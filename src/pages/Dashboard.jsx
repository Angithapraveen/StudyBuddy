import { useState, useEffect } from 'react';
import { Youtube, FileText, Upload, Clock, ArrowRight, X, Loader2, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  fetchYoutubeTranscript,
  processYoutube,
  processUpload,
  getMaterials,
  getApiErrorMessage,
} from '../services/api';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const Dashboard = () => {
  const navigate = useNavigate();
  const [ytLink, setYtLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getMaterials();
      setHistory(response.data.materials.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!ytLink.includes('youtube.com/') && !ytLink.includes('youtu.be/')) {
      toast.error('Please enter a valid YouTube link');
      return;
    }

    setIsProcessing(true);
    let toastId = toast.loading('Fetching transcript...');

    const apiMessage = (error) => {
      const code = error.code;
      const msg = error.message || '';
      if (code === 'ERR_NETWORK' || msg === 'Network Error' || code === 'ECONNREFUSED') {
        return 'Cannot reach the API. Start the server (e.g. npm run dev:all or npm start in server) on port 5000.';
      }
      return getApiErrorMessage(error, 'Failed to process video');
    };

    try {
      const trRes = await fetchYoutubeTranscript(ytLink);
      toastId = toast.loading('Generating AI notes...', { id: toastId });
      const response = await processYoutube(ytLink, trRes.data.transcript);
      toast.success('Analysis complete!', { id: toastId });
      navigate(`/results/${response.data.uploadId}`);
    } catch (error) {
      toast.error(apiMessage(error), { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('File too large. Please upload a smaller file (max 10MB).');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported format. Use PDF or DOCX.');
      return;
    }

    setUploadedFile(file);
    toast.success(`${file.name} ready for analysis!`);
  };

  const processFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    const toastId = toast.loading('Reading document and analyzing content...');
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const response = await processUpload(formData);
      toast.success('Document analyzed successfully!', { id: toastId });
      navigate(`/results/${response.data.uploadId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to analyze document'), { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl shadow-primary-200 relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 tracking-tight leading-none">Unlock your potential 🧠</h2>
            <p className="text-primary-100 text-lg max-w-2xl opacity-90 font-medium">
              StudyBuddy turns massive videos and long PDFs into concise, readable study guides in seconds.
            </p>
        </div>
        {/* Simple Abstract SVG background deco */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </section>

      {/* Submission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* YouTube Link Upload Card */}
        <div className="card p-8 border-l-8 border-l-red-500 hover:ring-2 hover:ring-red-100 transition-all">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-red-50 rounded-2xl text-red-600 shadow-sm">
              <Youtube size={32} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">YouTube Video</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Transcript Parsing</p>
            </div>
          </div>
          
          <form onSubmit={handleYoutubeSubmit} className="space-y-4">
            <div className="group">
              <div className="relative">
                <input 
                    type="text" 
                    placeholder="Paste YouTube link here..." 
                    className="input-field pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white text-lg font-medium"
                    value={ytLink}
                    onChange={(e) => setYtLink(e.target.value)}
                    disabled={isProcessing}
                />
                <Youtube className="absolute left-4 top-4.5 text-slate-400 group-focus-within:text-red-500 transition-colors" size={24} />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-3 btn-primary bg-red-600 hover:bg-red-700 h-14 font-black shadow-xl shadow-red-200 disabled:opacity-50 group"
              disabled={isProcessing || !ytLink}
            >
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                    <span>Generate AI Notes</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Document Upload Card */}
        <div className="card p-8 border-l-8 border-l-primary-600 hover:ring-2 hover:ring-primary-100 transition-all">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 shadow-sm">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Academic Docs</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">OCR & Contextual Reading</p>
            </div>
          </div>

          {!uploadedFile ? (
            <div className="relative border-3 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group h-[140px] flex items-center justify-center">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept=".pdf,.docx"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center">
                <Upload size={40} className="text-slate-400 group-hover:text-primary-500 mb-3 transition-transform group-hover:-translate-y-2" />
                <span className="text-slate-600 font-bold group-hover:text-primary-700 tracking-tight">Click or Drag PDF/Word</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between p-5 bg-primary-50/50 border border-primary-100 rounded-2xl shadow-sm ring-4 ring-primary-50/10">
                 <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="p-3 bg-white rounded-xl border border-primary-200 shadow-sm text-primary-600 shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-md font-black text-slate-800 truncate">{uploadedFile.name}</span>
                      <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready</span>
                    </div>
                 </div>
                 <button 
                  onClick={() => setUploadedFile(null)} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                 >
                   <X size={20} />
                 </button>
               </div>

               <button 
                onClick={processFile}
                className="w-full h-14 flex items-center justify-center space-x-3 btn-primary py-3 font-black shadow-xl shadow-primary-200 active:scale-95 transition-all disabled:opacity-50"
                disabled={isProcessing}
               >
                 {isProcessing ? (
                   <Loader2 size={24} className="animate-spin" />
                 ) : (
                   <>
                       <span>Analyze Document</span>
                       <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent History Section */}
      <section className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recent Sessions</h3>
          </div>
          <button 
            onClick={() => navigate('/history')}
            className="group flex items-center space-x-2 text-primary-600 font-black hover:text-primary-700 transition-colors"
          >
            <span className="text-sm uppercase tracking-widest">View Archives</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoadingHistory ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
        ) : history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {history.map((item) => (
                    <div 
                        key={item._id} 
                        onClick={() => navigate(`/results/${item._id}`)}
                        className="card p-6 flex flex-col justify-between cursor-pointer hover:border-primary-400 hover:shadow-xl hover:-translate-y-2 transition-all group border-b-6 border-b-slate-100"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ring-4 ring-slate-50 border border-slate-100 shrink-0 group-hover:bg-white transition-colors ${
                                    item.type === 'youtube' ? 'text-red-600 bg-red-50' : 'text-primary-600 bg-primary-50'
                                }`}>
                                    {item.type === 'youtube' ? <Youtube size={24} /> : <FileText size={24} />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                    item.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                                }`}>
                                    {item.type}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 group-hover:text-primary-700 transition-colors mb-2 line-clamp-2 leading-tight">
                                {item.title}
                            </h4>
                        </div>
                        <div className="flex items-center justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center space-x-1"><Clock size={12} /> <span>{new Date(item.createdAt).toLocaleDateString()}</span></span>
                            <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">Open Analysis →</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Target size={40} />
                </div>
                <h4 className="text-xl font-black text-slate-800">Your library is empty</h4>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Upload your first material to start building your personalized study guides today.</p>
            </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
