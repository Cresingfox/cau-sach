import type { BorrowRequest, Database, RequestInput, User } from './types.ts';
import { books } from './catalog.ts';

export const periods = [
  { start: '07:00', end: '07:45' }, { start: '07:50', end: '08:35' },
  { start: '08:55', end: '09:40' }, { start: '09:45', end: '10:30' },
  { start: '10:35', end: '11:20' }, { start: '13:00', end: '13:45' },
  { start: '13:50', end: '14:35' }, { start: '14:45', end: '15:30' },
];
export const id = () => globalThis.crypto.randomUUID();
export const vnDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const weekday = (date: string) => new Date(`${date}T12:00:00+07:00`).getUTCDay();
export function nextSchoolDate(now = new Date()) {
  const day = new Date(`${vnDate(now)}T12:00:00+07:00`);
  do { day.setUTCDate(day.getUTCDate() + 1); } while ([0, 6].includes(day.getUTCDay()));
  return vnDate(day);
}
export const endAt = (r: Pick<BorrowRequest, 'date' | 'end'>) => new Date(`${r.date}T${periods[r.end - 1].end}:00+07:00`).getTime();
export const startAt = (r: Pick<BorrowRequest, 'date' | 'start'>) => new Date(`${r.date}T${periods[r.start - 1].start}:00+07:00`).getTime();
export const overlaps = (a: BorrowRequest, b: BorrowRequest) => a.date === b.date && a.start <= b.end && b.start <= a.end;
export const active = (r: BorrowRequest) => ['matched', 'received'].includes(r.status);
export function available(db: Database, lender: User, request: BorrowRequest, now = new Date()) {
  // An overdue, unreturned copy is unavailable even for a later reservation.
  const reserved = db.requests.filter(r => r.id !== request.id && active(r) && r.bookId === request.bookId && (overlaps(r, request) || endAt(r) < now.getTime()))
    .filter(r => db.offers.some(o => o.id === r.offerId && o.lenderId === lender.id)).length;
  return lender.role === 'library' ? (db.stock[request.bookId] || 0) > reserved : lender.owned.includes(request.bookId) && reserved === 0;
}
export function matchesSchedule(db: Database, user: User, r: BorrowRequest, now = new Date()) {
  const subject = books.find(b => b.id === r.bookId)?.subject;
  const day = user.schedule[weekday(r.date)];
  return user.role === 'student' && !!day && user.id !== r.borrowerId && available(db, user, r, now) && !day.slice(r.start - 1, r.end).includes(subject || '');
}
function notify(db: Database, userId: string, title: string, body: string, requestId: string, now: Date, kind: 'suggestion' | 'transaction' = 'transaction') {
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  const createdAt = now.toISOString();
  db.notices.unshift({ id: id(), userId, title, body, requestId, createdAt, kind, read: false });
  if (user.emailEnabled && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    db.mails.unshift({ id: id(), userId, to: user.email, title, body, createdAt });
  }
}
function getUser(db: Database, actor: string) {
  const user = db.users.find(u => u.id === actor);
  if (!user) throw new Error('Tài khoản không tồn tại.');
  return user;
}
function getRequest(db: Database, requestId: string) {
  const request = db.requests.find(r => r.id === requestId);
  if (!request) throw new Error('Không tìm thấy yêu cầu.');
  return request;
}
function ensureOpen(r: BorrowRequest, now: Date) {
  if (r.status !== 'open' || endAt(r) <= now.getTime()) throw new Error('Yêu cầu đã đóng hoặc hết thời gian mượn.');
}
function closeOffers(db: Database, r: BorrowRequest, now: Date, title: string) {
  db.offers.filter(o => o.requestId === r.id && o.status !== 'closed').forEach(o => {
    o.status = 'closed';
    notify(db, o.lenderId, title, 'Yêu cầu đã đóng. Xem chi tiết trong lịch sử cho mượn.', r.id, now);
  });
}
export function expireRequests(state: Database, now = new Date()): Database {
  if (!state.requests.some(r => r.status === 'open' && endAt(r) <= now.getTime())) return state;
  const db = structuredClone(state);
  db.requests.filter(r => r.status === 'open' && endAt(r) <= now.getTime()).forEach(r => {
    r.status = 'expired'; closeOffers(db, r, now, 'Yêu cầu đã hết hạn');
    notify(db, r.borrowerId, 'Yêu cầu đã hết hạn', 'Đã qua tiết cuối của lịch mượn. Bạn có thể tạo yêu cầu cho buổi học khác.', r.id, now);
  });
  return db;
}
export function createRequest(state: Database, actor: string, input: RequestInput, now = new Date()) {
  const db = structuredClone(expireRequests(state, now));
  const user = getUser(db, actor);
  if (user.role === 'library') throw new Error('Tài khoản thư viện chỉ xử lý cho mượn.');
  if (!['community', 'library'].includes(input.target)) throw new Error('Nơi nhận yêu cầu không hợp lệ.');
  if (user.role === 'guest' && input.target === 'library') throw new Error('Tài khoản khách không gửi yêu cầu tới thư viện.');
  if (!books.some(b => b.id === input.bookId)) throw new Error('Hãy chọn sách trong danh mục trường.');
  if (!Number.isInteger(input.start) || !Number.isInteger(input.end) || input.start < 1 || input.end > periods.length || input.start > input.end) throw new Error('Khoảng tiết học không hợp lệ.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(endAt(input)) || vnDate(new Date(`${input.date}T12:00:00+07:00`)) !== input.date || [0, 6].includes(weekday(input.date))) throw new Error('Chọn ngày học từ thứ Hai đến thứ Sáu.');
  if (endAt(input) <= now.getTime()) throw new Error('Khoảng thời gian mượn đã kết thúc.');
  const r: BorrowRequest = { ...input, note: input.note.trim().slice(0, 240), id: id(), borrowerId: actor, status: 'open', createdAt: now.toISOString() };
  db.requests.unshift(r);
  const title = books.find(b => b.id === r.bookId)!.title;
  if (r.target === 'community') {
    db.users.filter(u => matchesSchedule(db, u, r, now)).forEach(u => notify(db, u.id, 'Có bạn đang cần sách của bạn', `${user.name} cần ${title}, ngày ${r.date}, tiết ${r.start}–${r.end}. Lịch của bạn phù hợp để cho mượn.`, r.id, now, 'suggestion'));
  } else {
    db.users.filter(u => u.role === 'library').forEach(u => notify(db, u.id, 'Yêu cầu gửi thư viện', `${user.name} cần ${title}, ngày ${r.date}, tiết ${r.start}–${r.end}.`, r.id, now));
  }
  return db;
}
export function offerBook(state: Database, actor: string, requestId: string, location: string, now = new Date()) {
  const db = structuredClone(expireRequests(state, now)); const user = getUser(db, actor); const r = getRequest(db, requestId);
  ensureOpen(r, now);
  if (r.borrowerId === actor) throw new Error('Bạn không thể cho chính mình mượn.');
  if ((r.target === 'library') !== (user.role === 'library')) throw new Error('Yêu cầu không thuộc kênh cho mượn của bạn.');
  if (!location.trim()) throw new Error('Cần có địa điểm giao nhận trong trường.');
  if (!available(db, user, r, now)) throw new Error('Bạn chưa có sách này hoặc sách đang được giữ cho lượt mượn khác.');
  if (db.offers.some(o => o.requestId === r.id && o.lenderId === actor && o.status !== 'closed')) throw new Error('Bạn đã gửi đề nghị cho yêu cầu này.');
  db.offers.push({ id: id(), requestId, lenderId: actor, location: location.trim().slice(0, 120), status: 'pending' });
  notify(db, r.borrowerId, 'Bạn có một đề nghị cho mượn', `${user.name} có thể cho mượn. Nhận/trả tại ${location.trim()}. ${user.role === 'library' ? 'Miễn phí.' : '10.000đ/lượt, thanh toán trực tiếp.'} Hãy xác nhận để giữ sách.`, r.id, now);
  return db;
}
export function acceptOffer(state: Database, actor: string, offerId: string, now = new Date()) {
  const db = structuredClone(expireRequests(state, now));
  const offer = db.offers.find(o => o.id === offerId); if (!offer) throw new Error('Không tìm thấy đề nghị.');
  const r = getRequest(db, offer.requestId); ensureOpen(r, now);
  if (r.borrowerId !== actor || offer.status !== 'pending') throw new Error('Bạn không thể xác nhận đề nghị này.');
  const lender = getUser(db, offer.lenderId);
  if (!available(db, lender, r, now)) throw new Error('Sách vừa được giữ cho một lượt khác. Hãy chọn đề nghị khác.');
  r.status = 'matched'; r.offerId = offer.id; offer.status = 'accepted';
  db.offers.filter(o => o.requestId === r.id && o.id !== offer.id && o.status === 'pending').forEach(o => {
    o.status = 'closed'; notify(db, o.lenderId, 'Người mượn đã chọn đề nghị khác', 'Cảm ơn bạn đã sẵn sàng chia sẻ sách.', r.id, now);
  });
  const body = `Lịch mượn ${r.date}, tiết ${r.start}–${r.end}. Nhận/trả tại ${offer.location}. ${lender.role === 'library' ? 'Miễn phí.' : 'Phí 10.000đ trả trực tiếp.'}`;
  [actor, offer.lenderId].forEach(u => notify(db, u, 'Đã xác nhận lượt mượn', body, r.id, now));
  return db;
}
export function changeRequest(state: Database, actor: string, requestId: string, action: 'cancel' | 'receive' | 'return' | 'reject', reason = '', now = new Date()) {
  const db = structuredClone(expireRequests(state, now)); const user = getUser(db, actor); const r = getRequest(db, requestId);
  const offer = db.offers.find(o => o.id === r.offerId);
  if (action === 'cancel') {
    if (r.borrowerId !== actor || !['open', 'matched'].includes(r.status)) throw new Error('Chỉ người mượn được hủy trước khi nhận sách.');
    r.status = 'cancelled'; r.reason = reason || 'Đã có sách'; closeOffers(db, r, now, 'Người mượn đã hủy yêu cầu');
  } else if (action === 'reject') {
    ensureOpen(r, now);
    if (user.role !== 'library' || r.target !== 'library') throw new Error('Chỉ thư viện được từ chối yêu cầu gửi thư viện.');
    r.status = 'rejected'; r.reason = reason || 'Thư viện chưa có sách phù hợp'; closeOffers(db, r, now, 'Thư viện đã đóng yêu cầu');
    notify(db, r.borrowerId, 'Thư viện chưa thể hỗ trợ', `${r.reason}. Bạn có thể tạo yêu cầu gửi cộng đồng.`, r.id, now);
  } else if (action === 'receive') {
    if (r.borrowerId !== actor || r.status !== 'matched') throw new Error('Chỉ người mượn được xác nhận đã nhận sách.');
    r.status = 'received'; notify(db, offer!.lenderId, 'Người mượn đã nhận sách', 'Lượt mượn đã bắt đầu. Người cho mượn xác nhận khi nhận lại sách.', r.id, now);
  } else {
    if (offer?.lenderId !== actor || r.status !== 'received') throw new Error('Chỉ người cho mượn được xác nhận nhận lại sách.');
    r.status = 'returned'; notify(db, r.borrowerId, 'Đã hoàn tất trả sách', 'Cảm ơn bạn đã trả sách. Lượt mượn đã hoàn tất.', r.id, now);
  }
  return db;
}
export function toggleOwned(state: Database, actor: string, bookId: string) {
  const db = structuredClone(state); const user = getUser(db, actor);
  if (user.role === 'library' || !books.some(b => b.id === bookId)) throw new Error('Thao tác không hợp lệ.');
  if (user.owned.includes(bookId)) {
    if (db.requests.some(r => r.bookId === bookId && active(r) && db.offers.some(o => o.id === r.offerId && o.lenderId === actor))) throw new Error('Sách đang có lượt mượn. Hãy hoàn tất trước khi bỏ khỏi danh sách.');
    user.owned = user.owned.filter(b => b !== bookId);
  } else user.owned.push(bookId);
  return db;
}
export function saveSettings(state: Database, actor: string, email: string, enabled: boolean) {
  const db = structuredClone(state); const user = getUser(db, actor);
  if ((enabled || email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Nhập email hợp lệ trước khi bật nhận email.');
  user.email = email.trim(); user.emailEnabled = enabled; return db;
}
