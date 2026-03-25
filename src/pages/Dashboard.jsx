import { useState, useEffect } from 'react';
import { Youtube, FileText, Upload, Clock, ArrowRight, X, Loader2, Calendar, Target, Sparkles, Plus } from 'lucide-react';
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
    <div className="max-w-screen-2xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 md:px-16 md:py-16 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-indigo-900/40" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Elevate Your <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Learning</span> Experience
          </h1>
          <p className="text-xl text-slate-300 font-medium leading-relaxed">
            Convert complex educational content from YouTube and PDF documents into structured study guides, summaries, and flashcards instantly.
          </p>
        </div>
      </section>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {/* YouTube Card */}
        <div className="group relative bg-white rounded-3xl p-10 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:border-red-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform duration-300">
                <Youtube size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">YouTube Analysis</h3>
              <p className="text-slate-600 font-medium leading-relaxed max-w-xs">Paste any video URL to generate high-quality notes and transcripts.</p>
            </div>
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">Video Ready</div>
          </div>

          <form onSubmit={handleYoutubeSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-14 pr-6 text-lg font-bold placeholder:text-slate-500 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                disabled={isProcessing}
              />
              <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            </div>

            <button
              type="submit"
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isProcessing || !ytLink}
            >
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>Transform Video</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Document Card */}
        <div className="group relative bg-white rounded-3xl p-10 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:border-primary-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-300">
                <FileText size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Academic Documents</h3>
              <p className="text-slate-600 font-medium leading-relaxed max-w-xs">Upload PDFs or DOCX files for deep contextual analysis and summaries.</p>
            </div>
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-200">Document Ready</div>
          </div>

          {!uploadedFile ? (
            <div className="relative h-[136px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center transition-all hover:bg-primary-50 hover:border-primary-400 group/drop cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
              />
              <Upload size={32} className="text-slate-500 group-hover/drop:text-primary-600 group-hover/drop:-translate-y-1 transition-all mb-3" />
              <span className="text-slate-700 font-bold group-hover/drop:text-primary-700 tracking-tight">Click to browse or drop file</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 text-center">PDF, DOCX up to 10MB</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-primary-50/50 border-2 border-primary-200 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="w-12 h-12 bg-white rounded-xl border border-primary-200 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-md font-black text-slate-800 truncate leading-tight">{uploadedFile.name}</span>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • READY</span>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <button
                onClick={processFile}
                className="w-full h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-primary-100 transition-all active:scale-[0.98] disabled:opacity-50"
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

      {/* Sessions History */}
      <section className="px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-primary-600 font-black mb-2 uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span>Continue Learning</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-all border border-slate-300"
          >
            <span>View All Archives</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/results/${item._id}`)}
                className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                      }`}>
                      {item.type === 'youtube' ? <Youtube size={24} /> : <FileText size={24} />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${item.type === 'youtube'
                        ? 'bg-red-50/50 text-red-600 border-red-100'
                        : 'bg-primary-50/50 text-primary-600 border-primary-100'
                      }`}>
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                    {item.title || 'Untitled Session'}
                  </h4>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar size={14} />
                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
            <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200">
              <Target size={48} strokeWidth={1} />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Your Knowledge Base is Empty</h4>
            <p className="text-slate-500 max-w-sm mx-auto mt-3 font-medium text-lg">
              Ready to start? Upload your first material or paste a video link to begin your AI-assisted learning journey.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-bounce">
                <ArrowRight className="rotate-90 text-primary-500" />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

