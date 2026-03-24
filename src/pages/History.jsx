import { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Search, Filter, Youtube, 
  FileText, ExternalLink, Calendar, MoreVertical, 
  Trash2, Download, CheckCircle, Clock, Loader2, AlertCircle 
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
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center space-x-4 tracking-tight leading-none">
            <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-100 ring-4 ring-primary-50">
                <HistoryIcon size={32} />
            </div>
            <span>Study Archive</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium max-w-xl">
             Revisit and manage all your AI-powered study cycles in one place.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 sm:w-80 lg:w-96">
            <Search className="absolute left-4 top-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              className="input-field pl-12 h-14 bg-white border-slate-200 focus:bg-white text-md font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-14 px-6 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all flex items-center justify-center space-x-3 shadow-sm hover:shadow-md font-black uppercase tracking-widest text-[10px]">
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 size={48} className="text-primary-600 animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Opening vaults...</p>
        </div>
      ) : (
        <>
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-3">
            {['all', 'youtube', 'pdf', 'docx'].map((filter) => (
               <button
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5 border ${
                   activeFilter === filter 
                   ? 'bg-primary-600 text-white ring-8 ring-primary-50 border-primary-500' 
                   : 'bg-white border-slate-100 text-slate-500 hover:border-primary-200 hover:text-primary-600'
                 }`}
               >
                 {filter}
               </button>
            ))}
          </div>

          {/* History List */}
          <div className="card shadow-3xl overflow-hidden border-none ring-1 ring-slate-200 ring-inset">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Content Source</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis Date</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr 
                      key={item._id} 
                      className="group hover:bg-slate-50/30 transition-all cursor-pointer" 
                      onClick={() => navigate(`/results/${item._id}`)}
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-5">
                          <div className={`p-4 rounded-2xl shrink-0 shadow-sm border border-transparent transition-all group-hover:bg-white group-hover:border-slate-100 ${
                            item.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                          }`}>
                            {item.type === 'youtube' ? <Youtube size={24} /> : <FileText size={24} />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-slate-900 font-black text-lg group-hover:text-primary-600 transition-colors line-clamp-1 tracking-tight leading-tight">
                                {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{item.type} Analysis</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-3 text-slate-600 font-black text-[11px] uppercase tracking-widest">
                           <Calendar size={16} className="text-slate-300" />
                           <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                         <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                           <CheckCircle size={12} />
                           <span>Synced</span>
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl border border-transparent hover:border-primary-100 transition-all scale-90 group-hover:scale-100">
                              <Download size={20} />
                           </button>
                           <button 
                             onClick={(e) => handleDelete(e, item._id)}
                             className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all scale-90 group-hover:scale-100"
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
                 <div className="p-24 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100 ring-8 ring-slate-50/50">
                       <AlertCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nothing found in records</h3>
                    <p className="text-md text-slate-500 max-w-xs mt-2 font-medium">Try searching for something else or upload new study material to your dashboard.</p>
                 </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default History;
