import { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Search, Filter, Youtube, 
  FileText, ExternalLink, Calendar, MoreVertical, 
  Trash2, Download, CheckCircle, Clock, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMaterials, deleteMaterial } from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getMaterials();
      setHistoryItems(response.data.materials);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteMaterial(id);
      setHistoryItems(prev => prev.filter(item => item._id !== id));
      toast.success('Study session removed');
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const filteredItems = historyItems.filter(item => {
    const title = item.title || 'Untitled Session';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-screen-2xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 text-primary-600 font-black uppercase tracking-[0.2em] text-[10px]">
            <HistoryIcon size={14} />
            <span>Learning Vault</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
            Study Archive
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
             Everything you've ever learned, synthesized and organized for quick recall.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative group sm:w-80 lg:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search your knowledge..." 
              className="w-full h-16 bg-white border-2 border-slate-200 rounded-3xl pl-14 pr-6 text-md font-bold placeholder:text-slate-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
           <div className="relative">
             <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl animate-pulse" />
             <Loader2 size={56} className="text-primary-600 animate-spin relative z-10" />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Opening vaults...</p>
        </div>
      ) : (
        <div className="space-y-8 px-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-4">
            {['all', 'youtube', 'pdf', 'docx'].map((filter) => (
               <button
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-95 border-2 ${
                   activeFilter === filter 
                   ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-200' 
                   : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 shadow-sm'
                 }`}
               >
                 {filter}
               </button>
            ))}
          </div>

          {/* History List */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200">Content Source</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 hidden md:table-cell">Analysis Date</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 hidden lg:table-cell">Status</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item) => (
                    <tr 
                      key={item._id} 
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer" 
                      onClick={() => navigate(`/results/${item._id}`)}
                    >
                      <td className="px-10 py-10">
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center transition-all group-hover:scale-110 ${
                            item.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                          }`}>
                            {item.type === 'youtube' ? <Youtube size={28} /> : <FileText size={28} />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-slate-900 font-black text-xl group-hover:text-primary-600 transition-colors line-clamp-1 tracking-tight leading-none mb-1">
                                {item.title || 'Untitled Session'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{item.type} Analysis</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 hidden md:table-cell">
                        <div className="flex items-center space-x-3 text-slate-500 font-bold text-xs uppercase tracking-wider">
                           <Calendar size={16} className="text-slate-300" />
                           <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10 hidden lg:table-cell">
                         <span className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                           <CheckCircle size={12} />
                           <span>Verified</span>
                         </span>
                      </td>
                      <td className="px-10 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-4 opacity-100 transition-all">
                           <button 
                             onClick={() => navigate(`/results/${item._id}`)}
                             className="w-12 h-12 bg-slate-50 text-slate-600 hover:text-primary-600 hover:bg-primary-50 hover:shadow-lg hover:shadow-primary-100 rounded-xl flex items-center justify-center transition-all group/btn"
                             title="View Analysis"
                           >
                              <ArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                           </button>
                           <button 
                             onClick={(e) => handleDelete(e, item._id)}
                             className="w-12 h-12 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 hover:shadow-lg hover:shadow-red-100 rounded-xl flex items-center justify-center transition-all"
                             title="Delete Session"
                           >
                              <Trash2 size={20} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredItems.length === 0 && (
                 <div className="p-32 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-100 mb-10 border border-slate-100 ring-[1rem] ring-slate-50/50">
                       <AlertCircle size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Records Empty</h3>
                    <p className="text-lg text-slate-500 max-w-sm mt-4 font-medium leading-relaxed">
                      We couldn't find any sessions matching your criteria. Start a new one from the dashboard!
                    </p>
                    <button 
                      onClick={() => navigate('/')}
                      className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all active:scale-95"
                    >
                      Return to Dashboard
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

