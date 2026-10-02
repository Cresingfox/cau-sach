import type { Database, User } from './types.ts';
import { createRequest, nextSchoolDate, vnDate } from './domain.ts';

const schedule = (busy = false): User['schedule'] => Object.fromEntries([1, 2, 3, 4, 5].map(day => [day, busy ? ['Toán', 'Toán', 'Ngữ văn', 'Vật lí', 'Sinh học', 'Hóa học', 'Tiếng Anh', 'Thể dục'] : ['Ngữ văn', 'Tiếng Anh', 'Toán', 'Toán', 'Sinh học', 'Vật lí', 'Thể dục', 'Hóa học']]));
export function createSeed(now = new Date()): Database {
  let db: Database = {
    version: 1,
    users: [
      { id: 'an', name: 'Nguyễn Minh An', username: 'minhan', role: 'student', classroom: '10A1 · Phòng 201', email: '', emailEnabled: false, owned: ['lit10', 'bio10'], schedule: schedule(true) },
      { id: 'linh', name: 'Trần Khánh Linh', username: 'khanhlinh', role: 'student', classroom: '10A2 · Phòng 202', email: '', emailEnabled: false, owned: ['math10', 'physics10', 'chem10'], schedule: schedule() },
      { id: 'huy', name: 'Lê Quang Huy', username: 'quanghuy', role: 'student', classroom: '10A3 · Phòng 203', email: '', emailEnabled: false, owned: ['math10', 'history10'], schedule: schedule(true) },
      { id: 'guest', name: 'Phạm Hà My', username: 'hamy', role: 'guest', classroom: '', email: '', emailEnabled: false, owned: ['bio10', 'lit10'], schedule: {} },
      { id: 'library', name: 'Thư viện nhà trường', username: 'thuvien', role: 'library', classroom: 'Phòng thư viện · Tầng 1, khu A', email: '', emailEnabled: false, owned: [], schedule: {} },
    ], requests: [], offers: [], notices: [], mails: [], stock: { math10: 2, lit10: 3, physics10: 0, chem10: 2, bio10: 1, history10: 2 },
  };
  const date = nextSchoolDate(now);
  db = createRequest(db, 'an', { bookId: 'math10', date, start: 1, end: 2, target: 'community', note: 'Mình cần sách cho hai tiết đầu. Sẽ giữ sách cẩn thận và trả ngay sau tiết 2.' }, now);
  db = createRequest(db, 'huy', { bookId: 'chem10', date, start: 6, end: 7, target: 'community', note: 'Nhờ mọi người hỗ trợ mình trong lúc chờ mua sách nhé!' }, now);
  db = createRequest(db, 'guest', { bookId: 'physics10', date, start: 3, end: 4, target: 'community', note: 'Mình có thể nhận sách ở sảnh khu A trước tiết 3.' }, now);
  db = createRequest(db, 'an', { bookId: 'physics10', date, start: 3, end: 3, target: 'library', note: 'Em xin mượn sách cho tiết Vật lí.' }, now);
  const tomorrow = { date, start: 3, end: 4, createdAt: now.toISOString(), note: 'Lượt mẫu để minh họa trạng thái.', target: 'community' as const };
  db.requests.push({ ...tomorrow, id: 'sample-pending', borrowerId: 'an', bookId: 'chem10', status: 'open' });
  db.offers.push({ id: 'sample-offer', requestId: 'sample-pending', lenderId: 'linh', location: '10A2 · Phòng 202', status: 'pending' });
  db.requests.push({ ...tomorrow, id: 'sample-matched', borrowerId: 'huy', bookId: 'lit10', status: 'matched', offerId: 'sample-accepted' });
  db.offers.push({ id: 'sample-accepted', requestId: 'sample-matched', lenderId: 'an', location: '10A1 · Phòng 201', status: 'accepted' });
  const yesterday = new Date(`${vnDate(now)}T12:00:00+07:00`); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  db.requests.push({ ...tomorrow, id: 'sample-expired', date: vnDate(yesterday), borrowerId: 'an', bookId: 'history10', status: 'expired' });
  return db;
}
