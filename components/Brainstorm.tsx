
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Inspiration } from '../types';
import { Send, Hash, Search, Pencil, Trash2, X, AlertCircle, ChevronDown, ChevronUp, Filter, EyeOff, Eye } from 'lucide-react';

interface BrainstormProps {
  projects: Project[];
  inspirations: Inspiration[];
  onAddInspiration: (content: string, projectId?: string) => void;
  onUpdateInspiration: (id: string, updates: Partial<Inspiration>) => void;
  onDeleteInspiration: (id: string) => void;
}

const Brainstorm: React.FC<BrainstormProps> = ({ projects, inspirations, onAddInspiration, onUpdateInspiration, onDeleteInspiration }) => {
  const [content, setContent] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProjectId, setFilterProjectId] = useState<string | 'ALL' | 'UNLINKED' | 'HIDDEN'>('ALL');
  
  const [editingInspiration, setEditingInspiration] = useState<Inspiration | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editProjectId, setEditProjectId] = useState<string | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddInspiration(content, selectedProjectId);
    setContent('');
    setSelectedProjectId(undefined);
  };

  const filteredInspirations = useMemo(() => {
    return inspirations.filter(insp => {
      const matchesSearch = insp.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterProjectId === 'HIDDEN') {
        return matchesSearch && insp.isHidden;
      }
      
      const matchesProject = 
        filterProjectId === 'ALL' || 
        (filterProjectId === 'UNLINKED' && !insp.projectId) || 
        (insp.projectId === filterProjectId);
        
      return matchesSearch && matchesProject && !insp.isHidden;
    });
  }, [inspirations, searchQuery, filterProjectId]);

  const handleEditClick = (insp: Inspiration) => {
    setEditingInspiration(insp);
    setEditContent(insp.content);
    setEditProjectId(insp.projectId);
    setSwipedId(null);
  };

  const handleUpdate = () => {
    if (!editingInspiration || !editContent.trim()) return;
    onUpdateInspiration(editingInspiration.id, {
      content: editContent,
      projectId: editProjectId
    });
    setEditingInspiration(null);
  };

  const toggleHide = (id: string, currentHidden?: boolean) => {
    onUpdateInspiration(id, { isHidden: !currentHidden });
    setSwipedId(null);
  };

  const confirmDelete = (id: string) => {
    setConfirmDeleteId(id);
    setSwipedId(null);
  };

  const executeDelete = () => {
    if (confirmDeleteId) {
      onDeleteInspiration(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#F8F7F4] overflow-hidden">
      {/* 左側：輸入表單 - 移動端優化佈局 */}
      <div className="flex-[0.8] md:flex-1 min-h-0 md:w-1/2 p-4 md:p-12 flex flex-col overflow-hidden">
        <header className="mb-4 md:mb-10 shrink-0">
          <h1 className="text-xl md:text-3xl font-bold text-[#4A4A4A]">擷光捕捉</h1>
          <p className="text-[10px] md:text-sm text-[#B7B7B7] tracking-tight">靈光轉瞬即逝，於此處溫柔珍藏。</p>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col gap-3 md:gap-6 overflow-hidden">
          <textarea
            className="flex-1 bg-white rounded-[2rem] md:rounded-3xl p-5 md:p-8 shadow-sm border border-[#EBE8E2] outline-none focus:ring-2 focus:ring-[#9D8189]/20 text-sm md:text-lg resize-none placeholder:text-[#EBE8E2] transition-all"
            placeholder="捕捉此刻的流光溢彩..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="bg-white rounded-2xl p-3 md:p-4 border border-[#EBE8E2] flex flex-col shrink-0 overflow-hidden">
            <span className="text-[9px] md:text-xs font-bold text-[#B7B7B7] uppercase tracking-wider mb-2 ml-1">歸於何處</span>
            <div className="flex flex-wrap gap-1.5 md:gap-2 max-h-20 md:max-h-24 overflow-y-auto hide-scrollbar">
              {projects.filter(p => !p.isFinished).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(selectedProjectId === p.id ? undefined : p.id)}
                  className={`px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedProjectId === p.id 
                    ? `${p.color} text-white shadow-sm` 
                    : 'bg-[#F8F7F4] text-[#4A4A4A] hover:bg-[#EBE8E2]'
                  }`}
                >
                  <Hash size={10} className="md:w-[14px] md:h-[14px]" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full py-3.5 md:py-5 bg-[#4A4A4A] text-white rounded-2xl font-bold text-sm md:text-lg shadow-xl shadow-[#4A4A4A]/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 shrink-0"
          >
            存入靈光池
          </button>
        </form>
      </div>

      {/* 右側：靈感列表 - 移動端支持平滑滾動與適配佈局 */}
      <div className="flex-1 min-h-0 md:w-1/2 p-4 md:p-12 border-t md:border-t-0 md:border-l border-[#EBE8E2] flex flex-col overflow-hidden bg-white/30 md:bg-transparent">
        <div className="shrink-0 mb-4 md:mb-8 space-y-3 md:space-y-6">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-base md:text-xl font-bold text-[#4A4A4A] whitespace-nowrap">流光拾遺</h2>
            <div className="relative group flex-1 max-w-[180px] md:max-w-[240px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B7B7B7] transition-colors" />
              <input 
                type="text" 
                placeholder="尋覓..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white md:bg-white border border-[#EBE8E2] rounded-xl pl-8 pr-3 py-1.5 text-[10px] md:text-sm outline-none focus:ring-2 focus:ring-[#9D8189]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto hide-scrollbar pb-1">
            <Filter size={12} className="text-[#B7B7B7] shrink-0 mr-1" />
            <FilterTag 
              label="萬象" 
              active={filterProjectId === 'ALL'} 
              onClick={() => setFilterProjectId('ALL')} 
              activeClass="bg-[#4A4A4A] text-white"
            />
            <FilterTag 
              label="通用池" 
              active={filterProjectId === 'UNLINKED'} 
              onClick={() => setFilterProjectId('UNLINKED')} 
              activeClass="bg-[#9D8189] text-white"
            />
            <FilterTag 
              label="沉潛之夢" 
              active={filterProjectId === 'HIDDEN'} 
              onClick={() => setFilterProjectId('HIDDEN')} 
              activeClass="bg-[#D8E2DC] text-[#4A4A4A]"
            />
            {projects.map(p => (
              <FilterTag 
                key={p.id}
                label={p.name} 
                active={filterProjectId === p.id} 
                onClick={() => setFilterProjectId(p.id)} 
                activeClass={`${p.color} text-white`}
                icon={<Hash size={10} />}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-1 space-y-3 md:space-y-6 overflow-y-auto hide-scrollbar px-0.5 pb-4">
          {filteredInspirations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 opacity-30">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#EBE8E2] flex items-center justify-center mb-4">
                <Send size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-xs md:text-sm">{searchQuery || filterProjectId !== 'ALL' ? '未能在影中尋得。' : '此處尚待點亮。'}</p>
            </div>
          ) : (
            filteredInspirations.map(insp => (
              <SwipeableInspirationItem 
                key={insp.id}
                insp={insp}
                projects={projects}
                isSwiped={swipedId === insp.id}
                onSwipe={(swiped) => setSwipedId(swiped ? insp.id : null)}
                onEdit={() => handleEditClick(insp)}
                onDelete={() => confirmDelete(insp.id)}
                onToggleHide={() => toggleHide(insp.id, insp.isHidden)}
              />
            ))
          )}
        </div>
      </div>

      {/* 編輯模態框 - 移動端全屏自適應 */}
      {editingInspiration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[4px] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-[400px] shadow-2xl border border-[#EBE8E2] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-[#4A4A4A]">修正流光</h3>
              <button onClick={() => setEditingInspiration(null)} className="p-1 text-[#B7B7B7] hover:text-[#4A4A4A] transition-colors"><X size={20}/></button>
            </div>
            
            <textarea
              autoFocus
              className="w-full h-44 bg-[#F8F7F4] rounded-2xl p-4 outline-none resize-none placeholder:text-[#B7B7B7] text-[#4A4A4A] text-sm leading-relaxed mb-5"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />

            <div className="mb-6">
              <span className="block text-[10px] font-bold text-[#B7B7B7] uppercase tracking-wider mb-2.5 ml-1">重塑歸處</span>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto hide-scrollbar">
                {projects.filter(p => !p.isFinished).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setEditProjectId(editProjectId === p.id ? undefined : p.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1.5 ${
                      editProjectId === p.id 
                      ? `${p.color} text-white shadow-sm` 
                      : 'bg-[#F8F7F4] text-[#4A4A4A] hover:bg-[#EBE8E2]'
                    }`}
                  >
                    <Hash size={10} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingInspiration(null)}
                className="flex-1 py-3.5 bg-[#F8F7F4] text-[#4A4A4A] rounded-xl font-bold text-xs hover:bg-[#EBE8E2] transition-colors"
              >
                罷了
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 py-3.5 bg-[#4A4A4A] text-white rounded-xl font-bold text-xs shadow-lg shadow-[#4A4A4A]/10 hover:bg-[#333] transition-colors"
              >
                重新封存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 - 移動端優化 */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[4px] p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-[320px] shadow-2xl border border-[#EBE8E2] text-center animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">抹除確認</h3>
            <p className="text-xs text-[#B7B7B7] mb-8 leading-relaxed px-2">這道流光將永久消逝在黑暗中，確定要執行嗎？</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 bg-[#F8F7F4] text-[#4A4A4A] rounded-xl font-bold text-xs transition-all hover:bg-[#EBE8E2]"
              >
                留步
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-200 transition-all hover:bg-red-500"
              >
                抹除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterTagProps {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClass: string;
  icon?: React.ReactNode;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, active, onClick, activeClass, icon }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[9px] md:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
      active ? `${activeClass} shadow-md` : 'bg-white text-[#4A4A4A] border border-[#EBE8E2] hover:bg-gray-50'
    }`}
  >
    {icon && <span className={active ? 'text-white' : 'text-[#B7B7B7]'}>{icon}</span>}
    {label}
  </button>
);

interface SwipeableInspirationItemProps {
  insp: Inspiration;
  projects: Project[];
  isSwiped: boolean;
  onSwipe: (swiped: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHide: () => void;
}

const SwipeableInspirationItem: React.FC<SwipeableInspirationItemProps> = ({ 
  insp, projects, isSwiped, onSwipe, onEdit, onDelete, onToggleHide
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  
  const MAX_REVEAL = 180; 

  const isLongText = insp.content.length > 80 || insp.content.split('\n').length > 3;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    isDragging.current = true;
    if (containerRef.current) {
        containerRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startX.current - x;
    
    if (Math.abs(diff) > 15) {
      if (diff > 0) {
        currentX.current = Math.min(diff, MAX_REVEAL);
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(-${currentX.current}px)`;
        }
      } else if (diff < 0 && isSwiped) {
        currentX.current = Math.max(MAX_REVEAL - Math.abs(diff), 0);
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(-${currentX.current}px)`;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (currentX.current > 70) {
      onSwipe(true);
      currentX.current = MAX_REVEAL;
    } else {
      onSwipe(false);
      currentX.current = 0;
    }

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
      containerRef.current.style.transform = `translateX(-${currentX.current}px)`;
    }
  };

  useEffect(() => {
    if (!isSwiped && containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
      containerRef.current.style.transform = `translateX(0px)`;
      currentX.current = 0;
    } else if (isSwiped && containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
      containerRef.current.style.transform = `translateX(-${MAX_REVEAL}px)`;
      currentX.current = MAX_REVEAL;
    }
  }, [isSwiped]);

  const linkedProject = projects.find(p => p.id === insp.projectId);

  return (
    <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shrink-0">
      {/* 操作按鈕層：底層容器背景應與背景色一致，且同樣具有圓角以防止溢出視覺錯誤 */}
      <div className="absolute inset-0 flex justify-end bg-[#F8F7F4] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
        {/* 使用相同的 flex item 佈局，但確保第一個 revealed 的按鈕與內容無縫銜接 */}
        <ActionButton icon={<Pencil size={16} />} label="修正" onClick={onEdit} color="bg-[#EBE8E2] text-[#4A4A4A]" />
        <ActionButton 
          icon={insp.isHidden ? <Eye size={16} /> : <EyeOff size={16} />} 
          label={insp.isHidden ? "重現" : "沉潛"} 
          onClick={onToggleHide} 
          color="bg-[#D8E2DC] text-[#4A4A4A]" 
        />
        <ActionButton 
            icon={<Trash2 size={16} />} 
            label="抹除" 
            onClick={onDelete} 
            color="bg-red-400 text-white" 
            isLast 
        />
      </div>

      {/* 氣泡內容卡片 */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className={`relative bg-white p-4 md:p-6 cursor-grab active:cursor-grabbing transition-transform z-10 border border-[#EBE8E2] ${insp.isHidden ? 'opacity-50' : ''}`}
        style={{ borderRadius: 'inherit' }}
      >
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-[#4A4A4A] text-[11px] md:text-sm leading-relaxed whitespace-pre-wrap transition-all ${!isExpanded ? 'line-clamp-3' : ''}`}>
                {insp.content}
              </p>
              {isLongText && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-2 text-[9px] md:text-[10px] font-bold text-[#9D8189] flex items-center gap-1 hover:text-[#4A4A4A] transition-colors"
                >
                  {isExpanded ? (
                    <><ChevronUp size={10}/> 收攏</>
                  ) : (
                    <><ChevronDown size={10}/> 展閱全文</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#F8F7F4] pt-2 md:pt-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              {linkedProject ? (
                <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[9px] font-bold text-white uppercase tracking-tighter ${linkedProject.color}`}>
                  {linkedProject.name}
                </span>
              ) : (
                <span className="text-[7px] md:text-[9px] font-bold text-[#B7B7B7] uppercase tracking-widest px-1.5 py-0.5 md:py-1 bg-[#F8F7F4] rounded-full">通用池</span>
              )}
              {insp.isHidden && <span className="text-[7px] md:text-[9px] font-bold text-[#9D8189] italic">沉潛中</span>}
            </div>
            <span className="text-[7px] md:text-[9px] text-[#B7B7B7] font-medium">{new Date(insp.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void, 
    color: string, 
    isLast?: boolean 
}> = ({ icon, label, onClick, color, isLast }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-[60px] h-full flex flex-col items-center justify-center gap-0.5 transition-opacity hover:opacity-90 active:scale-95 ${color} ${isLast ? '' : ''}`}
  >
    {icon}
    <span className="text-[8px] font-bold">{label}</span>
  </button>
);

export default Brainstorm;
