
import React, { useState, useMemo, useEffect } from 'react';
import { Manager, Seller, Sale, City, CourseModality, PaymentMethod } from './types';
import { INITIAL_SELLERS, INITIAL_SALES } from './mockData';
import Layout from './components/Layout';
import SellerCard from './components/SellerCard';
import { getRaceAnalysis, extractSaleFromDocument } from './services/geminiService';
import { translations } from './translations';
import { 
  Trophy, Target, TrendingUp, Sparkles, Zap, Users, Filter, DollarSign, 
  PieChart as PieIcon, Euro, Home, PackagePlus, CreditCard, Download, 
  FileText, Calendar, CheckCircle2, XCircle, ShieldCheck, RefreshCcw, 
  Plus, Info, ChevronDown, Hash, User as UserIcon, Upload, Loader2, X, Check, Trash2, AlertCircle, Lock, Key, Settings
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

type ViewMode = 'Gestor' | 'Gerentes' | 'Consultores';

const COLORS = ['#00384D', '#F97316', '#0D9488', '#8B5CF6', '#10B981'];

const App: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [activeView, setActiveView] = useState<ViewMode | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });

  const [sellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  
  // Filtros internos
  const [filterManager, setFilterManager] = useState<Manager | 'All'>('All');
  const [filterCity, setFilterCity] = useState<City | 'All'>('All');
  const [filterSeller, setFilterSeller] = useState<string>('All');
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSale, setScannedSale] = useState<Partial<Sale> | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = translations[lang];

  const canEdit = (activeView === 'Gestor' || activeView === 'Gerentes') && isAuthenticated;

  const handleRoleSelection = (role: ViewMode) => {
    if (role === 'Consultores') {
      setActiveView(role);
      setIsAuthenticated(false);
    } else {
      setShowLogin(true);
      setActiveView(role);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciais: admin / seda2026
    if (loginInput.username === 'admin' && loginInput.password === 'seda2026') {
      setIsAuthenticated(true);
      setShowLogin(false);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setActiveView(null);
    setIsAuthenticated(false);
    setShowLogin(false);
    setLoginInput({ username: '', password: '' });
    setFilterManager('All');
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const cityMatch = filterCity === 'All' || s.city === filterCity;
      const sellerMatch = filterSeller === 'All' || s.sellerId === filterSeller;
      
      const seller = sellers.find(sel => sel.id === s.sellerId);
      const managerMatch = filterManager === 'All' || seller?.manager === filterManager;
      
      return cityMatch && sellerMatch && managerMatch;
    });
  }, [sales, filterCity, filterSeller, filterManager, sellers]);

  const sellerPerformance = useMemo(() => {
    return sellers.map(seller => {
      const sellerSales = filteredSales.filter(s => s.sellerId === seller.id);
      const totalPoints = sellerSales.reduce((acc, s) => acc + s.points, 0);
      const totalBonus = sellerSales.reduce((acc, s) => acc + s.bonusEuro, 0);
      const totalTuition = sellerSales.reduce((acc, s) => acc + s.tuitionAmount, 0);
      const lastSale = sellerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...seller,
        totalPoints,
        totalBonus,
        totalSales: sellerSales.length,
        totalTuition,
        lastSaleDate: lastSale?.date || 'N/A'
      };
    }).filter(s => filterManager === 'All' || s.manager === filterManager)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [sellers, filteredSales, filterManager]);

  const stats = useMemo(() => {
    const totalPoints = sellerPerformance.reduce((acc, s) => acc + s.totalPoints, 0);
    const totalSales = filteredSales.length;
    const totalTuition = filteredSales.reduce((acc, s) => acc + s.tuitionAmount, 0);
    const totalBonus = sellerPerformance.reduce((acc, s) => acc + s.totalBonus, 0);
    const avgTicket = totalSales > 0 ? totalTuition / totalSales : 0;
    return { totalPoints, totalSales, totalTuition, totalBonus, avgTicket };
  }, [sellerPerformance, filteredSales]);

  const mixData = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredSales.forEach(sale => {
      distribution[sale.modality] = (distribution[sale.modality] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const performanceData = sellerPerformance.map(s => ({
        id: s.id,
        name: s.name,
        manager: s.manager,
        city: s.city,
        totalPoints: s.totalPoints,
        totalSales: s.totalSales
      }));
      const analysis = await getRaceAnalysis(
        performanceData, 
        filterManager === 'All' ? null : filterManager,
        lang
      );
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis("Error generating analysis.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const data = await extractSaleFromDocument(base64, file.type);
        const services = 420;
        const total = data.packageTotalValue || 0;
        const accommodation = data.accommodationAmount || 0;
        const tuition = total - services - accommodation;
        
        const extracted = {
          ...data,
          servicesAmount: services,
          tuitionAmount: tuition,
          points: data.isRenewal ? 20 : (tuition / 20),
          bonusEuro: data.isRenewal ? 0 : (data.modality === 'Elite' ? 70 : data.modality === 'Premium' ? 40 : 0),
          isEligible: true,
          shift: 'Manhã',
          paymentMethod: 'Transferência'
        };

        setScannedSale(extracted);
        setSelectedSellerId(sellers[0].id);
      } catch (err) {
        alert("Extraction Error");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmScannedSale = () => {
    if (!scannedSale || !selectedSellerId) return;
    const seller = sellers.find(s => s.id === selectedSellerId)!;
    const newSale: Sale = {
      ...scannedSale as Sale,
      id: `s-${Date.now()}`,
      sellerId: seller.id,
      sellerName: seller.name,
      city: (scannedSale.city as City) || seller.city || 'Dublin',
      date: scannedSale.date || new Date().toISOString().split('T')[0],
      isEligible: true,
    };
    setSales(prev => [newSale, ...prev]);
    setScannedSale(null);
    setSuccessMessage(`${t.addSuccess}: ${seller.name}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Fix for the error: Cannot find name 'exportToCSV'
  const exportToCSV = () => {
    const headers = [
      t.tableHeaderConsultant,
      t.studentName,
      t.tableHeaderModality,
      t.tableHeaderPackage,
      t.tableHeaderTuition,
      t.tableHeaderPoints,
      t.tableHeaderBonus,
      t.city,
      'Date'
    ];

    const rows = filteredSales.map(sale => [
      `"${sale.sellerName}"`,
      `"${sale.clientName}"`,
      `"${sale.modality}"`,
      sale.packageTotalValue,
      sale.tuitionAmount,
      sale.points.toFixed(2),
      sale.bonusEuro,
      `"${sale.city}"`,
      sale.date
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seda_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSale = (saleId: string) => {
    if (confirm(t.deleteConfirm)) {
      setSales(prev => prev.filter(s => s.id !== saleId));
      setSuccessMessage(t.deleteSuccess);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#00384D] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative z-10 animate-in zoom-in-95">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#00384D] p-3 rounded-2xl mb-4"><Lock className="text-white" size={32} /></div>
            <h2 className="text-2xl font-black text-[#00384D] uppercase">{t.loginTitle}</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{activeView === 'Gestor' ? t.gestorAccess : t.gerentesAccess}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <LoginInput label={t.username} value={loginInput.username} onChange={v => setLoginInput({...loginInput, username: v})} icon={<UserIcon size={18}/>} placeholder="admin" />
            <LoginInput label={t.password} value={loginInput.password} onChange={v => setLoginInput({...loginInput, password: v})} icon={<Key size={18}/>} placeholder="••••••••" type="password" />
            {loginError && <div className="text-red-500 text-[10px] font-black uppercase bg-red-50 p-3 rounded-xl">{t.loginError}</div>}
            <button type="submit" className="w-full bg-[#00384D] text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl">{t.loginAction}</button>
            <button type="button" onClick={() => setShowLogin(false)} className="w-full text-gray-400 text-[10px] font-black uppercase py-2">{t.cancel}</button>
          </form>
        </div>
      </div>
    );
  }

  if (!activeView) {
    return (
      <div className="min-h-screen bg-[#00384D] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-8 right-8 flex gap-2">
           <button onClick={() => setLang('pt')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'pt' ? 'bg-white text-[#00384D]' : 'text-white/50 hover:text-white'}`}>PT</button>
           <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-[#00384D]' : 'text-white/50 hover:text-white'}`}>EN</button>
        </div>
        <div className="max-w-5xl w-full relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-2xl"><div className="text-[#00384D] font-black text-5xl tracking-tighter">SEDA</div></div>
            <h1 className="text-white text-4xl font-black text-center uppercase tracking-tight">{t.performanceCenter} <span className="text-orange-500">Race</span></h1>
            <p className="text-gray-300 text-xs font-black uppercase tracking-widest mt-2">{t.selectAccess}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AccessCard icon={<ShieldCheck size={32} />} title={t.gestorAccess} desc={t.gestorDesc} onClick={() => handleRoleSelection('Gestor')} color="bg-orange-500" />
            <AccessCard icon={<Users size={32} />} title={t.gerentesAccess} desc={t.gerentesDesc} onClick={() => handleRoleSelection('Gerentes')} color="bg-[#00384D]" border />
            <AccessCard icon={<Trophy size={32} />} title={t.consultoresAccess} desc={t.consultoresDesc} onClick={() => handleRoleSelection('Consultores')} color="bg-teal-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeManager={filterManager !== 'All' ? filterManager : null} 
      onLogout={handleLogout} lang={lang} setLang={setLang}
    >
      {successMessage && <div className="fixed top-24 right-8 z-[60] animate-bounce bg-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-500"><Check size={16} /><span className="text-xs font-black uppercase">{successMessage}</span></div>}

      {canEdit && (
        <div className="bg-white rounded-[40px] p-8 border-2 border-dashed border-orange-200 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-orange-500 transition-all">
          <div className="flex items-center gap-6">
            <div className="bg-orange-100 p-5 rounded-3xl text-orange-600">{isScanning ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}</div>
            <div><h2 className="text-xl font-black text-[#00384D] uppercase tracking-tighter">{t.iaScanner}</h2><p className="text-gray-400 text-xs font-bold uppercase mt-1">{t.scannerRule}</p></div>
          </div>
          <label className="bg-[#00384D] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase cursor-pointer hover:bg-orange-500 transition-all flex items-center gap-2">
            {isScanning ? t.readingQuote : t.uploadQuote}
            <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} disabled={isScanning} />
          </label>
        </div>
      )}

      {scannedSale && (
        <div className="fixed inset-0 bg-[#00384D]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3"><div className="bg-teal-100 p-3 rounded-2xl text-teal-600"><Sparkles /></div><h2 className="text-2xl font-black text-[#00384D] uppercase">{t.validateQuote}</h2></div>
                <button onClick={() => setScannedSale(null)} className="text-gray-400 hover:text-red-500"><X /></button>
             </div>
             <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="col-span-2 p-5 rounded-2xl bg-orange-50 border border-orange-200">
                   <p className="text-[10px] font-black text-orange-600 uppercase mb-3 flex items-center gap-2"><UserIcon size={12}/> {t.confirmConsultant}</p>
                   <select value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)} className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm font-bold text-[#00384D] focus:ring-2 focus:ring-orange-500 outline-none">
                      {sellers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.manager})</option>)}
                   </select>
                </div>
                <ModalField label={t.studentName} value={scannedSale.clientName || t.notIdentified} />
                <ModalField label={t.modality} value={scannedSale.modality || t.notIdentified} highlight />
                <ModalField label={t.totalPackage} value={`€${scannedSale.packageTotalValue}`} />
                <ModalField label={t.netTuition} value={`€${scannedSale.tuitionAmount}`} highlight />
             </div>
             <div className="flex gap-4">
                <button onClick={confirmScannedSale} className="flex-1 bg-teal-600 text-white py-5 rounded-3xl font-black uppercase hover:bg-teal-700 shadow-xl">{t.confirmCompute}</button>
                <button onClick={() => setScannedSale(null)} className="px-10 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black uppercase">{t.cancel}</button>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#00384D] uppercase tracking-tighter">{activeView === 'Gestor' ? t.gestorAccess : (activeView === 'Gerentes' ? t.gerentesAccess : t.consultoresAccess)}</h1>
          <p className="text-gray-400 text-xs font-black uppercase mt-1">{t.realTimePerformance}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeView !== 'Consultores' && <FilterSelect label={t.filterManager} value={filterManager} onChange={v => setFilterManager(v as any)} options={Object.values(Manager).map(m => ({label: m, value: m}))} />}
          <FilterSelect label={t.consultant} value={filterSeller} onChange={setFilterSeller} options={sellerPerformance.map(s => ({label: s.name, value: s.id}))} />
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100">
             {['All', 'Dublin', 'Cork'].map(c => <button key={c} onClick={() => setFilterCity(c as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${filterCity === c ? 'bg-[#00384D] text-white' : 'text-gray-400'}`}>{c === 'All' ? t.all : c}</button>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard label={t.accumulatedPoints} value={stats.totalPoints.toFixed(0)} icon={<Zap className="text-orange-500" />} sub={t.ranking} />
        <KpiCard label={t.cashBonus} value={`€${stats.totalBonus.toLocaleString()}`} icon={<Euro className="text-teal-500" />} sub={t.newCourses} />
        <KpiCard label={t.avgTicketTuition} value={`€${stats.avgTicket.toFixed(0)}`} icon={<DollarSign className="text-blue-500" />} sub={t.monthGeneral} />
        <KpiCard label={t.tuitionVolume} value={`€${stats.totalTuition.toLocaleString()}`} icon={<PackagePlus className="text-purple-500" />} sub={t.pointsBase} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#00384D] uppercase">{t.commercialLeaderboard}</h2>
            {isAuthenticated && (
              <button onClick={handleAiAnalysis} disabled={isAiLoading} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {isAiLoading ? t.generatingIa : t.iaAnalysis}
              </button>
            )}
          </div>
          {aiAnalysis && (
            <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-6 text-[#00384D] animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-3 text-orange-600 font-black text-[10px] uppercase tracking-widest"><Sparkles size={14} /> {t.iaInsights}</div>
              <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sellerPerformance.map((seller, idx) => <SellerCard key={seller.id} seller={seller as any} rank={idx + 1} lang={lang} />)}
          </div>
        </div>
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm h-fit">
           <h3 className="text-lg font-black text-[#00384D] mb-6 uppercase flex items-center gap-2"><PieIcon size={20} className="text-orange-500" /> {t.salesMix}</h3>
           <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={mixData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{mixData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center"><p className="text-[10px] text-gray-400 font-black uppercase">{t.volume}</p><p className="text-3xl font-black text-[#00384D]">{stats.totalSales}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm mb-12 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-[#00384D] uppercase">{t.salesDetail}</h2>
            {canEdit && <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100"><AlertCircle size={10} /> {t.editionMode}</div>}
          </div>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3 bg-[#00384D] text-white rounded-2xl text-[10px] font-black uppercase shadow-lg"><Download size={16} /> {t.exportCsv}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase">
                <th className="pb-4 pr-4">{t.tableHeaderConsultant}</th>
                <th className="pb-4 pr-4">{t.tableHeaderModality}</th>
                <th className="pb-4 pr-4 text-right">{t.tableHeaderPackage}</th>
                <th className="pb-4 pr-4 text-right">{t.tableHeaderTuition}</th>
                <th className="pb-4 pr-4 text-right">{t.tableHeaderPoints}</th>
                <th className="pb-4 pr-4 text-right">{t.tableHeaderBonus}</th>
                {canEdit && <th className="pb-4 text-center">{t.tableHeaderActions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                <tr key={sale.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pr-4"><div className="text-xs font-black text-[#00384D] uppercase">{sale.sellerName}</div><div className="text-[9px] text-gray-400 font-bold uppercase">{sale.clientName}</div></td>
                  <td className="py-4 pr-4"><span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-100 text-gray-600">{sale.modality}</span></td>
                  <td className="py-4 pr-4 text-right text-xs font-bold text-gray-500">€{sale.packageTotalValue}</td>
                  <td className="py-4 pr-4 text-right text-xs font-black text-[#00384D]">€{sale.tuitionAmount}</td>
                  <td className="py-4 pr-4 text-right text-xs font-black text-orange-500">{sale.points.toFixed(1)}</td>
                  <td className="py-4 pr-4 text-right text-xs font-black text-teal-600">€{sale.bonusEuro}</td>
                  {canEdit && <td className="py-4 text-center"><button onClick={() => deleteSale(sale.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const AccessCard = ({ icon, title, desc, onClick, color, border }: any) => (
  <button onClick={onClick} className={`${border ? 'bg-white/10 border border-white/20' : color} p-10 rounded-[40px] text-left hover:scale-105 transition-all group shadow-2xl`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${border ? 'bg-white/20' : 'bg-white/10'} group-hover:bg-white group-hover:text-[#00384D] transition-colors text-white`}>{icon}</div>
    <h3 className="text-white font-black text-2xl mb-2 uppercase">{title}</h3>
    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">{desc}</p>
  </button>
);

const LoginInput = ({ label, value, onChange, icon, placeholder, type = "text" }: any) => (
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">{icon}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder={placeholder} />
    </div>
  </div>
);

const ModalField = ({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) => (
  <div className={`p-4 rounded-2xl ${highlight ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'}`}>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-black ${highlight ? 'text-orange-600' : 'text-[#00384D]'}`}>{value}</p>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }: any) => (
  <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1">
    <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase">{label}:</div>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-none text-[9px] font-black uppercase focus:ring-0 text-[#00384D]">
      <option value="All">All</option>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const KpiCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; sub: string }> = ({ label, value, icon, sub }) => (
  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-gray-50 p-3 rounded-2xl">{icon}</div>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sub}</span>
    </div>
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-[#00384D] tracking-tighter">{value}</h3>
  </div>
);

export default App;
