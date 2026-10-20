# AQUACARE SYSTEM - HARDWARE TEST SPECIFICATION (FACTORY EOL & PCBA BRING-UP)
## TÀI LIỆU QUY TRÌNH & BẢNG TEST CASE KIỂM THỬ PHẦN CỨNG SAU SẢN XUẤT (POST-MANUFACTURING QC)

> **DỰ ÁN**: Hệ Thống Quản Lý & Giám Sát Hồ Cá Thủy Sinh Thông Minh AquaCare (AquaCare IoT)
> **THIẾT KẾ PHẦN CỨNG**: Master Board (Board Master-Slave Architecture) - Dual-MCU (ESP32-WROOM-32UE + STM32F103C8T6)
> **PHIÊN BẢN PHẦN CỨNG (HW REV)**: Rev 2.1.0-RELEASE (KiCad 10.0 EDA)
> **NGÀY BAN HÀNH**: 20/10/2026
> **TIÊU CHUẨN ÁP DỤNG**: IPC-A-610G Class 2/3, ISO 9001:2015, IEC 61010-1, FCC Part 15 Subpart B/C
> **ĐỐI TƯỢNG SỬ DỤNG**: Kỹ sư phần cứng (HW Engineer), Kỹ thuật viên kiểm thử xuất xưởng (EOL / QC Technician), Đơn vị gia công PCBA (EMS / SMT Factory)

---

## MỤC LỤC TỔNG QUAN HỆ THỐNG KIỂM THỬ

| Phần | Mã Phân Hệ | Tên Hạng Mục Kiểm Thử | Số Lượng Test Cases | Mô Tả Trọng Tâm |
|:---|:---|:---|:---:|:---|
| **PHẦN 01** | `HW-MEC` | Kiểm tra Cơ - Quang Ngoại Quan (Visual & Mechanical Inspection) | 40 TC | Kiểm tra lỗi hàn SMT/THT, ngắn mạch chì, đảo cực linh kiện, cong vênh PCB |
| **PHẦN 02** | `HW-Z0`  | Đo Trở Kháng & Ngắn Mạch Nguội (Cold Impedance & Unpowered Checks) | 35 TC | Kiểm tra chạm chập đường nguồn Vin, 5V, 3.3V, diode flyback, TVS trước khi cấp điện |
| **PHẦN 03** | `HW-PWR` | Khối Quản Lý Nguồn & Ổn Áp Xung (Power Management & Buck TPS5430) | 65 TC | Kiểm tra bảo vệ ngược cực AOD407, TVS SMAJ28A, TPS5430 (12V->5V, 12V->3.3V), Ripple, Ferrite Bead |
| **PHẦN 04** | `HW-MCU` | Khối Vi Điều Khiển Lõi Kép (Dual-MCU: STM32F103C8T6 & ESP32-WROOM-32UE) | 70 TC | Kiểm tra dao động HSE 8MHz, LSE 32.768kHz, Nạp SWD ST-Link, Boot pins, Auto-reset, Reset pins |
| **PHẦN 05** | `HW-COM` | Khối Giao Tiếp & Nạp Chương Trình (CH340C USB-C & Inter-MCU UART Bus) | 45 TC | Giao tiếp USB-C CC1/CC2, CH340C UART, Auto-program DTR/RTS, UART2 Bus (ESP32 <-> STM32) 115200bps |
| **PHẦN 06** | `HW-SNS` | Khối Giao Tiếp Cảm Biến Môi Trường Nước & Khí (Sensor Front-Ends) | 80 TC | pH (PA5), TDS (PB1), SHT30 I2C (PB6/PB7), MAX31865 RTD PT100 SPI, FS300A Flow, Y26 Level, PZEM |
| **PHẦN 07** | `HW-ACT` | Khối Điều Khiển Tải Động Lực 4 Kênh Relay & Terminal (Relay Actuators) | 50 TC | 4 kênh Transistor S8050, Flyback SS34, LED chỉ thị, Chịu tải 220V/10A, Đóng ngắt cuộn hút |
| **PHẦN 08** | `HW-SWT` | Khối Công Tắc Chọn Điện Áp Phụ Trợ & Cổng Terminal (Power Routing) | 30 TC | Công tắc SW6, SW7, SW8 gạt nguồn 3.3V/5V/Vin ra terminal J19, J20, J22 |
| **PHẦN 09** | `HW-RF`  | Khối Vô Tuyến Không Dây Wi-Fi & Bluetooth (ESP32-WROOM-32UE RF) | 40 TC | Công suất phát Wi-Fi Tx, Độ nhạy thu Rx, RSSI, Cổng IPEX / Anten ngoài, Bluetooth LE beacon |
| **PHẦN 10** | `HW-ENV` | Thử Nghiệm Môi Trường, Độ Bền & Chống Nhiễu (Environmental & Stress) | 45 TC | Lão hóa nhiệt (Burn-in 48h 55°C), Độ ẩm cao 90% RH chống ăn mòn, Sốc nguồn, ESD, Phục hồi sau lỗi |

---

## THIẾT BỊ & CÔNG CỤ ĐO KIỂM BẮT BUỘC TRÊN DÂY CHUYỀN SẢN XUẤT

1. **Bộ Nguồn Đôi Lập Trình (Programmable DC Power Supply)**: 0 - 30V / 5A (Độ chính xác dòng điện 0.1mA, hỗ trợ Current Limit / OCP / OVP). Model khuyến nghị: Keysight E36313A hoặc Rigol DP832.
2. **Đồng Hồ Vạn Năng Để Bàn Kỹ Thuật Số (Digital Multimeter - DMM)**: 6.5 Digits True-RMS (Đo điện trở 4 dây Kelvin, diode test, tần số). Model: Rigol DM3068 hoặc Keithley DMM6500.
3. **Máy Hiện Sóng Số Kênh Đôi / 4 Kênh (Digital Storage Oscilloscope - DSO)**: Băng thông tối thiểu 100MHz - 200MHz, tốc độ lấy mẫu 1GSa/s, hỗ trợ đo Ripple AC Coupling và giải mã SPI/I2C/UART. Model: Siglent SDS1204X-E hoặc Rigol MSO5074.
4. **Tải Điện Tử Giả Lập (DC Electronic Load)**: 0 - 60V / 30A, 150W (Chế độ CC, CV, CR, CP, Transient Dynamic Load). Model: Rigol DL3021 hoặc Itech IT8511+.
5. **Máy Phân Tích Logic (Logic Analyzer)**: 8 - 16 Kênh 100MHz+ (Giải mã I2C, SPI, UART, PWM). Model: Saleae Logic Pro 8 / 16.
6. **Mạch Nạp Chuyên Dụng**: ST-Link V2 / V3 chính hãng (STMicroelectronics) và Cáp USB Type-C High-Speed.
7. **Máy Đo Tần Số / Máy Phát Hàm (Function / Arbitrary Waveform Generator)**: 0 - 25MHz để giả lập xung Hall lưu lượng nước và điện áp chuẩn ADC. Model: Siglent SDG1032X.
8. **Hộp Kháng Chuẩn & Giả Lập Cảm Biến**: Hộp điện trở thập phân (Decade Resistance Box) 0.01Ω - 1MΩ giả lập PT100/NTC, nguồn áp chuẩn mV giả lập đầu dò pH (0mV = pH 7, 177.5mV = pH 4, -177.5mV = pH 10).
9. **Camera Nhiệt Hồng Ngoại (Thermal Imaging Camera)**: Độ phân giải nhiệt độ 0.05°C để rà quét điểm quá nhiệt (Hotspots) trên chip nguồn TPS5430 và Mosfet Q1. Model: FLIR E4/E8 hoặc Fluke TiS60+.
10. **Kính Lúp Soi Mạch Điện Tử (Stereo Microscope / Digital Inspection Microscope)**: Độ phóng đại 10x - 45x kèm đèn LED vòng để soi mối hàn SMT 0603/0805, QFP-48 và PowerPAD.

---

####################################################################################################
PHẦN 01: KIỂM TRA CƠ - QUANG NGOẠI QUAN (VISUAL & MECHANICAL INSPECTION - HW-MEC)
MÃ PHÂN HỆ: HW-MEC | TỔNG SỐ TEST CASE: 40
MỤC TIÊU: Loại bỏ 100% lỗi gia công SMT, mối hàn bắc cầu (solder bridges), lỗi phân cực, nứt vỡ mạch.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_MEC_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tổng quan kích thước ngoại quan và độ phẳng PCB
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - PCB Master Board chưa hàn dây ngoại vi
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đặt bo mạch lên bàn rà phẳng chuẩn đá granite
   B2. Sử dụng thước kẹp điện tử Mitutoyo đo chiều dài, rộng, độ dày phôi FR4
   B3. Dùng căn lá (feeler gauge) kiểm tra độ cong vênh bề mặt PCB
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Kích thước PCB đạt đúng bản vẽ KiCad (dung sai +/- 0.2mm)
   * Độ dày PCB chuẩn 1.6mm (+/- 0.1mm)
   * Độ cong vênh (Bow & Twist) nhỏ hơn 0.75% theo tiêu chuẩn IPC-TM-650
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Không cong vênh vượt ngưỡng
   [ ] Kích thước cơ khí lắp vừa vặn vào khung hộp chuẩn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu cong vênh lớn: Xem lại profile nhiệt độ lò hàn reflow (làm nguội quá nhanh) hoặc phôi PCB bị ẩm.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra lớp mạ phủ bảo vệ mối hàn (Solder Mask) và lớp in lụa (Silkscreen)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã vệ sinh sạch dung môi sau hàn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Soi kính hiển vi 10x toàn bộ bề mặt Top và Bottom
   B2. Kiểm tra độ nét của nhãn ký hiệu linh kiện (U1, U5, J1-J22)
   B3. Kiểm tra sự thẳng hàng giữa lỗ mở solder mask và chân pad đồng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Mực in lụa trắng sắc nét, không bị nhòe, không mất nét chữ ký hiệu chân
   * Lớp sơn solder mask phủ kín 100% các đường mạch đồng, không trầy xước
   * Không có hiện tượng xô lệch solder mask làm hở chân linh kiện lân cận
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ký hiệu linh kiện đọc rõ ràng bằng mắt thường
   [ ] Solder mask nguyên vẹn không bong tróc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi in lụa lệch do xưởng gia công PCB; nếu chạm mask vào pad linh kiện cần cạo bớt hoặc trả hàng fab nhà máy.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mối hàn pad tản nhiệt PowerPAD đáy IC nguồn TPS5430 (U2, U3)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã qua hàn reflow SMT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Sử dụng kính hiển vi góc nghiêng hoặc máy soi X-Ray (nếu có)
   B2. Kiểm tra lượng thiếc dưới pad tiếp xúc tản nhiệt (Thermal Pad) của U2 và U3
   B3. Quan sát các lỗ via tản nhiệt nối xuống mặt Bottom GND
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Lượng thiếc điền đầy dưới Thermal Pad tối thiểu 70% diện tích tiếp xúc
   * Thiếc hàn ngấu vào thành via tản nhiệt, không có bọng khí (voids) lớn vượt quá 25%
   * Không có hiện tượng thiếc chảy tràn làm chập các chân lân cận (Pin 1, Pin 8)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Thermal pad tiếp xúc nhiệt tốt với mặt đất GND
   [ ] Không có cầu chì thiếc nối chân 8 với chân 7 hoặc pad
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu thiếu thiếc pad đáy: IC sẽ bị ngắt bảo vệ quá nhiệt khi kéo tải dòng cao; tăng lượng kem hàn stencil tại vùng pad.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hàn chân IC vi điều khiển STM32F103C8T6 (U5) gói LQFP-48
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch hoàn thiện SMT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đặt dưới kính hiển vi độ phóng đại 20x
   B2. Rà soát toàn bộ 48 chân theo 4 cạnh của U5
   B3. Dùng que đo nhọn đẩy nhẹ từng chân để kiểm tra hiện tượng hàn nguội (dry/cold solder)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% 48 chân tiếp xúc đều, thiếc tạo thành góc lượn (fillet) bóng đẹp theo IPC-A-610G
   * Không có chân nào bị bắc cầu thiếc (solder bridge) sang chân bên cạnh
   * Không có chân nào bị hở mối hàn (lifted pin) hoặc thiếu thiếc
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Không chạm chập giữa các chân liền kề
   [ ] Tất cả các chân dính chắc cơ học vào pad
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Dùng mỏ hàn nhọn kèm dây hút thiếc (desoldering braid) và dung dịch flux để loại bỏ cầu thiếc; hàn dặm lại chân hở.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mô-đun Wi-Fi ESP32-WROOM-32UE (U1) và mối hàn viền pad castellation
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch hoàn thiện SMT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra hướng đặt mô-đun U1 theo đúng vạch lụa đánh dấu
   B2. Soi các chân viền dập cạnh (castellated pads) quanh mép U1
   B3. Kiểm tra đầu nối ăng-ten IPEX/U.FL trên mô-đun
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Mô-đun đặt phẳng, không nghiêng vênh so với mặt PCB
   * Thiếc leo lên tối thiểu 50% chiều cao rãnh mạ cạnh của mô-đun
   * Đầu cắm IPEX không bị dính thiếc, không biến dạng cơ học
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khớp đúng chiều định vị Pin 1
   [ ] Đầu nối IPEX sạch sẽ, cắm chắc chắn cáp pigtail
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mô-đun bị lệch: Dùng máy khò nhiệt chỉnh lại vị trí; tránh nhiệt độ quá cao làm hỏng nắp che chắn EMI bên trong.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chiều phân cực của Diode chỉnh lưu Schottky và TVS (D2, D5, D4, D9, D11, D13, D14)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã hàn xong linh kiện bán dẫn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đối chiếu vạch trắng cực Cathode của từng Diode trên mạch thực tế với sơ đồ nguyên lý KiCad
   B2. Kiểm tra D2 (SR360), D5 (SR360) ở mạch nguồn xung TPS5430
   B3. Kiểm tra D4 (SMAJ28A TVS) ở ngõ vào Vin
   B4. Kiểm tra D9, D11, D13, D14 (SS34) mắc dập xung ngược song song cuộn dây relay
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% vạch chỉ thị Cathode quay đúng hướng thiết kế:
   * D2, D5: Cathode nối cực Switch (Pin 8), Anode nối GND
   * D4: Cathode nối Vin, Anode nối GND
   * D9, D11, D13, D14: Cathode nối dương nguồn cuộn hút (+5V/Vin), Anode nối Collector transistor
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Không có diode nào bị hàn ngược cực
   [ ] Mối hàn SMD SMA và THT DO-201AD chắc chắn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! CỰC KỲ NGUY HIỂM: Diode hàn ngược cực sẽ gây đoản mạch trực tiếp nguồn điện hoặc cháy nổ khi cấp nguồn. Cần thay thế ngay.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra phân cực của tụ hóa điện phân nhôm (C5 330uF 16V, C6 560uF 16V)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã hàn cụm nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Quan sát vạch sơn trắng đánh dấu cực âm (-) trên thân tụ hóa C5, C6
   B2. So sánh với ký hiệu hình bán nguyệt / vạch kẻ trên mặt lụa PCB
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Chân cực âm của C5, C6 phải cắm đúng vào lỗ pad GND
   * Tụ đứng thẳng, sát mặt PCB, không kênh nghiêng quá 1.5mm
   * Chân tụ mặt dưới cắt gọn, độ dài chì thừa sau mối hàn từ 1.0mm - 1.5mm
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Phân cực tụ hóa 100% chính xác
   [ ] Chân chì mặt đáy không chạm chập vào đường mạch lân cận
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tụ bị đảo cực: Khi cấp điện tụ sẽ nóng nhanh, xì khói hoặc nổ bung van an toàn. Bắt buộc nhổ bỏ và thay mới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cổng kết nối USB Type-C 16-Pin (J1) trên mạch nạp & giao tiếp
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã lắp ráp đầu nối J1
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Dùng kính hiển vi kiểm tra 16 chân tiếp xúc của J1 và 4 chân gá vỏ kim loại (Shield pins)
   B2. Dùng cáp USB-C cắm rút thử 5 lần để đánh giá lực giữ cơ khí
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 4 chân vỏ kim loại hàn ngấu thiếc hoàn toàn vào pad gia cường GND
   * 16 chân tín hiệu không bị dính thiếc, không bị uốn cong thụt lùi
   * Cổng USB-C vuông góc với mép PCB, cắm rút êm ái, lực cắm khoảng 5 - 20N
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Vỏ kim loại tiếp xúc mass chắc chắn
   [ ] Các chân CC1, CC2, D+, D-, VBUS, GND cách ly đúng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Hàn dặm lại chân vỏ nếu lực cơ khí yếu; nếu chân cắm lệch tâm có thể gây hỏng chân cáp USB của khách hàng.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra các khối cầu đấu dây vặn ốc Phoenix Terminal Blocks (J17, J19, J20, J21, J22)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch hoàn thiện linh kiện cắm THT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra khoảng cách bước chân (Pitch 5.0mm / 5.08mm) của các terminal
   B2. Quan sát mối hàn xuyên lỗ (Through-hole soldering) mặt dưới PCB
   B3. Vặn thử ốc siết dây của từng cổng xem ren có bị trờn hay kẹt không
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Mối hàn xuyên lỗ lấp đầy thiếc 100% chiều cao barrel lỗ via theo IPC Class 2
   * Các cầu đấu dây nằm thẳng hàng, mép đưa dây hướng ra ngoài vỏ hộp
   * Ốc siết trơn tru, lá thép ép dây di chuyển linh hoạt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mối hàn chịu lực cơ học vặn siết tốt
   [ ] Không lỏng lẻo chân terminal
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Tăng nhiệt độ mỏ hàn THT (350°C) và thêm thiếc có đường kính lớn để bù nhiệt cho các pad nối với mặt phẳng đồng lớn.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chất lượng hàn thạch anh dao động Y1 (8MHz SMD) và Y2 (32.768kHz RTC)
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã qua hàn SMT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Soi kính hiển vi chân hàn của thạch anh Y1 (SMD 5032) và Y2 (SMD ABS25 / 4-Pin)
   B2. Kiểm tra khoảng cách giữa vỏ kim loại thạch anh và các đường mạch tín hiệu bên dưới
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Các chân hàn ngấu đều, không bị kênh (tombstone)
   * Vỏ kim loại thạch anh tiếp xúc tốt với pad GND làm lá chắn nhiễu (nếu có)
   * Các tụ tải C24, C25 (20pF) và C26, C27 (10pF) nằm sát ngay cạnh chân thạch anh
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Thạch anh gắn phẳng, không nứt mẻ vỏ gốm
   [ ] Tụ bù dao động đặt đúng vị trí
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Hiện tượng nứt vỏ thạch anh do rung động máy gắp hoặc nhiệt độ reflow quá cao làm sai lệch tần số hoặc ngừng dao động.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 11
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R11, C11 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 12
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R12, C12 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 13
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R13, C13 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 14
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R14, C14 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 15
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R15, C15 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 16
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R16, C16 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 17
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R17, C17 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 18
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R18, C18 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 19
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R19, C19 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 20
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R20, C20 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 21
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R21, C21 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 22
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R22, C22 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 23
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R23, C23 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 24
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R24, C24 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 25
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R25, C25 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 26
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R26, C26 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 27
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R27, C27 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 28
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R28, C28 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 29
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R29, C29 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 30
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R30, C30 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 31
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R31, C31 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 32
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R32, C32 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 33
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R33, C33 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 34
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R34, C34 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 35
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R35, C35 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 36
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R36, C36 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 37
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R37, C37 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 38
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R38, C38 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 39
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R39, C39 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MEC_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngoại quan linh kiện thụ động SMT R/C khối mạch số 40
PHÂN HỆ QUẢN LÝ   : HW-MEC - Cơ Khí & Ngoại Quan
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : PCB, Pad, Solder, IC, Terminals
THIẾT BỊ CẦN THIẾT: Kính hiển vi Stereo 45x, Thước kẹp Mitutoyo, Căn lá
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch sau khâu rửa mạch siêu âm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nhóm linh kiện thụ động R40, C40 kích thước 0603/0805
   B2. Đo kiểm tra hiện tượng dựng bia mộ (Tombstoning) và xô lệch góc (Skew)
   B3. Kiểm tra cặn flux bám quanh chân linh kiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Góc lệch vị trí nhỏ hơn 10 độ so với tâm pad
   * Không xuất hiện hạt thiếc li ti (solder balls) vương vãi trên bề mặt
   * Mối hàn bóng sáng, không có vết nứt chân chim
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn IPC-A-610G Class 2
   [ ] Không có nguy cơ bong chân khi rung lắc
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Lỗi dựng bia mộ do chênh lệch diện tích tản nhiệt 2 đầu pad hoặc lực căng bề mặt kem hàn không đều; hiệu chỉnh stencil.
====================================================================================================

####################################################################################################
PHẦN 02: ĐO TRỞ KHÁNG NGUỘI & NGẮN MẠCH (COLD IMPEDANCE & UNPOWERED CHECKS - HW-Z0)
MÃ PHÂN HỆ: HW-Z0 | TỔNG SỐ TEST CASE: 35
MỤC TIÊU: Ngăn chặn 100% sự cố cắm nguồn gây cháy nổ, bảo vệ thiết bị đo và người vận hành.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_Z0_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra đoản mạch đường nguồn vào chính Vin (J2, J21) với GND
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch KHÔNG CẤP NGUỒN, tụ điện đã xả hết điện tích
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Chuyển DMM sang thang đo thông mạch (Continuity Beep) hoặc điện trở 200kΩ
   B2. Cắm que đo Đen vào điểm GND chuẩn (vỏ USB-C hoặc pad GND)
   B3. Chạm que đo Đỏ vào chân dương Jack DC J2 (Pin 1) hoặc cọc Vin của J21
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * DMM không phát tiếng bíp thông mạch liên tục
   * Điện trở hiển thị ban đầu vài trăm kΩ rồi tăng dần lên > 1MΩ (do nạp điện vào tụ C8, C10, C11, C12, C14, C15 10uF/35V)
   * Giá trị điện trở xác lập đoản mạch R_in > 100kΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Tuyệt đối không bị ngắn mạch (R < 1Ω)
   [ ] Điện trở duy trì mức an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu R < 10Ω: Kiểm tra ngay Diode TVS D4 (SMAJ28A) xem có bị chập do hàn quá nhiệt không, hoặc tụ gốm C10-C15 bị nứt vỡ ruột.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng đường nguồn 5V Buck Converter sau cuộn cảm L1 với GND
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đặt que đo Đen tại GND
   B2. Chạm que đo Đỏ vào chân dương của tụ hóa C5 (330uF 16V) hoặc đầu ra cuộn cảm L1 (15uH)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở đo được ban đầu nạp tụ rồi đạt giá trị ổn định trong dải 1.5kΩ - 50kΩ (tùy thuộc các phân áp hồi tiếp R3, R4 và tải cảm biến)
   * Giá trị đoản mạch không được thấp hơn 200Ω khi chưa cắm cảm biến ngoại vi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Không chạm chập đường 5V vào GND
   [ ] Điện trở tĩnh phù hợp với thiết kế
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu R < 50Ω: Kiểm tra IC U2 (TPS5430), tụ C5 hoặc Diode D2 (SR360) bị đánh thủng ngược.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng đường nguồn 3.3V chính sau cuộn cảm L2 với GND
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đặt que đo Đen tại GND
   B2. Chạm que đo Đỏ vào chân dương của tụ hóa C6 (560uF 16V) hoặc ngõ ra cuộn cảm L2 (15uH)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * DMM nạp điện cho C6, điện trở tăng dần và dừng lại ở khoảng 800Ω - 5kΩ
   * Không có hiện tượng còi DMM kêu bíp liên tục
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đường 3.3V không ngắn mạch với GND
   [ ] Trở kháng tĩnh đạt chuẩn an toàn cho ESP32 và STM32
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu R < 10Ω: Tháo rời Ferrite Bead FB1 và FB2 để cô lập xem ngắn mạch nằm ở nhánh ESP32 hay nhánh STM32.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngắn mạch giữa đường nguồn 3V3_ESP (sau hạt lọc FB1) với GND
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Chạm que đo Đen vào GND
   B2. Chạm que đo Đỏ vào chân 2 (3V3_ESP) của ESP32 U1 hoặc tụ C4, C7 (22uF)
   B3. Đo điện trở hai chiều (đổi chiều que đo)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thuận chiều que đo: R > 1.2kΩ
   * Ngược chiều que đo: R > 800Ω
   * Tụ điện C4, C7, C9, C16 nạp điện bình thường
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Không ngắn mạch nguồn ESP32
   [ ] Trở kháng cách ly RF tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắn mạch: IC ESP32-WROOM-32UE bị lỗi chân nguồn ngầm hoặc tụ C4/C7 bị đè nứt khi dập hàn.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra ngắn mạch đường nguồn 3.3V_STM (sau hạt lọc FB2) với GND
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Chạm que đo Đen vào GND
   B2. Chạm que đo Đỏ vào các chân VDD của STM32 U5 (Chân 9, 24, 36, 48) hoặc tụ C22 (10uF)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở đo được nằm trong dải 2.5kΩ - 15kΩ
   * Không có tiếng bíp liên tục từ DMM
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Các chân nguồn số và tương tự (VDDA) của STM32 không bị chập xuống mass
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu trở kháng < 5Ω: Kiểm tra chân 9, 24, 36, 48 của chip U5 xem có cầu thiếc li ti ở gầm linh kiện không.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly giữa các đường nguồn độc lập (Vin - 5V, 5V - 3.3V, Vin - 3.3V)
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân Vin (J2) và đường 5V (C5)
   B2. Đo điện trở giữa đường 5V và đường 3.3V (C6)
   B3. Đo điện trở giữa Vin và đường 3.3V
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở giữa Vin và 5V: > 500kΩ
   * Điện trở giữa 5V và 3.3V: > 100kΩ
   * Điện trở giữa Vin và 3.3V: > 500kΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hoàn toàn không có hiện tượng dò điện áp giữa các tầng nguồn xung
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có hiện tượng thông mạch giữa Vin và 5V/3.3V: Transistor chuyển mạch nội bộ của TPS5430 bị thủng hoặc cầu thiếc giữa chân 7 (Vin) và chân 8 (PH). Cực kỳ nguy hiểm nếu cấp nguồn!
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng cuộn hút Relay và Diode dập xung ngược (Flyback Diodes)
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa cực 5V và cực RELAY_COIL1 (Chân 1 J17)
   B2. Lặp lại đo với RELAY_COIL2, RELAY_COIL3, RELAY_COIL4 (Chân 2, 3, 4 J17)
   B3. Đổi chiều que đo để kiểm tra diode SS34 (D9, D11, D13, D14)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Chiều thuận diode (Que Đỏ ở Relay_Coil, que Đen ở 5V): Hiển thị điện áp rơi Diode Schottky 0.25V - 0.35V
   * Chiều nghịch: Điện trở hở mạch > 100kΩ (nếu chưa cắm rơ le ngoài)
   * Nếu đã gắn rơ le 5VDC: Điện trở cuộn hút chuẩn khoảng 70Ω - 100Ω
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Diode flyback còn nguyên vẹn, không đứt mạch, không chập
   [ ] Đường điều khiển cuộn hút đúng cực tính
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu diode SS34 bị chập (R = 0Ω cả 2 chiều): Khi kích hoạt transistor Q4/Q6/Q7/Q9 sẽ làm sập nguồn 5V và cháy transistor ngay lập tức.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 8
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_8 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 9
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_9 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 10
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_10 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 11
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_11 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 12
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_12 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 13
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_13 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 14
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_14 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 15
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_15 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 16
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_16 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 17
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_17 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 18
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_18 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 19
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_19 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 20
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_20 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 21
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_21 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 22
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_22 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 23
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_23 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 24
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_24 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 25
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_25 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 26
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_26 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 27
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_27 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 28
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_28 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 29
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_29 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 30
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_30 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 31
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_31 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 32
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_32 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 33
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_33 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 34
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_34 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_Z0_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra trở kháng nguội cách ly ngõ vào/ra tín hiệu IO kênh số 35
PHÂN HỆ QUẢN LÝ   : HW-Z0 - Trở Kháng & Ngắn Mạch Nguội
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Vin, 5V, 3.3V, TPS5430, MCU Rails
THIẾT BỊ CẦN THIẾT: Digital Multimeter 6.5 Digits (Keithley DMM6500 hoặc Rigol DM3068)
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp điện, đã xả điện tĩnh ESD
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở giữa chân tín hiệu IO_35 với GND và VCC
   B2. Quan sát điện trở bảo vệ phân áp hoặc điện trở kéo
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở về GND > 10kΩ hoặc phù hợp với giá trị điện trở pull-down trên sơ đồ
   * Không xuất hiện ngắn mạch thẳng xuống mass
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly tín hiệu an toàn
   [ ] Bảo vệ cổng IO của MCU
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chập: Kiểm tra mối hàn tụ lọc chống nhiễu hoặc chân vi điều khiển bị đánh thủng ESD trong quá trình thao tác.
====================================================================================================

####################################################################################################
PHẦN 03: KHỐI QUẢN LÝ NGUỒN & ỔN ÁP XUNG BUCK (POWER MANAGEMENT - HW-PWR)
MÃ PHÂN HỆ: HW-PWR | TỔNG SỐ TEST CASE: 65
MỤC TIÊU: Xác nhận hiệu suất biến đổi nguồn, độ ổn định điện áp, độ gợn sóng (ripple) và các tầng bảo vệ.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_PWR_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mạch bảo vệ chống cắm ngược cực ngõ vào (P-MOSFET AOD407 & Zener D3)
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bộ nguồn DC cài đặt 12.0V, giới hạn dòng CC = 0.5A. Cầu chì F2 nguyên vẹn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cố tình cấp ngược cực nguồn vào Jack DC J2 (Dương vào vỏ ngoài, Âm vào kim giữa)
   B2. Bật công tắc nguồn cấp
   B3. Đo điện thế tại điểm sau Mosfet Q1 (Cathode TVS D4 hoặc ngõ vào Vin của U2, U3)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Dòng điện tiêu thụ từ bộ nguồn DC xấp xỉ 0.00mA (dưới 10uA)
   * Điện áp đo được tại Vin sau Mosfet = 0.0V
   * Không có linh kiện nào phát nhiệt hay bốc khói
   * Đổi lại cực tính đúng (+12V vào kim giữa): Mạch dẫn bình thường, điện áp Vin = 11.95V - 12.0V
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Bảo vệ ngược cực kích hoạt tức thì và an toàn tuyệt đối
   [ ] Mosfet đóng ngắt chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dòng điện tăng vọt khi cắm ngược: Mosfet Q1 (AOD407) bị hàn sai chân (S-D lộn ngược) hoặc Diode Zener D3 (ZMM12) bị hỏng.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra dòng tĩnh không tải (Quiescent Current) khi cấp nguồn 12V
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn DC 12.0V chuẩn, bo mạch chưa cắm module cảm biến, chưa nạp firmware tải cao
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Nối ampe kế DMM nối tiếp đường nguồn 12V vào
   B2. Bật nguồn và chờ hệ thống ổn định trong 10 giây
   B3. Đọc giá trị dòng điện tĩnh I_standby
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Dòng tiêu thụ tĩnh toàn bo mạch I_standby nằm trong khoảng 35mA - 75mA (khi 2 IC TPS5430 hoạt động và 2 MCU ở trạng thái chờ)
   * Đèn LED D1 (Vin) và D6/D7 (5V/3.3V) sáng ổn định
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Dòng điện tĩnh không vượt quá 100mA
   [ ] Không có linh kiện nào bị nóng bất thường
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dòng > 150mA: Dùng camera nhiệt quét ngay để tìm IC đang bị om nhiệt (thường là TPS5430 hoặc ESP32 bị chạm chân).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ chính xác điện áp ra 5.0V của IC nguồn xung U2 (TPS5430 12V->5V)
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn Vin = 12.0V. Tải ngõ ra 5V hở mạch (No load)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Dùng DMM đo điện áp DC giữa cực dương tụ C5 và GND
   B2. Tăng dần điện áp nguồn Vin từ 9V -> 12V -> 16V (Line Regulation test)
   B3. Ghi lại điện thế ngõ ra
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp 5V đo được tại C5 phải nằm trong phạm vi: 4.90V <= V_5V <= 5.15V (Sai số < 3%)
   * Khi thay đổi Vin từ 9V đến 16V, điện áp 5V biến thiên không quá +/- 20mV
   * Tỷ lệ phân áp hồi tiếp R3 (10k) và R4 (3.24k) chia điện áp chân 4 (VSENSE) chuẩn 1.221V
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Điện áp 5V chuẩn xác và ổn định theo điện áp ngõ vào
   [ ] Điện áp chân VSENSE = 1.22V +/- 0.02V
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu V_5V sai khác lớn: Kiểm tra sai số của điện trở hồi tiếp R3, R4 (phải dùng loại trở chính xác 1%).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ chính xác điện áp ra 3.3V của IC nguồn xung U3 (TPS5430 12V->3.3V)
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn Vin = 12.0V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Dùng DMM đo điện áp DC tại cực dương tụ C6 và GND
   B2. Đo kiểm tra điện áp chân hồi tiếp số 4 của U3
   B3. Kiểm tra độ rơi áp qua các hạt lọc từ FB1 (ra 3V3_ESP) và FB2 (ra 3.3V_STM)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp 3.3V tại C6 nằm trong dải: 3.25V <= V_3V3 <= 3.38V
   * Điện áp tại 3V3_ESP: 3.24V - 3.37V
   * Điện áp tại 3.3V_STM: 3.24V - 3.37V
   * Độ sụt áp qua ferrite bead FB1, FB2 nhỏ hơn 30mV ở dòng tải 200mA
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Điện áp 3.3V phân phối đồng đều đến cả 2 vi điều khiển
   [ ] Độ suy hao qua cuộn lọc không đáng kể
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu điện áp 3.3V bị vọt lên > 3.6V: TẮT NGUỒN NGAY để tránh làm cháy chip ESP32 và STM32! Kiểm tra hở mạch chân R8 hoặc R5.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ gợn sóng (Voltage Ripple & Noise) đường 5V dưới tải dòng 1.5A
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn Vin = 12V. Mắc tải điện tử giả lập ngõ ra 5V ở chế độ CC = 1.5A
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kết nối que đo Oscilloscope vào tụ C5 theo kỹ thuật đo Tip & Ring (bỏ kẹp mass dài, dùng lò xo tiếp đất ngắn)
   B2. Cài đặt máy hiện sóng: AC Coupling, Băng thông giới hạn 20MHz, Thang đo 20mV/div, Timebase 2us/div
   B3. Quan sát biên độ đỉnh - đỉnh (Vpp) của sóng răng cưa chuyển mạch
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Tần số chuyển mạch đo được tại chân PH (Pin 8 U2) đạt chuẩn 500kHz (+/- 50kHz)
   * Độ gợn sóng điện áp đỉnh - đỉnh Vpp trên đường 5V nhỏ hơn 40mV
   * Dạng sóng chuyển mạch hình chữ nhật dứt khoát, không bị rung pha (jitter) quá mức
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ripple ngõ ra 5V < 50mVpp dưới tải định mức 1.5A
   [ ] Tần số đóng ngắt TPS5430 chuẩn xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu Ripple > 80mV: Tụ lọc ngõ ra C5 (330uF) có ESR quá lớn, hoặc thiếu tụ gốm bypass cao tần C20 (0.1uF) mắc song song.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ gợn sóng đường 3.3V dưới tải dòng 1.5A (Mô phỏng Wi-Fi Tx burst)
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn Vin = 12V. Nối tải điện tử vào đường 3.3V kéo dòng 1.5A
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Mắc que đo Oscilloscope tại tụ C6 và tại chân tụ C4 (nguồn ESP32)
   B2. Bật chế độ AC Coupling 20MHz BW, đo điện áp gợn Vpp
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ gợn sóng tại C6 nhỏ hơn 35mVpp
   * Độ gợn sóng tại chân ESP32 (sau hạt lọc FB1 và tụ C4) nhỏ hơn 25mVpp
   * Không có gai nhọn điện áp (spikes) vượt quá 100mV khi tải thay đổi đột ngột
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Nguồn 3.3V cực kỳ sạch, đáp ứng tốt cho bộ phát sóng vô tuyến RF của ESP32
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Bổ sung thêm tụ tantalum hoặc tụ gốm MLCC 10uF gần chân chip nếu thấy gai nhọn cao tần.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_007
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm đáp ứng quá độ tải (Transient Load Response) của tầng nguồn TPS5430
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin = 12V. Tải điện tử cài đặt chế độ Dynamic Load: Dòng biến thiên từ 0.2A đến 2.0A, tần số 1kHz, tốc độ đáp ứng Slew Rate 1A/us
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kẹp que đo DSO vào đường 5V và 3.3V
   B2. Chụp lại dạng sóng sụt áp (Undershoot) và vọt áp (Overshoot) khi tải nhảy bước dòng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ sụt áp tối đa (Max Undershoot) khi kéo dòng tức thì: < 150mV
   * Độ vọt áp tối đa (Max Overshoot) khi ngắt tải tức thì: < 150mV
   * Thời gian hồi phục về mức điện áp danh định (Recovery Time): < 80us
   * Mạch vòng hồi tiếp ổn định, không có hiện tượng dao động ký sinh suy giảm chậm (ringing)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chỉ tiêu ổn định mạch vòng kín (Loop Stability)
   [ ] Hệ số pha dự trữ (Phase Margin) > 45 độ
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có hiện tượng Ringing kéo dài: Cần cân chỉnh lại tụ bù pha Bootstrap C2, C3 (10nF) hoặc chọn cuộn cảm có dòng bão hòa cao hơn.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_008
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm bảo vệ quá tải và ngắn mạch ngõ ra (Overcurrent & Short Circuit Test)
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn DC 12V, giới hạn dòng nguồn 5A
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cố tình dùng dây dẫn ngắn mạch trực tiếp đường 5V xuống GND trong 5 giây
   B2. Quan sát dòng điện ngõ vào từ bộ nguồn và điện áp ngõ ra
   B3. Tháo dây ngắn mạch và kiểm tra khả năng tự phục hồi (Auto-recovery)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * IC TPS5430 tự động kích hoạt tính năng giới hạn dòng đỉnh theo chu kỳ (Cycle-by-Cycle Current Limit) và giảm tần số (Frequency Foldback)
   * Dòng điện ngõ vào 12V giảm xuống mức an toàn, cuộn cảm và IC không bị nổ
   * Khi gỡ ngắn mạch: Điện áp 5V lập tức phục hồi về 5.0V ổn định trong vòng 5ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Tính năng tự bảo vệ ngắn mạch hoạt động hoàn hảo
   [ ] Mạch tự động hoạt động lại bình thường
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu IC bị cháy khi chập tải: Diode Schottky D2 (SR360) không đủ dòng tải đỉnh hoặc chân tản nhiệt PowerPAD hàn không ngấu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 27%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 27% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 30%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 30% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 33%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 33% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 36%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 36% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 39%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 39% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 42%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 42% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 45%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 45% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 48%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 48% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 51%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 51% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 54%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 54% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 57%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 57% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 60%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 60% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 63%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 63% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 66%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 66% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 69%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 69% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 72%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 72% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 75%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 75% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 78%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 78% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 81%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 81% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 84%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 84% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 87%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 87% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 90%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 90% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 93%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 93% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 96%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 96% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 99%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 99% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 102%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 102% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 105%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 105% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 108%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 108% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 111%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 111% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 114%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 114% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 117%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 117% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 120%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 120% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_041
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 123%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 123% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_042
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 126%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 126% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_043
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 129%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 129% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_044
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 132%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 132% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_045
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 135%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 135% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_046
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 138%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 138% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_047
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 141%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 141% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_048
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 144%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 144% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_049
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 147%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 147% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_050
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 150%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 150% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_051
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 153%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 153% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_052
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 156%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 156% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_053
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 159%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 159% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_054
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 162%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 162% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_055
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 165%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 165% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_056
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 168%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 168% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_057
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 171%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 171% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_058
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 174%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 174% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_059
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 177%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 177% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_060
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 180%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 180% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_061
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 183%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 183% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_062
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 186%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 186% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_063
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 189%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 189% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_064
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 192%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 192% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_PWR_065
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu suất năng lượng và ổn định nhiệt tầng nguồn mức tải 195%
PHÂN HỆ QUẢN LÝ   : HW-PWR - Quản Lý Nguồn & Ổn Áp
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : TPS5430 U2/U3, AOD407, L1/L2, C5/C6, D2/D5
THIẾT BỊ CẦN THIẾT: DSO 200MHz, DMM 6.5 Digits, DC Electronic Load 150W, Thermal Camera
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn Vin 12V, môi trường phòng thử nghiệm 25°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Tăng dần dòng tải lên mức công suất 195% công suất thiết kế
   B2. Đo nhiệt độ bề mặt vỏ IC TPS5430 bằng camera nhiệt sau 15 phút vận hành
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt IC không vượt quá 65°C ở tải trung bình
   * Hiệu suất chuyển đổi biến áp (Efficiency) đạt > 82%
   * Điện áp ngõ ra duy trì sai số < 2%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hiệu suất đạt tiêu chuẩn công nghiệp
   [ ] Nhiệt độ tản nhiệt nằm trong giới hạn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nhiệt độ vượt 85°C: Kiểm tra lại độ dày lớp đồng tản nhiệt PCB và các via nhiệt xuống mặt dưới.
====================================================================================================

####################################################################################################
PHẦN 04: KHỐI VI ĐIỀU KHIỂN LÕI KÉP (DUAL-MCU STM32 & ESP32 - HW-MCU)
MÃ PHÂN HỆ: HW-MCU | TỔNG SỐ TEST CASE: 70
MỤC TIÊU: Đảm bảo MCU khởi động, dao động xung clock, giao tiếp debug và thực thi lệnh tin cậy.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_MCU_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra điện áp reset và mạch RC Reset của chip STM32F103C8T6 (Pin 7 NRST)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V vào bo mạch, đường 3.3V_STM đạt 3.30V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế tĩnh tại chân số 7 (NRST) của U5 bằng DMM
   B2. Nhấn giữ nút nhấn RESET (SW3) trên mạch và đo điện áp
   B3. Nhả nút nhấn SW3 và dùng máy hiện sóng đo dạng sóng hồi phục điện áp
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện thế tĩnh chân NRST khi không nhấn nút: 3.25V - 3.30V (nhờ trở kéo lên R18 10k nối 3.3V)
   * Khi nhấn nút SW3: Điện thế giảm ngay về 0.0V
   * Khi nhả nút: Tụ C23 (100nF) nạp điện, tạo sườn tăng mượt mà với hằng số thời gian RC khoảng 1ms, không bị dội phím (bouncing)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Chân Reset hoạt động dứt khoát
   [ ] MCU khởi động lại chuẩn xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chân NRST luôn ở mức thấp: Tụ C23 bị chập hoặc nút nhấn SW3 bị dính tiếp điểm cơ khí.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_002
TIÊU ĐỀ KIỂM THỬ  : Đo kiểm tra tần số và biên độ dao động thạch anh chính HSE 8MHz của STM32 (Y1)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã cấp nguồn, chip STM32 đang chạy
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gắn que đo máy hiện sóng tỷ lệ suy giảm 10X (điện dung que đo < 10pF) vào chân OSC_OUT (Chân 6) của U5
   B2. Kẹp mass ngắn vào chân GND gần nhất
   B3. Đo tần số (Frequency), điện thế đỉnh - đỉnh (Vpp) và chu kỳ xung (Period)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Tần số sóng sin đo được: 8.000MHz (+/- 50ppm)
   * Biên độ dao động ổn định Vpp trong khoảng 1.2V - 2.5V
   * Sóng sin đối xứng, không bị méo hài bậc cao, không có hiện tượng tắt dần
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mạch dao động HSE 8MHz khóa pha ổn định
   [ ] Đồng hồ hệ thống PLL nhân xung chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu không có dao động: Kiểm tra điện trở hồi tiếp R19 (1M), tụ gốm C24, C25 (20pF) hoặc thạch anh Y1 bị lỏng chân hàn.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra dao động thạch anh thời gian thực RTC LSE 32.768kHz của STM32 (Y2)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch được cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Chuyển máy hiện sóng sang thang đo 500mV/div, Timebase 10us/div
   B2. Đo tín hiệu tại chân PC15 (Pin 4) hoặc PC14 (Pin 3)
   B3. Lưu ý sử dụng que đo FET tích cực nếu có để tránh làm dừng dao động LSE
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Tần số đo được: 32.768kHz (+/- 20ppm)
   * Dạng sóng dao động sin thuần khiết
   * Biên độ Vpp đạt từ 0.6V đến 1.2V
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khối thời gian thực RTC hoạt động chính xác
   [ ] Lịch và đồng hồ hệ thống chạy không sai lệch
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Dao động LSE rất nhạy cảm với điện dung ký sinh; nếu không chạy kiểm tra tụ C26, C27 (10pF) và cặn flux còn dính trên PCB.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra giao tiếp nạp chương trình và gỡ lỗi SWD ST-Link cho STM32 (Header SWD1)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cắm mạch nạp ST-Link V2 vào đầu cắm 4 chân SWD1 (Pin 1: GND, Pin 2: SWCLK, Pin 3: SWDIO, Pin 4: 3.3V)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Mở phần mềm STM32CubeProgrammer trên máy tính
   B2. Chọn cấu hình kết nối: Interface SWD, Tần số nạp 4.0MHz, Mode Normal
   B3. Nhấn nút 'Connect' để đọc thông tin chip STM32
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Phần mềm nhận diện đúng: Device ID: 0x410, Core: ARM Cortex-M3, Flash Size: 64KB (hoặc 128KB)
   * Đọc và xóa sạch bộ nhớ Flash (Mass Erase) không phát sinh lỗi
   * Nạp firmware test kiểm tra ghi dữ liệu đạt tốc độ > 20KB/s với độ tin cậy 100%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cổng SWD kết nối thông suốt
   [ ] Lập trình Flash và kiểm tra mã nạp (Verification) thành công
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu 'No target detected': Đo lại điện áp chân SWDIO (PA13) và SWCLK (PA14) xem có bị chạm chân hoặc trở kéo BOOT0 sai mức logic.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cấu hình cọc cắm chân nhảy nạp BOOT0 và BOOT1 của STM32 (JP2x32.1)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch không cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra vị trí cắm jumper JP2x32.1
   B2. Đo điện thế logic tại chân BOOT0 (Pin 44) và BOOT1 (Pin 20) qua điện trở kéo xuống R22 (10k) và R20 (10k)
   B3. Thử nghiệm 2 chế độ: Chế độ chạy Flash (BOOT0 = 0) và Chế độ nạp UART System Memory (BOOT0 = 1)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Ở chế độ vận hành thông thường: Cả BOOT0 và BOOT1 đều được kéo xuống mức 0V (GND)
   * Khi cắm jumper sang vị trí 3.3V: Điện thế tại chân BOOT0 đạt 3.3V, chip chuyển sang Bootloader ROM
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mạch lựa chọn chế độ khởi động hoạt động chuẩn xác
   [ ] Jumper tiếp xúc điện tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu BOOT0 bị thả nổi (Floating): MCU sẽ khởi động chập chờn, lúc chạy lúc không tùy thuộc vào tĩnh điện môi trường.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mạch Reset và chân Enable của ESP32-WROOM-32UE (Pin 3 EN)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V, đường 3V3_ESP đạt 3.30V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế tại chân số 3 (EN) của U1 bằng DMM
   B2. Nhấn giữ nút nhấn SW1 (EN) và quan sát điện thế
   B3. Nhả nút SW1 và dùng máy hiện sóng đo thời gian khởi động
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện thế tĩnh tại chân EN khi không nhấn: 3.25V - 3.30V (nhờ trở kéo lên R7 10k nối 3V3_ESP)
   * Khi nhấn SW1: Điện áp giảm ngay về 0V
   * Khi nhả SW1: Tụ lọc C13 (0.1uF) tạo sườn dốc tăng ổn định trễ khoảng 1ms giúp mạch Power-On-Reset của ESP32 kích hoạt tin cậy
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Chân EN hoạt động ổn định
   [ ] ESP32 reset dứt khoát không bị treo lõi (Brownout)
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ESP32 tự động reset liên tục: Kiểm tra nguồn 3V3_ESP bị sụt áp khi chip phát Wi-Fi hoặc tụ C13 bị rò điện.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chân kích hoạt chế độ nạp Firmware ESP32 (Pin 25 IO0 và nút bấm SW2)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch được cấp nguồn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế chân IO0 tại điểm thử nghiệm hoặc tại cực nút nhấn SW2
   B2. Nhấn giữ nút SW2 (IO0) và đo điện thế
   B3. Thử nghiệm quy trình đưa ESP32 vào Download Bootloader thủ công: Giữ SW2 -> Nhấn nhả SW1 -> Nhả SW2
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện thế tĩnh của IO0 là 3.3V nhờ điện trở kéo R9 (10k)
   * Khi nhấn SW2: Điện thế tụt về 0V
   * Chuỗi UART0 (TXD0) xuất chuỗi log boot: 'waiting for download' ở tốc độ 115200bps
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Chân IO0 chuyển đổi trạng thái logic hoàn hảo
   [ ] ESP32 vào chế độ nạp firmware thành công
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu IO0 không lên được mức cao khi nhả nút: Kiểm tra nút SW2 bị kẹt hoặc transistor Q5 (SS8050) của mạch auto-reset bị rò dòng.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra đèn LED báo trạng thái người dùng kết nối chân PC13 của STM32 (D8)
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware kiểm tra nhấp nháy LED PC13 (Blinky test)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Nạp chương trình điều khiển chân PC13 đảo trạng thái tần số 1Hz (500ms ON / 500ms OFF)
   B2. Quan sát trạng thái sáng tắt của LED màu xanh D8
   B3. Đo điện thế và dòng điện qua điện trở R21 (1k)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Khi PC13 ở mức LOW (Active Low): LED D8 phát sáng rõ ràng, dòng qua LED khoảng 1.8mA
   * Khi PC13 ở mức HIGH: LED D8 tắt hoàn toàn
   * Đèn nhấp nháy đều đặn với chu kỳ 1.00s (+/- 1ms)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Chân PC13 xuất tín hiệu GPIO chuẩn
   [ ] LED D8 và trở R21 hoạt động bình thường
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu LED không sáng: Kiểm tra chiều phân cực của LED D8 (chân Anode nối 3.3V, Cathode nối qua R21 về PC13).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 9
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_9 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 10
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_10 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 11
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_11 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 12
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_12 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 13
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_13 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 14
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_14 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 15
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_15 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 16
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_16 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 17
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_17 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 18
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_18 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 19
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_19 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 20
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_20 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 21
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_21 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 22
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_22 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 23
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_23 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 24
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_24 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 25
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_25 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 26
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_26 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 27
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_27 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 28
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_28 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 29
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_29 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 30
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_30 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 31
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_31 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 32
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_32 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 33
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_33 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 34
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_34 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 35
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_35 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 36
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_36 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 37
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_37 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 38
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_38 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 39
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_39 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 40
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_40 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_041
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 41
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_41 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_042
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 42
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_42 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_043
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 43
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_43 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_044
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 44
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_44 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_045
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 45
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_45 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_046
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 46
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_46 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_047
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 47
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_47 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_048
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 48
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_48 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_049
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 49
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_49 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_050
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 50
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_50 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_051
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 51
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_51 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_052
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 52
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_52 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_053
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 53
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_53 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_054
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 54
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_54 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_055
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 55
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_55 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_056
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 56
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_56 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_057
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 57
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_57 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_058
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 58
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_58 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_059
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 59
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_59 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_060
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 60
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_60 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_061
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 61
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_61 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_062
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 62
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_62 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_063
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 63
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_63 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_064
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 64
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_64 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_065
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 65
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_65 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_066
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 66
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_66 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_067
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 67
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_67 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_068
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 68
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_68 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_069
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 69
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_69 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_MCU_070
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra chức năng ngoại vi GPIO và ngắt ngoài của cụm MCU kênh số 70
PHÂN HỆ QUẢN LÝ   : HW-MCU - Vi Điều Khiển Lõi Kép
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : STM32F103 U5, ESP32 U1, Y1, Y2, SW1/SW2/SW3, SWD1
THIẾT BỊ CẦN THIẾT: DSO 200MHz, ST-Link V2/V3, STM32CubeProgrammer, DMM
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware chẩn đoán EOL Diagnostic Firmware vào cả 2 chip
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình chân IO_70 làm ngõ vào kéo lên (Pull-up) rồi kích mức 0V
   B2. Đo điện áp ngưỡng chuyển mạch logic V_IL và V_IH bằng nguồn áp chuẩn
   B3. Kiểm tra thời gian đáp ứng ngắt ngoài EXTI
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ngưỡng mức thấp V_IL < 0.8V
   * Điện áp ngưỡng mức cao V_IH > 2.0V
   * Hệ thống phát hiện ngắt trong thời gian < 5us, không bỏ sót xung
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Ngõ vào IO và ngắt ngoài hoạt động chính xác
   [ ] Bộ lọc chống nhiễu kỹ thuật số đáp ứng tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu ngắt kích hoạt sai liên tục: Bổ sung thêm mạch dập nhiễu RC tại chân ngõ vào hoặc bật bộ lọc số trong thanh ghi MCU.
====================================================================================================

####################################################################################################
PHẦN 05: KHỐI GIAO TIẾP & NẠP CHƯƠNG TRÌNH (COMMUNICATION & UART BUS - HW-COM)
MÃ PHÂN HỆ: HW-COM | TỔNG SỐ TEST CASE: 45
MỤC TIÊU: Đảm bảo mạch nạp tự động qua USB Type-C và kênh truyền thông liên MCU (Inter-MCU) tin cậy tuyệt đối.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_COM_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra nhận diện điện trở xác định vai trò cổng USB Type-C (CC1, CC2)
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch chưa cấp nguồn ngoài
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Dùng cáp USB-C to USB-C nối từ nguồn sạc Type-C chuẩn PD / PC vào cổng J1
   B2. Đo điện trở tại chân A5 (CC1) và B5 (CC2) của J1 về mass bằng DMM
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Giá trị điện trở đo được tại CC1 (R12) = 5.1kΩ (+/- 1%)
   * Giá trị điện trở đo được tại CC2 (R13) = 5.1kΩ (+/- 1%)
   * Cổng sạc / Máy tính phát hiện thiết bị UFP (Upstream Facing Port - Sink) và mở nguồn VBUS 5V chuẩn
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn USB Type-C Specification 1.3
   [ ] Nhận diện cáp C-to-C cả hai chiều cắm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu máy tính dùng cáp C-to-C không nhận diện bo mạch: Bị thiếu trở 5.1k ở một trong hai chân CC hoặc hàn nhầm trở 56k (chỉ dùng cho nguồn cấp DFP).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra nhận diện chip chuyển đổi USB-to-UART CH340C (U4) trên hệ điều hành
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cắm cáp USB nối J1 với máy tính (Windows / Linux / macOS)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra nguồn 3.3V cấp cho chân 4 và 16 của IC U4
   B2. Mở Device Manager trên Windows hoặc lệnh `lsusb` / `dmesg` trên Linux
   B3. Quan sát cổng COM xuất hiện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Máy tính tự động nhận diện thiết bị 'USB-SERIAL CH340' và gán cổng COMx mà không cần bấm nút
   * Chân thạch anh nội của CH340C dao động ổn định 12MHz nội
   * Dòng tiêu thụ trên đường USB VBUS < 30mA
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cổng COM ảo nhận diện ổn định
   [ ] Không có hiện tượng chớp tắt cổng kết nối
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện 'Unknown Device' hoặc mã lỗi Code 43: Kiểm tra đường truyền dữ liệu D+ (chân 5 U4) và D- (chân 6 U4) xem có bị chập hoặc lộn chân.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mạch tự động nạp chương trình (Auto-Reset / Auto-Download Circuit) cho ESP32
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch kết nối máy tính qua cổng USB-C J1
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Mở công cụ nạp `esptool.py` hoặc PlatformIO / Arduino IDE
   B2. Thực hiện lệnh đọc MAC Address: `esptool.py --port COMx chip_id`
   B3. Dùng máy hiện sóng 2 kênh đo đồng thời xung điện tại chân DTR và RTS phát ra từ CH340C qua cặp transistor Q5, Q8 (SS8050) đến chân EN và IO0 của ESP32
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Mạch tự động kéo chân IO0 xuống mức LOW trước, sau đó phát xung cạnh xuống kéo chân EN về mức 0V rồi nhả ra để reset ESP32
   * Quá trình đồng bộ hóa (Sync packet) thành công 100% ở tốc độ baud lên tới 921600bps mà không cần can thiệp thủ công bằng tay vào nút bấm
   * Phần mềm đọc đúng MAC Address và Flash Chip ID của ESP32
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mạch auto-flash hoạt động ổn định và tin cậy
   [ ] Tốc độ nạp cao không bị rớt gói
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu nạp báo lỗi 'Failed to connect to ESP32: Timed out': Kiểm tra cặp transistor Q5, Q8, trở R10, R11 (10k) hoặc tụ C13 bị sai trị số làm trễ xung EN quá lâu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tốc độ truyền nhận và tỷ lệ lỗi bit (BER) kênh nạp UART0 của ESP32 (TXD0, RXD0)
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - ESP32 kết nối máy tính qua CH340C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Chạy script Python gửi liên tục 1,000,000 ký tự ASCII ngẫu nhiên qua cổng COM ở tốc độ 115200bps và 921600bps
   B2. Phần mềm nhúng phản hồi lặp lại (Loopback Echo test)
   B3. Đo tỷ lệ lỗi bit (Bit Error Rate)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Số byte truyền đi bằng số byte nhận về (1,000,000 / 1,000,000 bytes)
   * Tỷ lệ lỗi bit BER = 0.00%
   * Dạng sóng tín hiệu trên đường TXD0 (qua R15 1k) và RXD0 (qua R14 1k) vuông vắn, thời gian tăng (Rise time) < 150ns, không bị biến dạng do điện dung ký sinh
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đường truyền UART0 ổn định tuyệt đối
   [ ] Điện trở nối tiếp R14, R15 giảm suy hao và chặn xung sét hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có hiện tượng rớt ký tự: Kiểm tra tiếp xúc chân cáp USB hoặc điện trở R14, R15 bị tăng trị số.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra đường truyền thông liên vi điều khiển UART2 Bus (ESP32 <-> STM32)
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hai vi điều khiển đã nạp firmware truyền thông nội bộ
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kết nối máy phân tích logic (Logic Analyzer) vào đường TX2 (Chân 28 ESP32 -> Chân 31 PA9/TX1 STM32) và RX2 (Chân 27 ESP32 <- Chân 30 PA10/RX1 STM32)
   B2. Kích hoạt giao thức truyền dữ liệu nhị phân đóng gói khung CRC-16 ở tốc độ 115200bps (1 frame/50ms)
   B3. Theo dõi liên tục trong 1 giờ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các gói tin telemetry và lệnh điều khiển chuyển giao giữa STM32 và ESP32 toàn vẹn
   * Không phát sinh lỗi CRC, không bị tràn bộ đệm phần cứng (UART Overrun Error)
   * Mức điện áp cao V_OH trên bus nằm trong khoảng 3.2V - 3.3V (do cả 2 MCU đều chạy chung điện áp 3.3V logic)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Giao tiếp song công toàn phần (Full-duplex) thông suốt
   [ ] Khung dữ liệu đóng gói chuẩn xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối liên MCU: Kiểm tra chéo chân TX - RX (TX chip này phải nối RX chip kia).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 6
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 6
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 7
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 7
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 8
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 8
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 9
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 9
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 10
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 10
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 11
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 11
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 12
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 12
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 13
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 13
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 14
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 14
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 15
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 15
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 16
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 16
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 17
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 17
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 18
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 18
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 19
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 19
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 20
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 20
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 21
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 21
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 22
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 22
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 23
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 23
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 24
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 24
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 25
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 25
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 26
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 26
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 27
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 27
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 28
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 28
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 29
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 29
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 30
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 30
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 31
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 31
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 32
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 32
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 33
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 33
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 34
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 34
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 35
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 35
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 36
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 36
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 37
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 37
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 38
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 38
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 39
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 39
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 40
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 40
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_041
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 41
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 41
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_042
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 42
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 42
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_043
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 43
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 43
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_044
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 44
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 44
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_COM_045
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra tính toàn vẹn tín hiệu bus giao tiếp dưới môi trường nhiễu cao tần bước 45
PHÂN HỆ QUẢN LÝ   : HW-COM - Giao Tiếp & Mạch Nạp
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : CH340C U4, USB-C J1, Q5/Q8, R12/R13, UART2 Bus
THIẾT BỊ CẦN THIẾT: Máy tính, Logic Analyzer 16 Kênh, DSO, Cáp USB-C
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Hệ thống vận hành đầy tải, có đóng ngắt relay liên tục
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Truyền dữ liệu liên tục qua giao diện COM bước 45
   B2. Đo độ méo mắt tín hiệu (Eye Diagram) trên máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ mở của mắt tín hiệu (Eye Height) > 70% biên độ đỉnh
   * Độ trôi pha (Jitter) < 5% chu kỳ bit
   * Không xảy ra lỗi truyền thông khi cuộn hút relay đóng ngắt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng nhiễu công nghiệp đạt chuẩn
   [ ] Không bị treo bus UART
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu tín hiệu bị méo: Bổ sung hạt ferrite hoặc dây cáp bọc giáp chống nhiễu.
====================================================================================================

####################################################################################################
PHẦN 06: KHỐI GIAO TIẾP CẢM BIẾN MÔI TRƯỜNG NƯỚC & KHÍ (SENSOR FRONT-ENDS - HW-SNS)
MÃ PHÂN HỆ: HW-SNS | TỔNG SỐ TEST CASE: 80
MỤC TIÊU: Đảm bảo độ chính xác chuyển đổi ADC, độ tuyến tính, khả năng chống nhiễu cho từng loại cảm biến.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_SNS_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra kênh đo độ pH nước ngõ vào Analog (Cổng J16 - Chân PA5 STM32)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V. Cổng J16: Pin 1 = 5V, Pin 2 = GND, Pin 3 = PA5/PH_ADC
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện áp nguồn nuôi cấp ra chân 1 J16 (phải đạt 5.0V chuẩn)
   B2. Dùng máy phát điện áp chuẩn mV (hoặc hộp giả lập điện áp đầu dò pH) cấp các mức áp kiểm chuẩn vào chân 3: 0.00V, 1.25V, 2.50V, 3.30V
   B3. Đọc giá trị số hóa ADC 12-bit từ thanh ghi STM32 qua phần mềm debug
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp nuôi cảm biến tại Pin 1: 4.95V - 5.05V
   * Giá trị ADC đọc về tỷ lệ tuyến tính hoàn hảo với điện áp vào:
   * Tại V_in = 0.00V -> Giá trị ADC = 0 (+/- 5 LSB)
   * Tại V_in = 1.65V -> Giá trị ADC = 2048 (+/- 10 LSB)
   * Tại V_in = 3.30V -> Giá trị ADC = 4095 (+/- 10 LSB)
   * Độ nhiễu tín hiệu đỉnh - đỉnh ở trạng thái tĩnh < 3 LSB
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kênh đo Analog pH đạt độ chính xác cao
   [ ] Độ tuyến tính R^2 > 0.999
   [ ] Độ trôi nhiệt thấp
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu giá trị ADC nhảy loạn: Kiểm tra tụ lọc cao tần chống nhiễu tại chân PA5 hoặc nguồn 3.3V_STM bị gợn sóng.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra kênh đo độ dẫn điện và tổng chất rắn hòa tan TDS (Cổng J6 - Chân PB1 STM32)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J6: Pin 1 = 5V, Pin 2 = GND, Pin 3 = PB1/TDS_ADC
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện áp cấp tại Pin 1 J6 đạt 5V
   B2. Cấp tín hiệu xoay chiều mô phỏng đo điện cực TDS từ 0 đến 2.3V vào chân 3
   B3. Kiểm tra giá trị chuyển đổi ADC trên STM32
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp tại chân 3 chuyển đổi chính xác sang giá trị TDS ppm tương ứng
   * Sai số quy đổi độ dẫn điện nhỏ hơn 2%
   * Không có hiện tượng lệch điểm 0 (Zero offset < 5mV)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đầu vào TDS phản hồi nhạy bén
   [ ] Không bị suy hao tín hiệu trên đường mạch
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu đọc về 0 liên tục: Kiểm tra chân cắm connector J6 có bị hở chân hàn hoặc đứt đường mạch về PB1.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra giao tiếp SPI đọc cảm biến nhiệt độ bạch kim RTD PT100 qua MAX31865 (Cổng J15)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J15 (8 chân): 3.3V, GND, SCK (PA6), MISO (PA7), MOSI (PA11), CS (PA12)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cắm mô-đun MAX31865 kèm điện trở chuẩn 100.00Ω (tương đương 0.0°C) và 138.51Ω (tương đương 100.0°C) từ hộp điện trở thập phân
   B2. Kích hoạt luồng đọc SPI tần số 2.5MHz từ STM32
   B3. Đọc thanh ghi RTD MSB/LSB và thanh ghi Fault Status
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Giao tiếp SPI thông suốt, tín hiệu xung Clock SCK và dữ liệu MOSI/MISO rõ ràng
   * Nhiệt độ đọc về tại R = 100.00Ω: 0.0°C (+/- 0.15°C)
   * Nhiệt độ đọc về tại R = 138.51Ω: 100.0°C (+/- 0.20°C)
   * Thanh ghi lỗi Fault Register trả về 0x00 (không có lỗi hở mạch, ngắn mạch RTD)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Giao tiếp SPI với MAX31865 hoàn hảo
   [ ] Độ chính xác đo nhiệt độ nước đạt tiêu chuẩn kiểm định hồ cá
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu trả về 0xFF hoặc 0x00 liên tục: Kiểm tra chân chọn chip CS (PA12) hoặc dây xung SCK bị đấu sai.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra bus I2C đọc cảm biến nhiệt độ & độ ẩm không khí SHT30 (Cổng J7)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J7: Pin 1 = 3.3V, Pin 2 = GND, Pin 3 = SCL (PB6), Pin 4 = SDA (PB7)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế tĩnh trên 2 chân PB6 và PB7 (phải có mức 3.3V nhờ điện trở pull-up)
   B2. Kết nối cảm biến SHT30 thực tế hoặc thiết bị giả lập I2C địa chỉ 0x44
   B3. Gửi lệnh đo High Repeatability (0x2C06) và đọc 6 bytes dữ liệu (Temp MSB, Temp LSB, CRC, Humid MSB, Humid LSB, CRC)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Tần số xung I2C SCL đạt chuẩn 100kHz hoặc 400kHz Fast Mode
   * Cảm biến phản hồi bit ACK dứt khoát trên đường SDA
   * Hàm tính toán kiểm tra mã CRC-8 khớp 100% với dữ liệu nhận được
   * Nhiệt độ môi trường đo được: 25.0°C +/- 0.3°C, Độ ẩm: 60% RH +/- 2% RH
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Giao thức I2C vận hành chuẩn xác
   [ ] Tính toán CRC bảo toàn dữ liệu tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu bus I2C bị treo (SDA bị kéo thấp liên tục): Kiểm tra xung Clock Stretching hoặc thiếu điện trở kéo lên 4.7k trên đường I2C.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra kênh đếm xung cảm biến lưu lượng nước Hall FS300A (Cổng J12 - Chân PA1 STM32)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J12: Pin 1 = 5V, Pin 2 = GND, Pin 3 = FLOW_SIG (PA1)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế tại Pin 3 khi hở mạch (đạt 3.3V nhờ trở kéo lên R23 1k)
   B2. Dùng máy phát xung chuẩn phát sóng vuông 0 - 3.3V tần số 50Hz, 200Hz, 500Hz vào chân 3
   B3. Đọc bộ đếm Timer Input Capture trên STM32
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * STM32 đếm chính xác số lượng xung phát ra với sai số = 0 xung trong khoảng thời gian cửa sổ 1 giây
   * Đo được chính xác tần số xung tương ứng với lưu lượng dòng chảy (L/phút)
   * Không xuất hiện xung giả do nhiễu kích hoạt
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kênh đo lưu lượng đếm xung nhạy và chuẩn xác
   [ ] Tần số đáp ứng tối đa > 2kHz
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu đếm thiếu xung ở tần số cao: Điện trở kéo lên R23 quá lớn làm sườn tăng chậm, hoặc bộ lọc số của Timer đặt thời gian quá dài.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra kênh cảm biến báo mức nước quang / không tiếp xúc Y26 (Cổng J4 - Chân PA4 STM32)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J4: Pin 1 = 5V, Pin 2,3 = GND, Pin 4 = LEVEL_SIG
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra mạch phân áp an toàn gồm R38 (4.7k) và R39 (10k) để chuyển mức logic 5V từ cảm biến về 3.3V cho chân PA4
   B2. Cấp tín hiệu mức cao 5.0V vào Pin 4 cổng J4
   B3. Cấp tín hiệu mức thấp 0.0V vào Pin 4 cổng J4
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Khi ngõ vào = 5.0V: Điện áp tại chân PA4 của STM32 đạt chính xác: 5.0V * (10k / (4.7k + 10k)) = 3.40V (an toàn tuyệt đối cho chân 5V-tolerant của STM32), phần mềm nhận mức logic HIGH (Có nước)
   * Khi ngõ vào = 0.0V: Điện áp tại PA4 = 0.0V, phần mềm nhận mức LOW (Cạn nước)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mạch phân áp hạ điện áp bảo vệ chân vi điều khiển hoàn hảo
   [ ] Đọc trạng thái logic nước đầy/cạn chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu điện áp tại PA4 vượt quá 3.6V: Điện trở phân áp R39 (10k) bị hở chân hoặc hàn nhầm trị số.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cổng giao tiếp module đo điện năng AC đa năng PZEM-004T (Cổng J11)
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cổng J11: Pin 1 = 5V, Pin 4 = GND, Pin 2 = PA2_TX / PZEM_RX, Pin 3 = PA3_RX / PZEM_TX
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra mạch cầu phân áp hạ áp từ 5V xuống 3.3V trên đường RX (R24 20k và R25 4.7k)
   B2. Nối module PZEM-004T v3.0 vào cổng J11, cấp điện lưới 220VAC qua biến dòng CT
   B3. Gửi lệnh Modbus-RTU đọc thông số thanh ghi điện áp, dòng điện, công suất, năng lượng tiêu thụ qua UART
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Module PZEM phản hồi khung bản tin Modbus chuẩn xác
   * Điện áp lưới đo được: 220V +/- 1V
   * Dòng điện tải đo được chính xác với bóng đèn mẫu 100W
   * Mức tín hiệu nhận tại chân PA3 của STM32 không bao giờ vượt quá 3.3V
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Giao tiếp Modbus-RTU ổn định
   [ ] Tầng đệm bảo vệ an toàn cách ly hoàn toàn điện áp cao
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu không nhận được phản hồi: Đảo chân TX/RX tại cổng J11 hoặc kiểm tra module PZEM đã được cấp nguồn AC 220V để nuôi mạch đo hay chưa.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 8
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 8% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 9
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 9% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 10
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 10% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 11
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 11% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 12
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 12% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 13
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 13% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 14
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 14% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 15
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 15% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 16
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 16% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 17
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 17% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 18
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 18% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 19
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 19% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 20
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 20% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 21
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 21% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 22
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 22% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 23
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 23% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 24
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 24% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 25
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 25% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 26
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 26% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 27
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 27% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 28
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 28% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 29
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 29% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 30
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 30% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 31
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 31% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 32
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 32% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 33
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 33% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 34
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 34% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 35
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 35% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 36
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 36% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 37
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 37% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 38
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 38% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 39
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 39% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 40
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 40% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_041
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 41
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 41% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_042
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 42
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 42% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_043
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 43
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 43% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_044
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 44
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 44% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_045
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 45
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 45% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_046
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 46
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 46% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_047
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 47
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 47% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_048
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 48
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 48% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_049
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 49
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 49% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_050
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 50
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 50% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_051
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 51
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 51% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_052
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 52
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 52% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_053
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 53
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 53% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_054
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 54
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 54% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_055
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 55
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 55% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_056
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 56
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 56% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_057
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 57
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 57% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_058
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 58
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 58% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_059
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 59
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 59% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_060
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 60
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 60% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_061
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 61
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 61% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_062
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 62
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 62% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_063
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 63
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 63% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_064
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 64
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 64% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_065
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 65
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 65% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_066
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 66
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 66% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_067
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 67
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 67% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_068
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 68
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 68% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_069
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 69
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 69% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_070
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 70
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 70% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_071
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 71
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 71% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_072
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 72
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 72% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_073
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 73
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 73% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_074
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 74
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 74% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_075
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 75
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 75% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_076
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 76
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 76% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_077
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 77
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 77% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_078
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 78
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 78% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_079
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 79
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 79% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SNS_080
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra sai số chuyển đổi và độ ổn định tín hiệu cảm biến trong dải đo bước 80
PHÂN HỆ QUẢN LÝ   : HW-SNS - Giao Tiếp Cảm Biến
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PA5(pH), PB1(TDS), J15(MAX31865), J7(SHT30), J12(FS300A), J4(Y26), J11(PZEM)
THIẾT BỊ CẦN THIẾT: Bộ giả lập cảm biến, Máy phát hàm, DMM, Oscilloscope
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn nuôi ổn định, thiết bị giả lập cảm biến kết nối
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Điều chỉnh thông số giả lập cảm biến tại điểm kiểm tra 80% toàn dải
   B2. Đọc liên tục 100 mẫu dữ liệu liên tiếp
   B3. Tính toán độ lệch chuẩn (Standard Deviation)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Độ lệch chuẩn tín hiệu cực nhỏ (< 0.2% dải đo)
   * Không xuất hiện giá trị ngoại lai (No outlier values)
   * Thời gian đáp ứng trễ chuyển đổi < 10ms
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ lặp lại (Repeatability) và độ tin cậy dữ liệu đạt chuẩn
   [ ] Bộ lọc số FIR/IIR hoạt động hiệu quả
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu dữ liệu phân tán lớn: Kiểm tra tiếp xúc chân mass cảm biến hoặc có nguồn phát xung gần đường mạch analog.
====================================================================================================

####################################################################################################
PHẦN 07: KHỐI ĐIỀU KHIỂN TẢI ĐỘNG LỰC 4 KÊNH RELAY (RELAY ACTUATORS - HW-ACT)
MÃ PHÂN HỆ: HW-ACT | TỔNG SỐ TEST CASE: 50
MỤC TIÊU: Xác nhận khả năng đóng cắt an toàn, dập xung ngược cuộn hút, dòng kích và độ bền tiếp điểm.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_ACT_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra mạch kích hoạt Relay Kênh 1 (PB12 -> Q7 S8050 -> RELAY_COIL1 -> J17 Pin 1)
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V cho bo mạch, cấp nguồn cuộn hút relay 5V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện thế tại chân PB12 ở trạng thái nghỉ (0V)
   B2. Xuất mức logic HIGH (3.3V) từ chân PB12 của STM32
   B3. Đo điện áp cực B của Transistor Q7 qua trở R30 (1k)
   B4. Đo điện thế tại cực C của Q7 (RELAY_COIL1) và quan sát LED chỉ thị D12
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Khi PB12 = 0V: V_BE = 0V, Transistor khóa, LED D12 tắt, điện thế RELAY_COIL1 = 5V
   * Khi PB12 = 3.3V: V_BE = 0.72V, dòng cực B I_b khoảng 2.6mA, Transistor mở bão hòa
   * Điện áp bão hòa V_CE < 0.20V, cấp trọn vẹn ~4.8V cho cuộn hút rơ le
   * Đèn LED màu đỏ D12 sáng rõ ràng
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Transistor đóng cắt dứt khoát
   [ ] LED chỉ thị hoạt động chuẩn xác
   [ ] Cuộn hút rơ le hút dính chắc chắn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu Transistor không dẫn (V_CE = 5V khi PB12 cao): Kiểm tra chân phân cực E-B-C của Q7 (S8050 TO-92) có bị hàn nhầm thứ tự chân không.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra hiệu quả dập xung điện áp ngược của Diode Flyback D11 (SS34) khi ngắt Relay 1
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cắm rơ le 5VDC thực tế vào kênh 1
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kẹp que đo Oscilloscope vào cực Collector của Q7 (RELAY_COIL1)
   B2. Cài đặt kích hoạt Trigger sườn tăng (Rising edge) ở điện áp 6V
   B3. Điều khiển chân PB12 chuyển từ HIGH xuống LOW để ngắt cuộn hút rơ le
   B4. Đo điện áp đỉnh nhọn (Back-EMF spike)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp vọt đỉnh tại RELAY_COIL1 được ghim chặt ở mức: V_clamp = 5.0V + V_diode = 5.35V
   * Thời gian xả năng lượng từ trường trong cuộn dây kết thúc sau < 2ms
   * Hoàn toàn không có xung áp cao hàng chục Volt dội ngược gây đánh thủng Transistor Q7
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Diode dập xung SS34 phản ứng tức thì
   [ ] Bảo vệ linh kiện bán dẫn an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! CẢNH BÁO NGUY HIỂM: Nếu thấy xung áp vọt lên > 25V, Diode D11 bị hở chân hoặc hỏng đứt. Transistor Q7 sẽ chết sau vài chục lần đóng ngắt!
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra đồng bộ 4 kênh Relay hoạt động đồng thời (Full Load Switching)
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cắm đủ 4 rơ le ngoại vi vào các chân 1, 2, 3, 4 của cọc J17
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kích hoạt đồng thời cả 4 kênh: PB12 (K1), PB13 (K2), PB14 (K3), PB15 (K4) lên mức HIGH
   B2. Dùng DMM đo dòng điện tổng tiêu thụ trên đường nguồn 5V
   B3. Kiểm tra sụt áp trên đường nguồn 5V và 3.3V bằng máy hiện sóng
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Cả 4 đèn LED đỏ (D12, D16, D15, D10) đều sáng đồng loạt
   * Dòng tiêu thụ tăng thêm khoảng 300mA - 360mA (mỗi cuộn hút rơ le ăn khoảng 75mA - 90mA)
   * Độ sụt áp tức thời trên đường 5V < 80mV và hồi phục ngay lập tức
   * Đường nguồn 3.3V nuôi MCU không bị gợn sóng làm reset chip
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Bộ nguồn Buck 5V cấp dòng khỏe, không bị sập nguồn khi đóng đồng loạt cả 4 relay
   [ ] Các transistor Q4, Q6, Q7, Q9 hoạt động mát mẻ
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu đóng 4 relay làm ESP32 bị reset: Cuộn cảm L1 bị bão hòa từ tính hoặc tụ lọc C5 không đủ dung lượng bù dòng tức thời.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_004
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm đóng ngắt tần số cao liên tục kiểm tra độ bền nhiệt Transistor điều khiển
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nối tải cuộn hút
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Lập trình chu trình đóng ngắt liên tục chu kỳ 500ms ON / 500ms OFF liên tục trong 30 phút cho cả 4 kênh
   B2. Dùng camera nhiệt đo nhiệt độ bề mặt các transistor S8050
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Nhiệt độ bề mặt thân transistor Q4, Q6, Q7, Q9 ổn định dưới 48°C
   * Tiếng tiếp điểm rơ le kêu đanh, gọn gàng, không bị nghẽn
   * Không có hiện tượng trôi dòng phân cực
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Mạch điều khiển hoạt động bền bỉ, tản nhiệt tốt
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu transistor nóng > 70°C: Transistor không rơi vào vùng bão hòa hoàn toàn (dòng kích Ib quá nhỏ), cần giảm trị số trở kích dòng cực B.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 5
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 6
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 7
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 8
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 9
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 10
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 11
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 12
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 13
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 14
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 15
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 16
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 17
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 18
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 19
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 20
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 21
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 22
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 23
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 24
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 25
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 26
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 27
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 28
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 29
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 30
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 31
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 32
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 33
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 34
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 35
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 36
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 37
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 38
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 39
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 40
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_041
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 41
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_042
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 42
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_043
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 43
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_044
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 44
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_045
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 45
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_046
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 46
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_047
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 47
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_048
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 48
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_049
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 49
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ACT_050
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra cách ly điện áp cao 220VAC và rò điện tiếp điểm rơ le kênh số 50
PHÂN HỆ QUẢN LÝ   : HW-ACT - Điều Khiển Tải Động Lực Relay
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : PB12-PB15, Q4/Q6/Q7/Q9(S8050), D9/D11/D13/D14(SS34), J17
THIẾT BỊ CẦN THIẾT: DSO, DMM, Megohmmeter 1000V, Tải giả lập AC 220V
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nguồn lưới 220VAC kết nối tải giả lập bóng đèn sưởi / máy bơm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đo điện trở cách ly giữa đường tiếp điểm 220VAC với phần mạch số 3.3V/5V bằng máy đo Megohmmeter 1000V
   B2. Đóng ngắt tải công suất 500W qua rơ le
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở cách ly > 100MΩ ở điện áp thử 1000VDC
   * Không có hiện tượng phóng điện hồ quang hay rò điện sang khối vi điều khiển
   * Đèn tải sáng tắt dứt khoát
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn an toàn điện cao áp IEC 61010-1
   [ ] Khoảng cách cách ly Creepage & Clearance > 4.0mm
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu có xung nhiễu làm reset vi điều khiển khi tải đóng ngắt: Bổ sung mạch lọc dập tia lửa điện RC Snubber (100Ω + 0.1uF 400V) song song tiếp điểm rơ le.
====================================================================================================

####################################################################################################
PHẦN 08: KHỐI CÔNG TẮC CHỌN NGUỒN & TERMINAL PHỤ TRỢ (POWER ROUTING - HW-SWT)
MÃ PHÂN HỆ: HW-SWT | TỔNG SỐ TEST CASE: 30
MỤC TIÊU: Xác nhận các công tắc gạt lựa chọn nguồn điện áp phụ trợ (Vin, 5V, 3.3V) ra các cọc terminal ngoại vi.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_SWT_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra công tắc gạt chuyển mạch nguồn SW8 chọn Vin hoặc 5V cấp ra cổng Terminal J22
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn Vin = 12.0V, nguồn 5V ổn định 5.0V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gạt công tắc SW8 về vị trí nấc 1 (Vị trí nối Vin)
   B2. Đo điện thế DC tại 2 cực của Terminal J22 bằng DMM
   B3. Gạt công tắc SW8 sang vị trí nấc 3 (Vị trí nối 5V)
   B4. Đo lại điện thế DC tại Terminal J22
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Tại nấc 1: Điện áp ra tại J22 = 12.0V (+/- 0.1V)
   * Tại nấc 3: Điện áp ra tại J22 = 5.0V (+/- 0.05V)
   * Tiếp điểm công tắc trơn tru, điện trở tiếp xúc < 0.05Ω, không bị sụt áp khi kéo tải 1A
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Chuyển mạch nguồn chính xác theo sơ đồ
   [ ] Đầu ra cấp nguồn đúng điện áp lựa chọn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu điện áp ra bị chập chờn: Công tắc cơ khí SW8 bị oxi hóa lá đồng tiếp điểm hoặc mối hàn chân công tắc bị rỗ thiếc.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_002
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra công tắc gạt chuyển mạch nguồn SW7 chọn 3.3V hoặc 5V cấp ra cổng Terminal J20
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gạt SW7 về vị trí 3.3V và đo điện áp tại Terminal J20
   B2. Gạt SW7 về vị trí 5V và đo điện áp tại Terminal J20
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Vị trí 3.3V: Điện áp đo được = 3.30V (+/- 0.03V)
   * Vị trí 5V: Điện áp đo được = 5.00V (+/- 0.05V)
   * Không có hiện tượng phóng hồ quang làm ngắn mạch giữa 3.3V và 5V trong khoảnh khắc gạt công tắc (Break-before-make)
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Cách ly giữa 2 mức điện áp hoàn toàn tin cậy
   [ ] Terminal phụ trợ J20 cấp đúng điện áp cho cảm biến mở rộng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Tuyệt đối không dùng công tắc loại Make-before-break vì sẽ chập nguồn 5V vào đường 3.3V làm nổ chip.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra công tắc gạt chuyển mạch nguồn SW6 chọn 3.3V hoặc 5V cấp ra cổng Terminal J19
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Cấp nguồn 12V
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Kiểm tra chuyển mạch SW6 tương tự với các nấc lựa chọn cấp ra J19
   B2. Mắc tải 500mA vào cổng J19 và kiểm tra độ sụt áp
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện áp ổn định chuẩn xác ở cả 2 mức 3.3V và 5.0V
   * Độ sụt áp trên tiếp điểm < 20mV ở dòng tải 500mA
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Công tắc SW6 đáp ứng tốt yêu cầu kỹ thuật
   [ ] Terminal J19 hoạt động hoàn hảo
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Hàn dặm lại chân công tắc nếu tiếp xúc chập chờn.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 4
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 200 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 5
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 250 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 6
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 300 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 7
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 350 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 8
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 400 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 9
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 450 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 10
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 500 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 11
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 550 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 12
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 600 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 13
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 650 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 14
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 700 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 15
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 750 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 16
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 800 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 17
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 850 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 18
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 900 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 19
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 950 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 20
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1000 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 21
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1050 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 22
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1100 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 23
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1150 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 24
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1200 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 25
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1250 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 26
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1300 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 27
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1350 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 28
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1400 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 29
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1450 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_SWT_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ bền cơ học và cách điện tiếp điểm công tắc gạt bước 30
PHÂN HỆ QUẢN LÝ   : HW-SWT - Công Tắc & Terminal Phụ Trợ
MỨC ĐỘ ƯU TIÊN    : Medium
LINH KIỆN LIÊN QUAN : SW6, SW7, SW8, J19, J20, J22
THIẾT BỊ CẦN THIẾT: DMM, Tải điện tử, Bộ gạt cơ khí tự động
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Thiết bị thử nghiệm độ bền tiếp điểm
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện gạt công tắc chuyển đổi chu kỳ 1500 lần
   B2. Đo điện trở tiếp xúc và điện trở cách điện
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Điện trở tiếp xúc duy trì < 0.08Ω sau hàng trăm lần gạt
   * Điện trở cách điện giữa các cực hở mạch > 50MΩ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Độ bền cơ khí đạt tiêu chuẩn
   [ ] Không bị kẹt lẫy chuyển hướng
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Thay thế công tắc mới nếu phát hiện lỏng chân gạt.
====================================================================================================

####################################################################################################
PHẦN 09: KHỐI VÔ TUYẾN KHÔNG DÂY WI-FI & BLUETOOTH (ESP32 RF - HW-RF)
MÃ PHÂN HỆ: HW-RF | TỔNG SỐ TEST CASE: 40
MỤC TIÊU: Đo kiểm tra công suất phát xạ vô tuyến Tx, độ nhạy thu Rx, ăng-ten IPEX và kết nối đám mây.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_RF_001
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra đầu nối ăng-ten ngoài IPEX / U.FL và phối hợp trở kháng RF 50Ω
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - ESP32-WROOM-32UE sử dụng đầu nối IPEX ngoài
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gắn cáp đo RF chuyên dụng pigtail U.FL to SMA vào đầu nối IPEX của mô-đun U1
   B2. Nối vào máy phân tích mạng véc-tơ (VNA - Vector Network Analyzer)
   B3. Quét thông số phản xạ S11 trong dải tần 2.400GHz - 2.500GHz
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Hệ số phản xạ S11 < -15dB trên toàn dải băng tần 2.4GHz Wi-Fi (Tỷ số sóng đứng điện áp VSWR < 1.4)
   * Trở kháng danh định đạt chuẩn 50Ω (+/- 3Ω)
   * Đầu nối IPEX gắn chắc, không lỏng lẻo khi xoay cáp 360 độ
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Phối hợp trở kháng anten đạt chuẩn tối ưu
   [ ] Hạn chế tối đa sóng phản xạ làm suy giảm công suất phát
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu S11 > -10dB: Đường mạch vi dải (Microstrip line) trên mô-đun hoặc cáp pigtail bị gãy lõi đồng bên trong.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_002
TIÊU ĐỀ KIỂM THỬ  : Đo công suất phát xạ vô tuyến cực đại Wi-Fi 802.11b/g/n (Tx Power Measurement)
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Mô-đun phát ở chế độ kiểm chuẩn Continuous Wave (CW) và gói tin chuẩn Wi-Fi kênh 1, 6, 11 (2412MHz, 2437MHz, 2462MHz)
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Nối cổng RF qua bộ suy hao chuẩn 20dB vào máy phân tích phổ (Spectrum Analyzer / RF Power Meter)
   B2. Kích phát gói tin 802.11b tốc độ 11Mbps công suất cực đại
   B3. Kích phát gói tin 802.11n MCS7 băng thông 20MHz
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Công suất phát 802.11b đo được: +19.5dBm (+/- 1.5dBm)
   * Công suất phát 802.11n MCS7: +14.5dBm (+/- 1.5dBm)
   * Mặt nạ phổ phát xạ (Spectral Emission Mask) đạt chuẩn FCC Part 15.247, không vi phạm bức xạ ngoài băng
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Công suất phát xạ mạnh mẽ đúng thông số datasheet ESP32
   [ ] Đạt chuẩn phát xạ hợp quy vô tuyến
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu công suất phát thấp hơn 12dBm: Nguồn 3V3_ESP bị sụt áp khi phát dòng lớn (> 350mA) hoặc hạt lọc FB1 bị tăng điện trở thuần.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_003
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra độ nhạy thu sóng Wi-Fi (Rx Sensitivity & RSSI Test)
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Đặt bo mạch trong buồng đo chắn sóng (Shield Box) cách trạm phát Access Point chuẩn một khoảng cố định suy hao 60dB
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấu hình ESP32 quét danh sách mạng Wi-Fi (Wi-Fi Scan)
   B2. Đọc chỉ số cường độ tín hiệu thu nhận RSSI trên cả 13 kênh
   B3. Thực hiện truyền nhận 10,000 gói tin TCP/UDP
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Chỉ số RSSI đọc về chuẩn xác: -58dBm (+/- 3dBm)
   * Độ nhạy thu tối thiểu đạt -95dBm ở chuẩn 802.11b 1Mbps
   * Tỷ lệ rớt gói tin (Packet Loss Rate) < 0.1%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khối thu sóng RF nhạy bén
   [ ] Kết nối Wi-Fi ổn định qua vật cản
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu RSSI quá yếu (-85dBm trong cự ly gần): Ăng-ten chưa được cắm vào jack IPEX hoặc mối hàn tiếp đất anten bị hở.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_004
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra phát sóng và kết nối Bluetooth Low Energy (BLE 4.2 / 5.0 Advertising)
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Nạp firmware phát BLE Beacon với UUID định danh hệ thống AquaCare
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Dùng điện thoại thông minh hoặc máy thu BLE chuyên dụng đặt cách 5 mét
   B2. Quét tìm kiếm thiết bị 'AquaCare_Master_XXXX'
   B3. Thực hiện kết nối Pairing và đọc ghi thuộc tính GATT Characteristic
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thiết bị xuất hiện tức thì trong danh sách quét dưới 1 giây với RSSI > -65dBm
   * Quá trình ghép nối Bluetooth thành công 100%
   * Truyền dữ liệu cấu hình Wi-Fi (Provisioning) qua BLE diễn ra mượt mà trong vòng 3 giây
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khối BLE hoạt động chuẩn xác
   [ ] Sẵn sàng cho tính năng cài đặt thiết bị qua Mobile App
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu không tìm thấy tên Bluetooth: Kiểm tra phần mềm chưa khởi động stack BLE hoặc thạch anh 40MHz của ESP32 bị sai tần số.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_005
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 5
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 50ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_006
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 6
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 60ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_007
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 7
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 70ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_008
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 8
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 80ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_009
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 9
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 90ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_010
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 10
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 100ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_011
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 11
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 110ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_012
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 12
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 120ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_013
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 13
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 130ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_014
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 14
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 140ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_015
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 15
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 150ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_016
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 16
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 160ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_017
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 17
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 170ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_018
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 18
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 180ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_019
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 19
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 190ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_020
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 20
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 200ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_021
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 21
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 210ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_022
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 22
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 220ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_023
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 23
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 230ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_024
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 24
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 240ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_025
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 25
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 250ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_026
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 26
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 260ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_027
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 27
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 270ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_028
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 28
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 280ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_029
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 29
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 290ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_030
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 30
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 300ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_031
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 31
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 310ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_032
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 32
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 320ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_033
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 33
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 330ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_034
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 34
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 340ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_035
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 35
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 350ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_036
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 36
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 360ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_037
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 37
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 370ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_038
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 38
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 380ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_039
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 39
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 390ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_RF_040
TIÊU ĐỀ KIỂM THỬ  : Kiểm tra thông lượng dữ liệu mạng và độ ổn định kết nối liên tục chu kỳ 40
PHÂN HỆ QUẢN LÝ   : HW-RF - Vô Tuyến Wi-Fi & Bluetooth
MỨC ĐỘ ƯU TIÊN    : High
LINH KIỆN LIÊN QUAN : ESP32-WROOM-32UE U1, Cáp IPEX/U.FL, Ăng-ten ngoài 2.4GHz
THIẾT BỊ CẦN THIẾT: Máy phân tích mạng VNA, Máy phân tích phổ, Buồng đo chắn sóng RF Shield Box
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Kết nối vào hệ thống Server AquaCare qua giao thức MQTT over TLS
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Gửi liên tục các bản tin Telemetry kích thước 256 bytes với chu kỳ 400ms
   B2. Đo thời gian trễ Round-Trip Time (RTT) và kiểm tra lỗi rớt socket
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Thông lượng mạng ổn định > 500Kbps
   * Thời gian phản hồi RTT < 80ms trên mạng nội bộ
   * Không bị khởi động lại do lỗi tràn ngăn xếp Wi-Fi
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Kết nối IoT Cloud ổn định dài hạn
   [ ] Hệ thống truyền thông tin cậy
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu mất kết nối: Kiểm tra bộ nhớ heap của ESP32 và độ ổn định của đường truyền Internet.
====================================================================================================

####################################################################################################
PHẦN 10: THỬ NGHIỆM MÔI TRƯỜNG, ĐỘ BỀN & BẢO VỆ CHỐNG NHIỄU (STRESS & ENV - HW-ENV)
MÃ PHÂN HỆ: HW-ENV | TỔNG SỐ TEST CASE: 45
MỤC TIÊU: Đảm bảo độ bền hoạt động 24/7 trong môi trường hồ cá ẩm ướt, nhiệt độ cao, sốc điện và tĩnh điện.
####################################################################################################

====================================================================================================
TEST CASE ID      : HW_ENV_001
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm lão hóa nhiệt toàn tải liên tục 48 giờ (Burn-in Life Test 48h at 55°C)
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch hoàn thiện lắp đặt trong tủ thử nghiệm nhiệt độ môi trường (Chamber) cài đặt 55°C
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Cấp nguồn 12V, kéo tải tối đa: Bật đồng thời 4 relay, phát Wi-Fi liên tục, đọc cảm biến chu kỳ 1s
   B2. Chạy liên tục không ngừng nghỉ trong 48 giờ
   B3. Theo dõi dòng tiêu thụ, nhiệt độ các điểm nóng và tỷ lệ lỗi hệ thống qua log tự động
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Bo mạch vận hành liên tục 48 giờ không bị treo, không bị reset đột ngột
   * Nhiệt độ tối đa trên chip nguồn TPS5430 đo được trong tủ nhiệt: < 88°C (giới hạn chịu nhiệt của chip là 150°C)
   * Sau 48 giờ đưa ra nhiệt độ phòng: Toàn bộ chức năng đo cảm biến và đóng cắt tải vẫn chính xác 100%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Vượt qua thử nghiệm lão hóa nhiệt gia tốc
   [ ] Độ tin cậy tuổi thọ linh kiện đạt chuẩn sản xuất
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu bo mạch bị khởi động lại sau vài giờ: Kiểm tra hiện tượng trôi nhiệt của các tụ điện hoặc chip nguồn ngắt do quá nhiệt.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_002
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chịu độ ẩm cao và kiểm tra lớp sơn phủ bảo vệ bo mạch (Conformal Coating)
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch đã được xịt phủ lớp keo bảo vệ chống ẩm (Conformal Coating silicone / acrylic) che kín linh kiện SMT
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Đặt bo mạch vào buồng vi khí hậu: Nhiệt độ 40°C, Độ ẩm tương đối 90% - 95% RH trong 24 giờ
   B2. Kiểm tra hiện tượng đọng sương và đo dòng rò giữa các đường mạch điện áp cao
   B3. Kiểm tra hiện tượng ăn mòn điện hóa (Dendrite growth) dưới kính hiển vi
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Lớp keo bảo vệ bám dính chắc, không phồng rộp, phát huỳnh quang đều dưới đèn UV
   * Điện trở cách ly giữa các đường mạch lân cận > 20MΩ trong môi trường ẩm
   * Không có bất kỳ dấu hiệu rỉ sét hay ăn mòn các chân kim loại
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng kháng ẩm tuyệt hảo trong môi trường sát mặt nước hồ cá
   [ ] Bảo vệ mạch chống oxy hóa dài hạn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Cần che chắn kỹ các lỗ cắm cổng kết nối (USB-C, Terminal, Jack DC) trước khi xịt keo phủ để tránh dính keo làm mất tiếp xúc.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_003
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm phóng tĩnh điện trực tiếp và gián tiếp (ESD Immunity Test IEC 61000-4-2)
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bo mạch được cấp điện vận hành bình thường trên bàn thử ESD tiêu chuẩn
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Sử dụng súng bắn tĩnh điện ESD Gun (Điện dung 150pF, Điện trở 330Ω)
   B2. Phóng điện tiếp xúc (Contact Discharge): Bắn mức áp +/- 4kV vào vỏ kim loại cổng USB-C J1, ốc vặn terminal
   B3. Phóng điện trong không khí (Air Discharge): Bắn mức áp +/- 8kV vào khe hở công tắc gạt, vỏ ngoài
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Bo mạch không bị hỏng hóc vật lý bất kỳ linh kiện nào
   * Hệ thống không bị treo chip hoặc mất kết nối truyền thông trong suốt quá trình bắn tĩnh điện
   * Nếu có hiện tượng reset do nhiễu điện từ cực mạnh: Vi điều khiển phải tự động phục hồi về trạng thái bình thường dưới 2 giây
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Đạt chuẩn miễn nhiễm tĩnh điện công nghiệp IEC 61000-4-2 Level 2/3
   [ ] TVS diode D4 phát huy tác dụng triệt tiêu xung sét tĩnh điện
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu chip bị cháy khi bắn tĩnh điện: Nối đất vỏ kim loại USB-C xuống mặt phẳng mass lớn hoặc bổ sung diode ESD chuyên dụng cho các đường dữ liệu D+/D-.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_004
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm sụt áp đột ngột và dao động nguồn ngõ vào (Voltage Dips & Interruptions)
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Bộ nguồn lập trình DC cấp nguồn cho bo mạch
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Mô phỏng hiện tượng sụt điện nguồn 12V rơi nhanh về 6V trong thời gian 50ms rồi hồi phục
   B2. Mô phỏng mất điện hoàn toàn trong 10ms (chu kỳ mất nửa sóng lưới điện)
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * Hệ thống tụ lọc đầu vào (C5, C6 và các tụ 10uF) duy trì đủ năng lượng dự trữ giúp MCU không bị Brownout reset trong các nhịp ngắt ngắn < 15ms
   * Khi điện áp sụt về 6V: Bộ nguồn xung TPS5430 vẫn duy trì ổn định ngõ ra 5V và 3.3V không sụt quá 5%
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Khả năng hoạt động bền bỉ trước sự bất ổn của lưới điện
   [ ] Bảo toàn dữ liệu bộ nhớ EEPROM/Flash an toàn
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Tăng dung lượng tụ hóa đầu vào C5, C6 nếu muốn kéo dài thời gian duy trì khi mất điện.
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_005
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 500 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 500 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_006
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 600 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 600 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_007
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 700 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 700 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_008
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 800 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 800 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_009
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 900 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 900 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_010
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1000 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1000 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_011
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1100 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1100 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_012
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1200 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1200 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_013
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1300 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1300 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_014
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1400 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1400 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_015
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1500 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1500 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_016
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1600 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1600 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_017
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1700 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1700 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_018
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1800 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1800 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_019
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 1900 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 1900 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_020
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2000 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2000 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_021
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2100 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2100 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_022
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2200 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2200 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_023
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2300 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2300 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_024
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2400 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2400 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_025
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2500 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2500 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_026
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2600 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2600 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_027
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2700 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2700 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_028
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2800 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2800 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_029
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 2900 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 2900 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_030
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3000 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3000 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_031
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3100 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3100 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_032
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3200 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3200 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_033
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3300 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3300 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_034
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3400 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3400 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_035
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3500 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3500 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_036
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3600 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3600 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_037
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3700 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3700 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_038
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3800 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3800 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_039
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 3900 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 3900 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_040
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4000 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4000 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_041
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4100 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4100 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_042
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4200 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4200 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_043
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4300 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4300 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_044
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4400 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4400 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

====================================================================================================
TEST CASE ID      : HW_ENV_045
TIÊU ĐỀ KIỂM THỬ  : Thử nghiệm chu kỳ bật tắt nguồn liên tục (Power Cycling Stress Test) chu kỳ 4500 lần
PHÂN HỆ QUẢN LÝ   : HW-ENV - Môi Trường & Độ Bền
MỨC ĐỘ ƯU TIÊN    : Critical
LINH KIỆN LIÊN QUAN : Toàn bộ bo mạch Master Board, F2, D4, Casing
THIẾT BỊ CẦN THIẾT: Tủ nhiệt ẩm vi khí hậu, Súng phóng tĩnh điện ESD Gun, Bộ nguồn lập trình
----------------------------------------------------------------------------------------------------
1. ĐIỀU KIỆN TIÊN QUYẾT (PRECONDITIONS):
   - Máy đóng ngắt nguồn tự động điều khiển bằng relay
2. CÁC BƯỚC TIẾN HÀNH KIỂM THỬ (TEST PROCEDURE):
   B1. Thực hiện chu trình ngắt nguồn 2 giây -> Cấp điện 5 giây -> Lặp lại 4500 chu kỳ
   B2. Ghi nhận trạng thái khởi động thành công của firmware và tính toàn vẹn bộ nhớ
3. KẾT QUẢ MONG ĐỢI VÀ TIÊU CHUẨN KỸ THUẬT (ACCEPTANCE CRITERIA):
   * 100% các lần khởi động đều vào chương trình chính xác
   * Không bị lỗi hư hỏng bảng phân vùng Flash (No Flash corruption)
   * Dòng khởi động nạp tụ ban đầu (Inrush Current) nằm trong giới hạn chịu đựng của cầu chì F2
4. TIÊU CHÍ ĐÁNH GIÁ (PASS / FAIL CHECKLIST):
   [ ] Hệ thống khởi động tin cậy sau hàng ngàn lần mất điện
   [ ] Mạch Power-On-Reset hoạt động tuyệt đối chính xác
5. HƯỚNG DẪN XỬ LÝ SỰ CỐ & NGUYÊN NHÂN LỖI PHỔ BIẾN (TROUBLESHOOTING GUIDE):
   ! Nếu xuất hiện lỗi phân vùng Flash: Kiểm tra tính năng Brownout Detector (BOD) của MCU đã được bật trong thanh ghi cấu hình (Option Bytes).
====================================================================================================

####################################################################################################
PHỤ LỤC: BIỂU MẪU BÁO CÁO KẾT QUẢ KIỂM THỬ XUẤT XƯỞNG (FACTORY EOL QC REPORT)
####################################################################################################

### THÔNG TIN LÔ HÀNG KIỂM THỬ:
- **MÃ LÔ SẢN XUẤT (LOT NUMBER)**: ............................................................ 
- **SỐ SERI BO MẠCH (BOARD SERIAL NUMBER - SN)**: ............................................. 
- **ĐỊA CHỈ MAC ESP32 (MAC ADDRESS)**: ........................................................ 
- **NGÀY KIỂM THỬ**: ...... / ...... / 2026
- **KỸ THUẬT VIÊN KIỂM ĐỊNH (QC INSPECTOR)**: ................................................. 
- **KẾT LUẬN CUỐI CÙNG**: [  ] XUẤT XƯỞNG (PASSED)    [  ] TRẢ HÀNG SỬA CHỮA (REWORK / REJECT)

### BẢNG ĐIỀN KẾT QUẢ TÓM TẮT 10 TRẠM KIỂM THỬ:

| Trạm Đo | Hạng Mục Kiểm Tra | Thông Số Kỹ Thuật Chuẩn | Giá Trị Thực Tế Đo Được | Đánh Giá (P/F) | Chữ Ký KTV |
|:---:|:---|:---|:---|:---:|:---:|
| 1 | Ngoại quan mối hàn & Cơ khí | Đạt IPC-A-610 Class 2, không cầu chì | ................................... | [  ] | ............ |
| 2 | Trở kháng nguội Vin - GND | R > 100kΩ (Không ngắn mạch) | .............................. kΩ | [  ] | ............ |
| 3 | Dòng tĩnh toàn mạch (Vin=12V) | 35mA <= I_standby <= 75mA | .............................. mA | [  ] | ............ |
| 4 | Điện áp ngõ ra 5V (C5) | 4.90V <= V_5V <= 5.15V | ............................... V | [  ] | ............ |
| 5 | Điện áp ngõ ra 3.3V (C6) | 3.25V <= V_3V3 <= 3.38V | ............................... V | [  ] | ............ |
| 6 | Tần số thạch anh HSE STM32 | 8.000MHz (+/- 50ppm) | ............................. MHz | [  ] | ............ |
| 7 | Nạp Firmware qua USB Type-C | Nạp thành công ở 921600bps | ................................... | [  ] | ............ |
| 8 | Đọc chuẩn kênh cảm biến pH | ADC tuyến tính, V_ref chuẩn | ................................... | [  ] | ............ |
| 9 | Đóng ngắt 4 Kênh Relay | 4 Relay hút dứt khoát, 4 LED sáng | ................................... | [  ] | ............ |
| 10 | Công suất phát Wi-Fi & BLE | RSSI > -60dBm, Kết nối Cloud OK | ............................. dBm | [  ] | ............ |

---
*Tài liệu được phát triển bởi Bộ Phận Kỹ Thuật Phần Cứng AquaCare (AquaCare Hardware R&D Team).*
*Bản quyền thuộc về AquaCare System 2026. Nghiêm cấm sao chép khi chưa có văn bản chấp thuận.*