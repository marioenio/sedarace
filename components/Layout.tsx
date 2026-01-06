
import React from 'react';
import { Manager } from '../types';
import { Search, Bell, LogOut, LayoutDashboard, Trophy, Users, FileText, ChevronRight, ShieldCheck, User, Languages } from 'lucide-react';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeManager: Manager | null;
  onLogout: () => void;
  lang: 'pt' | 'en';
  setLang: (l: 'pt' | 'en') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeManager, onLogout, lang, setLang }) => {
  const t = translations[lang];
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-[#00384D] p-1.5 rounded-lg">
               <div className="text-white font-bold text-xl tracking-tighter">SEDA</div>
            </div>
            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">{t.vision}</span>
              <span className="text-[10px] text-gray-400 font-medium">{t.portalVersion}</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem icon={activeManager ? <Users size={18} /> : <Trophy size={18} />} label={activeManager ? t.myTeam : t.globalRanking} active />
            <NavItem icon={<FileText size={18} />} label={t.sales} />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switch */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
             <button 
                onClick={() => setLang('pt')} 
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'pt' ? 'bg-[#00384D] text-white shadow-sm' : 'text-gray-400 hover:text-[#00384D]'}`}
             >
               PT
             </button>
             <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-[#00384D] text-white shadow-sm' : 'text-gray-400 hover:text-[#00384D]'}`}
             >
               EN
             </button>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={t.search} 
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#00384D]/20 w-48 uppercase font-bold"
            />
          </div>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                  {activeManager ? activeManager : t.all}
                </p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mt-0.5">
                  {activeManager ? t.managerSeda : t.consultantSeda}
                </p>
             </div>
             <button 
              onClick={onLogout}
              className="flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase bg-red-50 px-3 py-2 rounded-xl"
             >
               {t.logout} <LogOut size={14} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 p-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-medium">
          <p className="font-black uppercase tracking-widest">© 2026 SEDA COLLEGE - COMMERCIAL PERFORMANCE SYSTEM</p>
          <div className="flex gap-6 uppercase font-black tracking-widest">
            <a href="#" className="hover:text-gray-600">PRIVACY POLICY</a>
            <a href="#" className="hover:text-gray-600">TERMS OF USE</a>
            <a href="#" className="hover:text-gray-600">TECHNICAL SUPPORT</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${active ? 'bg-[#00384D] text-white shadow-lg shadow-[#00384D]/20' : 'text-gray-400 hover:bg-gray-100'}`}>
    {icon}
    {label}
  </button>
);

export default Layout;
