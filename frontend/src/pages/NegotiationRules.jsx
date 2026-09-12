import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const NegotiationRules = () => {
  const [rules, setRules] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    min_days: 0,
    max_days: 30,
    max_discount_percentage: 0,
    allowed_installments: 1,
    strategy_name: 'default',
    ai_message_prompt: ''
  });

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/v1/tenants');
      setTenants(response.data);
      if (response.data.length > 0) {
        setSelectedTenantId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tenants', error);
    }
  };

  const fetchRules = async () => {
    if (!selectedTenantId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v1/rules?tenant_id=${selectedTenantId}`);
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchRules();
    }
  }, [selectedTenantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, tenant_id: selectedTenantId };
      
      if (editingRule) {
        await axios.put(`/api/v1/rules/${editingRule.id}`, payload);
      } else {
        await axios.post('/api/v1/rules', payload);
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule', error);
      alert('Error guardando la regla. Revisa los datos.');
    }
  };

  const openNewModal = () => {
    setEditingRule(null);
    setFormData({
      min_days: 0,
      max_days: 30,
      max_discount_percentage: 0,
      allowed_installments: 1,
      strategy_name: 'default',
      ai_message_prompt: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      min_days: rule.min_days,
      max_days: rule.max_days,
      max_discount_percentage: rule.max_discount_percentage,
      allowed_installments: rule.allowed_installments,
      strategy_name: rule.strategy_name,
      ai_message_prompt: rule.ai_message_prompt || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta regla?')) return;
    try {
      await axios.delete(`/api/v1/rules/${id}`);
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule', error);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Reglas de Cobranza (IA)</h2>
          <p className="text-sm text-gray-500 mt-1">Configura los descuentos y cuotas permitidas según la mora del cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block px-4 py-2 outline-none shadow-sm"
          >
            <option value="" disabled>Seleccione Empresa</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={openNewModal}
            disabled={!selectedTenantId}
            className={`btn-primary ${!selectedTenantId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus size={18} className="mr-2" />
            Nueva Regla
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-semibold border-b border-gray-200">Rango de Mora</th>
                  <th className="px-6 py-3 font-semibold border-b border-gray-200">Estrategia</th>
                  <th className="px-6 py-3 font-semibold border-b border-gray-200">Descuento Max.</th>
                  <th className="px-6 py-3 font-semibold border-b border-gray-200">Cuotas</th>
                  <th className="px-6 py-3 font-semibold border-b border-gray-200 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {!selectedTenantId ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      Selecciona una empresa para ver sus reglas.
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      No hay reglas configuradas para esta empresa.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="bg-white border-b border-gray-100 hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {rule.min_days} a {rule.max_days} días
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                          {rule.strategy_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-semibold">{parseFloat(rule.max_discount_percentage)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{rule.allowed_installments} máx.</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(rule)}
                            className="w-8 h-8 rounded text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors flex items-center justify-center"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="w-8 h-8 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-fade-in-up border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {editingRule ? 'Editar Regla' : 'Nueva Regla de Negociación'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días Mora Mínimo</label>
                  <input
                    type="number"
                    name="min_days"
                    value={formData.min_days}
                    onChange={handleInputChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días Mora Máximo</label>
                  <input
                    type="number"
                    name="max_days"
                    value={formData.max_days}
                    onChange={handleInputChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento Máximo (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="max_discount_percentage"
                    value={formData.max_discount_percentage}
                    onChange={handleInputChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuotas Autorizadas</label>
                  <input
                    type="number"
                    name="allowed_installments"
                    value={formData.allowed_installments}
                    onChange={handleInputChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Estrategia</label>
                <input
                  type="text"
                  name="strategy_name"
                  value={formData.strategy_name}
                  onChange={handleInputChange}
                  placeholder="Ej: early_collection"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt / Instrucción para IA (Opcional)</label>
                <textarea
                  name="ai_message_prompt"
                  value={formData.ai_message_prompt}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm resize-none"
                  placeholder="Instrucciones adicionales para el agente en este rango..."
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  Este texto se inyectará en las reglas de la IA para condicionar su comportamiento al negociar con este segmento.
                </p>
              </div>

              <div className="px-6 py-4 flex justify-end gap-4 items-center border-t border-gray-100 -mx-6 -mb-6 mt-6 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Guardar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationRules;
