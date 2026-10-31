# GreenPoint — Yêu cầu sản phẩm

> Nguồn: `GreenPoint.docx` (6 dòng mô tả tính năng + 1 ảnh mockup 10 màn hình).
> Nhãn nguồn: **[TL]** = có trong tài liệu gốc · **[MU]** = suy ra từ mockup · **[?]** = chưa rõ, cần chốt trước khi code.
> Design chi tiết: xem `design/DESIGN.md`. Ảnh từng màn: `design/screens/`.

## 1. Mô tả gốc (nguyên văn tài liệu) [TL]

1. **GreenMap** – Bản đồ các điểm thu gom gần người dùng, kèm loại rác được nhận, giờ hoạt động và hướng dẫn phân loại.
2. **Đổi rác lấy điểm** – Người dùng mang chai nhựa, lon nhôm, giấy carton đã phân loại đến điểm thu gom. Nhân viên cân và xác nhận khối lượng để hệ thống cộng điểm.
3. **GreenRewards** – Đổi điểm lấy bình nước tái sử dụng, túi vải, cây xanh hoặc voucher từ doanh nghiệp đối tác.
4. **GreenImpact** – Thống kê khối lượng từng loại rác đã bàn giao, lịch sử giao dịch và tỷ lệ rác được chuyển đến đơn vị tái chế có xác nhận.
5. **GreenBusiness** – Bảng điều khiển cho điểm thu gom: tổng đơn, khối lượng, doanh thu, chi phí và lịch sử giao nhận.
6. **GreenCapital** – Tạo báo cáo hoạt động và nhu cầu đầu tư của cơ sở thu gom để kết nối với ngân hàng hoặc chương trình tài trợ phù hợp.

## 2. Actors

| Actor | Vai trò | Nguồn |
|---|---|---|
| Người dân (Citizen) | Tìm điểm thu gom, bàn giao rác, tích điểm, đổi quà, xem tác động | [TL] |
| Nhân viên điểm thu gom (Staff) | Cân rác, xác nhận khối lượng | [TL] |
| Chủ cơ sở thu gom (Business) | Xem dashboard, quản lý kho/đơn, tạo hồ sơ vay vốn | [TL] |
| Doanh nghiệp đối tác (Partner) | Cung cấp voucher/quà | [TL] |
| Đơn vị tái chế (Recycler) | Xác nhận đã tiếp nhận rác | [TL] (cách xác nhận [?]) |
| Ngân hàng / quỹ tài trợ | Thẩm định, cấp vốn — nằm ngoài hệ thống | [TL] |

App có 2 vai trò giao diện: **Citizen app** (màn 01–08) và **Business app** (màn 09–10). [MU]

## 3. Luồng nghiệp vụ

### 3.1 Đổi rác lấy điểm [TL + MU]
1. Citizen chọn loại rác và nhập khối lượng → hệ thống hiển thị **tổng điểm dự kiến** (màn 04).
2. Bấm "Tiếp tục" → hệ thống tạo giao dịch, sinh **mã giao dịch + QR** (ví dụ `#GP256789`) (màn 05).
3. Tại điểm thu gom, Staff quét QR, cân thực tế rồi xác nhận hoặc từ chối kèm lý do. [TL] Màn: Quét mã nhận rác, Cân và xác nhận.
4. Giao dịch chuyển sang **Đã xác nhận** và cộng điểm theo số cân thực tế, hoặc **Bị từ chối** và không cộng điểm. [MU + quyết định Q-01, Q-02]

### 3.2 Đổi quà [MU]
1. Citizen vào "Đổi quà" (màn 06), lọc theo danh mục, bấm "Đổi quà" trên một món.
2. Trừ điểm, ghi giao dịch loại "Đổi quà" với số điểm âm (màn 08).
3. Cách nhận quà / dùng voucher: [?]

### 3.3 Tạo hồ sơ vay vốn [TL + MU]
1. Business vào GreenCapital (màn 10), chọn mục đích cần vốn.
2. Bấm "Tạo hồ sơ vay vốn" → hệ thống tạo báo cáo hoạt động từ dữ liệu thu gom. [TL]
3. Gửi/kết nối tới ngân hàng hoặc chương trình tài trợ. Cơ chế gửi: [?]

## 4. Quy tắc nghiệp vụ

| ID | Quy tắc | Nguồn |
|---|---|---|
| BR-01 | Điểm = Σ (khối lượng × đơn giá điểm của loại rác) | [MU] |
| BR-02 | Đơn giá: Giấy/bìa carton 10 điểm/kg · Chai nhựa PET 15 điểm/kg · Lon nhôm 20 điểm/kg. Ví dụ 2 kg + 1 kg + 0,5 kg = 20 + 15 + 10 = 45 điểm | [MU] |
| BR-03 | Khối lượng nhập theo bước 0,5 kg, tối thiểu 0 | [MU] |
| BR-04 | Chỉ cộng điểm sau khi Staff xác nhận; trước đó điểm chỉ là "dự kiến" | [TL + MU] |
| BR-05 | Đổi quà trừ điểm theo giá quà; không được đổi khi không đủ điểm | [MU] (rule chặn [?] nhưng hiển nhiên) |
| BR-06 | Giá quà: Túi vải canvas 100 · Voucher Highlands Coffee 150 · Bình nước tái sử dụng 200 · Cây xanh mini 300 điểm | [MU] |
| BR-07 | Lịch sử: giao dịch "Đổi rác" hiển thị điểm dương (xanh), "Đổi quà" điểm âm (đỏ) | [MU] |
| BR-08 | GreenCapital chỉ kết nối và cung cấp dữ liệu; việc cấp tín dụng phụ thuộc quy định và thẩm định của ngân hàng/tổ chức tài chính (phải hiển thị disclaimer) | [MU] |
| BR-09 | Điểm thu gom có: danh sách loại rác nhận, giờ mở cửa, địa chỉ, toạ độ | [TL + MU] |

## 5. Tính năng theo module

| ID | Module | Chức năng | Màn | Nguồn |
|---|---|---|---|---|
| F-01 | Onboarding | Splash, nút "Bắt đầu", link "Đăng nhập" | 01 | [MU] |
| F-02 | Home | Tổng điểm, kg đã bàn giao, số lần giao dịch, 4 lối tắt | 02 | [MU] |
| F-03 | GreenMap | Bản đồ điểm thu gom gần nhất, vị trí người dùng, tìm theo tên/khu vực, lọc theo loại rác, card chi tiết + "Chỉ đường" | 03 | [TL + MU] |
| F-04 | GreenMap | Hướng dẫn phân loại rác | Hướng dẫn (mới) | [TL] |
| F-05 | Đổi rác | Chọn loại + khối lượng, tính điểm dự kiến, stepper 3 bước | 04 | [TL + MU] |
| F-06 | Đổi rác | Mã giao dịch + QR, trạng thái xác nhận | 05 | [MU] |
| F-07 | Đổi rác | Màn Staff: quét QR, nhập số cân, xác nhận/từ chối | Quét mã, Cân và xác nhận (mới) | [TL] |
| F-08 | GreenRewards | Danh mục quà, lọc theo Vật phẩm xanh / Voucher / Cây xanh, đổi quà | 06 | [TL + MU] |
| F-09 | GreenImpact | Tổng kg, quy đổi tương đương, tỷ lệ có xác nhận tiếp nhận; tab Tổng quan / Chi tiết / Chứng nhận | 07 | [TL + MU] |
| F-10 | GreenImpact | Lịch sử giao dịch, lọc Tất cả / Đổi rác / Đổi quà | 08 | [TL + MU] |
| F-11 | GreenBusiness | Tổng kg thu gom (so tháng trước), đơn hôm nay, doanh thu ước tính, Quản lý kho (Tồn kho / Đơn hàng / Báo cáo) | 09 | [TL + MU] |
| F-12 | GreenBusiness | Chi phí, lịch sử giao nhận | Lịch sử giao nhận ở tab Quản lý; chi phí chưa có màn | [TL] |
| F-13 | GreenCapital | Chọn mục đích vay, tạo hồ sơ vay vốn, disclaimer | 10 | [TL + MU] |

## 6. Thực thể dữ liệu (nháp, chỉ gồm trường thấy trong mockup)

- **User**: name, avatar, pointBalance
- **CollectionPoint**: name, address, lat/lng, acceptedWasteTypes[], openHours
- **WasteType**: code, name, pointsPerKg, image
- **RecycleTransaction**: code (`GP…`), userId, collectionPointId, items[{wasteType, weightKg}], estimatedPoints, confirmedPoints, status, createdAt
- **Reward**: name, category (green_item | voucher | plant), pointCost, image, partner
- **Redemption**: userId, rewardId, points, createdAt
- **BusinessStats**: totalWeightKg, monthOverMonthPct, ordersToday, estimatedRevenue
- **LoanApplication**: businessId, purposes[], status

## 7. Câu hỏi mở — cần chốt trước khi code

| ID | Câu hỏi |
|---|---|
| Q-01 | Ai nhập khối lượng? Tài liệu nói Staff cân, mockup cho Citizen tự nhập (dự kiến). Nếu số cân thực tế khác dự kiến thì điểm tính theo số nào? Citizen có được từ chối không? |
| Q-02 | Màn 05 chỉ có trạng thái "Đã xác nhận". Cần thêm trạng thái chờ Staff xác nhận, bị từ chối, hết hạn QR? |
| Q-03 | Chưa có màn cho Staff (quét QR, nhập cân, xác nhận) — Staff dùng Business app hay app riêng? |
| Q-04 | Hướng dẫn phân loại (F-04) đặt ở đâu? |
| Q-05 | GreenBusiness thiếu "chi phí" và "lịch sử giao nhận" (F-12). "Doanh thu ước tính" tính từ đâu? |
| Q-06 | Đơn vị tái chế xác nhận tiếp nhận bằng cách nào (portal, API, nhập tay)? |
| Q-07 | Dữ liệu mock không khớp: số dư 245 điểm nhưng lịch sử là +160 / −300. "6 lần giao dịch" có tính cả đổi quà không? |
| Q-08 | Bottom nav Business không thống nhất: màn 09 là "Báo cáo", màn 10 là "Tài chính". |
| Q-09 | Đăng ký/đăng nhập, KYC, điểm có hết hạn không, tồn kho quà, cách nhận quà, đối soát voucher với đối tác. |
| Q-10 | Dữ liệu nào chia sẻ cho ngân hàng khi tạo hồ sơ vay, và cơ chế đồng ý (consent) của cơ sở thu gom? |

## 8. Quyết định cho bản simulator web

Cập nhật lần cuối: 2026-10-30.

| Câu hỏi | Quyết định |
|---|---|
| Q-01 | Người dân khai khối lượng dự kiến ở màn 04. Nhân viên nhập số cân thực tế khi nhận rác. **Điểm cộng tính theo số cân thực tế** (BR-01), số dự kiến được giữ lại để đối chiếu. Người dân không cần đồng ý lại khi số cân khác dự kiến. Làm tròn `Math.round` từng dòng. Cân có độ chính xác 0,1 kg, tối đa 500 kg. |
| Q-02 | Giao dịch có ba trạng thái: **Chờ xác nhận**, **Đã xác nhận**, **Bị từ chối** kèm lý do. Không còn tự xác nhận sau 2 giây. Chưa có hạn dùng cho mã QR. |
| Q-03 | Nhân viên dùng tài khoản của điểm thu gom (`business`). Tab **Quản lý** có nút **Quét mã nhận rác**, danh sách chờ cân và lịch sử giao nhận. Ô "Đơn hàng" trên GreenBusiness mở tab này. Nhân viên chỉ xử lý được giao dịch của điểm thu gom mình. |
| Q-04 | Hướng dẫn phân loại (F-04) thuộc GreenMap: mở từ nút sách trên màn bản đồ, từ màn đổi rác và từ tab Cá nhân. |
| Q-07 | Giữ số dư 245 theo mockup. "Số lần giao dịch" đếm các giao dịch đã xác nhận, gồm cả đổi rác và đổi quà. |
| Q-08 | Tab thứ 3 của Business là "Tài chính" (GreenCapital). "Báo cáo" là ô trong Quản lý kho. |
| Q-09 | Đăng nhập mock: `citizen` và `business`, cùng mật khẩu `GreenPoint@2026`. Không dùng mật khẩu phổ biến như `123456` vì Chrome cảnh báo lộ mật khẩu bằng hộp thoại chặn cả tab sau khi đăng nhập. |
| F-03 | Vị trí người dùng lấy từ GPS của thiết bị. Không có quyền hoặc không có tín hiệu thì dùng vị trí mặc định gần ĐH Bách Khoa và báo trên bản đồ. 6 điểm thu gom mẫu ở Hà Nội giữ nguyên (nhân viên gắn với Green-House). Khi có vị trí thật, app sinh thêm điểm mẫu quanh người dùng, cố định theo ô lưới khoảng 1,6 km, không sinh trong bán kính 2 km quanh điểm mẫu Hà Nội. Địa chỉ của các điểm này là mẫu. Đi xa hơn 500 m so với lần căn khung trước thì bản đồ căn lại vào người dùng và 3 điểm gần nhất. |
| F-07 | Quét QR bằng camera sau của thiết bị, dùng BarcodeDetector nếu trình duyệt hỗ trợ, nếu không thì dùng thư viện jsQR. Luôn có ô nhập mã tay. Không có máy chủ nên chỉ quét được giao dịch tạo trên cùng trình duyệt. |
