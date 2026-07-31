import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, Plus, X } from 'lucide-react';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOpenModal = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({ name: tenant.name });
    } else {
      setEditingTenant(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
    setFormData({ name: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      if (editingTenant) {
        await axios.put(`/api/v1/tenants/${editingTenant.id}`, formData);
      } else {
        await axios.post('/api/v1/tenants', formData);
      }
      fetchTenants();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving tenant:", error);
      alert("Hubo un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Empresas (Tenants)</h2>
          <p className="text-light-text-secondary mt-1">Gestiona las diferentes empresas del sistema SaaS.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Empresa
        </button>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar empresa..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-light-blue/20 focus:border-light-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-slate-400">Cargando...</p>
            ) : tenants.map((tenant) => (
              <div key={tenant.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-light-blue-soft text-light-blue flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-light-text-primary">{tenant.name}</h3>
                    <p className="text-xs text-light-text-secondary">ID: {tenant.id}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 flex justify-between">
                  <span>Creado: {new Date(tenant.created_at).toLocaleDateString()}</span>
                  <button 
                    onClick={() => handleOpenModal(tenant)}
                    className="text-light-blue hover:underline font-medium"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-light-text-primary">
                {editingTenant ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary mb-2">
                  Nombre de la Empresa
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50 focus:border-light-blue transition-colors"
                  placeholder="Ej. Acme Corp"
                  required
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium bg-light-blue hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? 'Guardando...' : 'Guardar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
