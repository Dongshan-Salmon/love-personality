import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, BookOpen, Heart, AlertTriangle, Shield, X, User, Brain, 
  Zap, MessageCircle, Activity, Anchor, Lock, Eye, FileText, Layers, Filter 
} from 'lucide-react';

// 正式環境：從 public 資料夾讀取 JSON
const JSON_URL = '/戀愛人格表.json';

// --- 工具函式 ---
const parseRisk = (text) => {
  if (!text || typeof text !== 'string') return { aggressor: 5, victim: 5 };
  const aggressorMatch = text.match(/加害[:：]?\s*([0-9]+(?:\.[0-9]+)?)/);
  const victimMatch   = text.match(/受害[:：]?\s*([0-9]+(?:\.[0-9]+)?)/);
  return { 
    aggressor: aggressorMatch ? Number(aggressorMatch[1]) : 5, 
    victim: victimMatch ? Number(victimMatch[1]) : 5 
  };
};

const mapProfileForUI = (profile) => {
  const c = profile.content || {};
  const type = profile.type || '';
  const category = type.includes('·') ? type.split('·')[0] : type.includes('（') ? type.split('（')[0] : '其他';
  
  return {
    id: profile.id,
    title: type,
    category,
    emotional:  c['情緒模組'] || '',
    cognitive:  c['認知模組'] || '',
    behavioral: c['行為模組'] || '',
    attachment: c['依附模組'] || '',
    background: c['人格發展背景'] || '',
    control:    c['控制模組'] || '',
    submission: c['順從_被控制模組'] || '',
    defense:    c['防衛機制'] || '',
    interaction: c['關係不同階段的互動模式'] || '',
    dialogue:    c['常見內在對話'] || '',
    coldRead: [c['冷讀模組'] || '', c['冷讀句'] ? `\n\n💬 冷讀金句：\n${c['冷讀句']}` : ''].join('').trim(),
    caseStudy: c['案例_細節'] || '',
    risk: parseRisk(c['加害_受害風險']),
  };
};

// --- UI Components ---
const CategoryBadge = ({ category, active, onClick }) => (
  <button onClick={() => onClick(category)} className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm ${active ? 'bg-rose-500 text-white shadow-md scale-105' : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'}`}>{category}</button>
);

const RiskBar = ({ label, value, color }) => (
  <div className="flex items-center gap-2 text-xs mt-1">
    <span className="w-12 font-bold text-slate-500">{label}</span>
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${(typeof value === 'number' ? value : 5) * 10}%` }}></div></div>
    <span className="w-8 text-right font-bold text-slate-700">{value}</span>
  </div>
);

const InfoSection = ({ title, content, icon: Icon, colorClass, bgClass }) => (
  <div className={`${bgClass} p-4 rounded-xl border ${colorClass.replace('text-', 'border-').replace('700', '100')} h-full hover:shadow-md transition-shadow`}>
    <h3 className={`font-bold ${colorClass} mb-2 flex items-center gap-2 text-sm uppercase tracking-wider`}><Icon className="w-4 h-4" /> {title}</h3>
    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">{content || "無資料"}</p>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-b-2 ${active ? 'border-rose-500 text-rose-600 bg-rose-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Icon className="w-4 h-4" />{label}</button>
);

const Modal = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState('core');
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
        <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg font-black text-xl shrink-0">#{data.id}</div>
            <div className="min-w-0"><h2 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{data.title}</h2><span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{data.category}</span></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full shrink-0 text-slate-400"><X className="w-6 h-6" /></button>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 shrink-0 grid grid-cols-2 gap-8"><RiskBar label="加害" value={data.risk.aggressor} color="bg-orange-500" /><RiskBar label="受害" value={data.risk.victim} color="bg-blue-500" /></div>
        <div className="flex border-b border-slate-200 shrink-0 bg-white"><TabButton active={activeTab === 'core'} onClick={() => setActiveTab('core')} icon={Heart} label="核心" /><TabButton active={activeTab === 'deep'} onClick={() => setActiveTab('deep')} icon={Layers} label="深層" /><TabButton active={activeTab === 'real'} onClick={() => setActiveTab('real')} icon={Zap} label="實戰" /></div>
        <div className="overflow-y-auto p-6 bg-white flex-1 custom-scrollbar">
          {activeTab === 'core' && <div className="grid md:grid-cols-2 gap-4"><InfoSection title="情緒" content={data.emotional} icon={Heart} colorClass="text-rose-600" bgClass="bg-rose-50" /><InfoSection title="認知" content={data.cognitive} icon={Brain} colorClass="text-purple-600" bgClass="bg-purple-50" /><InfoSection title="行為" content={data.behavioral} icon={Activity} colorClass="text-blue-600" bgClass="bg-blue-50" /><InfoSection title="依附" content={data.attachment} icon={Anchor} colorClass="text-teal-600" bgClass="bg-teal-50" /></div>}
          {activeTab === 'deep' && <div className="grid md:grid-cols-2 gap-4"><div className="md:col-span-2"><InfoSection title="背景" content={data.background} icon={User} colorClass="text-slate-600" bgClass="bg-slate-100" /></div><InfoSection title="控制" content={data.control} icon={Lock} colorClass="text-orange-600" bgClass="bg-orange-50" /><InfoSection title="順從" content={data.submission} icon={Shield} colorClass="text-indigo-600" bgClass="bg-indigo-50" /><div className="md:col-span-2"><InfoSection title="防衛" content={data.defense} icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-red-50" /></div></div>}
          {activeTab === 'real' && <div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><InfoSection title="互動" content={data.interaction} icon={Activity} colorClass="text-cyan-600" bgClass="bg-cyan-50" /><InfoSection title="內在" content={data.dialogue} icon={MessageCircle} colorClass="text-pink-600" bgClass="bg-pink-50" /></div><div className="bg-slate-800 text-slate-100 p-5 rounded-xl"><h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2"><Eye className="w-5 h-5" /> 冷讀切入</h3><p className="text-lg font-medium leading-relaxed italic whitespace-pre-line">{data.coldRead}</p></div><div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100"><h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2"><FileText className="w-5 h-5" /> 案例</h3><p className="text-sm text-emerald-800 whitespace-pre-line">{data.caseStudy}</p></div></div>}
        </div>
      </div>
    </div>
  );
};

export default function LovePersonalityApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [database, setDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(JSON_URL);
        if (!res.ok) throw new Error('載入 JSON 失敗');
        const json = await res.json();
        setDatabase((Array.isArray(json.profiles) ? json.profiles : []).map(mapProfileForUI));
      } catch (e) { console.error(e); setError(e.message); } finally { setLoading(false); }
    };
    load();
  }, []);

  const categories = useMemo(() => ['全部', ...new Set(database.map(p => p.category))], [database]);
  const filteredData = useMemo(() => database.filter(item => {
    const term = searchTerm.toLowerCase();
    return (selectedCategory === '全部' || item.category === selectedCategory) &&
           (item.title.toLowerCase().includes(term) || item.emotional.toLowerCase().includes(term) || (item.coldRead && item.coldRead.toLowerCase().includes(term)));
  }), [searchTerm, selectedCategory, database]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-6 py-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl text-rose-500 mb-2 shadow-lg border border-rose-100"><BookOpen className="w-12 h-12" /></div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800">戀愛人格<span className="text-rose-500">百科全書</span></h1>
          <p className="text-slate-500 text-lg">GitHub Codespaces 版本</p>
        </div>
        <div className="sticky top-4 z-30 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200 space-y-4">
          <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-rose-300 outline-none text-lg" /></div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{categories.map(cat => <CategoryBadge key={cat} category={cat} active={selectedCategory === cat} onClick={setSelectedCategory} />)}</div>
        </div>
        {loading && <div className="text-center py-16 text-slate-400">載入中...</div>}
        {error && <div className="text-center py-16 text-red-500">{error}</div>}
        {!loading && !error && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredData.map(item => (
            <div key={item.id} onClick={() => setSelectedPersonality(item)} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer p-6 flex flex-col">
              <div className="flex justify-between mb-4"><span className="text-rose-500 font-black">#{item.id}</span><span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{item.category}</span></div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{item.emotional}</p>
              <div className="mt-auto pt-3 border-t border-slate-100 flex gap-4 text-xs font-bold text-slate-500"><span className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${item.risk.aggressor > 5 ? 'bg-orange-500' : 'bg-slate-300'}`} />加害 {item.risk.aggressor}</span><span className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${item.risk.victim > 5 ? 'bg-blue-500' : 'bg-slate-300'}`} />受害 {item.risk.victim}</span></div>
            </div>
          ))}
        </div>}
        <Modal data={selectedPersonality} onClose={() => setSelectedPersonality(null)} />
      </div>
    </div>
  );
}