# Hướng dẫn sử dụng Docker cho dự án

## 1. Docker là gì?
Docker là một nền tảng giúp đóng gói ứng dụng và các thành phần phụ thuộc vào trong các container. Điều này giúp bạn dễ dàng triển khai, chạy ứng dụng trên nhiều môi trường khác nhau mà không lo bị lỗi do khác biệt môi trường.

### Hình minh họa: So sánh truyền thống vs Docker

| Truyền thống (Không Docker) | Sử dụng Docker |
|----------------------------|---------------|
| Cài đặt thủ công từng phần mềm, dễ lỗi do khác môi trường | Đóng gói mọi thứ vào container, chạy ở đâu cũng giống nhau |
| Khó triển khai lên server mới | Dễ dàng triển khai, chỉ cần cài Docker |

```
+-------------------+         +-------------------+
|  Máy tính A       |         |  Máy tính B       |
|  Python 3.8       |         |  Python 3.10      |
|  Flask 2.0        |         |  Flask 2.2        |
+-------------------+         +-------------------+
=> Có thể lỗi khi chuyển code!

Với Docker:
+-------------------+
|  Container        |
|  Python 3.8       |
|  Flask 2.0        |
+-------------------+
=> Chạy ở đâu cũng giống nhau!
```

## 2. Các thành phần chính trong dự án
- **Dockerfile**: Định nghĩa cách build image cho service (ví dụ: `aiService/Dockerfile`).
- **docker-compose.yaml**: Quản lý nhiều container (service) cùng lúc, định nghĩa cách các service kết nối với nhau.

### Ví dụ thực tế:
- Bạn có thể tưởng tượng Dockerfile giống như "công thức nấu ăn" để tạo ra một chiếc bánh (image). Khi có công thức, bạn có thể làm ra nhiều chiếc bánh giống hệt nhau.
- docker-compose.yaml giống như "menu" để gọi nhiều món ăn (nhiều container) cùng lúc, và sắp xếp chúng làm việc với nhau.

## 3. Cài đặt Docker
- Tải và cài đặt Docker Desktop: https://www.docker.com/products/docker-desktop/
- Kiểm tra cài đặt:
  ```sh
  docker --version
  docker compose version
  ```

## 4. Cấu trúc Docker trong dự án này
- `aiService/`: Chứa mã nguồn Python, Dockerfile để build image cho AI service.
- `backend/`: Thường sẽ có Dockerfile riêng nếu muốn đóng gói backend Node.js.
- `frontend/`: Có thể đóng gói frontend React nếu muốn.
- `docker-compose.yaml`: Quản lý các service trên.

### Sơ đồ tổng quan các service
```
+-----------+      +----------+      +----------+
| frontend  |<---->| backend  |<---->| aiService|
+-----------+      +----------+      +----------+
     |                |                |
     |                |                |
     +---------------------------------+
                 Docker
```

## 5. Giải thích file docker-compose.yaml
Ví dụ (giả sử có 3 service):
```yaml
version: '3.8'
services:
  ai-service:
    build: ./aiService
    ports:
      - "5000:5000"
    volumes:
      - ./aiService:/app
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
```
- `build`: Đường dẫn tới Dockerfile của service.
- `ports`: Mở cổng từ máy host sang container.
- `volumes`: Gắn thư mục mã nguồn vào container (hỗ trợ hot reload).

### Giải thích dễ hiểu:
- Khi bạn chạy `docker compose up`, Docker sẽ tạo ra 3 container tương ứng với 3 service trên, mỗi container giống như một "máy tính mini" chạy riêng biệt.
- `ports` giúp bạn truy cập vào các service từ trình duyệt hoặc các ứng dụng khác.

## 6. Các lệnh Docker cơ bản
- Build image cho 1 service:
  ```sh
  docker build -t ten-image .
  ```
- Chạy container từ image:
  ```sh
  docker run -p 5000:5000 ten-image
  ```
- Dùng docker compose để build & chạy toàn bộ project:
  ```sh
  docker compose up --build
  ```
- Dừng các container:
  ```sh
  docker compose down
  ```

### Ví dụ thực tế:
- Nếu bạn muốn chạy riêng AI service:
  ```sh
  cd aiService
  docker build -t ai-service .
  docker run -p 5000:5000 ai-service
  ```
- Nếu muốn chạy tất cả cùng lúc (frontend, backend, aiService):
  ```sh
  cd .. # về thư mục gốc dự án
  docker compose up --build
  ```

## 7. Quy trình chạy project với Docker Compose
1. Mở terminal tại thư mục gốc dự án.
2. Chạy lệnh:
   ```sh
   docker compose up --build
   ```
3. Truy cập các service qua trình duyệt:
   - AI Service: http://localhost:5000
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173

### Sơ đồ luồng hoạt động
```
[Trình duyệt] -> [Frontend] -> [Backend] -> [AI Service]
```

## 8. Một số lưu ý
- Khi thay đổi code, nếu dùng `volumes` thì không cần build lại image.
- Nếu thay đổi file Dockerfile hoặc cài thêm package, cần build lại bằng `docker compose up --build`.
- Kiểm tra log container:
  ```sh
  docker compose logs -f
  ```
- Nếu gặp lỗi port đã được sử dụng, hãy dừng container cũ bằng:
  ```sh
  docker compose down
  ```

## 9. Tài liệu tham khảo
- [Tài liệu Docker chính thức](https://docs.docker.com/)
- [Tài liệu Docker Compose](https://docs.docker.com/compose/)

---
