import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Plus,
  X,
  Edit2,
  Trash2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supportService, type SupportChannel } from "../../services/supportService";
import PageLoader from "../../components/PageLoader";

export default function ClientSupport() {
  const { user } = useAuth();
  const [activeSector, setActiveSector] = useState(user?.division?.toUpperCase() || "CONTRACTING");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newChannel, setNewChannel] = useState({
    title: "",
    desc: "",
    email: "",
    phone: "",
    color: "blue"
  });

  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await supportService.getChannels();
      setChannels(data || []);
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = channels.filter(c => 
    c.sector === "ALL" || c.sector === activeSector
  );

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIndex !== null) {
        const channelToUpdate = channels[editingIndex];
        if (channelToUpdate.id) {
          await supportService.updateChannel(channelToUpdate.id, {
            ...channelToUpdate,
            ...newChannel
          });
        }
      } else {
        await supportService.createChannel({
          ...newChannel,
          sector: activeSector,
          icon: "HelpCircle"
        });
      }
      await fetchChannels(); // Refresh the list
      setIsModalOpen(false);
      setEditingIndex(null);
      setNewChannel({ title: "", desc: "", email: "", phone: "", color: "blue" });
    } catch (error) {
      console.error("Failed to save channel", error);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const channelId = channels[index]?.id;
      if (channelId) {
        await supportService.deleteChannel(channelId);
        await fetchChannels();
      }
    } catch (error) {
      console.error("Failed to delete channel", error);
    }
  };

  const startEdit = (index: number) => {
    const c = channels[index];
    setNewChannel({
      title: c.title,
      desc: c.desc || "",
      email: c.email || "",
      phone: c.phone || "",
      color: (c as any).color || "blue"
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I download my monthly invoices?",
      a: "Navigate to the 'Billing & Payments' module from the sidebar. You will see a list of all your invoices with a download icon next to each one. Supported formats include PDF and Excel.",
      sector: "ALL"
    },
    {
      q: "Where can I track site progress photos?",
      a: "In the 'Projects' section, select your active project. Under the 'Documents' or 'Gallery' tab, you'll find the latest site inspection photos and progress reports uploaded by our engineering team.",
      sector: "CONTRACTING"
    },
    {
      q: "How do I track my trading orders?",
      a: "Trading orders can be tracked under the 'Trading Dashboard'. You can view real-time status of shipments and pending deliveries.",
      sector: "TRADING"
    },
    {
      q: "What is the average response time for support?",
      a: "Our standard response time for technical queries is within 4 working hours. For urgent site issues, please use the direct phone number of your assigned Project Coordinator.",
      sector: "ALL"
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.sector === "ALL" || f.sector === activeSector
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Sector Header Toggle (Premium Style) - ONLY FOR ADMIN */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="flex flex-col items-center gap-6 mb-4">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
            {['TRADING', 'CONTRACTING'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSector(s)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all ${
                  activeSector === s 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-y-[-1px]' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">How can we help you?</h1>
            <p className="text-slate-500">Our {activeSector.toLowerCase()} team is here to assist you with any queries.</p>
          </div>
        </div>
      )}

      {/* Default Header for Clients */}
      {user?.role !== 'SUPER_ADMIN' && (
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">How can we help you?</h1>
          <p className="text-slate-500">Our team is here to assist you with any project or billing queries.</p>
        </div>
      )}
        {user?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 shrink-0"
          >
            <Plus size={18} />
            ADD
          </button>
        )}

      {/* Add Support Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 scale-in-center">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {editingIndex !== null ? 'Edit Support Channel' : 'Add Support Channel'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIndex(null);
                  setNewChannel({ title: "", desc: "", email: "", phone: "", color: "blue" });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddChannel} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Technical Support"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={newChannel.title}
                  onChange={(e) => setNewChannel({...newChannel, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  required
                  placeholder="Briefly describe what this channel handles..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all h-20 resize-none"
                  value={newChannel.desc}
                  onChange={(e) => setNewChannel({...newChannel, desc: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                  <input 
                    required
                    type="email"
                    placeholder="support@trek.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    value={newChannel.email}
                    onChange={(e) => setNewChannel({...newChannel, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                  <input 
                    required
                    type="text"
                    placeholder="+974 ..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    value={newChannel.phone}
                    onChange={(e) => setNewChannel({...newChannel, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Theme Color</label>
                <div className="flex gap-3 pt-1">
                  {['blue', 'emerald', 'amber'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewChannel({...newChannel, color: c})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newChannel.color === c ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent'
                      } ${
                        c === 'blue' ? 'bg-blue-500' : c === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredChannels.map((channel, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:shadow-xl transition-all group relative">
            {user?.role === 'SUPER_ADMIN' && (
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(i)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(i)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
               </div>
            )}
            <div className={`w-12 h-12 rounded-lg mb-6 flex items-center justify-center transition-all ${
              channel.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
              channel.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
              'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
            }`}>
               {channel.icon === 'Briefcase' ? <Briefcase size={20} /> :
                channel.icon === 'CreditCard' ? <CreditCard size={20} /> :
                <HelpCircle size={20} />}
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{channel.title}</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{channel.desc}</p>
            
            <div className="mt-8 space-y-4">
               <a href={`mailto:${channel.email}`} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Mail size={14} />
                  </div>
                  {channel.email}
               </a>
               <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Phone size={14} />
                  </div>
                  {channel.phone}
               </div>
            </div>

            <button className={`mt-8 w-full py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              channel.color === 'blue' ? 'bg-blue-600 shadow-blue-100' :
              channel.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-100' :
              'bg-amber-600 shadow-amber-100'
            } text-white shadow-xl hover:-translate-y-1`}>
              Contact Now
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900 rounded-[32px] p-8 md:p-12 text-white overflow-hidden relative">
         <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
               <ShieldCheck size={14} className="text-emerald-400" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Portal Support 24/7</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-tight">Frequently Asked <br /> Questions</h2>
            <div className="space-y-4 pt-4">
               {filteredFaqs.map((faq, i) => (
                 <div 
                   key={i} 
                   onClick={() => setOpenIndex(openIndex === i ? null : i)}
                   className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                     openIndex === i 
                     ? 'bg-brand-600/10 border-brand-500/30' 
                     : 'bg-white/5 border-white/10 hover:bg-white/10'
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold transition-colors ${openIndex === i ? 'text-brand-400' : 'text-slate-300 group-hover:text-white'}`}>{faq.q}</span>
                      <ArrowRight size={16} className={`transition-all ${openIndex === i ? 'rotate-90 text-brand-400' : 'text-slate-500 group-hover:text-white group-hover:translate-x-1'}`} />
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openIndex === i 
                      ? 'max-h-[300px] opacity-100 mt-4' 
                      : 'max-h-0 opacity-0'
                    }`}>
                       <div className="pb-2">
                         <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                           {faq.a}
                         </p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="hidden md:flex justify-center relative">
            <div className="w-64 h-64 bg-brand-500/20 rounded-full absolute blur-[100px]" />
            <MessageSquare size={200} className="text-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <Clock size={80} strokeWidth={1} className="text-white/20 animate-pulse" />
            </div>
         </div>
      </div>
    </div>
  );
}
