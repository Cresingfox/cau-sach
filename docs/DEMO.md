# Kịch bản demo và cách trình bày bài

## Chuẩn bị

1. Chạy `npm run dev`, mở URL Vite.
2. Dùng Chrome/Chromium ở mức zoom 100%. Cửa sổ máy tính khoảng 1280–1440px; có thể đổi sang chế độ điện thoại để minh họa responsive.
3. Khi muốn làm lại: avatar → Cài đặt → Khôi phục dữ liệu demo. Việc này chỉ tác động dữ liệu prototype trên trình duyệt đang dùng.
4. Dùng đúng cùng một tab để đổi vai. Không cần đăng nhập nhiều trình duyệt.

## Demo 5 phút

### 0:00–0:40 — Tình huống

“Một học sinh chưa mua được sách Toán cho buổi học tới. Bạn ấy cần cách học ngay và cách tìm bản sách giấy. Cầu Sách hỗ trợ trong thời gian chờ sách chính thức.”

Mở popup giới thiệu. Chỉ ra phần dữ liệu do trường cấp, nguyên tắc nguồn sách và email mô phỏng.

### 0:40–1:20 — Đọc nguồn chính thức

Đăng nhập `minhan` / `demo2026`, đi qua hoặc bỏ qua tour. Tìm `Toán`, bấm **Mở nguồn chính thức**. Nêu rõ link hiện mở kho Hành trang số; người đọc chọn đúng sách trên nền tảng NXB. Prototype không đăng lại sách.

### 1:20–2:10 — Gửi yêu cầu

Vào **Mượn sách → Tạo yêu cầu mượn**:

- Sách: Toán 10, tập một.
- Ngày: để mặc định ngày học tiếp theo.
- Tiết: 1–2.
- Kênh: Cộng đồng.
- Lời nhắn: “Mình cần sách cho buổi học tới, cảm ơn mọi người!”.

Giải thích: ai cũng thấy yêu cầu; chỉ người có sách và lịch phù hợp nhận gợi ý. Đây là một lượt 10.000đ, trả trực tiếp.

### 2:10–3:00 — Người cho mượn

Đổi vai **Trần Khánh Linh** bằng menu góc trên. Bỏ qua tour nếu hiện.

Mở chuông để thấy gợi ý. Vào **Cho mượn**, tìm yêu cầu vừa tạo, bấm **Mình có thể cho mượn**. Giữ địa điểm điền sẵn `10A2 · Phòng 202`, gửi đề nghị.

Điểm cần trình bày: Linh có sách Toán và không học Toán tiết 1–2. Quang Huy có sách nhưng học Toán tiết 1–2, nên không được gợi ý tự động; Huy vẫn có thể chủ động vào bảng.

### 3:00–3:50 — Xác nhận và giao nhận

Đổi lại **Nguyễn Minh An**, vào **Mượn sách**, chọn **Xác nhận mượn** trên đề nghị Linh.

Chỉ địa điểm, ngày/tiết, giờ nhận/trả và phí. Yêu cầu đã rời bảng chung. Minh An bấm **Mình đã nhận sách**.

Đổi Linh → Cho mượn → Tôi đã đề nghị → **Xác nhận đã nhận lại sách**. Đổi lại An và xem lịch sử đã trả.

### 3:50–4:30 — Thư viện và khách

- Minh An tạo yêu cầu gửi thư viện; khi đổi vai khách sẽ không thấy yêu cầu riêng này trên bảng.
- Đổi `thuvien`: xem yêu cầu Vật lí mẫu. Thư viện có 0 bản Vật lí nên nút cho mượn không khả dụng; bấm từ chối để thông báo lại.
- Đổi `hamy`: mở form mượn, mục thư viện bị vô hiệu hóa có giải thích; lịch học hiển thị giới hạn. Khách vẫn mượn/cho mượn và nhận thông báo giao dịch.

### 4:30–5:00 — Email và giới hạn

Avatar → Cài đặt → nhập `demo@example.com` → bật nhận email. Thực hiện một đề nghị/xác nhận rồi xem **Thông báo → Hộp thư mô phỏng**.

Kết: “Bản mẫu chứng minh hành trình sử dụng. Khi triển khai thật, trường cung cấp dữ liệu và cấp tài khoản; hệ thống cần máy chủ, gửi email và kiểm soát dữ liệu học sinh.”

## Cấu trúc bài thuyết minh đề xuất

1. **Vấn đề:** thiếu sách tạm thời, không phải học sinh nào cũng có thiết bị để đọc online.
2. **Giải pháp:** nguồn đọc chính thức + điều phối bản sách giấy có sẵn theo lịch.
3. **Điểm sáng tạo:** giảm thông báo không phù hợp bằng thời khóa biểu nhưng vẫn giữ bảng yêu cầu mở; hai bước xác nhận tránh ép người dùng vào giao dịch.
4. **Khả thi:** trường cấp dữ liệu, thư viện hỗ trợ miễn phí, cá nhân chủ động cho mượn theo mức phí đề xuất. Cần kiểm chứng mức phí có phù hợp học sinh và trường hay không.
5. **Quyền nội dung:** chỉ dẫn nguồn chính thức; không phát tán scan. Không gọi đây là cam kết pháp lý tuyệt đối cho mọi mô hình thu phí.
6. **Chuyển tiếp:** yêu cầu hết hạn tự ẩn; khi có sách chính thức thì đóng nhu cầu và hoàn trả sách.
7. **Minh chứng:** demo luồng hoàn chỉnh, ảnh desktop/mobile, kết quả kiểm tra. Phân biệt số liệu demo với kết quả khảo sát thực tế.

## Những gì chưa được chứng minh bằng prototype

Không tuyên bố đã hợp tác với trường hoặc NXB, có học sinh thật sử dụng, tiết kiệm được một khoản xác định, hoặc vận hành ở quy mô lớn. Để đánh giá thực tế, có thể thí điểm có sự tham gia của trường rồi đo tỷ lệ ghép thành công, thời gian phản hồi, số lượt trả đúng hạn và chi phí phát sinh.

## Bộ bài nộp gọn

- Mã nguồn với README và đường dẫn demo nếu bạn tự triển khai lên hosting.
- Tài liệu thuyết minh theo cấu trúc trên, khoảng 3–5 trang.
- Video quay hành trình hai vai khoảng 3–5 phút.
- Ảnh minh chứng trong `docs/screenshots/`.

Không cần đưa mọi chi tiết kỹ thuật lên slide. Ưu tiên cho người chấm thấy một học sinh từ thiếu sách đến có sách để học.
