export type Role = 'student' | 'guest' | 'library';
export type Page = 'books' | 'borrow' | 'lend' | 'schedule' | 'notifications' | 'settings';
export interface User { id: string; name: string; username: string; role: Role; classroom: string; email: string; emailEnabled: boolean; owned: string[]; schedule: Record<number, string[]>; }
export interface Book { id: string; title: string; subject: string; grade: number; series: string; volume: string; color: string; symbol: string; url: string; source: string; }
export type RequestStatus = 'open' | 'matched' | 'received' | 'returned' | 'expired' | 'cancelled' | 'rejected';
export interface BorrowRequest { id: string; borrowerId: string; bookId: string; date: string; start: number; end: number; target: 'community' | 'library'; note: string; status: RequestStatus; offerId?: string; createdAt: string; reason?: string; }
export interface Offer { id: string; requestId: string; lenderId: string; location: string; status: 'pending' | 'accepted' | 'closed'; }
export interface Notice { id: string; userId: string; title: string; body: string; kind: 'suggestion' | 'transaction'; requestId: string; createdAt: string; read: boolean; }
export interface Mail { id: string; userId: string; to: string; title: string; body: string; createdAt: string; }
export interface Database { version: 1; users: User[]; requests: BorrowRequest[]; offers: Offer[]; notices: Notice[]; mails: Mail[]; stock: Record<string, number>; }
export interface RequestInput { bookId: string; date: string; start: number; end: number; target: 'community' | 'library'; note: string; }
