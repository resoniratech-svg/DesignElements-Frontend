import { 
  UserCheck, 
  Clock, 
  PieChart as PieChartIcon, 
  ArrowRight,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useLeadStore } from '../store/leadStore';
import PageLoader from '../../../components/PageLoader';
import { useDivision } from '../../../context/DivisionContext';

import { useQuery } from '@tanstack/react-query';
import { leadService } from '../../../services/leadService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setFilters } = useLeadStore();
  const { activeDivision } = useDivision();

  // 1. Fetch Dashboard Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['marketing-stats', activeDivision],
    queryFn: () => leadService.getDashboardStats(activeDivision),
    refetchInterval: 30000,
  });

  // 2. Fetch Recent Leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', activeDivision],
    queryFn: () => leadService.getLeads(activeDivision)
  });

  const recentLeads = leads.slice(0, 5);
  const loading = statsLoading || leadsLoading;
  const hasStatsData = stats && stats.funnelData && stats.monthlyData;

  if (loading || !hasStatsData) {
    return <PageLoader message="Syncing Marketing Intelligence..." />;
  }

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Target className="text-brand-600" size={32} />
             Marketing Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Real-time conversion analytics and sales pipeline performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live Acquisition</span>
          </div>
          <button 
            onClick={() => navigate('/marketing/leads/new')}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95"
          >
            Create New Lead
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Potential Leads" 
          value={stats.totalLeads} 
          icon={Target} 
          color="blue"
          onClick={() => {
            setFilters({ status: 'All' });
            navigate('/marketing/leads');
          }}
        />
        <KPICard 
          title="Active Follow-ups" 
          value={stats.followedUpLeads} 
          icon={Clock} 
          color="yellow"
          onClick={() => {
            setFilters({ status: 'Follow-up' });
            navigate('/marketing/leads');
          }}
        />
        <KPICard 
          title="Successful Conversions" 
          value={stats.convertedLeads} 
          icon={UserCheck} 
          color="green"
          onClick={() => {
            setFilters({ status: 'Converted' });
            navigate('/marketing/leads');
          }}
        />
        <KPICard 
          title="New Arrivals" 
          value={stats.pendingLeads} 
          icon={Zap} 
          color="purple"
          onClick={() => {
            setFilters({ status: 'New' });
            navigate('/marketing/leads');
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="text-brand-600" size={20} />
                Lead Acquisition Trend
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly inbound volume</p>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-100">6 Months</button>
            </div>
          </div>
          <div className="h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Subtle Accent Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        </div>

        {/* Pipeline Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6">
            <PieChartIcon className="text-purple-600" size={20} />
            Lead Funnel
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.funnelData}
                  cx="50%"
                  cy="50%"
                  paddingAngle={8}
                  dataKey="count"
                  cornerRadius={8}
                >
                  {stats.funnelData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  iconSize={10} 
                  formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Leads Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Inbound Leads</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latest prospects in the queue</p>
            </div>
            <button 
              onClick={() => navigate('/marketing/leads')}
              className="text-brand-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 group"
            >
              Master Lead List <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentLeads.map((lead: any) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/marketing/leads/${lead.id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase text-xs">{lead.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{lead.email}</div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center">
                          <StatusBadge status={lead.status} />
                       </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-600 uppercase tracking-tight">{lead.source}</td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-slate-300 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all">
                          <ArrowRight size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
