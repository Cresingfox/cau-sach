import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronDown, CircleHelp, HeartHandshake, LibraryBig, LogOut, Settings, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { Database, Page, User } from './types';
import { AppContext } from './context';
import { expireRequests, id } from './domain';
import { createSeed } from './seed';
import { loadDatabase, readFlag, STORAGE_KEY, writeFlag } from './storage';
import { HeroArt, Intro, Logo, Modal, Tour } from './components';
import { AuthorWelcome } from './AuthorWelcome';
import { BooksPage } from './pages/BooksPage';
import { BorrowPage, LendPage } from './pages/LoansPage';
import { NotificationsPage, SchedulePage, SettingsPage } from './pages/UtilityPages';

const navigation = [{ page: 'books', label: 'Sách online', icon: BookOpen }, { page: 'borrow', label: 'Mượn sách', icon: LibraryBig }, { page: 'lend', label: 'Cho mượn', icon: HeartHandshake }, { page: 'schedule', label: 'Thời khóa biểu', icon: CalendarDays }] as const;
export default function App() {
  const [db, setDb] = useState(loadDatabase);
  const [userId, setUserId] = useState(() => readFlag('cau-sach:session') || '');
  const [page, setPage] = useState<Page>('books');
  const [intro, setIntro] = useState(() => !readFlag('cau-sach:intro'));
  const [authorWelcome, setAuthorWelcome] = useState(true);
  const [tour, setTour] = useState(false);
  const [toast, setToast] = useState<{ text: string; error: boolean; } | null>(null);
  const [resetModal, setResetModal] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const user = db.users.find(u => u.id === userId);
  const go = useCallback((p: Page) => { setPage(p); window.scrollTo({ top: 0 }); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); setStorageError(false); } catch { setStorageError(true); } }, [db]);
  useEffect(() => {
    const expire = () => setDb(prev => expireRequests(prev));
    const timer = window.setInterval(expire, 15000); window.addEventListener('focus', expire); document.addEventListener('visibilitychange', expire);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', expire); document.removeEventListener('visibilitychange', expire); };
  }, []);
  useEffect(() => { if (user && !intro && !readFlag(`cau-sach:tour:${user.id}`)) setTour(true); }, [user, intro]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 5500); return () => window.clearTimeout(timer); }, [toast]);
  function commit(fn: (state: Database) => Database, message?: string) {
    try { setDb(fn(db)); if (message) setToast({ text: message, error: false }); return true; }
    catch (e) { setToast({ text: e instanceof Error ? e.message : 'Không thể hoàn tất thao tác.', error: true }); return false; }
  }
  function login(selected: User) { setUserId(selected.id); writeFlag('cau-sach:session', selected.id); go('books'); }
  function logout() { setUserId(''); writeFlag('cau-sach:session', ''); setTour(false); }
  const closeTour = () => { setTour(false); if (user) writeFlag(`cau-sach:tour:${user.id}`, 'seen'); go('books'); };
  const unread = user ? db.notices.filter(n => n.userId === user.id && !n.read).length : 0;
  return <>
    {user ? <AppContext.Provider value={{ db, user, commit, go, showIntro: () => setIntro(true), showTour: () => setTour(true), reset: () => setResetModal(true), logout }}>
      <div className="app-layout"><aside className="sidebar"><a href="#" className="logo-link" onClick={e => { e.preventDefault(); go('books'); }} aria-label="Cầu Sách - trang sách"><Logo /></a><div className="school-label"><span className="school-mark"><LibraryBig size={16} /></span><div>THPT Bình Minh<span>Trường minh họa</span></div></div><div className="nav-caption">GÓC HỌC TẬP</div><nav aria-label="Điều hướng chính">{navigation.map(({ page: p, label, icon: Icon }) => <button key={p} data-tour={p} aria-current={page === p ? 'page' : undefined} className={`nav-item ${page === p ? 'selected' : ''}`} onClick={() => go(p)}><Icon size={20} /><span>{label}</span>{p === 'lend' && <span className="nav-count">{db.requests.filter(r => r.status === 'open' && r.target === (user.role === 'library' ? 'library' : 'community')).length}</span>}</button>)}</nav><div className="sidebar-note"><span className="note-icon"><HeartHandshake size={24} /></span><strong>Một cuốn sách,<br />thêm một người bạn.</strong><p>Chia sẻ hôm nay,<br />tiếp nối việc học ngày mai.</p><button onClick={() => go('lend')}>Cùng chia sẻ <ArrowRight size={15} /></button></div><div className="sidebar-bottom"><button className={`nav-item ${page === 'settings' ? 'selected' : ''}`} onClick={() => go('settings')}><Settings size={19} /><span>Cài đặt</span></button><button className="nav-item" onClick={() => setIntro(true)}><CircleHelp size={19} /><span>Trợ giúp & giới thiệu</span></button><div className="sidebar-footer"><span className="live-dot" /> Prototype · Phiên bản 0.1</div></div></aside>
        <div className="main-shell"><header className="topbar"><div className="breadcrumb">Góc học tập <span>/</span><strong>{page === 'notifications' ? 'Thông báo' : page === 'settings' ? 'Cài đặt' : navigation.find(n => n.page === page)?.label}</strong></div><div className="top-actions"><label className="role-picker"><span><Sparkles size={14} /> Đổi vai demo</span><select aria-label="Đổi vai demo" value={user.id} onChange={e => login(db.users.find(u => u.id === e.target.value)!)}>{db.users.map(u => <option key={u.id} value={u.id}>{u.name} {u.role === 'guest' ? '(Khách)' : u.role === 'library' ? '' : '(HS)'}</option>)}</select><ChevronDown size={13} /></label><button data-tour="notifications" className={`icon-button notification-button ${page === 'notifications' ? 'chosen' : ''}`} aria-label={`Thông báo${unread ? ` (${unread} chưa đọc)` : ''}`} onClick={() => go('notifications')}><Bell size={21} />{unread > 0 && <span className="unread-dot" />}</button><button className="avatar" title="Cài đặt tài khoản" aria-label="Cài đặt tài khoản" onClick={() => go('settings')}>{user.name.split(' ').at(-1)?.slice(0, 1)}</button><button className="icon-button logout" aria-label="Đăng xuất" title="Đăng xuất" onClick={() => { setUserId(''); writeFlag('cau-sach:session', ''); setTour(false); }}><LogOut size={17} /></button></div></header>
          {storageError && <div className="storage-warning" role="alert">Trình duyệt không cho lưu dữ liệu. Bạn vẫn dùng được demo, nhưng thay đổi có thể mất khi tải lại.</div>}
          <main className="main-content" id="main-content">{page === 'books' && <BooksPage />}{page === 'borrow' && <BorrowPage />}{page === 'lend' && <LendPage />}{page === 'schedule' && <SchedulePage />}{page === 'notifications' && <NotificationsPage />}{page === 'settings' && <SettingsPage />}<footer className="page-footer"><span>Cầu Sách · Học tiếp, cùng nhau.</span><span>Giải pháp chuyển tiếp · Nguồn học liệu chính thức <ShieldCheck size={14} /></span></footer></main></div></div>
    </AppContext.Provider> : <Auth db={db} setDb={setDb} onLogin={login} onHelp={() => setIntro(true)} />}
    {authorWelcome && <AuthorWelcome onClose={() => setAuthorWelcome(false)} />}
    {!authorWelcome && intro && <Intro onClose={() => { setIntro(false); writeFlag('cau-sach:intro', 'seen'); }} />} {tour && user && !intro && !authorWelcome && <Tour navigate={go} onClose={closeTour} />}
    {toast && <div className={`toast ${toast.error ? 'error' : ''}`} role={toast.error ? 'alert' : 'status'}><CheckCircle2 size={19} /><span>{toast.text}</span><button className="icon-button" aria-label="Đóng thông báo" onClick={() => setToast(null)}><X size={16} /></button></div>}
    {resetModal && <Modal title="Khôi phục dữ liệu demo?" onClose={() => setResetModal(false)}><p>Thao tác này xóa các yêu cầu, tài khoản khách và cài đặt bạn đã tạo trên trình duyệt này, rồi nạp lại dữ liệu mẫu.</p><div className="modal-actions"><button className="button secondary" onClick={() => setResetModal(false)}>Giữ dữ liệu</button><button className="button primary" onClick={() => { setDb(createSeed()); setUserId('an'); writeFlag('cau-sach:session', 'an'); setResetModal(false); go('books'); setToast({ text: 'Đã khôi phục dữ liệu mẫu.', error: false }); }}>Khôi phục demo</button></div></Modal>}
  </>;
}
function Auth({ db, setDb, onLogin, onHelp }: { db: Database; setDb: (db: Database) => void; onLogin: (u: User) => void; onHelp: () => void; }) {
  const [guest, setGuest] = useState(false); const [error, setError] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); const data = new FormData(e.currentTarget); const username = String(data.get('username')).trim().toLowerCase();
    if (!guest) { const found = db.users.find(u => u.username === username); if (!found || data.get('password') !== 'demo2026') { setError('Tên đăng nhập chưa đúng hoặc mật khẩu khác demo2026.'); return; } onLogin(found); }
    else {
      if (!/^[a-z0-9_]{3,24}$/.test(username)) { setError('Tên đăng nhập gồm 3–24 chữ thường không dấu, số hoặc dấu gạch dưới.'); return; }
      if (db.users.some(u => u.username === username)) { setError('Tên đăng nhập đã tồn tại. Hãy chọn tên khác.'); return; }
      const name = String(data.get('name')).trim(); if (name.length < 2) { setError('Nhập tên hiển thị có ít nhất 2 ký tự.'); return; }
      const user: User = { id: id(), name, username, role: 'guest', classroom: '', email: '', emailEnabled: false, owned: [], schedule: {} };
      setDb({ ...db, users: [...db.users, user] }); onLogin(user);
    }
  }
  return <div className="auth-layout"><section className="auth-story"><Logo /><div><span className="eyebrow">HỌC TIẾP, CÙNG NHAU</span><h1>Chờ sách về.<br />Không chờ<br /><em>việc học.</em></h1><p>Tìm nguồn sách chính thức. Kết nối một người bạn.<br />Tiếp tục hành trình học tập của bạn.</p><HeroArt /><div className="auth-pills"><span><ShieldCheck size={16} /> Nguồn chính thức</span><span><Users size={16} /> Cộng đồng trường học</span></div></div><small>Một ý tưởng nhỏ cho những ngày đầu năm học.</small></section><section className="auth-form-area"><button className="text-button auth-help" onClick={onHelp}><CircleHelp size={17} /> Về prototype này</button><div className="auth-form"><span className="eyebrow">CHÀO BẠN ĐẾN VỚI CẦU SÁCH</span><h2>{guest ? 'Một người bạn mới.' : 'Hôm nay, bạn cần sách gì?'}</h2><p>{guest ? 'Tạo tài khoản khách để cùng mượn và chia sẻ sách.' : 'Đăng nhập để tìm sách và kết nối với trường của bạn.'}</p><div className="segmented"><button className={!guest ? 'active' : ''} onClick={() => { setGuest(false); setError(''); }}>Đăng nhập</button><button className={guest ? 'active' : ''} onClick={() => { setGuest(true); setError(''); }}>Tạo tài khoản khách</button></div><form onSubmit={submit} key={String(guest)}>
    {guest && <label>Tên hiển thị<input name="name" required maxLength={50} placeholder="Ví dụ: Nguyễn Hà My" autoComplete="off" /></label>}<label>Tên đăng nhập<input name="username" autoComplete="off" required maxLength={24} placeholder={guest ? 'Tên không dấu, ví dụ: hamy2026' : 'Ví dụ: minhan'} defaultValue={guest ? '' : 'minhan'} /></label>
    {!guest && <label>Mật khẩu demo<input name="password" type="password" required defaultValue="demo2026" autoComplete="off" /></label>}
    {guest && <div className="info-box guest-rules"><strong>Tài khoản khách dùng được gì?</strong><p>✓ Đăng yêu cầu và cho mượn trong cộng đồng<br />✓ Nhận thông báo giao dịch, tùy chọn email mô phỏng</p><p>Không gửi thư viện, không có thời khóa biểu hoặc gợi ý theo lịch. Mật khẩu chung của demo: <b>demo2026</b>.</p><label className="checkbox-label"><input type="checkbox" required /> Mình đã hiểu giới hạn của tài khoản khách.</label></div>}
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full" type="submit">{guest ? 'Tạo tài khoản & bắt đầu' : 'Vào góc học tập'}<ArrowRight size={17} /></button></form>
    {!guest && <div className="demo-accounts"><span className="eyebrow">HOẶC CHỌN VAI ĐỂ KHÁM PHÁ</span><div>{db.users.slice(0, 5).map(u => <button key={u.id} onClick={() => onLogin(u)}><span className={`mini-avatar ${u.role}`}>{u.role === 'library' ? <LibraryBig size={16} /> : u.name.split(' ').at(-1)?.charAt(0)}</span><span>{u.name.split(' ').slice(-2).join(' ')}<small>{u.role === 'library' ? 'Quản lý thư viện' : u.role === 'guest' ? 'Tài khoản khách' : u.classroom.split(' · ')[0]}</small></span></button>)}</div></div>}
    <p className="fine auth-disclaimer"><ShieldCheck size={15} /> Đăng nhập mô phỏng, không có xác thực thật.<br />Không nhập thông tin nhạy cảm hoặc mật khẩu thật.</p>
  </div></section></div>;
}
