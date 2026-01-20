
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

  // 1. 初始化加載
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
    }

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedInspirations) setInspirations(JSON.parse(savedInspirations));
  }, []);

  // 2. 自動保存
  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('mm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('mm_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('mm_inspirations', JSON.stringify(inspirations));
  }, [inspirations]);

  // 3. 數據備份與恢復
  const exportData = () => {
    const data = {
      projects,
      entries,
      inspirations,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `拾光長箋_備份_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.projects && json.entries && json.inspirations) {
          if (confirm('導入將覆蓋現有所有數據，確定嗎？')) {
            setProjects(json.projects);
            setEntries(json.entries);
            setInspirations(json.inspirations);
            alert('數據恢復成功');
          }
        }
      } catch (err) {
        alert('無效的備份文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    if (confirm('確定刪除項目？相關印記將轉為未歸類。')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const reorderProjects = (draggedId: string, targetId: string) => {
    setProjects(prev => {
      const newProjects = [...prev];
      const fromIdx = newProjects.findIndex(p => p.id === draggedId);
      const toIdx = newProjects.findIndex(p => p.id === targetId);
      const [removed] = newProjects.splice(fromIdx, 1);
      newProjects.splice(toIdx, 0, removed);
      return newProjects.map((p, i) => ({ ...p, slot: i }));
    });
  };

  const addNewProject = () => {
    if (projects.filter(p => !p.isFinished).length >= 9) {
      alert("生命有限，九種可能已是極致。");
      return;
    }
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '新修行',
      color: MORANDI_PALETTE[projects.length % MORANDI_PALETTE.length],
      slot: projects.length,
      isFinished: false
    };
    setProjects(prev => [...prev, newProject]);
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const now = new Date();
    months.add(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
    entries.forEach(e => months.add(e.date.substring(0, 7)));
    return ['ALL', ...Array.from(months).sort().reverse()];
  }, [entries]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7F4] select-none">
      <nav className="w-20 bg-white border-r border-[#EBE8E2] flex flex-col items-center py-8 gap-10 shrink-0">
        <div className="w-12 h-12 flex items-center justify-center text-[#9D8189]">
          <Rabbit size={32} strokeWidth={1.5} />
        </div>
        
        <div className="flex flex-col gap-6">
          <NavButton active={activeView === 'MATRIX'} onClick={() => setActiveView('MATRIX')} icon={<LayoutGrid size={22} />} />
          <NavButton active={activeView === 'BRAINSTORM'} onClick={() => setActiveView('BRAINSTORM')} icon={<Lightbulb size={22} />} />
          <NavButton active={activeView === 'DASHBOARD'} onClick={() => setActiveView('DASHBOARD')} icon={<BarChart3 size={22} />} />
        </div>

        <div className="mt-auto">
          <NavButton active={isProjectSettingsOpen} onClick={() => setIsProjectSettingsOpen(true)} icon={<Settings2 size={22} />} />
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {activeView === 'MATRIX' && (
          <MonthlyMatrix 
            viewingMonth={viewingMonth} availableMonths={availableMonths} onMonthChange={setViewingMonth}
            projects={projects.filter(p => !p.isFinished)} entries={entries} 
            onAddEntry={addEntry} onUpdateEntry={updateEntry} onDeleteEntry={deleteEntry}
            onUpdateProject={updateProject} onDeleteProject={deleteProject} onReorderProjects={reorderProjects}
          />
        )}
        {activeView === 'DASHBOARD' && (
          <Dashboard projects={projects} entries={entries} inspirations={inspirations} viewingMonth={viewingMonth} availableMonths={availableMonths} onMonthChange={setViewingMonth} />
        )}
        {activeView === 'BRAINSTORM' && (
          <Brainstorm projects={projects} inspirations={inspirations} onAddInspiration={addInspiration} onUpdateInspiration={updateInspiration} onDeleteInspiration={deleteInspiration} />
        )}

        {/* 懸浮按鈕 */}
        {activeView === 'MATRIX' && (
          <div className="absolute bottom-10 right-10 flex flex-col gap-4">
            <button onClick={addNewProject} className="w-14 h-14 bg-[#D8E2DC] text-[#4A4A4A] rounded-full flex items-center justify-center shadow-xl border border-[#B7C9BE]"><FolderPlus size={26}/></button>
            <button onClick={() => setActiveView('BRAINSTORM')} className="w-14 h-14 bg-[#4A4A4A] text-white rounded-full flex items-center justify-center shadow-xl"><Plus size={28}/></button>
          </div>
        )}
      </main>

      {/* 設置彈窗：集成備份功能 */}
      {isProjectSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-[450px] shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#4A4A4A]">時光檔案</h2>
              <button onClick={() => setIsProjectSettingsOpen(false)} className="text-[#B7B7B7] hover:text-[#4A4A4A]"><X /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button onClick={exportData} className="flex items-center justify-center gap-2 py-3 bg-[#F8F7F4] rounded-2xl font-bold text-sm border border-[#EBE8E2]">
                <Download size={18}/> 導出備份
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-[#F8F7F4] rounded-2xl font-bold text-sm border border-[#EBE8E2]">
                <Upload size={18}/> 導入備份
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} accept=".json" />
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar">
              <h3 className="text-[10px] font-bold text-[#B7B7B7] uppercase tracking-widest mb-2">已入夢項目 ({projects.filter(p=>p.isFinished).length})</h3>
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-white border border-[#EBE8E2] rounded-2xl shadow-sm">
                   <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                   <div className="flex-1 font-bold text-sm">{p.name}</div>
                   <button onClick={() => updateProject(p.id, { isFinished: !p.isFinished })} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#EBE8E2]">
                    {p.isFinished ? '喚醒' : '封印'}
                   </button>
                   <button onClick={() => deleteProject(p.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: any }) => (
  <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-[#F8F7F4] text-[#4A4A4A] shadow-inner' : 'text-[#B7B7B7] hover:bg-[#F8F7F4]'}`}>
    {icon}
  </button>
);

export default App;
