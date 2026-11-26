import React, { useState } from 'react';
import { ROBOT_COMPONENTS } from '../data/componentsData';
import { ComponentId, RobotComponentInfo, SubsystemCategory } from '../types/robot';
import { ComponentPartImage } from './ComponentPartImage';
import { Eye, Info, Search, Cpu, Compass, Cog, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ComponentTableProps {
  selectedId: ComponentId | null;
  onSelectComponent: (id: ComponentId) => void;
  onOpenDetailModal: (component: RobotComponentInfo) => void;
}

export const ComponentTable: React.FC<ComponentTableProps> = ({
  selectedId,
  onSelectComponent,
  onOpenDetailModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<SubsystemCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: SubsystemCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả (9)', icon: <CheckCircle2 className="w-4 h-4 mr-1 inline" /> },
    { id: 'compute_ai', label: 'Xử lý & AI', icon: <Cpu className="w-4 h-4 mr-1 inline" /> },
    { id: 'sensors', label: 'Cảm biến (LiDAR/Cam)', icon: <Compass className="w-4 h-4 mr-1 inline" /> },
    { id: 'actuation_motion', label: 'Truyền động & Motor', icon: <Cog className="w-4 h-4 mr-1 inline" /> },
    { id: 'power_structure', label: 'Khung gầm & Không dây', icon: <ShieldCheck className="w-4 h-4 mr-1 inline" /> },
  ];

  const filtered = ROBOT_COMPONENTS.filter((item) => {
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchQuery =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.functionSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interfaces.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const getImportanceBadge = (importance: RobotComponentInfo['importance']) => {
    switch (importance) {
      case 'Bắt buộc':
        return <span className="badge bg-danger text-white px-2 py-1">Bắt buộc</span>;
      case 'Trọng yếu':
        return <span className="badge bg-primary text-white px-2 py-1">Trọng yếu</span>;
      default:
        return <span className="badge bg-secondary text-white px-2 py-1">Cần thiết</span>;
    }
  };

  return (
    <div className="card shadow-lg border-0 bg-slate-900 text-slate-100 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="card-header bg-slate-800/90 border-b border-slate-700/80 px-4 py-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              Bảng Phân Tích Linh Kiện & Chức Năng Cơ Bản
            </h5>
            <p className="text-slate-400 text-xs mb-0 mt-0.5">
              Hệ thống robot tự hành vi sai (Differential Drive AMR) tích hợp Jetson Nano & RPLIDAR
            </p>
          </div>

          {/* Search Box */}
          <div className="position-relative" style={{ minWidth: '220px' }}>
            <Search className="w-4 h-4 position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="form-control form-control-sm bg-slate-800 text-white border-slate-700 ps-5 rounded-pill text-xs"
              placeholder="Tìm kiếm linh kiện, chức năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="d-flex flex-wrap gap-1 mt-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`btn btn-sm rounded-pill text-xs px-3 py-1 transition-all ${
                filterCategory === cat.id
                  ? 'btn-primary fw-semibold shadow-sm'
                  : 'btn-outline-secondary text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bootstrap Responsive Table */}
      <div className="table-responsive">
        <table className="table table-dark table-hover table-bordered align-middle mb-0 text-xs text-slate-200">
          <thead className="table-secondary text-slate-900 text-uppercase fw-bold text-xs">
            <tr>
              <th scope="col" className="text-center" style={{ width: '50px' }}>STT</th>
              <th scope="col" style={{ width: '220px' }}>Bộ phận / Linh kiện</th>
              <th scope="col">Chức năng cơ bản</th>
              <th scope="col" style={{ width: '160px' }}>Giao tiếp / Điện áp</th>
              <th scope="col" className="text-center" style={{ width: '100px' }}>Phân loại</th>
              <th scope="col" className="text-center" style={{ width: '140px' }}>Tương tác 3D</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-400">
                  Không tìm thấy linh kiện phù hợp với từ khóa "{searchQuery}"
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const isSelected = selectedId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'table-active border-primary bg-primary/20' : ''
                    }`}
                    onClick={() => onSelectComponent(item.id)}
                  >
                    <td className="text-center font-mono text-slate-400">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <ComponentPartImage
                          region={item.imageRegion}
                          showBadge={false}
                          className="w-11 h-11 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="d-flex align-items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-circle flex-shrink-0"
                              style={{ backgroundColor: item.highlightColor }}
                            ></span>
                            <div className="fw-bold text-white text-sm">{item.name}</div>
                          </div>
                          <div className="text-slate-400 text-[11px]">{item.vietnameseName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="mb-0 text-slate-300 leading-relaxed font-normal">
                        {item.functionSummary}
                      </p>
                      <div className="mt-1 text-slate-400 text-[11px] d-flex align-items-center gap-2">
                        <span className="badge bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          ROS2: {item.rosPackage.split(',')[0]}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-slate-200 font-mono text-[11px] mb-1">
                        {item.voltage}
                      </div>
                      <span className="text-slate-400 text-[11px] line-clamp-1" title={item.interfaces}>
                        {item.interfaces.split(',').slice(0, 2).join(', ')}...
                      </span>
                    </td>
                    <td className="text-center">{getImportanceBadge(item.importance)}</td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className={`btn ${
                            isSelected ? 'btn-primary' : 'btn-outline-primary'
                          } text-xs px-2 py-1`}
                          title="Định vị & phóng to linh kiện trên mô hình 3D"
                          onClick={() => onSelectComponent(item.id)}
                        >
                          <Eye className="w-3.5 h-3.5 me-1 inline" />
                          Xem 3D
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-info text-xs px-2 py-1"
                          title="Xem thông số kỹ thuật & sơ đồ kết nối"
                          onClick={() => onOpenDetailModal(item)}
                        >
                          <Info className="w-3.5 h-3.5 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Card Footer Summary */}
      <div className="card-footer bg-slate-800/80 border-t border-slate-700/80 px-4 py-2 text-xs text-slate-400 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-3">
          <span>
            Tổng số: <strong className="text-white">9</strong> linh kiện cốt lõi
          </span>
          <span>•</span>
          <span>
            Hệ điều hành: <strong className="text-emerald-400">Ubuntu 20.04 LTS / ROS2 Foxy</strong>
          </span>
          <span>•</span>
          <span>
            Cơ chế lái: <strong className="text-cyan-400">Differential Drive (2WD + 2 Caster)</strong>
          </span>
        </div>
        <div className="text-slate-400">
          Nhấp đúp chuột hoặc chọn <kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-[10px]">Xem 3D</kbd> để bóc tách chi tiết
        </div>
      </div>
    </div>
  );
};
