# GreenPoint — Design spec

## Cách dùng file này

- **Ảnh trong `screens/` là nguồn chính cho bố cục** (thứ tự, vị trí, tỉ lệ component).
- **File này là nguồn chính cho giá trị** (màu, cỡ chữ, bo góc, spacing, text).
- Khi ảnh và file này mâu thuẫn: màu/size theo file này, bố cục theo ảnh.
- Mockup gốc là ảnh raster (không có file Figma), nên mọi giá trị dưới đây là **ước lượng** lấy mẫu từ ảnh, tính trên khung iPhone rộng 390pt. Không tự thêm màu hay spacing ngoài các token dưới đây.

## 1. Design tokens

### Màu

| Token | Giá trị | Dùng cho |
|---|---|---|
| `primary` | `#218048` | Card tổng điểm, nút chính, chip đang chọn, progress fill, icon chính |
| `primary-dark` | `#0E3B25` | Logo text "GreenPoint", tiêu đề lớn |
| `primary-tint` | `#E6F3E8` | Nền icon tròn, nền card tổng điểm dự kiến, nền QR card |
| `primary-tint-strong` | `#D8ECDC` | Banner "Kết nối tín dụng xanh" |
| `warm-tint` | `#F8ECDC` | Nền icon quà trong lịch sử |
| `info-tint` | `#D2E7FB` | Track của progress bar |
| `danger` | `#E5383B` | Điểm âm (đổi quà), chấm đỏ thông báo |
| `text-primary` | `#1A1A1A` | Tiêu đề, số liệu |
| `text-secondary` | `#6B7280` | Mô tả phụ, timestamp, caption |
| `surface` | `#FFFFFF` | Card, list item, chip chưa chọn |
| `background` | `#F4F8F4` | Nền màn hình |
| `border` | `#E5E7EB` | Viền chip chưa chọn, viền ô stepper |
| `on-primary` | `#FFFFFF` | Text/icon trên nền primary |

### Typography

Font: sans-serif hỗ trợ tốt tiếng Việt (gợi ý **Be Vietnam Pro**; dùng system font nếu không nhúng được).

| Token | Size / weight | Dùng cho |
|---|---|---|
| `display` | 32 / Bold | "245 điểm", "45 điểm", "1.250 kg" |
| `brand` | 36 / Bold | "GreenPoint" ở splash |
| `title` | 18 / SemiBold | Tiêu đề màn hình trên header |
| `heading` | 16 / SemiBold | Tiêu đề section ("Bạn muốn làm gì hôm nay?", "Quản lý kho") |
| `stat` | 22 / Bold | Số trên stat card ("8.5 kg", "6 lần", "15", "8.5 triệu") |
| `body` | 14 / Medium | Tên item, nội dung chính |
| `caption` | 12 / Regular | Mô tả phụ, timestamp, đơn giá "10 điểm/kg" |
| `nav` | 11 / Medium | Label bottom nav |

### Spacing, bo góc, đổ bóng

- Padding ngang màn hình: 16
- Khoảng cách giữa các card: 12
- Padding trong card: 16
- Bo góc: card 16 · card lớn/banner 20 · nút chính 24 (pill) · chip 999 (pill) · ảnh sản phẩm 12
- Nút chính: cao 48, full-width
- Chip: cao 32, padding ngang 16
- Shadow card: rất nhẹ, `0 2 8 rgba(0,0,0,0.06)`
- Bottom nav: cao ~64, nền `surface`, 4 tab, icon outline 24 + label `nav`

## 2. Components dùng chung

| Component | Mô tả |
|---|---|
| `AppHeader` | Nút back (chevron trái) + title căn giữa (`title`). Biến thể Home: logo lá + "GreenPoint" bên trái, icon chuông (có chấm `danger`) + avatar tròn bên phải |
| `PointsCard` | Nền `primary`, bo 20. Label "Tổng điểm hiện có", số `display` màu `on-primary`, hình lá góc phải, nút pill trắng chữ `primary` |
| `StatCard` | Nền `surface`, label `caption`, số `stat`, icon minh hoạ góc phải-dưới |
| `ActionTile` | Ô 2x2 trên Home: icon `primary` bên trái, tiêu đề `body` SemiBold, mô tả `caption` |
| `FilterChips` | Hàng chip cuộn ngang. Chọn: nền `primary`, chữ trắng. Chưa chọn: nền `surface`, viền `border`, chữ `text-primary` |
| `PrimaryButton` | Nền `primary`, chữ trắng SemiBold 16, cao 48, pill |
| `QuantityStepper` | Nút tròn "−", giá trị ("2 kg"), nút tròn "+"; viền `border` |
| `Stepper3` | 3 bước tròn có số, bước hiện tại nền `primary`, các bước khác nền `primary-tint`; label dưới mỗi bước |
| `ListRow` | Icon tròn có nền tint bên trái, tiêu đề + timestamp, giá trị bên phải (xanh nếu dương, `danger` nếu âm) |
| `ProgressBar` | Cao 8, bo pill, track `info-tint`, fill `primary` |
| `BottomNav` | 4 tab, tab đang chọn: icon filled + label màu `primary`; còn lại `text-secondary` |

## 3. Điều hướng

- **Citizen app** — BottomNav: Trang chủ · Bản đồ · Lịch sử · Cá nhân
- **Business app** — BottomNav: Trang chủ · Quản lý · Báo cáo/Tài chính · Cá nhân (mockup không thống nhất tab thứ 3, xem Q-08 trong requirements)
- Màn 04, 05 là luồng con, không có BottomNav.

## 4. Đặc tả từng màn

### 01 — Splash / Onboarding · `screens/01-splash.png`
Nền gradient trắng → `primary-tint`. Từ trên xuống:
1. Logo lá (to, căn giữa)
2. "GreenPoint" (`brand`, `primary-dark`)
3. Tagline "Rác có giá trị, sống xanh có thưởng" (`body`, `primary`)
4. Hình minh hoạ: thành phố xanh, quả địa cầu, 4 thùng rác (xanh, xanh, vàng, xanh dương), lá bay
5. `PrimaryButton` "Bắt đầu"
6. Text link "Đăng nhập" (`primary`, SemiBold)

### 02 — Trang chủ · `screens/02-home.png` · nav: Trang chủ
1. `AppHeader` biến thể Home
2. "Xin chào, Tuấn Anh!" (`heading`) + "Cùng nhau vì một Việt Nam xanh hơn 🌿" (`caption`)
3. `PointsCard`: "Tổng điểm hiện có" · "245 điểm" · nút "Đổi quà"
4. 2 `StatCard` cạnh nhau: "Rác đã bàn giao — 8.5 kg" (icon chai) · "Số lần giao dịch — 6 lần" (icon tái chế)
5. Section "Bạn muốn làm gì hôm nay?" + lưới 2x2 `ActionTile`:
   - Tìm điểm thu gom / Gần bạn nhất (icon ghim bản đồ) → màn 03
   - Đổi rác lấy điểm / Quy trình đơn giản (icon tái chế) → màn 04
   - Đổi quà / Nhiều ưu đãi hấp dẫn (icon hộp quà) → màn 06
   - Theo dõi tác động / Vì môi trường xanh (icon lá) → màn 07

### 03 — Bản đồ điểm thu gom · `screens/03-map.png` · nav: Bản đồ
1. `AppHeader` "Điểm thu gom gần bạn"
2. Ô tìm kiếm (icon kính lúp, placeholder "Tìm điểm thu gom, khu vực...")
3. `FilterChips`: Tất cả (chọn) · Chai nhựa · Giấy · Kim loại
4. Bản đồ chiếm phần lớn màn: marker ghim `primary` có icon tái chế, chấm xanh dương là vị trí người dùng
5. Card nổi phía dưới bản đồ:
   - Icon tròn `primary` + "Điểm thu gom Green-House" (`body` SemiBold) + "0.8 km" (`caption`, có icon ghim) bên phải
   - "123 Lê Thanh Nghị, Q. Hai Bà Trưng"
   - "Nhận: Nhựa, Giấy, Kim loại"
   - "Mở cửa: 7:00 - 19:00"
   - `PrimaryButton` "Chỉ đường"

### 04 — Chọn loại rác & nhập khối lượng · `screens/04-recycle-select.png` · không nav
1. `AppHeader` "Đổi rác lấy điểm"
2. `Stepper3`: 1 Chọn loại rác (hiện tại) · 2 Xác nhận · 3 Hoàn tất
3. Section "Chọn loại rác và nhập khối lượng"
4. 3 card loại rác, mỗi card: ảnh vuông bo góc · tên + đơn giá (`caption`) · `QuantityStepper` bên phải
   - Giấy, bìa carton — 10 điểm/kg — 2 kg
   - Chai nhựa (PET) — 15 điểm/kg — 1 kg
   - Lon nhôm — 20 điểm/kg — 0.5 kg
5. Card nền `primary-tint`: "Tổng điểm dự kiến" + "45 điểm" (`display`, `primary`), cập nhật realtime theo BR-01
6. `PrimaryButton` "Tiếp tục"

### 05 — Xác nhận giao dịch · `screens/05-recycle-confirm-qr.png` · không nav
1. `AppHeader` "Xác nhận giao dịch"
2. Card nền `primary-tint`: mã QR trên nền trắng · "Mã giao dịch" (`caption`) · "#GP256789" (`heading`, Bold)
3. Card trạng thái nền `surface`: icon check tròn `primary` + "Đã xác nhận" + "Giao dịch của bạn đã được ghi nhận." + "+45 điểm" (`stat`, `primary`, căn giữa)
4. `PrimaryButton` "Quay lại trang chủ"

### 06 — Đổi quà · `screens/06-rewards.png` · nav: Trang chủ
1. `AppHeader` "Đổi quà" (title căn trái cạnh nút back)
2. `FilterChips`: Tất cả (chọn) · Vật phẩm xanh · Voucher · Cây xanh
3. Danh sách quà, mỗi item: ảnh 80x80 bo 12 bên trái · tên (`body`) + điểm (`stat`, nhỏ hơn: 16 Bold) · nút nhỏ "Đổi quà" (pill `primary`, cao 28) góc phải-dưới
   - Bình nước tái sử dụng — 200 điểm
   - Túi vải canvas — 100 điểm
   - Voucher Highlands Coffee — 150 điểm
   - Cây xanh mini — 300 điểm

### 07 — Tác động môi trường · `screens/07-impact.png` · nav: Cá nhân
1. `AppHeader` "Tác động của bạn" (title căn trái)
2. `FilterChips` dạng tab: Tổng quan (chọn) · Chi tiết · Chứng nhận
3. Card: icon tái chế + "Tổng khối lượng đã bàn giao" + "8.5 kg" (`stat`). Dưới đó "Tương đương" và 3 cột icon chia bởi vạch dọc mảnh:
   - ~ 17 chai nhựa 500ml · ~ 4 kg giấy · ~ 8 lon nhôm
4. Card: "Tỷ lệ đã có xác nhận tiếp nhận" + "80%" (`stat`) + `ProgressBar` 80%
5. Banner ảnh thành phố/rừng xanh, bo 20, chữ trắng đè lên: "Cùng nhau giảm rác thải" / "Kiến tạo tương lai xanh 🌿"

### 08 — Lịch sử giao dịch · `screens/08-history.png` · nav: Lịch sử
1. `AppHeader` "Lịch sử giao dịch" (title căn trái)
2. `FilterChips`: Tất cả (chọn) · Đổi rác · Đổi quà
3. Danh sách `ListRow`:
   - Đổi rác: icon tái chế trên nền `primary-tint`, giá trị dương màu `primary`
   - Đổi quà: icon hộp quà trên nền `warm-tint`, giá trị âm màu `danger`
   - Format thời gian: `HH:mm - dd/MM/yyyy`

### 09 — GreenBusiness · `screens/09-business-dashboard.png` · nav Business: Trang chủ
1. "GreenBusiness" (`title` lớn, căn trái) + "Dành cho điểm thu gom & doanh nghiệp" (`caption`)
2. Card: "Tổng khối lượng thu gom" + "1.250 kg" (`display`) + icon trend tăng bên phải + "+12% so với tháng trước" (`caption`, số màu `primary`)
3. 2 `StatCard`: "Đơn hàng hôm nay — 15" · "Doanh thu ước tính — 8.5 triệu" (số màu `primary`)
4. Section "Quản lý kho": 3 ô vuông cạnh nhau, icon `primary` + label: Tồn kho · Đơn hàng · Báo cáo
5. Banner nền `primary-tint-strong`: icon + "Kết nối tín dụng xanh" + mô tả "Tạo hồ sơ hoạt động để tiếp cận nguồn vốn ưu đãi từ ngân hàng, tổ chức tài chính." + nút nhỏ "Tìm hiểu thêm" → màn 10

### 10 — GreenCapital · `screens/10-green-capital.png` · nav Business: Tài chính
1. Logo nhỏ + "GreenCapital" (`title`) + "Kết nối vốn xanh - Phát triển bền vững" (`caption`, căn giữa)
2. Hình minh hoạ: chồng xu + cây non + toà ngân hàng, nền `primary-tint`, bo 20
3. "Bạn cần vốn để làm gì?" (`heading`)
4. Danh sách lựa chọn (icon check-circle viền `primary`), cho chọn nhiều:
   - Mua xe vận chuyển · Mua cân điện tử, thùng chứa · Mở rộng cơ sở thu gom · Đầu tư công nghệ tái chế
5. `PrimaryButton` "Tạo hồ sơ vay vốn"
6. Disclaimer (`caption`, `text-secondary`): "GreenPoint chỉ hỗ trợ kết nối và cung cấp dữ liệu. Việc cấp tín dụng phụ thuộc vào quy định và thẩm định của ngân hàng, tổ chức tài chính."

## 5. Mock data (khớp với mockup)

```json
{
  "user": { "name": "Tuấn Anh", "pointBalance": 245, "totalWeightKg": 8.5, "transactionCount": 6 },
  "wasteTypes": [
    { "code": "paper", "name": "Giấy, bìa carton", "pointsPerKg": 10 },
    { "code": "pet", "name": "Chai nhựa (PET)", "pointsPerKg": 15 },
    { "code": "aluminum", "name": "Lon nhôm", "pointsPerKg": 20 }
  ],
  "collectionPoints": [
    {
      "name": "Điểm thu gom Green-House",
      "address": "123 Lê Thanh Nghị, Q. Hai Bà Trưng",
      "distanceKm": 0.8,
      "accepts": ["Nhựa", "Giấy", "Kim loại"],
      "openHours": "7:00 - 19:00"
    }
  ],
  "rewards": [
    { "name": "Bình nước tái sử dụng", "category": "green_item", "points": 200 },
    { "name": "Túi vải canvas", "category": "green_item", "points": 100 },
    { "name": "Voucher Highlands Coffee", "category": "voucher", "points": 150 },
    { "name": "Cây xanh mini", "category": "plant", "points": 300 }
  ],
  "history": [
    { "type": "recycle", "points": 45, "at": "2025-04-15T12:30" },
    { "type": "redeem", "points": -200, "at": "2025-04-10T10:15" },
    { "type": "recycle", "points": 30, "at": "2025-04-05T14:20" },
    { "type": "redeem", "points": -100, "at": "2025-03-28T09:40" },
    { "type": "recycle", "points": 60, "at": "2025-03-20T16:10" },
    { "type": "recycle", "points": 25, "at": "2025-03-15T11:05" }
  ],
  "impact": { "equivalents": { "petBottles500ml": 17, "paperKg": 4, "aluminumCans": 8 }, "verifiedRecyclingRate": 0.8 },
  "business": { "totalWeightKg": 1250, "monthOverMonthPct": 12, "ordersToday": 15, "estimatedRevenueVnd": 8500000 }
}
```

> Lưu ý: số dư 245 điểm không khớp tổng lịch sử (+160 / −300). Đây là dữ liệu mock, giữ nguyên để khớp hình; xem Q-07.
> Tên người dùng mock đã đổi từ "Lan Anh" trong mockup gốc thành "Tuấn Anh".
