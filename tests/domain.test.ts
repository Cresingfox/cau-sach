import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptOffer, available, changeRequest, createRequest, endAt, expireRequests, matchesSchedule, nextSchoolDate, offerBook, saveSettings, toggleOwned, vnDate } from '../src/domain.ts';
import { createSeed } from '../src/seed.ts';
import type { Database, RequestInput } from '../src/types.ts';

const now = new Date('2026-10-02T10:00:00+07:00');
const input: RequestInput = { bookId: 'math10', date: '2026-10-05', start: 1, end: 2, target: 'community', note: 'Cần sách Toán' };
const fresh = () => ({ ...createSeed(now), requests: [], offers: [], notices: [], mails: [] } as Database);
function create(db = fresh(), borrower = 'an', override: Partial<RequestInput> = {}) { return createRequest(db, borrower, { ...input, ...override }, now); }
function pair(db = create(), lender = 'linh') {
  db = offerBook(db, lender, db.requests[0].id, 'Phòng 202', now);
  return acceptOffer(db, db.requests[0].borrowerId, db.offers.at(-1)!.id, now);
}
test('Vietnam dates, school day, and bell schedule are timezone explicit', () => {
  assert.equal(vnDate(new Date('2026-10-01T18:00:00Z')), '2026-10-02');
  assert.equal(nextSchoolDate(now), '2026-10-05');
  assert.equal(endAt(input), new Date('2026-10-05T08:35:00+07:00').getTime());
});
test('guest restrictions are enforced in domain, not only disabled UI', () => {
  assert.throws(() => create(fresh(), 'guest', { target: 'library' }), /khách/);
  assert.throws(() => create(fresh(), 'library'), /thư viện/);
  const db = create(fresh(), 'guest'); assert.equal(db.requests[0].borrowerId, 'guest');
});
test('reject past periods, invalid dates, weekend and reversed periods', () => {
  for (const override of [{ date: '2026-10-01' }, { date: '2026-10-03' }, { date: '2026-02-30' }, { start: 4, end: 2 }, { end: 9 }, { bookId: 'unknown' }]) assert.throws(() => create(fresh(), 'an', override));
});
test('suggestions reach only owners with a compatible timetable', () => {
  const db = create(); const r = db.requests[0];
  assert.deepEqual(db.notices.map(n => n.userId), ['linh']);
  assert.equal(matchesSchedule(db, db.users.find(u => u.id === 'huy')!, r, now), false);
  assert.equal(matchesSchedule(db, db.users.find(u => u.id === 'guest')!, r, now), false);
  // A busy student may still manually offer; schedule controls suggestions only.
  assert.equal(offerBook(db, 'huy', r.id, 'Phòng 203', now).offers.length, 1);
});
test('two-step confirmation keeps board open until borrower chooses one offer', () => {
  let db = create(); const requestId = db.requests[0].id;
  db = offerBook(db, 'linh', requestId, 'Phòng 202', now);
  db = offerBook(db, 'huy', requestId, 'Phòng 203', now);
  assert.equal(db.requests[0].status, 'open');
  assert.throws(() => acceptOffer(db, 'guest', db.offers[0].id, now), /không thể/);
  const original = structuredClone(db);
  db = acceptOffer(db, 'an', db.offers[0].id, now);
  assert.equal(db.requests[0].status, 'matched'); assert.equal(db.offers[1].status, 'closed');
  assert.equal(original.requests[0].status, 'open');
  assert.throws(() => acceptOffer(db, 'an', db.offers[1].id, now), /đóng/);
});
test('one copy cannot be promised to overlapping confirmed requests', () => {
  let db = create(); const first = db.requests[0].id;
  db = create(db, 'guest'); const second = db.requests[0].id;
  db = offerBook(db, 'linh', first, '202', now); db = offerBook(db, 'linh', second, '202', now);
  db = acceptOffer(db, 'an', db.offers[0].id, now);
  assert.throws(() => acceptOffer(db, 'guest', db.offers[1].id, now), /giữ/);
  assert.throws(() => toggleOwned(db, 'linh', 'math10'), /đang có/);
});
test('future nonoverlapping reservations allowed, overdue copy unavailable', () => {
  let db = pair(); db = create(db, 'guest', { start: 3, end: 4 });
  const linh = db.users.find(u => u.id === 'linh')!;
  assert.equal(available(db, linh, db.requests[0], now), true);
  assert.equal(available(db, linh, db.requests[0], new Date('2026-10-05T08:40:00+07:00')), false);
});
test('library rejects out of stock books and respects multi-copy inventory', () => {
  const empty = create(fresh(), 'an', { bookId: 'physics10', target: 'library' });
  assert.throws(() => offerBook(empty, 'library', empty.requests[0].id, 'Thư viện', now), /chưa có/);
  const rejected = changeRequest(empty, 'library', empty.requests[0].id, 'reject', '', now);
  assert.equal(rejected.requests[0].status, 'rejected'); assert.equal(rejected.notices[0].userId, 'an');
  let db = create(fresh(), 'an', { target: 'library' }); db = pair(db, 'library');
  db = create(db, 'huy', { target: 'library' }); db = pair(db, 'library');
  db = create(db, 'linh', { target: 'library' });
  assert.throws(() => offerBook(db, 'library', db.requests[0].id, 'Thư viện', now), /chưa có/);
});
test('expiry closes open requests once, retains history and never auto-returns loans', () => {
  let db = pair(); const matchedId = db.requests[0].id;
  db = create(db, 'guest', { bookId: 'chem10' });
  db = offerBook(db, 'linh', db.requests[0].id, '202', now);
  const late = new Date('2026-10-05T08:36:00+07:00'); db = expireRequests(db, late);
  assert.equal(db.requests[0].status, 'expired'); assert.equal(db.offers.at(-1)!.status, 'closed');
  assert.equal(db.requests.find(r => r.id === matchedId)!.status, 'matched');
  assert.equal(expireRequests(db, late), db);
});
test('guest transaction mail works; disabled mail and guest suggestions do not send', () => {
  let db = saveSettings(fresh(), 'guest', 'guest@example.com', true); db = create(db, 'guest');
  db = offerBook(db, 'linh', db.requests[0].id, '202', now);
  assert.equal(db.mails.length, 1); assert.equal(db.mails[0].to, 'guest@example.com');
  assert.equal(db.notices.some(n => n.userId === 'guest' && n.kind === 'suggestion'), false);
  db = saveSettings(db, 'guest', 'guest@example.com', false);
  db = acceptOffer(db, 'guest', db.offers[0].id, now); assert.equal(db.mails.length, 1);
  assert.throws(() => saveSettings(db, 'guest', '', true), /email/);
});
test('only borrower receives; only lender confirms return; copy becomes available', () => {
  let db = pair(); const r = db.requests[0];
  assert.throws(() => changeRequest(db, 'linh', r.id, 'receive', '', now), /người mượn/);
  db = changeRequest(db, 'an', r.id, 'receive', '', now);
  assert.throws(() => changeRequest(db, 'an', r.id, 'return', '', now), /người cho mượn/);
  assert.throws(() => changeRequest(db, 'an', r.id, 'cancel', '', now), /trước khi/);
  db = changeRequest(db, 'linh', r.id, 'return', '', now); assert.equal(db.requests[0].status, 'returned');
  db = create(db, 'guest'); assert.equal(available(db, db.users[1], db.requests[0], now), true);
});
test('cancellation closes pending offers and notifies affected lender', () => {
  let db = create(); const r = db.requests[0]; db = offerBook(db, 'linh', r.id, '202', now);
  db = changeRequest(db, 'an', r.id, 'cancel', 'Đã có sách chính thức', now);
  assert.equal(db.requests[0].reason, 'Đã có sách chính thức'); assert.equal(db.offers[0].status, 'closed');
  assert.equal(db.notices[0].userId, 'linh');
});
