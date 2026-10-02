import { ArrowRight, Download } from 'lucide-react';
import { Modal } from './components';
import readmeUrl from '../README.md?url';

export function AuthorWelcome({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Lời chào từ người đề xuất ý tưởng" onClose={onClose}>
      <div className="author-welcome">
        <span className="eyebrow">NGUYỄN XUÂN HIẾU · KHMT2026</span>
        <p>Kính chào quý thầy cô và các anh chị trong CLB AI,</p>
        <p>Em là <strong>Nguyễn Xuân Hiếu</strong>, sinh viên lớp <strong>KHMT2026</strong>. Em xin giới thiệu Cầu Sách — bản prototype minh họa ý tưởng của em nhằm hỗ trợ học sinh trong thời gian thiếu sách giáo khoa.</p>
        <p><strong>Ý tưởng và định hướng sản phẩm do em đề xuất; phần mã nguồn và giao diện được AI xây dựng theo yêu cầu của em.</strong> Đây là bản demo chạy trên trình duyệt, chưa triển khai máy chủ ứng dụng hay cơ sở dữ liệu dùng chung. Dữ liệu minh họa chỉ được lưu trong trình duyệt của người dùng.</p>
        <p>Sản phẩm hướng tới việc giúp học sinh truy cập nguồn sách chính thức và kết nối mượn sách thuận tiện, hiệu quả hơn.</p>
        <p>Kính mời quý thầy cô và các anh chị đọc <strong>README.md</strong> để xem hướng dẫn sử dụng, cách chạy thử và phạm vi của prototype.</p>
        <p className="author-signoff">Em xin chân thành cảm ơn quý thầy cô và các anh chị đã dành thời gian xem và góp ý!</p>
      </div>
      <div className="modal-actions author-actions">
        <a className="button secondary" href={readmeUrl} download="README.md"><Download size={16} /> Tải README.md</a>
        <button className="button primary" onClick={onClose}>Tiếp tục khám phá <ArrowRight size={16} /></button>
      </div>
    </Modal>
  );
}
