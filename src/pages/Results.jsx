import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Download, Printer, Youtube, FileText, 
  MessageSquare, Send, User, ChevronDown, CheckCircle, 
  BookOpen, List, Target, ExternalLink, Loader2,
  HelpCircle, Hash, GraduationCap, Quote
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMaterialDetail, sendMessage, getChatHistory } from '../services/api';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [material, setMaterial] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matResponse, chatResponse] = await Promise.all([
        getMaterialDetail(id),
        getChatHistory(id)
      ]);
      
      setMaterial(matResponse.data.material);
      setAnalysis(matResponse.data.analysis || {});
      setMessages(chatResponse.data.messages || []);
      
      if (!chatResponse.data.messages.length) {
        setMessages([{ role: 'model', content: "Hi! I've analyzed this for you. Ask me anything about this content!" }]);
      }
    } catch (error) {
      toast.error('Failed to load analysis details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || chatLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await sendMessage(id, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: response.data.text }]);
    } catch (error) {
      toast.error('StudyBot is busy. Try again soon!');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={48} className="text-primary-600 animate-spin" />
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Gathering AI Insights...</h3>
      </div>
    );
  }

  const isYoutube = material?.type === 'youtube';
  
  const tabs = [
    { id: 'summary', label: 'Summary', icon: <BookOpen size={18} /> },
    { id: 'notes', label: 'Study Notes', icon: <List size={18} /> },
    { id: 'definitions', label: 'Glossary', icon: <Quote size={18} /> },
    { id: 'viva', label: 'Viva Prep', icon: <HelpCircle size={18} /> },
    { id: 'keypoints', label: 'Takeaways', icon: <Target size={18} /> },
    { id: 'resources', label: 'Next Steps', icon: <ExternalLink size={18} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Left Column: AI Content */}
      <div className="flex-1 space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 text-slate-500 hover:text-primary-600 font-black transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-widest leading-none pt-0.5">Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-white text-slate-600 hover:text-primary-600 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center space-x-2">
                <Download size={18} />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Export Analysis</span>
            </button>
          </div>
        </div>

        {/* Title Card */}
        <div className="card p-10 border-l-10 border-l-primary-600 bg-gradient-to-br from-white via-white to-primary-50/20 relative overflow-hidden ring-4 ring-primary-50/5 shadow-2xl">
          <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                 <div className={`p-3 rounded-2xl shadow-sm ${isYoutube ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600 font-black'}`}>
                    {isYoutube ? <Youtube size={28} /> : <FileText size={28} />}
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-0.5">
                        {isYoutube ? 'Video Intelligence' : 'Document Analysis'}
                    </span>
                    <div className="flex items-center space-x-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center space-x-1.5 text-emerald-600"><CheckCircle size={14} /> <span>Validated</span></span>
                        <span className="opacity-20">|</span>
                        <span>{new Date(material?.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                {material?.title}
              </h1>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl shadow-inner">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2.5 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all hover:scale-[1.02] active:scale-95 ${
                        activeTab === tab.id 
                        ? 'bg-white text-primary-700 shadow-xl border border-slate-200' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="card min-h-[500px] overflow-hidden shadow-2xl relative">
            <div className="p-12">
                {activeTab === 'summary' && (
                    <article className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                            <BookOpen className="text-primary-600" size={32} />
                            <span>Executive Summary</span>
                        </h3>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed text-xl font-medium">
                                {analysis?.summary || 'No summary available.'}
                            </p>
                        </div>
                    </article>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                             <List className="text-primary-600" size={32} />
                             <span>Curated Study Notes</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {analysis?.notes?.length > 0 ? analysis.notes.map((note, idx) => (
                                <div key={idx} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-primary-200 transition-all hover:shadow-lg group relative overflow-hidden">
                                    <div className="flex items-start space-x-4 relative z-10">
                                        <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center font-black text-primary-600 shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-lg font-medium pt-1.5">{note}</p>
                                    </div>
                                </div>
                            )) : <p className="text-slate-400 font-bold uppercase tracking-widest text-center py-10">Waiting for insights...</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'definitions' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                             <Hash className="text-primary-600" size={32} />
                             <span>Glossary of Terms</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis?.definitions?.length > 0 ? analysis.definitions.map((def, idx) => (
                                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-primary-200 transition-all shadow-sm hover:shadow-md">
                                    <h4 className="text-lg font-black text-primary-600 mb-2 uppercase tracking-tight">{def.term}</h4>
                                    <p className="text-slate-600 font-medium leading-relaxed">{def.definition}</p>
                                </div>
                            )) : <p className="text-slate-400 font-bold uppercase tracking-widest">No definitions identified.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'viva' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                             <HelpCircle className="text-primary-600" size={32} />
                             <span>Viva & Interview Prep</span>
                        </h3>
                        <div className="space-y-6">
                            {analysis?.vivaQuestions?.length > 0 ? analysis.vivaQuestions.map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl border-l-8 border-l-indigo-500">
                                    <h4 className="text-xl font-black text-slate-900 mb-4 flex items-center space-x-3">
                                        <span className="text-indigo-600">Q.</span>
                                        <span>{item.question}</span>
                                    </h4>
                                    <p className="text-slate-600 font-medium pl-8 border-l-2 border-slate-200">
                                        <span className="font-black text-xs uppercase tracking-widest text-slate-400 block mb-2">Ideal Answer</span>
                                        {item.answer}
                                    </p>
                                </div>
                            )) : <p className="text-slate-400 font-bold uppercase tracking-widest">No questions generated yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'keypoints' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                             <Target className="text-primary-600" size={32} />
                             <span>Critical Takeaways</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {analysis?.keyPoints?.length > 0 ? analysis.keyPoints.map((point, idx) => (
                                <div key={idx} className="flex items-center space-x-5 p-6 bg-primary-50/30 rounded-2xl border border-primary-100/50">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-600 font-black shrink-0">
                                        {idx + 1}
                                    </div>
                                    <span className="text-slate-800 font-bold text-lg leading-snug">{point}</span>
                                </div>
                            )) : <p>No key points found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center space-x-3 tracking-tight">
                             <ExternalLink className="text-primary-600" size={32} />
                             <span>Exploration Path</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis?.relatedTopics?.length > 0 ? analysis.relatedTopics.map((topic, idx) => (
                                <div key={idx} className="group p-8 bg-white border-2 border-slate-50 rounded-3xl hover:border-primary-200 hover:shadow-xl transition-all flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Topic {idx + 1}</p>
                                        <h4 className="text-xl font-black text-slate-800 leading-tight">{topic}</h4>
                                    </div>
                                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                            )) : <p>No suggestions available.</p>}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600" />
        </div>
      </div>

      {/* Right Column: Grounded StudyBot */}
      <div className="w-full lg:w-[400px] shrink-0 h-fit lg:sticky lg:top-24 mb-10">
        <div className="card flex flex-col h-[700px] shadow-3xl overflow-hidden ring-8 ring-slate-100/50 border-none">
          <div className="p-6 bg-indigo-900 text-white flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h3 className="text-md font-black tracking-tight leading-none mb-1">StudyBot Grounded</h3>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Strict Context Mode</span>
                </div>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/80 backdrop-blur-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <GraduationCap size={18} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium ${
                        msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-slate-800'
                    }`}>
                        {msg.content}
                    </div>
                </div>
              </div>
            ))}
            {chatLoading && <div className="animate-pulse flex space-x-2 p-4 bg-white/50 rounded-2xl w-20"><div className="w-2 h-2 bg-slate-300 rounded-full" /><div className="w-2 h-2 bg-slate-300 rounded-full" /><div className="w-2 h-2 bg-slate-300 rounded-full" /></div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 relative z-10">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Ask only about this content..."
                    className="w-full pr-14 pl-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white outline-none font-medium"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={chatLoading}
                />
                <button type="submit" disabled={!inputValue.trim() || chatLoading} className="absolute right-2 top-2 w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Send size={18} /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Results;
