import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, User, MessageSquare, 
  Plus, History, Edit 
} from 'lucide-react';
import { leadService } from '../../../services/leadService';

import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id) return;
      try {
        const [leadData, followUpsData] = await Promise.all([
          leadService.getLead(id),
          leadService.getLeadFollowUps(id)
        ]);
        if (leadData) setLead(leadData);
        if (followUpsData) setFollowUps(followUpsData);
      } catch (error) {
        console.error("Failed to fetch lead details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadData();
  }, [id]);



  const handleAddFollowUp = async () => {
    if (!lead || !newNote.trim()) return;
    
    try {
      await leadService.addFollowUp(lead.id, newNote, nextFollowUpDate || undefined);
      
      // Refresh data
      const [updatedLead, updatedFollowUps] = await Promise.all([
        leadService.getLead(lead.id),
        leadService.getLeadFollowUps(lead.id)
      ]);
      
      setLead(updatedLead);
      setFollowUps(updatedFollowUps);
      setNewNote('');
      setNextFollowUpDate('');
      setShowFollowUpForm(false);
    } catch (error) {
      console.error("Failed to add follow-up", error);
      alert("Failed to save follow-up notes.");
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!lead) {
    return <div className="p-8 text-center text-gray-500">Lead not found.</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/marketing/leads')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Leads
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/marketing/leads/edit/${lead.id}`)}
            className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
          >
            <Edit size={16} /> Edit Lead
          </button>
          <button 
            onClick={() => setShowFollowUpForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Follow-up
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lead Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {lead.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
              <div className="mt-2 italic"><StatusBadge status={lead.status} /></div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-gray-400" size={18} />
                <span className="text-gray-600">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="text-gray-400" size={18} />
                <span className="text-gray-600">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="text-gray-400" size={18} />
                <span>Assigned to: <span className="font-medium text-gray-900">{lead.assignedTo || lead.assigned_to_name || lead.assigned_to || 'Admin User'}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="text-gray-400" size={18} />
                <span>Next Follow-up: <span className="font-medium text-blue-600">
                  {lead.nextFollowUpDate || lead.next_follow_up_date 
                    ? (lead.nextFollowUpDate || lead.next_follow_up_date).split(/[T ]/)[0] 
                    : 'Not scheduled'}
                </span></span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Lead Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Source</p>
                <p className="text-sm font-medium text-gray-900">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <PriorityBadge priority={lead.priority} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {lead.notes || 'No notes available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="text-blue-600" size={20} />
                Follow-up Timeline
              </h3>
              <button 
                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                {showFollowUpForm ? 'Cancel' : 'Add Note'}
              </button>
            </div>

            {showFollowUpForm && (
              <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Follow-up Notes *</label>
                  <textarea 
                    className="w-full p-3 text-sm border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
                    placeholder="Type follow-up notes here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Next Follow-up Date (Optional)</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={handleAddFollowUp}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                    >
                      Save Follow-up
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {followUps?.length > 0 ? followUps.map((item: any, idx: number) => (
                <div key={item.id} className="relative">
                  <div className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <MessageSquare size={12} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-bold">
                        {item.user_name || 'System'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm italic">No interactions recorded yet.</p>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
