
import React, { useMemo, useState } from 'react';
import { Project, Entry, Inspiration } from '../types';
import { Calendar, BarChart3, ListTodo, Lightbulb, ChevronDown, X, Search, Filter, ChevronUp } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  entries: Entry[];
  inspirations: Inspiration[];
  viewingMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  entries, 
  inspirations, 
  viewingMonth,
  availableMonths,
  onMonthChange
}) => {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'FINISHED'>('ALL');

  const monthLabelDisplay = useMemo(() => {
    if (viewingMonth === 'ALL') return '恆常流年';
    const [year, month] = viewingMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('zh-TW', { month: 'long', year: 'numeric' });
  }, [viewingMonth]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ONGOING' && !p.isFinished) || 
        (statusFilter === 'FINISHED' && p.isFinished);
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const projectStats = useMemo(() => {
    return filteredProjects.map(p => {
      const pEntries = entries.filter(e => {
        const matchesProject = e.projectId === p.id;
        const matchesMonth = viewingMonth === 'ALL' || e.date.startsWith(viewingMonth);
        return matchesProject && matchesMonth;
      }).sort((a, b) => b.date.localeCompare(a.date));

      const pInspirations = inspirations.filter(i => i.projectId === p.id && !i.isHidden)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return {
        ...p,
        monthEntries: pEntries,
        projectInspirations: pInspirations
      };
    });
  }, [filteredProjects, entries, inspirations, viewingMonth]);

  return (
    <div className="h-full flex flex-col bg-[#F8F7F4]">
      <div className="bg-white border-b border-[#EBE8E2] px-8 py-4 shrink-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B7B7B7]" />
            <input 
              type="text" 
              placeholder="於時光中尋覓..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F7F4] border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#9D8189]/20 transition-all"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <FilterButton 
              active={statusFilter === 'ALL'} 
              onClick={() => setStatusFilter('ALL')} 
              label="萬象" 
            />
            <FilterButton 
              active={statusFilter === 'ONGOING'} 
              onClick={() => setStatusFilter('ONGOING')} 
              label="行路" 
            />
            <FilterButton 
              active={statusFilter === 'FINISHED'} 
              onClick={() => setStatusFilter('FINISHED')} 
              label="入夢" 
            />
          </div>

          <button 
            onClick={() => setIsMonthPickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-2xl text-[#4A4A4A] font-bold text-sm hover:bg-[#EBE8E2] transition-all whitespace-nowrap"
          >
            <Calendar size={16} className="text-[#9D8189]" />
            <span>{viewingMonth === 'ALL' ? '流年' : monthLabelShort(viewingMonth)} 擷影</span>
            <ChevronDown size={14} className="text-[#B7B7B7]" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto hide-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-[#4A4A4A]">修行總覽</h1>
              <p className="text-xs text-[#B7B7B7]">過往塵煙與流光靈感 ({monthLabelDisplay})</p>
            </div>
          </div>

          {projectStats.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center border border-[#EBE8E2] shadow-sm">
              <div className="w-16 h-16 bg-[#F8F7F4] rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="text-[#B7B7B7]" size={32} />
              </div>
              <p className="text-[#B7B7B7] font-medium text-lg">此處尚是一片空靈。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectStats.map(s => (
                <ProjectReviewCard key={s.id} stats={s} viewingMonth={viewingMonth} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isMonthPickerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-[340px] shadow-2xl border border-[#EBE8E2] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#4A4A4A]">切換時光尺度</h3>
              <button onClick={() => setIsMonthPickerOpen(false)} className="text-[#B7B7B7] hover:text-[#4A4A4A] transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 hide-scrollbar">
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
                    className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${
                      isActive ? 'bg-[#9D8189] text-white shadow-lg' : 'bg-[#F8F7F4] text-[#4A4A4A] hover:bg-[#EBE8E2]'
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

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
      active ? 'bg-[#4A4A4A] text-white shadow-md' : 'bg-white text-[#4A4A4A] border border-[#EBE8E2] hover:bg-[#F8F7F4]'
    }`}
  >
    {label}
  </button>
);

const monthLabelShort = (monthStr: string) => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleString('zh-TW', { month: 'short' });
};

const ProjectReviewCard: React.FC<{ stats: any, viewingMonth: string }> = ({ stats: s, viewingMonth }) => {
  const [expandEntries, setExpandEntries] = useState(false);
  const [expandInspirations, setExpandInspirations] = useState(false);

  const visibleEntries = expandEntries ? s.monthEntries : s.monthEntries.slice(0, 3);
  const visibleInspirations = expandInspirations ? s.projectInspirations : s.projectInspirations.slice(0, 3);

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-[#EBE8E2] hover:shadow-md transition-shadow relative flex flex-col min-h-[450px] ${s.isFinished ? 'bg-[#F8F7F4]/40' : ''}`}>
      <div className="mb-6 flex justify-between items-start">
        <h3 className={`text-xl font-bold text-[#4A4A4A] truncate max-w-[70%] ${s.isFinished ? 'line-through text-[#B7B7B7]' : ''}`}>
          {s.name}
        </h3>
        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${s.isFinished ? 'bg-[#D8E2DC] text-[#4A4A4A]' : 'bg-[#9D8189]/10 text-[#9D8189]'}`}>
          {s.isFinished ? '入夢時分' : '行路中'}
        </span>
      </div>

      <div className="flex-1 space-y-6">
        {/* Progress Entries */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo size={14} className="text-[#B7B7B7]" />
              <h4 className="text-[10px] font-bold text-[#B7B7B7] uppercase tracking-widest">
                {viewingMonth === 'ALL' ? '修行軌跡' : '當月擷影'}
              </h4>
            </div>
            {s.monthEntries.length > 3 && (
              <button 
                onClick={() => setExpandEntries(!expandEntries)}
                className="text-[9px] font-bold text-[#9D8189] hover:underline"
              >
                {expandEntries ? '收攏' : `展閱 (${s.monthEntries.length})`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {visibleEntries.length > 0 ? (
              visibleEntries.map((e: any) => (
                <div key={e.id} className="bg-[#F8F7F4]/50 p-3 rounded-xl border border-[#F0F0F0]">
                  <p className="text-xs text-[#4A4A4A] leading-relaxed mb-1 font-medium">{e.content}</p>
                  <span className="text-[9px] text-[#B7B7B7] font-bold uppercase">
                    {viewingMonth === 'ALL' ? e.date.replace(/-/g, '/') : e.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-[#B7B7B7] italic py-4 text-center border border-dashed border-[#F0F0F0] rounded-xl">
                {viewingMonth === 'ALL' ? '尚無修行印記' : '此月尚未留痕'}
              </p>
            )}
          </div>
        </section>

        {/* Associated Inspirations */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-[#B7B7B7]" />
              <h4 className="text-[10px] font-bold text-[#B7B7B7] uppercase tracking-widest">擷光靈感</h4>
            </div>
            {s.projectInspirations.length > 3 && (
              <button 
                onClick={() => setExpandInspirations(!expandInspirations)}
                className="text-[9px] font-bold text-[#9D8189] hover:underline"
              >
                {expandInspirations ? '收攏' : `展閱 (${s.projectInspirations.length})`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {visibleInspirations.length > 0 ? (
              visibleInspirations.map((insp: any) => (
                <InspirationBriefItem key={insp.id} insp={insp} />
              ))
            ) : (
              <p className="text-[10px] text-[#B7B7B7] italic py-4 text-center border border-dashed border-[#F0F0F0] rounded-xl">靈光尚未乍現</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const InspirationBriefItem: React.FC<{ insp: Inspiration }> = ({ insp }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = insp.content.length > 60 || insp.content.includes('\n');

  return (
    <div className="bg-white p-3 rounded-xl border border-[#EBE8E2] hover:border-[#9D8189]/30 transition-colors shadow-sm">
      <p className={`text-[11px] text-[#4A4A4A] leading-relaxed whitespace-pre-wrap ${!isExpanded && isLong ? 'line-clamp-2' : ''}`}>
        {insp.content}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-[9px] font-bold text-[#9D8189] flex items-center gap-0.5"
        >
          {isExpanded ? <><ChevronUp size={10}/> 收攏</> : <><ChevronDown size={10}/> 展閱</>}
        </button>
      )}
      <p className="text-[8px] text-[#B7B7B7] mt-1.5">{new Date(insp.createdAt).toLocaleDateString('zh-TW')}</p>
    </div>
  );
};

export default Dashboard;
