# Hướng dẫn backend Node.js trong dự án

## 1. Node.js là gì?
Node.js là một môi trường chạy JavaScript phía server (máy chủ). Thay vì chỉ chạy JS trên trình duyệt, Node.js cho phép bạn xây dựng các ứng dụng web, API, server...

### Hình minh họa:
```
[Trình duyệt] <----> [Node.js Backend] <----> [Cơ sở dữ liệu]
```

## 2. Các thành phần backend trong project này
- **server.js**: File khởi động server Node.js.
- **controllers/**: Chứa các hàm xử lý logic (ví dụ: userController.js).
- **models/**: Định nghĩa cấu trúc dữ liệu (ví dụ: userModel.js).
- **routes/**: Định nghĩa các đường dẫn API (ví dụ: userRoutes.js).
- **middlewares/**: Các hàm trung gian xử lý trước khi vào controller (ví dụ: protectRoute.js).
- **database/**: Kết nối tới cơ sở dữ liệu (connectDB.js).
- **utils/**: Các hàm tiện ích (ví dụ: generateTokenAndSetCookie.js).

## 3. Luồng xử lý một request (yêu cầu)

```
[Client gửi request]
      |
      v
[Route] ---> [Middleware] ---> [Controller] ---> [Model/Database]
      |           |                 |                 |
      |           |                 |                 |
      +-----------+-----------------+-----------------+
```

### Ví dụ thực tế:
1. Người dùng gửi yêu cầu đăng nhập tới `/api/users/login`.
2. Route `/login` gọi middleware kiểm tra dữ liệu.
3. Nếu hợp lệ, controller xử lý đăng nhập, kiểm tra tài khoản trong database.
4. Nếu đúng, trả về token xác thực cho client.

## 4. Một số kỹ thuật đã áp dụng trong project

| Kỹ thuật                | Ý nghĩa & Giải thích dễ hiểu |
|-------------------------|------------------------------|
| Express.js              | Framework giúp xây dựng API nhanh, dễ tổ chức code |
| Middleware              | Hàm trung gian kiểm tra, xử lý dữ liệu trước khi vào controller (ví dụ: kiểm tra đăng nhập) |
| JWT (JSON Web Token)    | Kỹ thuật xác thực, giúp bảo vệ API, chỉ cho phép người dùng hợp lệ truy cập |
| Mô hình MVC             | Chia code thành Model (dữ liệu), View (giao diện), Controller (xử lý logic) |
| Kết nối Database        | Sử dụng file connectDB.js để kết nối tới cơ sở dữ liệu (ví dụ: MongoDB) |
| Tách code thành module  | Mỗi chức năng (user, auth, ...) nằm ở file riêng, dễ bảo trì |

## 5. Sơ đồ minh họa luồng đăng nhập
```
[Client]
   |
   v
[POST /api/users/login]
   |
   v
[Middleware kiểm tra dữ liệu]
   |
   v
[Controller kiểm tra tài khoản]
   |
   v
[Database: Tìm user]
   |
   v
[Trả về token nếu đúng]
```

## 6. Ví dụ xử lý nghiệp vụ thực tế
### Luồng đăng nhập chi tiết
1. **Client gửi yêu cầu đăng nhập** với email và mật khẩu lên API `/api/users/login`.
2. **Route** nhận request và chuyển cho controller `loginUser`.
3. **Controller** thực hiện các bước:
   - Lấy email, mật khẩu từ request body.
   - Kiểm tra dữ liệu có hợp lệ không (có thiếu trường nào không).
   - Tìm user trong database theo email.
   - Nếu không tìm thấy user, trả về lỗi "Tài khoản không tồn tại".
   - Nếu tìm thấy, so sánh mật khẩu đã nhập với mật khẩu đã lưu (thường đã được mã hóa).
   - Nếu sai mật khẩu, trả về lỗi "Sai mật khẩu".
   - Nếu đúng, tạo JWT token, lưu token vào cookie hoặc trả về cho client.
   - Trả về thông tin user (trừ mật khẩu) và token.

#### Ví dụ code chi tiết (userController.js)
```js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // 1. Kiểm tra dữ liệu đầu vào
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
  }
  // 2. Tìm user trong database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Tài khoản không tồn tại' });
  }
  // 3. So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Sai mật khẩu' });
  }
  // 4. Tạo token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // 5. Trả về thông tin user (ẩn mật khẩu) và token
  res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      // ...các thông tin khác
    },
    token,
  });
};
```

### Luồng bảo vệ route (middleware protectRoute.js)
1. **Client gửi request** kèm token (thường ở header hoặc cookie).
2. **Middleware** kiểm tra token:
   - Nếu không có token, trả về lỗi "Chưa đăng nhập".
   - Nếu có, xác thực token bằng JWT.
   - Nếu token hợp lệ, lấy thông tin user từ token, cho phép đi tiếp.
   - Nếu token sai/hết hạn, trả về lỗi "Token không hợp lệ".

#### Ví dụ code chi tiết (protectRoute.js)
```js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protectRoute = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
```

### Sơ đồ minh họa nghiệp vụ đăng nhập & bảo vệ route
```
[Client]
   |
   v
[POST /api/users/login]
   |
   v
[Controller: loginUser]
   |
   v
[Tìm user, kiểm tra mật khẩu, tạo token]
   |
   v
[Trả về token cho client]
   |
   v
[Client gửi request mới kèm token]
   |
   v
[Middleware: protectRoute kiểm tra token]
   |
   v
[Controller xử lý tiếp nếu hợp lệ]
```

## 7. Một số lệnh thường dùng với backend Node.js
- Cài thư viện:
  ```sh
  npm install ten-thu-vien
  ```
- Chạy server:
  ```sh
  node server.js
  ```
- Nếu dùng nodemon (tự động reload khi sửa code):
  ```sh
  npx nodemon server.js
  ```

## 8. Tài liệu tham khảo
- [Tài liệu Express.js](https://expressjs.com/vi/)
- [Tài liệu Node.js](https://nodejs.org/vi/docs/)
- [Giới thiệu về JWT](https://jwt.io/introduction)

---
