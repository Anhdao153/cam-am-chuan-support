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
