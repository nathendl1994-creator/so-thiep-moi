# Hướng dẫn Triển khai ứng dụng React + Vite lên Netlify

Tài liệu này hướng dẫn bạn từng bước chi tiết để xây dựng (build) và triển khai ứng dụng này lên nền tảng **Netlify**.

## 1. Tổng quan cấu hình

Ứng dụng này sử dụng kiến trúc Single Page Application (SPA) xây dựng trên nền tảng **React**, **Vite**, **TypeScript** và **Tailwind CSS**.

- **Lệnh cài đặt**: `npm install`
- **Lệnh chạy thử (Development)**: `npm run dev`
- **Lệnh tạo bản phát hành (Build)**: `npm run build`
- **Thư mục xuất bản (Publish directory)**: `dist`
- **Cấu hình định hướng (Routing redirect)**: File `public/_redirects` đã được cấu hình sẵn để tránh lỗi 404 khi tải lại trang ở các URL con:
  ```text
  /* /index.html 200
  ```

---

## 2. Các bước triển khai lên Netlify

Có 2 cách phổ biến để bạn có thể triển khai dự án này lên Netlify:

### Cách 1: Kết nối trực tiếp với GitHub (Khuyên dùng - Tự động cập nhật)

1. **Đẩy mã nguồn lên một kho chứa (Repository) trên GitHub, GitLab, hoặc Bitbucket.**
2. **Truy cập vào trang quản trị Netlify:** Đăng nhập vào [Netlify Dashboard](https://app.netlify.com/).
3. **Thêm trang web mới:** Nhấp vào nút **"Add new site"** -> Chọn **"Import an existing project"**.
4. **Kết nối nhà cung cấp dịch vụ Git:** Chọn GitHub (hoặc nền tảng bạn dùng) và cấp quyền truy cập.
5. **Chọn Repository:** Chọn kho chứa của dự án này.
6. **Cấu hình Build Settings:** Netlify sẽ tự động nhận diện cấu hình của Vite. Hãy đảm bảo các thông số hiển thị chính xác như sau:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (Để trống nếu dự án nằm ở thư mục gốc)
7. **Cấu hình Biến môi trường (Environment Variables) - Nếu có:**
   - Nếu bạn sử dụng bất kỳ API key hoặc thông số nhạy cảm nào, hãy nhấp vào **"Advanced build settings"** hoặc cấu hình sau đó tại mục **Site configuration > Environment variables**.
   - Khai báo các khóa cần thiết (Ví dụ: `VITE_API_KEY`...) **Tuyệt đối không đẩy các mã khóa bí mật trực tiếp lên Git công khai.**
8. **Nhấp vào "Deploy site":** Netlify sẽ tiến hành kéo code, cài đặt gói phụ thuộc, build dự án và kích hoạt trang web của bạn sau vài giây.

---

### Cách 2: Triển khai thủ công (Netlify Drop - Kéo và Thả)

Nếu bạn không muốn liên kết Git hoặc muốn kiểm tra nhanh bản build:

1. **Chạy lệnh build ở môi trường nội bộ:**
   ```bash
   npm run build
   ```
2. Thư mục `dist` sẽ được tạo ra ở thư mục gốc của dự án.
3. Truy cập vào [Netlify Drop](https://app.netlify.com/drop).
4. Kéo và thả toàn bộ thư mục `dist` vào khung tải lên của Netlify.
5. Trang web của bạn sẽ được kích hoạt ngay lập tức!

---

## 3. Quản lý Biến môi trường (API Keys & Secrets)

- Dự án sử dụng tệp `.env.example` làm biểu mẫu hướng dẫn khai báo biến môi trường.
- Để sử dụng trong mã nguồn client-side React + Vite, các biến môi trường **bắt buộc** phải có tiền tố `VITE_` (Ví dụ: `VITE_MY_VARIABLE_NAME`).
- Trên Netlify, hãy thiết lập các biến này trong trang quản trị: **Site settings > Environment variables** để đảm bảo bảo mật tốt nhất.

---

Chúc bạn triển khai trang web thành công lên Netlify!
