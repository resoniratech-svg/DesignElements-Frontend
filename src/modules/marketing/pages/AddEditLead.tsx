import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, X, User, Phone, Mail, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { userService } from '../../../services/userService';
import type { Lead, LeadStatus, LeadPriority } from '../types';

const AddEditLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    assignedTo: '',
    nextFollowUpDate: '',
    notes: '',
    division: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch lead if editing
  const { data: lead, isLoading: isFetching } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLead(id!),
    enabled: isEditing && !!id
  });

  // 1.5 Fetch users for specialist assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers()
  });

  // Sync form when data loads
  useEffect(() => {
    if (lead) {
      const anyLead = lead as any;
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source || 'Website',
        status: lead.status,
        priority: lead.priority || 'Medium',
        assignedTo: String(lead.assignedTo || anyLead.assigned_to || ''),
        nextFollowUpDate: lead.nextFollowUpDate || anyLead.next_follow_up_date 
          ? String(lead.nextFollowUpDate || anyLead.next_follow_up_date).split(/[T ]/)[0] 
          : '',
        notes: lead.notes || '',
        division: lead.division || undefined
      });
    }
  }, [lead]);

  // 2. Mutation for create/update
  const mutation = useMutation({
    mutationFn: (data: Partial<Lead>) => isEditing ? leadService.updateLead(id!, data) : leadService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ['lead', id] });
      navigate('/marketing/leads');
    },
    onError: (error: Error) => {
      alert(`Failed to ${isEditing ? 'update' : 'create'} lead: ${error.message || 'Unknown error'}`);
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.division) newErrors.division = 'Division is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Map fields for backend (camelCase -> snake_case)
    const payload = {
      ...formData,
      assigned_to: formData.assignedTo || null, 
      next_follow_up_date: formData.nextFollowUpDate || null,
    };
    
    mutation.mutate(payload);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Lead' : 'Add New Lead'}</h1>
          <p className="text-gray-500 text-sm">Enter the lead information below accurately.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Lead Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "")})}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="+1 234 567 890"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, "")})}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Source</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none"
                    value={formData.source || 'Website'}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Direct">Direct Outreach</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Division *</label>
                <div className={`relative ${errors.division ? 'animate-bounce-subtle' : ''}`}>
                  <select 
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition-all appearance-none ${errors.division ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                    value={formData.division || ''}
                    onChange={(e) => setFormData({...formData, division: e.target.value as any})}
                  >
                    <option value="">Select Division</option>
                    <option value="Trading">Trading</option>
                    <option value="Contracting">Contracting</option>
                  </select>
                </div>
                {errors.division && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.division}</p>}
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Internal Notes</label>
              <textarea 
                placeholder="Briefly describe the lead's requirements or background..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Classification</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initial Status</label>
                <select 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={formData.status || 'New'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as LeadStatus})}
                >
                  <option value="New">New Lead</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Pending">Pending</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority Rank</label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as LeadPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${formData.priority === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-500'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Specialist</label>
                <div className="space-y-3">
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  >
                    <option value="">Select Specialist</option>
                    {users
                      .filter((u: any) => (u.role || '').toUpperCase() !== 'CLIENT')
                      .map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role ? u.role.replace('_', ' ') : 'USER'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Follow-up</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={formData.nextFollowUpDate || ''}
                  onChange={(e) => setFormData({...formData, nextFollowUpDate: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button 
                type="submit"
                disabled={mutation.isPending || isFetching}
                className="w-full bg-brand-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                {mutation.isPending ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={18} /> 
                        {isEditing ? 'Update Lead' : 'Create Lead'}
                    </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full bg-white text-gray-500 py-3 rounded-2xl font-bold border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLead;
