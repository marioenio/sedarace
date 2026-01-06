
import React from 'react';
import { Seller } from '../types';
import { TrendingUp, Award, MapPin, Euro, UserCircle2 } from 'lucide-react';
import { translations } from '../translations';

interface ExtendedSeller extends Seller {
  totalPoints: number;
  totalSales: number;
  totalTuition: number;
  totalBonus: number;
  lastSaleDate: string;
}

interface SellerCardProps {
  seller: ExtendedSeller;
  rank: number;
  lang: 'pt' | 'en';
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, rank, lang }) => {
  const t = translations[lang];
  const isTopThree = rank <= 3;
  const avgTicket = seller.totalSales > 0 ? seller.totalTuition / seller.totalSales : 0;
  
  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
      {isTopThree && (
        <div className="absolute top-0 right-0 p-5">
          <Award className={`${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-orange-400'}`} size={32} />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="bg-gray-50 p-4 rounded-2xl text-[#00384D] flex items-center justify-center relative">
          <UserCircle2 size={40} className="opacity-30" />
          <div className="absolute -bottom-1 -right-1 bg-[#00384D] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg border-2 border-white">
            {rank}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-black text-[#00384D] text-lg mb-0.5 leading-tight">{seller.name}</h3>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] text-gray-400 font-black uppercase flex items-center gap-1">
              <MapPin size={10} className="text-orange-500" /> {seller.city}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">{t.accumulatedPoints}</p>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-[#00384D]">{seller.totalPoints.toFixed(0)}</span>
                <TrendingUp size={12} className="text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">{t.cashBonus}</p>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-teal-600">€{seller.totalBonus}</span>
                <Euro size={12} className="text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{t.mediaTuition}</span>
          <span className="text-xs font-black text-gray-800 tracking-tight">€{avgTicket.toFixed(0)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{t.salesVolume}</span>
          <span className="text-xs font-black text-[#00384D]">{seller.totalSales}</span>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
