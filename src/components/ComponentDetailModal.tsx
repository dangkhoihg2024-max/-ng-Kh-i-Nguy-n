import React, { useState, useEffect } from 'react';
import { RobotComponentInfo } from '../types/robot';
import { ComponentPartImage } from './ComponentPartImage';
import {
  X,
  Cpu,
  Layers,
  Activity,
  Eye,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  BatteryCharging,
  Wifi,
  Gamepad,
  Cable,
  Image as ImageIcon,
} from 'lucide-react';

interface ComponentDetailModalProps {
  component: RobotComponentInfo | null;
  onClose: () => void;
  onInspect3D: (id: RobotComponentInfo['id']) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  onClose,
  onInspect3D,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'checklist'>('info');
  const [photoMode, setPhotoMode] = useState<'part' | 'assembled' | 'kit'>('part');

  useEffect(() => {
    setPhotoMode('part');
    setActiveTab('info');
  }, [component?.id]);

  if (!component) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: component.highlightColor }}
            ></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white mb-0">{component.name}</h3>
                <span className="badge bg-primary text-white text-xs">{component.categoryLabel}</span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5 mb-0">{component.vietnameseName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Thông tin chi tiết vs Danh mục kiểm tra phụ kiện */}
        <div className="flex items-center gap-2 mt-3 pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Thông Tin & Tác Dụng Bộ Phận
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Danh Mục Kiểm Tra Linh Kiện / Phụ Kiện Đi Kèm
          </button>
        </div>

        {activeTab === 'info' ? (
          <div>
            {/* Hình ảnh thực tế của bộ phận */}
            <div className="mt-4 p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Hình Ảnh Thực Tế Bộ Phận
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPhotoMode('part')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      photoMode === 'part'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Linh kiện tách rời ({component.imageRegion.kitNumber})
                  </button>
                  <button
                    onClick={() => setPhotoMode('assembled')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      photoMode === 'assembled'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Lắp trên xe thật
                  </button>
                  <button
                    onClick={() => setPhotoMode('kit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      photoMode === 'kit'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Toàn bộ Kit
                  </button>
                </div>
              </div>

              {photoMode === 'part' && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <ComponentPartImage
                      region={component.imageRegion}
                      className="w-52 h-44 shadow-lg"
                    />
                    <span className="text-[11px] text-slate-300 font-medium">
                      {component.imageRegion.label}
                    </span>
                  </div>
                  {component.extraRegions?.map((extra) => (
                    <div key={extra.kitNumber} className="flex flex-col items-center gap-1">
                      <ComponentPartImage
                        region={extra}
                        className="w-44 h-44 shadow-lg"
                      />
                      <span className="text-[11px] text-slate-300 font-medium">
                        {extra.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {photoMode === 'assembled' && (
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={component.realPhoto}
                    alt={`Ảnh thực tế ${component.name} trên JetBot`}
                    className="max-h-64 w-auto rounded-xl border border-slate-700 object-contain shadow-lg"
                  />
                  <span className="text-[11px] text-slate-400">
                    Vị trí lắp đặt thực tế trên xe JetBot
                  </span>
                </div>
              )}

              {photoMode === 'kit' && (
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src="/assets/aistudio/image_3c91e4ba.png"
                    alt="Sơ đồ toàn bộ linh kiện JetBot"
                    className="w-full max-h-64 rounded-xl border border-slate-700 bg-white object-contain p-1 shadow-lg"
                  />
                  <span className="text-[11px] text-slate-400">
                    Đánh dấu vị trí bộ phận: <strong className="text-red-400">{component.imageRegion.kitNumber}</strong>
                    {component.extraRegions?.map((e) => `, ${e.kitNumber}`).join('') || ''}
                  </span>
                </div>
              )}
            </div>

            {/* Chức năng & Tác dụng chính (Nổi bật) */}
            <div className="mt-4 p-4 bg-cyan-950/40 rounded-xl border border-cyan-800/60">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Chức năng & Tác dụng của bộ phận
              </div>
              <p className="text-slate-100 text-sm mb-0 font-medium leading-relaxed">
                {component.functionSummary}
              </p>
            </div>

            {/* Vị trí & Phân tích chi tiết */}
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Vị trí lắp đặt & Vai trò kỹ thuật thực tế
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed text-justify bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {component.detailedRole}
              </p>
            </div>

            {/* Thông số kỹ thuật dạng bảng Bootstrap */}
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                Thông số kỹ thuật & Chi tiết phần cứng
              </h4>
              <div className="table-responsive rounded-lg overflow-hidden border border-slate-700">
                <table className="table table-dark table-striped table-hover mb-0 text-xs">
                  <tbody>
                    {component.specs.map((spec, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold text-slate-400" style={{ width: '38%' }}>
                          {spec.label}
                        </td>
                        <td className="font-mono text-cyan-300">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Giao tiếp & Hệ sinh thái ROS2 */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Điện áp & Cổng kết nối
                </div>
                <div className="text-xs font-mono text-white mb-1">{component.voltage}</div>
                <div className="text-xs text-slate-300">{component.interfaces}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Gói phần mềm ROS / ROS2
                </div>
                <div className="text-xs font-mono text-emerald-400 mb-1">{component.rosPackage}</div>
                <div className="text-xs text-slate-400">Tương thích JetBot, Nav2, TensorRT</div>
              </div>
            </div>
          </div>
        ) : (
          /* Checklist các phụ kiện đi kèm theo yêu cầu người dùng */
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <h5 className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" /> 1. Các bộ phận ĐÃ CÓ ĐẦY ĐỦ TRÊN XE (Xem trong ảnh 3D)
              </h5>
              <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
                <li><strong>Khung gầm & Cơ cấu di chuyển:</strong> Khung nhôm Anod xanh 2 tầng, 2 bánh xe cao su gai mâm đúc xanh chrome và 1 bánh xe hướng (caster wheel) kim loại dập chữ U.</li>
                <li><strong>Cảm biến chính:</strong> Cảm biến LiDAR 360 độ (trên đỉnh) kèm động cơ dây curoa; Camera góc rộng + cáp dẹt FFC AWM 20706.</li>
                <li><strong>Bộ xử lý trung tâm:</strong> Mạch Jetson Nano + Tản nhiệt nhôm đen + Quạt tản nhiệt 40mm (Cooling Fan).</li>
                <li><strong>Bo mạch mở rộng:</strong> JetBot Expansion Board / Motor Driver ở tầng dưới có công tắc AI PWR và giắc cắm DC.</li>
                <li><strong>Truyền thông:</strong> 2 Ăng-ten Wi-Fi gắn mạch dựng đứng hai bên.</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/60 text-xs">
              <h5 className="text-amber-300 font-bold mb-2 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400" /> 2. Các linh kiện / Phụ kiện CẦN KIỂM TRA THÊM (Bên trong xe hoặc ngoài hộp)
              </h5>
              <div className="space-y-2 text-slate-300">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> Thẻ nhớ MicroSD (TF Card 64GB - 128GB)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Nằm ở đâu:</strong> Cắm ở khe cắm thẻ nhớ dưới bo mạch Jetson Nano.
                    <br />
                    <strong>Vai trò:</strong> Chứa hệ điều hành (Ubuntu 20.04 LTS), thư viện ROS/ROS2, CUDA, OpenCV, PyTorch và hệ thống Jupyter Notebook để chạy lệnh.
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-yellow-300 flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5" /> Khối Pin / Mạch cấp nguồn không dây
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Nằm ở đâu:</strong> Dãy 3 cell pin 18650 cắm dưới đáy bo mạch mở rộng hoặc bộ sạc dự phòng chuyên dụng.
                    <br />
                    <strong>Kiểm tra:</strong> Cần đảm bảo đã sạc đủ điện áp (11.1V - 12.6V) để xe hoạt động không dây mà không cần cắm cáp cố định.
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" /> Mạch / Card Wi-Fi M.2 (hoặc USB Wi-Fi)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Nằm ở đâu:</strong> Mạch Wi-Fi nằm phía dưới bo mạch Jetson Nano (nối trực tiếp ra 2 dây cáp ăng-ten đen).
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5" /> Cáp nối nguồn & tín hiệu
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cáp nối giữa LiDAR và bo mạch trung tâm (dây cắm màu xanh/xám, bo USB-UART) và cáp nguồn từ bo mở rộng vào cổng Power của Jetson Nano.
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Gamepad className="w-3.5 h-3.5" /> Tay cầm điều khiển (Gamepad / Joystick Bluetooth / USB)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    (Tùy chọn) Thường dùng để lái xe thủ công trong giai đoạn quét xây dựng bản đồ (SLAM map building).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onInspect3D(component.id);
              onClose();
            }}
            className="btn btn-primary d-flex align-items-center gap-2 text-xs px-4 py-2"
          >
            <Eye className="w-4 h-4" />
            Phóng to & Định vị trong Mô hình 3D
          </button>

          <button onClick={onClose} className="btn btn-secondary text-xs px-4 py-2">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
