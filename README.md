# GreenPoint — web simulator

App GreenPoint (đổi rác lấy điểm) chạy trên trình duyệt trong một **máy ảo điện thoại**: khung máy, status bar, Dynamic Island / punch-hole, home indicator, và nút chuyển **iOS ↔ Android** ngay trên thanh công cụ.

- Yêu cầu sản phẩm: [docs/requirements.md](docs/requirements.md)
- Design spec + ảnh mockup: [design/DESIGN.md](design/DESIGN.md), [design/screens/](design/screens/)

## Chạy

Cần Node ≥ 22.12 (dự án dùng Node 26, có `.nvmrc`).

```bash
nvm use
npm install
npm run dev          # http://localhost:5173  (simulator)
```

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server. `/` là simulator, `/app.html` là app chạy riêng (mở được trên điện thoại thật) |
| `npm test` | Unit test (vitest): tính điểm, luồng nghiệp vụ, định dạng số/ngày |
| `npm run typecheck` · `npm run lint` | Kiểm tra TypeScript và ESLint |
| `npm run build` · `npm run preview` | Build production vào `dist/` và chạy thử |

## Deploy lên GitHub Pages

Bản chạy online: https://anhnt2003.github.io/green-point/

Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) chạy mỗi khi push lên `master` hoặc `main`, và có thể chạy tay trong tab Actions. Các bước: cài dependency, lint, chạy test, build với đường dẫn con của repo rồi deploy. Lint hoặc test lỗi thì không deploy.

Cấu hình một lần duy nhất: vào Settings > Pages của repo, mục Build and deployment, chọn Source là **GitHub Actions**.

Muốn thử bản build dưới đường dẫn con ở máy:

```bash
BASE_PATH=/green-point/ npm run build
BASE_PATH=/green-point/ npm run preview   # http://localhost:4173/green-point/
```

## Tài khoản demo

| Tài khoản | Mật khẩu | Vào |
|---|---|---|
| `citizen` | `GreenPoint@2026` | App người dân (màn 01–08) |
| `business` | `GreenPoint@2026` | App điểm thu gom (màn 09–10) |

Màn đăng nhập có nút điền nhanh. Không dùng mật khẩu phổ biến như `123456`: Chrome phát hiện mật khẩu bị lộ và mở hộp thoại cảnh báo chặn cả tab ngay sau khi đăng nhập.

## Thanh công cụ simulator

- **iOS / Android**: đổi khung máy và phong cách UI ngay lập tức, giữ nguyên màn hình đang mở.
- **Đăng nhập nhanh**: Người dân, Điểm thu gom, Đăng xuất.
- **Reset dữ liệu**: xoá dữ liệu đã lưu, về dữ liệu mẫu (245 điểm, 8.5 kg, 6 giao dịch).
- **Back** (khi ở Android): nút Back hệ thống.
- **Vừa màn hình / 100%**: thu nhỏ máy cho vừa cửa sổ hoặc hiển thị đúng 390×844.
- **Mở riêng**: mở app không có khung máy.

Khác biệt iOS và Android: status bar, Dynamic Island hoặc punch-hole, nút back (chevron hoặc mũi tên), tiêu đề căn giữa hoặc căn trái, bottom nav (tab bar hoặc Material 3 có pill), hiệu ứng chuyển trang (slide hoặc fade-through), phản hồi chạm (mờ hoặc ripple), dialog (alert iOS hoặc Material dialog), thông báo (banner trên hoặc snackbar dưới), ô nhập (filled hoặc outlined). Màu, cỡ chữ, bo góc giữ đúng token trong DESIGN.md.

## Kiến trúc

- **React 19 + Vite 8 + TypeScript**, CSS Modules với token trong [src/app/styles/tokens.css](src/app/styles/tokens.css).
- **Shell và app tách hai trang**. Simulator ([src/shell/](src/shell/)) nhúng app ([src/app/](src/app/)) qua `<iframe>` 390×844 và giao tiếp bằng `postMessage` ([src/shared/bridge.ts](src/shared/bridge.ts)). Thu nhỏ khung máy bằng CSS transform không làm lệch toạ độ chuột của bản đồ, vì sự kiện trong iframe dùng hệ toạ độ riêng.
- **Bản đồ: MapLibre GL JS**, bản web của MapLibre Native, cùng style spec. Tile vector từ [OpenFreeMap](https://openfreemap.org) (không cần API key, có ghi công OpenStreetMap ở nút ⓘ), dự phòng tile raster OSM. Màn bản đồ được tải lười nên MapLibre (~1 MB) chỉ tải khi mở bản đồ.
- **Vị trí người dùng là vị trí thật** của thiết bị, theo dõi liên tục khi đang mở bản đồ. Lần định vị đầu tiên, bản đồ bao quát bạn và 3 điểm thu gom gần nhất. Danh sách và khoảng cách được sắp theo vị trí thật. Nút "vị trí của tôi" đưa bản đồ về chỗ bạn đứng. Nếu bị từ chối quyền, không có tín hiệu, hoặc trang không chạy qua https hay localhost, app dùng vị trí mặc định gần ĐH Bách Khoa, vẽ chấm màu xám và hiện dòng thông báo trên bản đồ. 6 điểm thu gom mẫu vẫn ở Hà Nội, nên ở xa Hà Nội sẽ thấy khoảng cách thật, ví dụ 1.140 km.
- **Dữ liệu mock** trong [src/app/data/seed.ts](src/app/data/seed.ts), lưu localStorage qua zustand. Toàn bộ quy tắc nghiệp vụ nằm trong hàm thuần ở [src/app/store/reducers.ts](src/app/store/reducers.ts). Màn hình chỉ gọi selector và action của store, nên sau này thay bằng API không ảnh hưởng UI.
- **Điều hướng**: `createMemoryRouter` (react-router 7), không đổi URL trình duyệt, back-stack giống native. Bottom nav đọc tab đang chọn từ `handle` của route.

## Quyết định cho các câu hỏi mở

| Câu hỏi | Cách làm trong simulator |
|---|---|
| Q-01, Q-02 xác nhận của nhân viên | Màn 05 hiện "Đang chờ xác nhận", sau ~2 giây tự chuyển "Đã xác nhận" và mới cộng điểm (BR-04). Điểm = điểm dự kiến, làm tròn từng dòng (0,5 kg PET = 8 điểm) |
| Q-07 số dư không khớp lịch sử | Giữ 245 điểm như mockup. "Số lần giao dịch" đếm cả đổi rác và đổi quà |
| Q-08 tab thứ 3 của Business | Dùng "Tài chính" (GreenCapital). "Báo cáo" là ô trong Quản lý kho |
| Màn chưa có mockup | Cá nhân, Quản lý, Tồn kho, Đơn hàng, Báo cáo là màn tối giản theo token. Quản lý hiện các lần bàn giao người dân gửi tới Green-House |

Giao dịch đổi rác của người dân được ghi vào điểm thu gom Green-House, nên tài khoản `business` thấy tổng kg và số đơn hôm nay tăng tương ứng.

## Chưa làm

Màn nhân viên quét QR và nhập số cân thực tế, hướng dẫn phân loại rác, backend. Mở `/app.html` trên điện thoại qua địa chỉ LAN dạng `http://192.168…` sẽ không định vị được, vì trình duyệt chỉ cho phép định vị trên https hoặc localhost.
