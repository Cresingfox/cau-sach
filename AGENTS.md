# Hướng dẫn cho agent tiếp tục dự án Cầu Sách

## Đọc trước

1. `README.md` để chạy dự án và biết phạm vi demo.
2. `docs/SPEC.md` để giữ đúng yêu cầu sản phẩm.
3. `docs/ARCHITECTURE.md` để tìm nơi sửa nghiệp vụ, dữ liệu hoặc giao diện.

## Ý định đã chốt với người dùng

- Website tiếng Việt có hai việc chính: mở sách tại nguồn chính thức và kết nối mượn sách theo tiết.
- Đây là prototype một trình duyệt; không tự phát triển backend, xác thực thật hoặc dịch vụ gửi email nếu chưa được yêu cầu.
- Học sinh/khách cho mượn giá cố định 10.000đ/lượt, thu trực tiếp; thư viện miễn phí. Không tự đổi mô hình phí.
- Người mượn chọn cộng đồng HOẶC thư viện. Không tự thêm bước ưu tiên thư viện hoặc gửi đồng thời.
- Bảng cộng đồng cho mọi học sinh và khách xem. Thời khóa biểu chỉ lọc đối tượng nhận gợi ý, không hạn chế người xem bảng.
- Khách vẫn nhận thông báo giao dịch và email mô phỏng. Chỉ thiếu quyền gửi thư viện, thời khóa biểu và gợi ý theo lịch.
- Có hai bước đồng ý: người cho mượn đề nghị, người mượn xác nhận. Chỉ khi đó mới giữ sách và đóng yêu cầu trên bảng.
- Hết hạn thì ẩn yêu cầu mở, giữ lịch sử. Không tự coi sách đã trả.
- Khi sách chính thức về, đóng nhu cầu hỗ trợ và trả sách đã mượn.

## Quy ước mã

- React + TypeScript + Vite. Giao diện trong `src/pages`, thành phần chung trong `src/components.tsx`.
- Tất cả chuyển trạng thái phải đi qua `src/domain.ts`. Không chỉ vô hiệu hóa nút rồi coi đó là kiểm tra quyền.
- Hàm domain nhận `Database`, người thực hiện và tham số; trả bản sao dữ liệu hoặc throw lỗi tiếng Việt. Không gọi mạng, storage, React hoặc gửi email trong domain.
- Dữ liệu demo trong `seed.ts`, danh mục sách trong `catalog.ts`, kiểu dữ liệu trong `types.ts`.
- Giờ học theo `Asia/Ho_Chi_Minh`; không dùng giờ máy người xem để xác định thứ/ngày học.
- Trạng thái `matched` và `received` giữ bản sách. Kiểm tra khả dụng lại ở bước xác nhận đề nghị.
- Chỉ người mượn xác nhận nhận sách; chỉ người cho mượn xác nhận nhận lại sách.
- Không ghi dữ liệu cá nhân thật, thông tin xác thực hoặc khóa dịch vụ vào source/seed/tài liệu.
- Giữ mô tả “email mô phỏng”, “tài khoản demo” và giới hạn localStorage rõ trên UI.
- Không thêm scan/PDF SGK, iframe đọc sách hoặc cache nội dung nhà xuất bản. Chỉ thay URL bằng URL chính thức đã xác minh đúng sách.

## Thiết kế và khả năng truy cập

- Tông xanh lá dịu, nền sáng, điểm nhấn kem/cam; giữ nhất quán với CSS hiện tại.
- Nội dung hiển thị tiếng Việt có dấu, câu ngắn. Thuật ngữ kỹ thuật nằm trong tài liệu/giới thiệu demo, không chen vào hành trình mượn.
- Ưu tiên điện thoại; không để toàn trang cuộn ngang. Bảng thời khóa biểu có thể cuộn trong khung.
- Nút phải có nhãn; icon button có aria-label. Giữ focus-visible, modal native và spotlight tour dùng được bằng bàn phím.

## Kiểm tra và bàn giao

- `npm run build` kiểm tra TypeScript và đóng gói.
- `npm test` kiểm tra nghiệp vụ bằng Node test runner.
- `npm run test:browser` khi thay đổi luồng UI; chạy server Vite trước. Có thể cấu hình `CHROMIUM_PATH`, `TEST_URL`.
- Không cần chạy lại mọi kiểm tra nhiều lần nếu chưa có thay đổi hoặc lỗi mới.
- Cập nhật tài liệu nếu thay đổi quy tắc, tài khoản demo, cấu trúc hoặc giới hạn.
- Không tự deploy, tạo repository từ xa hay gửi thông báo cho người thật. Bàn giao mã nguồn, ảnh và lệnh chạy trước.
