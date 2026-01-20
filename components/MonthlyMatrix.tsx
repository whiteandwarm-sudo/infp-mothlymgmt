
import React, { useState, useMemo } from 'react';
import { Project, Entry, INTENSITY_COLORS } from '../types';
import { Plus, X, Send, Trash2, Calendar, Archive } from 'lucide-react';

interface MonthlyMatrixProps {
  viewingMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  projects: Project[];
  entries: Entry[];
  onAddEntry: (entry: Omit<Entry, 'id'>) => void;
  onUpdateEntry: (id: string, updates: Partial<Entry>) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onReorderProjects: (draggedId: string, targetId: string) => void;
}

const MonthlyMatrix: React.FC<MonthlyMatrixProps> = ({ 
  viewingMonth,
  availableMonths,
  onMonthChange,
  projects, 
  entries, 
  onAddEntry, 
  onUpdateEntry, 
  onDeleteEntry,
  onUpdateProject,
  onDeleteProject,
  onReorderProjects
}) => {
  const [selectedCell, setSelectedCell] = useState<{ date: string; projectId: string; entryId?: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [inputContent, setInputContent] = useState('');
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const effectiveMonth = useMemo(() => {
    return viewingMonth === 'ALL' ? todayStr.substring(0, 7) : viewingMonth;
  }, [viewingMonth, todayStr]);

  const dates = useMemo(() => {
    const [year, month] = effectiveMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => {
      const d = i + 1;
      return `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    });
  }, [effectiveMonth]);

  const monthLabel = useMemo(() => {
    if (viewingMonth === 'ALL') return '流年';
    const [year, month] = viewingMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleString('zh-TW', { month: 'short' });
  }, [viewingMonth]);

  const getEntryForCell = (date: string, projectId: string) => {
    return entries.filter(e => e.date === date && e.projectId === projectId)[0];
  };

  const handleOpenCell = (date: string, projectId: string) => {
    const existing = getEntryForCell(date, projectId);
    if (existing) {
      setSelectedCell({ date, projectId, entryId: existing.id });
      setInputContent(existing.content);
    } else {
      setSelectedCell({ date, projectId });
      setInputContent('');
    }
  };

  const handleSaveEntry = () => {
    if (!selectedCell || !inputContent.trim()) return;
    if (selectedCell.entryId) {
      onUpdateEntry(selectedCell.entryId, { content: inputContent, intensity: 1 });
    } else {
      onAddEntry({
        date: selectedCell.date,
        projectId: selectedCell.projectId,
        content: inputContent,
        intensity: 1
      });
    }
    handleCloseEntry();
  };

  const handleDeleteEntry = () => {
    if (selectedCell?.entryId) {
      onDeleteEntry(selectedCell.entryId);
      handleCloseEntry();
    }
  };

  const handleCloseEntry = () => {
    setInputContent('');
    setSelectedCell(null);
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('projectId');
    if (draggedId !== targetId) {
      onReorderProjects(draggedId, targetId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 統一的滾動容器 - 加入 hide-scrollbar 隱藏滾動條 */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        {/* 使用表格佈局思維的容器，確保最小寬度以容納所有列 */}
        <div className="inline-block min-w-full align-middle">
          
          {/* 表頭佈局 */}
          <div className="flex sticky top-0 z-30 bg-white border-b border-[#EBE8E2]">
            {/* 左側固定日期標籤 */}
            <div 
              onClick={() => setIsMonthPickerOpen(true)}
              className="sticky left-0 z-40 w-20 h-16 flex items-center justify-center font-bold text-[#B7B7B7] border-r border-[#EBE8E2] bg-white cursor-pointer active:bg-gray-50 transition-colors select-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
            >
              {monthLabel}
            </div>
            {/* 項目標題列表 */}
            <div className="flex">
              {projects.map((p) => (
                <div 
                  key={p.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, p.id)}
                  onDoubleClick={() => setEditingProject(p)}
                  className="h-16 flex items-center px-4 font-semibold border-r border-[#EBE8E2] overflow-hidden cursor-move active:scale-95 transition-transform"
                  style={{ width: '160px', flexShrink: 0 }}
                >
                  <div className={`flex items-center w-full ${p.isFinished ? 'opacity-40' : ''}`}>
                    <span className={`truncate text-[#4A4A4A] text-sm select-none ${p.isFinished ? 'line-through' : ''}`}>{p.name}</span>
                  </div>
                </div>
              ))}
              {/* 補位，確保背景一致 */}
              <div className="flex-1 bg-white border-b border-[#EBE8E2]"></div>
            </div>
          </div>

          {/* 表體佈局 */}
          <div className="flex flex-col">
            {dates.map((date, idx) => {
              const isToday = date === todayStr;
              return (
                <div 
                  key={date} 
                  className={`flex border-b border-[#F0F0F0] hover:bg-[#F8F7F4]/30 transition-colors ${isToday ? 'bg-[#9D8189]/05' : ''}`}
                >
                  {/* 左側固定日期數字 */}
                  <div className={`sticky left-0 z-20 w-20 h-14 flex items-center justify-center text-xs font-bold border-r border-[#EBE8E2] shrink-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${isToday ? 'text-[#9D8189] bg-[#9D8189]/10' : 'text-[#B7B7B7]'}`}>
                    {idx + 1}
                  </div>
                  {/* 項目格子列表 */}
                  <div className="flex">
                    {projects.map((p) => {
                      const cellEntry = getEntryForCell(date, p.id);
                      const colorBase = p.color || '';
                      const colorClass = cellEntry 
                        ? INTENSITY_COLORS[colorBase][1]
                        : 'hover:bg-[#F8F7F4]/50';

                      return (
                        <button
                          key={p.id}
                          onClick={() => handleOpenCell(date, p.id)}
                          className={`h-14 border-r border-[#F0F0F0] transition-all relative group text-left px-3 overflow-hidden flex flex-col justify-center ${colorClass} ${p.isFinished && !cellEntry ? 'opacity-20 cursor-not-allowed' : ''}`}
                          style={{ width: '160px', flexShrink: 0 }}
                        >
                          {cellEntry && (
                            <span className="text-[10px] text-[#4A4A4A]/80 leading-tight block w-full truncate overflow-hidden whitespace-nowrap">
                              {cellEntry.content}
                            </span>
                          )}
                          {!cellEntry && !p.isFinished && (
                            <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-black/5">
                              <Plus size={14} className="text-[#4A4A4A]/40" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 彈窗部分保持不變 */}
      {selectedCell && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-6 w-[400px] shadow-2xl border border-[#EBE8E2] transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#4A4A4A]">{selectedCell.entryId ? '修補記憶' : '刻下時光'}</h3>
              <button onClick={handleCloseEntry} className="text-[#B7B7B7] hover:text-[#4A4A4A]"><X size={20}/></button>
            </div>
            <p className="text-xs font-bold text-[#B7B7B7] mb-4 tracking-wide uppercase">
              {new Date(selectedCell.date).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })} • {projects.find(p => p.id === selectedCell.projectId)?.name}
            </p>
            <textarea
              autoFocus
              className="w-full h-32 bg-[#F8F7F4] rounded-2xl p-4 outline-none resize-none placeholder:text-[#B7B7B7] text-[#4A4A4A] text-sm leading-relaxed"
              placeholder="今日種下了什麼因？哪怕只有微光..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              {selectedCell.entryId && (
                <button
                  onClick={handleDeleteEntry}
                  className="p-2 text-[#B7B7B7] hover:text-red-400 transition-colors"
                  title="抹去痕跡"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                onClick={handleSaveEntry}
                disabled={!inputContent.trim()}
                className="bg-[#4A4A4A] text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#4A4A4A]/20"
              >
                <Send size={16} /> {selectedCell.entryId ? '更新' : '塵封'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-6 w-[360px] shadow-2xl border border-[#EBE8E2] animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#4A4A4A]">念想深處</h3>
              <button onClick={() => setEditingProject(null)} className="text-[#B7B7B7] hover:text-[#4A4A4A]"><X size={20}/></button>
            </div>
            
            <div className="mb-6">
              <label className="text-[10px] font-bold text-[#B7B7B7] uppercase tracking-wider block mb-2">名相</label>
              <div className="flex gap-3 items-center">
                <input 
                  autoFocus
                  className="flex-1 bg-[#F8F7F4] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#9D8189]/20 text-[#4A4A4A] font-medium"
                  value={editingProject.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setEditingProject({...editingProject, name: newName});
                    onUpdateProject(editingProject.id, { name: newName });
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingProject(null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
               <button
                onClick={() => {
                  const newState = !editingProject.isFinished;
                  setEditingProject({...editingProject, isFinished: newState});
                  onUpdateProject(editingProject.id, { isFinished: newState });
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all border ${
                  editingProject.isFinished 
                  ? 'bg-[#D8E2DC] text-[#4A4A4A] border-[#B7C9BE]' 
                  : 'bg-white text-[#9D8189] border-[#EBE8E2]'
                }`}
              >
                <Archive size={18} /> {editingProject.isFinished ? '喚醒舊夢' : '暫且入夢'}
              </button>
              <button
                onClick={() => {
                  onDeleteProject(editingProject.id);
                  setEditingProject(null);
                }}
                className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                <Trash2 size={18} /> 告別此項
              </button>
            </div>
            
            <button
              onClick={() => setEditingProject(null)}
              className="w-full py-4 bg-[#4A4A4A] text-white rounded-2xl font-bold shadow-lg shadow-[#4A4A4A]/10"
            >
              善哉
            </button>
          </div>
        </div>
      )}

      {isMonthPickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-6 w-[320px] shadow-2xl border border-[#EBE8E2] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#4A4A4A]">溯流而上</h3>
              <button onClick={() => setIsMonthPickerOpen(false)} className="text-[#B7B7B7] hover:text-[#4A4A4A]"><X size={20}/></button>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto hide-scrollbar">
              {availableMonths.map(m => {
                const isActive = viewingMonth === m;
                let dateLabel = '';
                if (m === 'ALL') {
                  dateLabel = '恆常流年';
                } else {
                  const [year, month] = m.split('-').map(Number);
                  dateLabel = new Date(year, month - 1).toLocaleString('zh-TW', { month: 'long', year: 'numeric' });
                }

                return (
                  <button
                    key={m}
                    onClick={() => {
                      onMonthChange(m);
                      setIsMonthPickerOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 rounded-2xl font-medium transition-all flex items-center justify-between ${
                      isActive ? 'bg-[#4A4A4A] text-white shadow-lg' : 'bg-[#F8F7F4] text-[#4A4A4A] hover:bg-[#EBE8E2]'
                    }`}
                  >
                    {dateLabel}
                    {isActive && <Calendar size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyMatrix;
