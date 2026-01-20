
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutGrid, Lightbulb, BarChart3, Plus, Settings2, X, Trash2, FolderPlus, Rabbit, Download, Upload } from 'lucide-react';
import { ViewType, Project, Entry, Inspiration, MORANDI_PALETTE } from './types';
import MonthlyMatrix from './components/MonthlyMatrix';
import Dashboard from './components/Dashboard';
import Brainstorm from './components/Brainstorm';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('MATRIX');
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [viewingMonth, setViewingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // 初始化時加載數據
  useEffect(() => {
    const savedProjects = localStorage.getItem('mm_projects');
    const savedEntries = localStorage.getItem('mm_entries');
    const savedInspirations = localStorage.getItem('mm_inspirations');

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      const defaults: Project[] = [
        { id: '1', name: '文字修行', color: MORANDI_PALETTE[0], slot: 0, isFinished: false },
        { id: '2', name: '身體律動', color: MORANDI_PALETTE[1], slot: 1, isFinished: false },
        { id: '3', name: '美學構築', color: MORANDI_PALETTE[2], slot: 2, isFinished: false },
      ];
      setProjects(defaults);
      localStorage.setItem('mm_projects', JSON.stringify(defaults));
    }

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedInspirations) setInspirations(JSON.parse(savedInspirations));
  }, []);

  // 數據變動時自動保存
  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('mm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('mm_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('mm_inspirations', JSON.stringify(inspirations));
  }, [inspirations]);

  // 導出 JSON 文件
  const exportData = () => {
    const data = {
      projects,
      entries,
      inspirations,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `拾光長箋_備份_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 導入 JSON 文件
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.projects && data.entries && data.inspirations) {
          if (window.confirm('導入備份將會覆蓋當前數據，確定要繼續嗎？')) {
            setProjects(data.projects);
            setEntries(data.entries);
            setInspirations(data.inspirations);
            alert('時光已重塑，數據恢復成功。');
          }
        } else {
          alert('文件格式似乎不正確，請確保這是由本應用導出的備份文件。');
        }
      } catch (err) {
        alert('解析文件失敗。');
      }
    };
    reader.readAsText(file);
    // 重置 input 以便下次選擇同一文件
    event.target.value = '';
  };

  const addEntry = (entry: Omit<Entry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setEntries(prev => [...prev, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<Entry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addInspiration = (content: string, projectId?: string) => {
    const newInsp: Inspiration = {
      id: crypto.randomUUID(),
      content,
      projectId,
      createdAt: new Date().toISOString(),
      isHidden: false
    };
    setInspirations(prev => [newInsp, ...prev]);
  };

  const updateInspiration = (id: string, updates: Partial<Inspiration>) => {
    setInspirations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInspiration = (id: string) => {
    setInspirations(prev => prev.filter(i => i.id !== id));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    if (window.confirm('確定要告別這個項目嗎？過往的塵埃亦將隨之散去。')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const reorderProjects = (draggedId: string, targetId: string) => {
    setProjects(prev => {
      const newProjects = [...prev];
      const draggedIndex = newProjects.findIndex(p => p.id === draggedId);
      const targetIndex = newProjects.findIndex(p => p.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const [removed] = newProjects.splice(draggedIndex, 1);
      newProjects.splice(targetIndex, 0, removed);
      return newProjects.map((p, i) => ({ ...p, slot: i }));
    });
  };

  const addNewProject = (name: string = '新啟程') => {
    const activeCount = projects.filter(p => !p.isFinished).length;
    if (activeCount >= 9) {
      alert("生命有限，九種可能已是極致。請先圓滿舊的章節。");
      return;
    }
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      color: MORANDI_PALETTE[projects.length % MORANDI_PALETTE.length],
      slot: projects.length,
      isFinished: false
    };
    setProjects(prev => [...prev, newProject]);
  };

  const visibleProjects = useMemo(() => {
    return projects.filter(p => {
      if (viewingMonth === 'ALL') return true;
      const hasEntriesThisMonth = entries.some(e => e.projectId === p.id && e.date.startsWith(viewingMonth));
      return !p.isFinished || hasEntriesThisMonth;
    });
  }, [projects, entries, viewingMonth]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const now = new Date();
    months.add(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
    
    entries.forEach(e => {
      const m = e.date.substring(0, 7);
      months.add(m);
    });
    
    const sorted = Array.from(months).sort().reverse();
    return ['ALL', ...sorted];
  }, [entries]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7F4] select-none">
      <nav className="w-20 bg-white border-r border-[#EBE8E2] flex flex-col items-center py-8 gap-10">
        <div className="w-12 h-12 flex items-center justify-center text-[#9D8189]">
          <Rabbit size={32} strokeWidth={1.5} />
        </div>
        
        <div className="flex flex-col gap-6">
          <NavButton 
            active={activeView === 'MATRIX'} 
            onClick={() => setActiveView('MATRIX')}
            icon={<LayoutGrid size={22} />} 
          />
          <NavButton 
            active={activeView === 'BRAINSTORM'} 
            onClick={() => setActiveView('BRAINSTORM')}
            icon={<Lightbulb size={22} />} 
          />
          <NavButton 
            active={activeView === 'DASHBOARD'} 
            onClick={() => setActiveView('DASHBOARD')}
            icon={<BarChart3 size={22} />} 
          />
        </div>

        <div className="mt-auto">
          <NavButton 
            active={isProjectSettingsOpen}
            onClick={() => setIsProjectSettingsOpen(!isProjectSettingsOpen)}
            icon={<Settings2 size={22} />} 
          />
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {activeView === 'MATRIX' && (
          <MonthlyMatrix 
            viewingMonth={viewingMonth}
            availableMonths={availableMonths}
            onMonthChange={setViewingMonth}
            projects={visibleProjects} 
            entries={entries} 
            onAddEntry={addEntry} 
            onUpdateEntry={updateEntry}
            onDeleteEntry={deleteEntry}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onReorderProjects={reorderProjects}
          />
        )}
        {activeView === 'DASHBOARD' && (
          <Dashboard 
            projects={projects} 
            entries={entries} 
            inspirations={inspirations} 
            viewingMonth={viewingMonth}
            availableMonths={availableMonths}
            onMonthChange={setViewingMonth}
          />
        )}
        {activeView === 'BRAINSTORM' && (
          <Brainstorm 
            projects={projects} 
            inspirations={inspirations} 
            onAddInspiration={addInspiration}
            onUpdateInspiration={updateInspiration}
            onDeleteInspiration={deleteInspiration}
          />
        )}

        {/* 懸浮按鈕僅在月度進度表（MATRIX）中顯示 */}
        {activeView === 'MATRIX' && (
          <div className="absolute bottom-8 right-8 flex flex-col gap-4">
            <button 
              onClick={() => addNewProject()}
              title="播下種子"
              className="w-14 h-14 bg-[#D8E2DC] text-[#4A4A4A] rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all border border-[#B7C9BE]"
            >
              <FolderPlus size={26} />
            </button>
            <button 
              onClick={() => {
                setActiveView('BRAINSTORM');
              }}
              title="捕捉流光"
              className="w-14 h-14 bg-[#4A4A4A] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={28} />
            </button>
          </div>
        )}
      </main>

      {isProjectSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-[500px] shadow-2xl border border-[#EBE8E2] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#4A4A4A]">時光檔案</h2>
                <p className="text-[10px] text-[#B7B7B7] uppercase tracking-wider font-bold">Data & Projects Management</p>
              </div>
              <button onClick={() => setIsProjectSettingsOpen(false)} className="text-[#B7B7B7] hover:text-[#4A4A4A] transition-colors"><X /></button>
            </div>

            {/* 數據管理按鈕區 */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={exportData}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#F8F7F4] text-[#4A4A4A] rounded-2xl font-bold text-xs hover:bg-[#EBE8E2] transition-all border border-[#EBE8E2]"
              >
                <Download size={16} /> 備份至雲端 (JSON)
              </button>
              <button 
                onClick={handleImportClick}
                className="flex items-center justify-center gap-2 py-3.5 bg-white text-[#4A4A4A] rounded-2xl font-bold text-xs hover:bg-[#F8F7F4] transition-all border border-[#EBE8E2]"
              >
                <Upload size={16} /> 恢復存檔 (JSON)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={importData} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 hide-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-[#B7B7B7] uppercase tracking-widest">所有項目</h3>
                <span className="text-[9px] text-[#B7B7B7] font-medium">{projects.length} / 9 Slots</span>
              </div>
              
              {projects.length === 0 && <p className="text-center py-10 text-[#B7B7B7] italic">尚無心向之所。</p>}
              {projects.map(p => (
                <div key={p.id} className={`flex gap-4 items-center p-4 rounded-2xl transition-all ${p.isFinished ? 'bg-[#F8F7F4] opacity-50' : 'bg-white border border-[#EBE8E2] shadow-sm'}`}>
                  <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${p.isFinished ? 'line-through text-[#B7B7B7]' : 'text-[#4A4A4A]'}`}>{p.name}</p>
                    <p className="text-[9px] text-[#B7B7B7] font-medium uppercase tracking-tighter">{p.isFinished ? '已入夢' : '行路中'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateProject(p.id, { isFinished: !p.isFinished })}
                      className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                        p.isFinished 
                        ? 'border-[#B7C9BE] bg-[#D8E2DC] text-[#4A4A4A]' 
                        : 'border-[#EBE8E2] text-[#B7B7B7] hover:border-[#4A4A4A] hover:text-[#4A4A4A]'
                      }`}
                    >
                      {p.isFinished ? '喚醒' : '休眠'}
                    </button>
                    <button 
                      onClick={() => deleteProject(p.id)}
                      className="p-2 text-[#B7B7B7] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsProjectSettingsOpen(false)}
              className="w-full py-4 bg-[#4A4A4A] text-white rounded-2xl font-bold mt-8 shadow-lg shadow-[#4A4A4A]/20"
            >
              完成設定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
      active ? 'bg-[#F8F7F4] text-[#4A4A4A]' : 'text-[#B7B7B7] hover:bg-[#F8F7F4]'
    }`}
  >
    {icon}
  </button>
);

export default App;
