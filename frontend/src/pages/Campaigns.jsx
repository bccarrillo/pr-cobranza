import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Edit2, Play, Pause } from 'lucide-react';
import CampaignModal from '../components/Campaigns/CampaignModal';

const Campaigns = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchCampaigns();
    }
  }, [selectedTenantId]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/v1/tenants');
      setTenants(response.data);
      if (response.data.length > 0) {
        setSelectedTenantId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchCampaigns = async () => {
    if (!selectedTenantId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/campaigns?tenant_id=${selectedTenantId}`);
      setCampaigns(response.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (id) => {
    try {
      await axios.patch(`/api/v1/campaigns/${id}/toggle`);
      fetchCampaigns(); // Refresh list to get updated status
    } catch (err) {
      console.error("Error toggling campaign:", err);
      alert("Error al cambiar estado de la campaña");
    }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta automatización permanentemente?")) return;
    try {
      await axios.delete(`/api/v1/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Error al eliminar la campaña");
    }
  };

  const handleOpenCreate = () => {
    setCampaignToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign) => {
    setCampaignToEdit(campaign);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Megaphone size={24} />
            </div>
            <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Automatizaciones</h2>
          </div>
          <p className="text-light-text-secondary mt-1">Gestiona las reglas de envíos masivos y recordatorios programados.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
          >
            <option value="" disabled>Seleccione Empresa</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button 
            onClick={handleOpenCreate}
            disabled={!selectedTenantId}
            className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium transition-colors shadow-sm shadow-purple-200 ${!selectedTenantId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
          >
            <Plus size={18} />
            Nueva Regla
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden border border-slate-200/50 shadow-sm">
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          {!selectedTenantId ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Megaphone size={48} className="mb-4 opacity-30" />
              <p>Seleccione una empresa para ver sus automatizaciones.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Megaphone size={48} className="mb-4 opacity-30" />
              <p className="font-medium text-lg text-slate-500">Sin reglas configuradas</p>
              <p className="text-sm">Cree su primera automatización para enviar correos masivos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <div key={campaign.id} className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${campaign.is_active ? 'border-purple-200 shadow-purple-100/50' : 'border-slate-200 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${campaign.is_active ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                        {campaign.is_active ? <Play size={20} /> : <Pause size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{campaign.name}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {campaign.is_active ? 'Activa' : 'Pausada'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Configuración:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-mono text-sm">
                        {campaign.days_offset > 0 ? `+${campaign.days_offset}` : campaign.days_offset}
                      </span>
                      <span className="text-sm text-slate-500">
                        {campaign.days_offset === 0 ? '(El mismo día)' : campaign.days_offset < 0 ? 'días de atraso' : 'días antes de vencer'}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${campaign.condition_type === 'continuous' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {campaign.condition_type === 'continuous' ? 'Continuo (Repetitivo)' : 'Día Exacto (Una vez)'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Plantilla:</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                      {campaign.message_template}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => toggleCampaign(campaign.id)}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${campaign.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {campaign.is_active ? 'Pausar' : 'Activar'}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(campaign)} className="p-2 text-light-blue hover:bg-light-blue-soft rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteCampaign(campaign.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        tenantId={selectedTenantId}
        campaignToEdit={campaignToEdit}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCampaigns();
        }}
      />
    </div>
  );
};

export default Campaigns;
