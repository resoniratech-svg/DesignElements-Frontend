import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Briefcase,
  Clock,
  Settings2,
  Calendar,
  ShoppingBag,
  Calculator,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import ClientAutocomplete from '../../components/forms/ClientAutocomplete';
import ManagerAutocomplete from '../../components/forms/ManagerAutocomplete';

const sectors = [

  {
    id: 'trading',
    title: 'Trading Sector',
    icon: ShoppingBag,
    description: 'Product supply and material procurement',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  {
    id: 'contracting',
    title: 'Contracting Sector',
    icon: Calculator,
    description: 'EPC and construction projects',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  }
];

const CreateProject = () => {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState('trading');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    manager: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    uploadedDocument: null as File | string | null
  });

  // Reset dependent fields when sector changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      client: prev.client,
      manager: prev.manager
    }));
  }, [selectedSector]);



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!formData.client.trim()) {
      setErrorMsg("Client is required");
      return;
    }

    setErrorMsg(null);

    try {
      // Map frontend form fields to PostgreSQL column names
      const payload = {
        project_name: formData.name,
        client_name: formData.client,
        contract_value: parseFloat(String(formData.budget).replace(/[^0-9.]/g, "")) || 0,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        manager: formData.manager || null,
        description: formData.description || null,
        division: selectedSector || null,
        status: formData.status || 'Active',
      };

      await projectService.createProject(payload);
      setSuccessMsg(`Project "${formData.name}" created successfully! Redirecting...`);
      setTimeout(() => navigate('/admin/projects'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create project.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/projects')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-500 text-sm">Fill in the details to launch a new project</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/projects')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            form="project-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSubmitting ? 'Saving...' : 'Create Project'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Sector</h2>
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isSelected = selectedSector === sector.id;
            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                  ? `${sector.border} ${sector.bg} ring-2 ring-offset-2 ring-indigo-500`
                  : 'border-white bg-white hover:border-gray-200 shadow-sm'
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-white shadow-sm' : sector.bg}`}>
                    <Icon className={`h-6 w-6 ${sector.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isSelected ? sector.color : 'text-gray-900'}`}>
                      {sector.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{sector.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Project Details Form */}
        <div className="lg:col-span-2">
          <form id="project-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {errorMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Annual AC Maintenance 2024"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe the project scope and objectives..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <div className="relative">
                    <ClientAutocomplete
                      value={formData.client}
                      onChange={(name) => setFormData({ ...formData, client: name })}
                      division={selectedSector}
                      placeholder="Search or specify client"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Manager
                  </label>
                  <div className="relative">
                    <ManagerAutocomplete
                      value={formData.manager}
                      onChange={(name) => setFormData({ ...formData, manager: name })}
                      division={selectedSector}
                      placeholder="Search or specify manager"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Estimated)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (QAR)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g. 250,000"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Status
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white font-medium"
                    >
                      <option value="Active">Active Project</option>
                      <option value="COMPLETED">Inactive Completed</option>
                      <option value="Cancelled">Inactive Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200" style={{ borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
              <div className="flex items-start space-x-3">
                <Settings2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">Project Configuration</p>
                  <p>All project data will be initialized based on the selected sector specifications and standard operating procedures.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
