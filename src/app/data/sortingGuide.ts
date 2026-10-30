import type { WasteCode } from '@/app/domain/types'

/** F-04 — Hướng dẫn phân loại: what each collection point accepts and how to prepare it. */
export interface GuideEntry {
  code: WasteCode
  accepted: string[]
  notAccepted: string[]
  prepare: string[]
  tip: string
}

export const SORTING_GUIDE: readonly GuideEntry[] = [
  {
    code: 'paper',
    accepted: [
      'Thùng, hộp bìa carton',
      'Báo, tạp chí, sách vở cũ',
      'Giấy in, giấy viết đã dùng',
      'Hộp giấy khô và sạch: hộp bánh, hộp giày',
    ],
    notAccepted: [
      'Giấy ăn, khăn giấy đã dùng',
      'Giấy dính dầu mỡ hoặc thức ăn',
      'Giấy bị ướt hoặc mốc',
      'Cốc giấy, hộp sữa có lớp tráng nhựa hoặc nhôm',
      'Giấy than, giấy decal, giấy ép plastic',
    ],
    prepare: [
      'Gỡ băng dính, ghim bấm và kẹp kim loại',
      'Gấp phẳng thùng carton để gọn chỗ',
      'Buộc thành bó và giữ khô ráo',
    ],
    tip: 'Giấy càng khô và sạch thì càng dễ tái chế.',
  },
  {
    code: 'pet',
    accepted: [
      'Chai nước suối, nước ngọt, trà đóng chai',
      'Chai có ký hiệu ♳ hoặc chữ PET ở đáy',
      'Chai dầu ăn đã rửa sạch',
    ],
    notAccepted: [
      'Túi nilon, màng bọc thực phẩm',
      'Hộp xốp, ly nhựa mỏng dùng một lần',
      'Ống hút, thìa nĩa nhựa',
      'Chai còn nước hoặc chất lỏng bên trong',
      'Chai từng đựng hoá chất, thuốc bảo vệ thực vật',
    ],
    prepare: ['Đổ hết nước và tráng sơ', 'Tháo nắp, bóc nhãn nếu được', 'Bóp dẹt chai cho gọn'],
    tip: 'Nắp chai thường làm từ loại nhựa khác, nên để riêng.',
  },
  {
    code: 'aluminum',
    accepted: ['Lon nước ngọt, lon bia', 'Lon nước tăng lực, cà phê lon'],
    notAccepted: [
      'Lon sắt, vỏ đồ hộp: loại hút nam châm',
      'Bình xịt còn gas, lon sơn, lon hoá chất',
      'Giấy bạc dính thức ăn',
    ],
    prepare: ['Đổ hết nước và tráng qua', 'Bóp dẹt lon, không cần bóc nhãn'],
    tip: 'Lon nhôm nhẹ và không hút nam châm. Lon hút nam châm là lon sắt.',
  },
]

/** Never accepted at GreenPoint collection points, and where it should go instead. */
export const NOT_COLLECTED: readonly { label: string; note: string }[] = [
  { label: 'Pin, ắc quy, bóng đèn', note: 'Mang đến điểm thu hồi pin và rác điện tử' },
  { label: 'Thiết bị điện tử, dây điện', note: 'Mang đến điểm thu hồi rác điện tử' },
  { label: 'Thủy tinh vỡ, gốm sứ', note: 'Gói kỹ rồi bỏ vào rác thải còn lại' },
  { label: 'Thức ăn thừa, rác hữu cơ', note: 'Bỏ vào thùng rác thực phẩm hoặc ủ phân' },
  { label: 'Tã, khẩu trang, rác y tế', note: 'Buộc kín túi, bỏ vào rác thải còn lại' },
]
