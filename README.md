# Jotform - Bitrix24 Integration

## Giới thiệu

Dự án tích hợp **Jotform** với **Bitrix24 CRM** bằng Node.js.

Khi người dùng gửi biểu mẫu trên Jotform, ứng dụng sẽ nhận dữ liệu thông qua Webhook, xử lý và ánh xạ các trường thông tin, sau đó sử dụng Bitrix24 REST API để tự động tạo một Contact mới trong Bitrix24.

### Luồng hoạt động

```text
Jotform Form
    │
    │ Submit
    ▼
Jotform Webhook
    │
    │ POST /webhook/jotform
    ▼
Node.js Application
    │
    ├── Parse dữ liệu submission
    ├── Kiểm tra dữ liệu
    ├── Gọi Jotform API khi có Submission ID
    └── Mapping dữ liệu
    │
    ▼
Bitrix24 REST API
    │
    ▼
CRM Contact
```

---

## Chức năng

* Nhận dữ liệu submission từ Jotform Webhook.
* Sử dụng Jotform API để kiểm tra kết nối và truy xuất submission.
* Tạo Contact mới trong Bitrix24 CRM.
* Ánh xạ dữ liệu chính xác:

  * Full Name → `NAME`
  * Phone Number → `PHONE`
  * Email → `EMAIL`
* Kiểm tra dữ liệu đầu vào.
* Xử lý lỗi khi parse dữ liệu hoặc gọi API.
* Ghi log quá trình xử lý.
* Tách source code theo Route, Controller, Service và Utility để dễ bảo trì và mở rộng.

---

## Công nghệ sử dụng

* Node.js
* Express.js
* Axios
* Multer
* dotenv
* Jotform API
* Bitrix24 REST API

---

## Cấu trúc dự án

```text
jotform-bitrix24-integration/
│
├── src/
│   ├── controllers/
│   │   └── jotform.controller.js
│   │
│   ├── routes/
│   │   └── jotform.route.js
│   │
│   ├── services/
│   │   ├── jotform.service.js
│   │   └── bitrix.service.js
│   │
│   └── utils/
│       ├── jotform.util.js
│       └── logger.js
│
├── .env
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md
```

### Giải thích

| Thư mục/File   | Chức năng                                 |
| -------------- | ----------------------------------------- |
| `routes`       | Khai báo API endpoints                    |
| `controllers`  | Xử lý request và response                 |
| `services`     | Làm việc với Jotform API và Bitrix24 API  |
| `utils`        | Parse dữ liệu và logging                  |
| `app.js`       | Khởi tạo Express server                   |
| `.env`         | Lưu biến môi trường và thông tin xác thực |
| `.env.example` | Mẫu cấu hình môi trường                   |
| `README.md`    | Hướng dẫn triển khai dự án                |

---

# 1. Yêu cầu môi trường

Cần cài đặt:

* Node.js 18 trở lên
* npm
* Tài khoản Jotform
* Tài khoản Bitrix24

Kiểm tra Node.js:

```bash
node -v
```

Kiểm tra npm:

```bash
npm -v
```

---

# 2. Cài đặt dự án

Clone repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Di chuyển vào thư mục dự án:

```bash
cd jotform-bitrix24-integration
```

Cài đặt dependencies:

```bash
npm install
```

Nếu chưa có `package.json`, có thể cài trực tiếp:

```bash
npm install express axios multer dotenv
```

---

# 3. Cấu hình Environment Variables

Tạo file `.env` tại thư mục gốc của dự án.

```env
PORT=3000

BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.vn/rest/USER_ID/WEBHOOK_CODE/

JOTFORM_API_KEY=your_jotform_api_key
JOTFORM_API_URL=https://api.jotform.com
```

## Giải thích

### PORT

Port chạy Node.js server.

```env
PORT=3000
```

### BITRIX24_WEBHOOK_URL

Webhook URL được tạo từ Bitrix24.

Ví dụ:

```env
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.vn/rest/USER_ID/WEBHOOK_CODE/
```

Ứng dụng sẽ gọi endpoint:

```text
crm.contact.add.json
```

URL cuối cùng có dạng:

```text
https://your-domain.bitrix24.vn/rest/USER_ID/WEBHOOK_CODE/crm.contact.add.json
```

### JOTFORM_API_KEY

API Key dùng để xác thực khi gọi Jotform API.

```env
JOTFORM_API_KEY=your_jotform_api_key
```

> Không commit API Key hoặc Bitrix24 Webhook URL thật lên GitHub.

---

# 4. Tạo Jotform Form

Tạo một biểu mẫu trên Jotform với 3 trường bắt buộc:

1. Full Name
2. Phone Number
3. Email

Cấu hình tất cả các trường là bắt buộc.

Dữ liệu được ánh xạ như sau:

| Jotform      | Bitrix24 |
| ------------ | -------- |
| Full Name    | `NAME`   |
| Phone Number | `PHONE`  |
| Email        | `EMAIL`  |

---

# 5. Thiết lập Jotform API

Tạo API Key trong tài khoản Jotform.

Thêm API Key vào file `.env`:

```env
JOTFORM_API_KEY=your_jotform_api_key
```

Ứng dụng sử dụng Jotform API để:

* Kiểm tra xác thực API.
* Kiểm tra kết nối với Jotform.
* Truy xuất dữ liệu Submission khi có Submission ID.

## Kiểm tra Jotform API

Khởi động server:

```bash
node app.js
```

Mở trình duyệt:

```text
http://localhost:3000/jotform/test
```

Nếu kết nối thành công, API trả về:

```json
{
  "status": "success",
  "message": "Connected to Jotform API successfully",
  "data": {
    "username": "...",
    "name": "...",
    "email": "..."
  }
}
```

---

# 6. Thiết lập Bitrix24 Webhook

Trong Bitrix24, tạo Inbound Webhook và cấp quyền phù hợp để thao tác với CRM Contact.

Lấy Webhook URL và thêm vào `.env`:

```env
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.vn/rest/USER_ID/WEBHOOK_CODE/
```

Ứng dụng sử dụng Bitrix24 REST API:

```text
crm.contact.add
```

để tạo Contact mới.

Payload gửi đến Bitrix24:

```json
{
  "fields": {
    "NAME": "Nguyen Van A",
    "PHONE": [
      {
        "VALUE": "0901234567",
        "VALUE_TYPE": "WORK"
      }
    ],
    "EMAIL": [
      {
        "VALUE": "example@email.com",
        "VALUE_TYPE": "WORK"
      }
    ]
  }
}
```

---

# 7. Cấu hình Jotform Webhook

Endpoint của ứng dụng:

```text
POST /webhook/jotform
```

Khi chạy local:

```text
http://localhost:3000/webhook/jotform
```

Jotform không thể gọi trực tiếp đến `localhost`, vì vậy khi chạy local cần sử dụng một public tunnel.

Ví dụ với ngrok:

```bash
ngrok http 3000
```

Sau đó ngrok cung cấp một public URL, ví dụ:

```text
https://example.ngrok-free.app
```

Cấu hình Webhook URL trên Jotform:

```text
https://example.ngrok-free.app/webhook/jotform
```

Luồng xử lý:

```text
Jotform Submit
      │
      ▼
POST /webhook/jotform
      │
      ▼
Parse rawRequest
      │
      ▼
Extract Name / Phone / Email
      │
      ▼
Validate Data
      │
      ▼
Jotform API
      │
      ▼
Bitrix24 API
      │
      ▼
Create Contact
```

---

# 8. API Endpoints

## Kiểm tra kết nối Jotform

```text
GET /jotform/test
```

Ví dụ:

```text
http://localhost:3000/jotform/test
```

Chức năng:

* Kiểm tra Jotform API Key.
* Kiểm tra kết nối với Jotform API.

---

## Nhận Jotform Webhook

```text
POST /webhook/jotform
```

Chức năng:

1. Nhận submission từ Jotform.
2. Parse dữ liệu `rawRequest`.
3. Lấy Full Name, Phone Number và Email.
4. Kiểm tra dữ liệu.
5. Gọi Jotform API nếu submission có Submission ID.
6. Gửi dữ liệu sang Bitrix24.
7. Tạo Contact mới.
8. Trả về Contact ID.

Response thành công:

```json
{
  "status": "success",
  "contact_id": 123
}
```

Response lỗi:

```json
{
  "status": "error",
  "message": "Failed to process submission"
}
```

---

# 9. Chạy ứng dụng

Chạy server:

```bash
node app.js
```

Kết quả mong đợi:

```text
Server running on port 3000
```

Nếu sử dụng `nodemon`:

Cài đặt:

```bash
npm install -D nodemon
```

Thêm scripts vào `package.json`:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

Chạy môi trường development:

```bash
npm run dev
```

---

# 10. Logging

Ứng dụng ghi log các hoạt động quan trọng:

* Nhận Jotform Webhook.
* Lấy Submission ID.
* Gọi Jotform API.
* Gửi dữ liệu đến Bitrix24.
* Tạo Contact thành công.
* Các lỗi xảy ra trong quá trình xử lý.

Ví dụ:

```text
[INFO] Received Jotform webhook
[INFO] Fetching submission from Jotform API
[INFO] Sending contact to Bitrix24
[INFO] Contact created successfully
```

Khi xảy ra lỗi:

```text
[ERROR] Jotform integration error
```

---

# 11. Error Handling

Ứng dụng xử lý các trường hợp:

### Invalid rawRequest

Nếu `rawRequest` không phải JSON hợp lệ:

```json
{
  "status": "error",
  "message": "Invalid rawRequest"
}
```

### Empty Contact Data

Nếu không có Full Name, Phone Number và Email:

```json
{
  "status": "error",
  "message": "Empty contact data"
}
```

### Jotform API Error

Nếu API Key không hợp lệ hoặc không thể kết nối đến Jotform API, ứng dụng ghi log lỗi và trả về response phù hợp.

### Bitrix24 API Error

Nếu Bitrix24 không tạo được Contact, ứng dụng ghi log lỗi và trả về thông báo lỗi.

---

# 12. Mapping dữ liệu

Ứng dụng sử dụng utility để tách dữ liệu từ Jotform:

```text
Jotform Field
     │
     ├── Full Name
     │       ↓
     │     NAME
     │
     ├── Phone Number
     │       ↓
     │     PHONE
     │
     └── Email
             ↓
           EMAIL
```

Ví dụ dữ liệu:

```text
Full Name: Nguyen Van A
Phone: 0901234567
Email: example@email.com
```

Dữ liệu gửi sang Bitrix24:

```text
NAME: Nguyen Van A
PHONE: 0901234567
EMAIL: example@email.com
```

---

# 13. Bảo mật

Không commit các file chứa thông tin xác thực.

File `.gitignore`:

```gitignore
node_modules/
.env
*.log
```

Tạo `.env.example`:

```env
PORT=3000

BITRIX24_WEBHOOK_URL=

JOTFORM_API_KEY=
JOTFORM_API_URL=https://api.jotform.com
```

Người khác có thể copy:

```bash
cp .env.example .env
```

Sau đó thêm thông tin xác thực của riêng họ.

---

# 14. Kiểm tra chức năng

## Test Jotform API

Truy cập:

```text
http://localhost:3000/jotform/test
```

Kết quả mong đợi:

```json
{
  "status": "success",
  "message": "Connected to Jotform API successfully"
}
```

## Test Webhook Integration

1. Khởi động Node.js server.
2. Chạy ngrok.
3. Cấu hình URL ngrok vào Jotform Webhook.
4. Điền Full Name, Phone Number và Email vào form.
5. Submit form.
6. Kiểm tra log server.
7. Kiểm tra Contact mới trong Bitrix24 CRM.

Kết quả mong đợi:

```text
Jotform Form
      ↓
Webhook Received
      ↓
Data Validated
      ↓
Jotform API Checked
      ↓
Bitrix24 API Called
      ↓
Contact Created Successfully
```

---

# 15. Tiêu chí hoàn thành

Dự án đáp ứng các chức năng chính:

* [x] Tạo Jotform Form.
* [x] Thu thập Full Name.
* [x] Thu thập Phone Number.
* [x] Thu thập Email.
* [x] Nhận submission bằng Webhook.
* [x] Sử dụng Jotform API.
* [x] Sử dụng Bitrix24 REST API.
* [x] Tạo Contact trong Bitrix24.
* [x] Mapping dữ liệu chính xác.
* [x] Xử lý lỗi.
* [x] Logging.
* [x] Clean project structure.
* [x] Environment configuration.
* [ ] Public Git repository.

---

# 16. Hướng phát triển

Một số hướng mở rộng trong tương lai:

* Kiểm tra Contact trùng Email hoặc Phone trước khi tạo.
* Cập nhật Contact nếu đã tồn tại.
* Lưu log vào file hoặc database.
* Thêm retry khi API tạm thời lỗi.
* Thêm webhook signature verification.
* Hỗ trợ tạo Lead hoặc Deal trong Bitrix24.
* Triển khai ứng dụng lên Render, Railway hoặc VPS để không cần ngrok.

---

## Tài liệu tham khảo

* Jotform API Documentation
* Bitrix24 REST API Documentation
* Bitrix24 Webhook Documentation
* Express.js Documentation
