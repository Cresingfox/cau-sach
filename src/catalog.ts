import type { Book } from './types.ts';
// Editorial illustrations are original, not reproductions of textbook covers.
// Links deliberately lead to the official catalog: specific book deep-links need school verification.
export const books: Book[] = [
  { id: 'math10', title: 'Toán 10', subject: 'Toán', grade: 10, series: 'Kết nối tri thức', volume: 'Tập một', color: 'sage', symbol: 'math', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
  { id: 'lit10', title: 'Ngữ văn 10', subject: 'Ngữ văn', grade: 10, series: 'Kết nối tri thức', volume: 'Tập một', color: 'peach', symbol: 'literature', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
  { id: 'physics10', title: 'Vật lí 10', subject: 'Vật lí', grade: 10, series: 'Kết nối tri thức', volume: 'Cả năm', color: 'blue', symbol: 'physics', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
  { id: 'chem10', title: 'Hóa học 10', subject: 'Hóa học', grade: 10, series: 'Kết nối tri thức', volume: 'Cả năm', color: 'lavender', symbol: 'chemistry', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
  { id: 'bio10', title: 'Sinh học 10', subject: 'Sinh học', grade: 10, series: 'Kết nối tri thức', volume: 'Cả năm', color: 'yellow', symbol: 'biology', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
  { id: 'history10', title: 'Lịch sử 10', subject: 'Lịch sử', grade: 10, series: 'Kết nối tri thức', volume: 'Cả năm', color: 'rose', symbol: 'history', url: 'https://hanhtrangso.nxbgd.vn/', source: 'Hành trang số · NXBGD Việt Nam' },
];
