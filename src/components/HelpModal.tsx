import React from 'react';
import { X, MousePointer, Keyboard, Layers, Radio, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl text-slate-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white mb-0">Hướng Dẫn Tương Tác & Điều Khiển</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          {/* 1. Thao tác chuột */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-cyan-400 mb-2 flex items-center gap-1.5 text-sm">
              <MousePointer className="w-4 h-4" />
              Thao Tác Chuột & Cảm Ứng Trong 3D
            </div>
            <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
              <li><strong>Chuột trái (kéo rê):</strong> Xoay tự do quan sát mọi góc quanh robot.</li>
              <li><strong>Chuột phải (kéo rê):</strong> Di chuyển tịnh tiến camera.</li>
              <li><strong>Cuộn chuột:</strong> Phóng to / thu nhỏ góc nhìn.</li>
              <li><strong>Nhấp chuột vào linh kiện:</strong> Tự động định vị, phát sáng và mở bảng thông số chi tiết.</li>
            </ul>
          </div>

          {/* 2. Điều khiển lái robot */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5 text-sm">
              <Keyboard className="w-4 h-4" />
              Lái Robot Tự Hành (Differential Drive)
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">W</kbd> hoặc <kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">↑</kbd>: Tiến thẳng</div>
              <div><kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">S</kbd> hoặc <kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">↓</kbd>: Lùi sau</div>
              <div><kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">A</kbd> hoặc <kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">←</kbd>: Rẽ trái</div>
              <div><kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">D</kbd> hoặc <kbd className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">→</kbd>: Rẽ phải</div>
              <div className="col-span-2 pt-1"><kbd className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 border border-amber-700">Shift</kbd>: Tăng tốc gấp 2 lần trong 3 giây (hồi chiêu 13 giây)</div>
              <div className="col-span-2"><kbd className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300 border border-cyan-700">V</kbd>: Bật / tắt góc nhìn thứ nhất từ camera của xe (POV)</div>
              <div className="col-span-2"><kbd className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 border border-indigo-700">1</kbd>: Bật / tắt ô nhập code điều khiển tự hành</div>
            </div>
            <div className="mt-2 text-slate-400 text-[11px]">
              Hai bánh xe chủ động và động cơ DC sẽ quay trực tiếp, mô phỏng đúng nguyên lý dẫn động vi sai.
            </div>
          </div>

          {/* 3. Tính năng đặc biệt */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-purple-400 mb-2 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4" />
              Chế Độ Tháo Lắp & Cảm Biến
            </div>
            <p className="text-slate-300 mb-1">
              <strong>Exploded View:</strong> Kéo thanh trượt để tách rời 3 tầng khung, tách rời Jetson Nano, LiDAR, Camera CSI, bánh xe và động cơ để kiểm tra kết cấu bên trong.
            </p>
            <p className="text-slate-300 mb-0">
              <strong>LiDAR 360° & Radar:</strong> Bật quét laser đỏ 360 độ và quan sát màn hình 2D Costmap phát hiện vật cản theo thời gian thực.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn btn-primary text-xs px-4 py-2">
            Đã Hiểu & Bắt Đầu
          </button>
        </div>
      </div>
    </div>
  );
};
