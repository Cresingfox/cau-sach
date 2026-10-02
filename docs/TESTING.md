# Kiểm tra prototype

## Đã chạy ngày 02–03/10/2026

Môi trường: Node.js 26.8.2, npm 11.19.1, Chromium hệ thống, Vite 7.3.6, ứng dụng tại `127.0.0.1:5173`.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run build` | TypeScript strict và Vite build thành công |
| `npm test` | 12/12 kiểm tra nghiệp vụ qua |
| `npm run test:browser` | Các luồng trình duyệt dưới đây qua, không có lỗi JavaScript runtime |
| Quan sát ảnh desktop/mobile | Đã xem ảnh trang giới thiệu và tủ sách; không thấy chồng chữ hoặc tràn bố cục |

## Nghiệp vụ

- Ngày Việt Nam, ngày học tiếp theo và giờ kết thúc tiết.
- Khách không gửi thư viện, thư viện không tự tạo yêu cầu mượn.
- Chặn ngày không hợp lệ/cuối tuần, khoảng tiết sai, thời gian đã kết thúc và sách ngoài danh mục.
- Gợi ý đúng chủ sách có lịch phù hợp; người bận vẫn được chủ động đề nghị.
- Hai bước xác nhận, chọn một trong nhiều đề nghị và đóng đề nghị khác.
- Chặn cùng một bản cho hai lượt trùng, kiểm tra lại ngay lúc xác nhận.
- Cho đặt trước các khoảng không trùng; sách quá hạn chưa trả không khả dụng.
- Thư viện hết sách từ chối; số bản tổng giới hạn số lượt trùng.
- Hết hạn giữ lịch sử, đóng pending offer, không tự trả sách, không thông báo lặp.
- Email giao dịch cho khách; tắt email không tạo thư; khách không nhận gợi ý theo lịch.
- Quyền xác nhận nhận/trả và giải phóng sách khi trả.
- Hủy yêu cầu, lưu lý do và báo cho bên đã đề nghị.

## Trình duyệt

- Popup lần đầu, mật khẩu sai, đăng nhập đúng, hướng dẫn 5 bước và focus bàn phím trong tour.
- Tìm sách không dấu và kiểm tra URL nguồn chính thức.
- Tạo yêu cầu → đổi vai Linh → đề nghị → An xác nhận → nhận → Linh xác nhận trả.
- Email mô phỏng theo tùy chọn; dữ liệu vẫn còn sau khi tải lại.
- Yêu cầu thư viện không hiện trên bảng cộng đồng khách.
- Khách không có tùy chọn thư viện hoặc thời khóa biểu.
- Thư viện không thể cho mượn khi tồn bằng 0, từ chối, và tạo lượt miễn phí khi có sách.
- Hủy một lượt đã xác nhận nhưng chưa nhận.
- Tạo khách mới và khai báo sở hữu sách.
- Khi tải lại, yêu cầu mở đã hết hạn rời danh sách đang theo dõi và vào lịch sử.
- Chiều rộng 390px/320px không làm toàn trang cuộn ngang. Bảng thời khóa biểu cuộn trong khung.
- Đăng xuất từ Cài đặt vẫn dùng được trên điện thoại khi nút desktop được ẩn.

Bộ kiểm tra không mở hoặc đăng nhập vào tài khoản NXB; chỉ xác nhận link dẫn tới domain chính thức. Nguồn ngoài có thể đổi giao diện hoặc điều kiện truy cập. Cần xác minh lại trước khi trình diễn công khai.

## Chạy lại

```bash
npm test
npm run build
```

Chạy Vite ở terminal riêng trước khi kiểm tra trình duyệt:

```bash
npm run dev
```

```bash
npm run test:browser
```

Test browser dùng profile mới và dữ liệu riêng, không ảnh hưởng dữ liệu ở trình duyệt cá nhân. Nó ghi lại ảnh tại `docs/screenshots/`.

Máy khác có thể đặt `CHROMIUM_PATH` và `TEST_URL`. Nếu môi trường sandbox chặn mở port hoặc chạy Chromium, cấp quyền cho đúng lệnh server/kiểm thử; không sửa cấu hình hệ thống hoặc trình duyệt người dùng để né giới hạn.

## Giới hạn kiểm tra

Chưa kiểm thử Safari/Firefox, screen reader thực tế, email thật, nhiều máy đồng thời, dữ liệu trường thật, khả năng chịu tải hoặc triển khai production. Không suy diễn từ kết quả prototype sang bảo mật tài khoản, hiệu lực pháp lý của chính sách phí, hay hiệu quả sử dụng thực tế.
