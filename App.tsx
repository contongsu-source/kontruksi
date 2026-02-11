import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  HardHat, 
  Package, 
  BrainCircuit, 
  Building2, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  ChevronRight,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Project, Material, ViewState, ProjectStatus } from './types';
import { INITIAL_PROJECTS, INITIAL_MATERIALS } from './constants';
import { StatsCard } from './components/StatsCard';
import { ProjectModal } from './components/ProjectModal';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Derived Statistics
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
    const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);
    const activeProjects = projects.filter(p => p.status === ProjectStatus.ONGOING).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const pendingProjects = projects.filter(p => p.status === ProjectStatus.PLANNING).length;
    
    return { totalBudget, totalSpent, activeProjects, completedProjects, pendingProjects };
  }, [projects]);

  const chartData = useMemo(() => {
    return projects.map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      Budget: p.budget,
      Terpakai: p.spent
    }));
  }, [projects]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const statusData = useMemo(() => {
    const counts = {
      [ProjectStatus.ONGOING]: 0,
      [ProjectStatus.COMPLETED]: 0,
      [ProjectStatus.PLANNING]: 0,
      [ProjectStatus.ON_HOLD]: 0,
    };
    projects.forEach(p => counts[p.status]++);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key as ProjectStatus] }));
  }, [projects]);

  // CRUD Handlers
  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    } else {
      setProjects(prev => [...prev, project]);
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data proyek ini?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  // Helper to render currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('Laporan Data Proyek - Konstruksi Pro Master', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);

    // Table Data
    const tableColumn = ["Nama Proyek", "Klien", "Lokasi", "Anggaran", "Terpakai", "Progress", "Status"];
    const tableRows = projects.map(project => [
      project.name,
      project.client,
      project.location,
      formatRupiah(project.budget),
      formatRupiah(project.spent),
      `${project.progress}%`,
      project.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246], // Blue 500
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: 'helvetica'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate 50
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        6: { fontStyle: 'bold' }
      }
    });

    doc.save('laporan-proyek.pdf');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex-shrink-0 hidden lg:flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">KONSTRUKSI</h1>
              <span className="text-xs text-blue-400 font-medium tracking-widest">PRO MASTER</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveView('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveView('PROJECTS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'PROJECTS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <HardHat size={20} />
            <span className="font-medium">Data Proyek</span>
          </button>

          <button 
            onClick={() => setActiveView('INVENTORY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'INVENTORY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Package size={20} />
            <span className="font-medium">Inventaris</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Intelligence</p>
            <button 
              onClick={() => setActiveView('AI_INSIGHTS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeView === 'AI_INSIGHTS' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <BrainCircuit size={20} className={activeView === 'AI_INSIGHTS' ? 'text-white' : 'text-purple-400 group-hover:text-white'} />
              <span className="font-medium">AI Consultant</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin Utama</p>
              <p className="text-xs text-slate-400 truncate">admin@promaster.id</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {activeView === 'DASHBOARD' && 'Dashboard Overview'}
            {activeView === 'PROJECTS' && 'Manajemen Proyek'}
            {activeView === 'INVENTORY' && 'Stok Material'}
            {activeView === 'AI_INSIGHTS' && 'AI Intelligence'}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* DASHBOARD VIEW */}
          {activeView === 'DASHBOARD' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Total Anggaran" 
                  value={formatRupiah(stats.totalBudget)}
                  trend={12.5}
                  icon={<DollarSign className="w-6 h-6" />}
                  color="blue"
                />
                <StatsCard 
                  title="Pengeluaran" 
                  value={formatRupiah(stats.totalSpent)}
                  trend={-2.4}
                  trendLabel="lebih hemat"
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="orange"
                />
                 <StatsCard 
                  title="Proyek Aktif" 
                  value={stats.activeProjects.toString()}
                  trend={0}
                  icon={<HardHat className="w-6 h-6" />}
                  color="green"
                />
                 <StatsCard 
                  title="Proyek Tertunda" 
                  value={stats.pendingProjects.toString()}
                  trend={1}
                  trendLabel="butuh review"
                  icon={<AlertTriangle className="w-6 h-6" />}
                  color="red"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Analisis Keuangan Proyek</h3>
                    <select className="text-sm border-slate-300 rounded-md bg-slate-50 px-3 py-1 text-slate-600 border outline-none">
                      <option>Tahun Ini</option>
                      <option>Bulan Ini</option>
                    </select>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `Rp${val/1000000000}M`} />
                        <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => formatRupiah(value)}
                        />
                        <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="Terpakai" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Status Proyek</h3>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-3xl font-bold text-slate-800">{projects.length}</span>
                      <p className="text-xs text-slate-500">Total Proyek</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {statusData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS VIEW */}
          {activeView === 'PROJECTS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-600">Daftar Semua Proyek</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={handleExportPDF}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all"
                  >
                    <Printer size={18} />
                    Cetak PDF
                  </button>
                  <button 
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30 transition-all"
                  >
                    <Plus size={18} />
                    Tambah Proyek
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Proyek</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Anggaran</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{project.name}</div>
                          <div className="text-xs text-slate-500">{project.client}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{project.location}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800">{formatRupiah(project.budget)}</div>
                          <div className="text-xs text-slate-500">Terpakai: {formatRupiah(project.spent)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${project.status === ProjectStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                              project.status === ProjectStatus.ONGOING ? 'bg-blue-100 text-blue-800' :
                              project.status === ProjectStatus.PLANNING ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(project)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {projects.length === 0 && (
                   <div className="p-12 text-center text-slate-500">
                     Belum ada data proyek. Klik "Tambah Proyek" untuk memulai.
                   </div>
                )}
              </div>
            </div>
          )}

          {/* INVENTORY VIEW */}
          {activeView === 'INVENTORY' && (
             <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {materials.map(material => (
                   <div key={material.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-slate-100 rounded-lg">
                         <Package className="w-6 h-6 text-slate-600" />
                       </div>
                       <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                         {material.category}
                       </span>
                     </div>
                     <h4 className="font-bold text-slate-800 mb-1">{material.name}</h4>
                     <p className="text-2xl font-bold text-blue-600">{material.quantity} <span className="text-sm text-slate-400 font-normal">{material.unit}</span></p>
                     <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                        <span className="text-slate-500">Harga Satuan</span>
                        <span className="font-medium">{formatRupiah(material.unitPrice)}</span>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
                 <div>
                   <h4 className="font-bold text-blue-800">Butuh Material Tambahan?</h4>
                   <p className="text-blue-600 text-sm mt-1">Gunakan AI Consultant untuk memprediksi kebutuhan material bulan depan berdasarkan progress proyek.</p>
                 </div>
                 <button 
                   onClick={() => setActiveView('AI_INSIGHTS')}
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                 >
                   Tanya AI
                 </button>
               </div>
             </div>
          )}

          {/* AI INSIGHTS VIEW */}
          {activeView === 'AI_INSIGHTS' && (
            <AIAssistant projects={projects} materials={materials} />
          )}

        </div>
      </main>

      {/* Edit/Add Modal */}
      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

    </div>
  );
};

export default App;