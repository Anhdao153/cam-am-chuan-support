# cam-am-chuan-support.github.io

Trang hỗ trợ và chính sách quyền riêng tư của ứng dụng Cảm Âm Chuẩn.

## Cập nhật trang chính sách quyền riêng tư

`privacy.html` được sinh tự động từ API:

```sh
npm run build:privacy
```

Hoặc chạy trực tiếp:

```sh
node scripts/build-privacy.mjs
```

Script gọi `https://api-prod.pikzone.vn/api/v1/policy`, chuyển nội dung Markdown
trong `data.policy` thành HTML và ghi đè `privacy.html`. Nếu API lỗi, file cũ được giữ nguyên.

## Song ngữ Việt / Anh

Trang hỗ trợ và trang chính sách đều có nút chuyển ngôn ngữ `VI` / `EN` ở header.
Lựa chọn được lưu trong `localStorage` (khóa `camamchuan.lang`); nếu chưa có lựa chọn,
trang mặc định tiếng Anh khi trình duyệt dùng tiếng Anh và tiếng Việt cho các trường hợp còn lại.

Nội dung tiếng Việt của chính sách lấy từ API. Nội dung tiếng Anh được lưu thủ công tại
`content/privacy.en.md`, nên khi API thay đổi nội dung tiếng Việt cần cập nhật lại bản dịch này.
Mã xử lý chuyển ngôn ngữ dùng chung nằm ở `assets/lang.js`.
