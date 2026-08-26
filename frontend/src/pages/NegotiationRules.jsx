import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const NegotiationRules = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8081/api/v1/rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingRule) {
        await axios.put(`http://127.0.0.1:8081/api/v1/rules/${editingRule.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:8081/api/v1/rules', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8081/api/v1/rules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reglas de Cobranza (IA)</h2>
          <p className="text-slate-500 mt-1">Configura los descuentos y cuotas permitidas según la mora del cliente.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-light-purple text-white px-4 py-2 rounded-xl hover:bg-light-purple/90 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nueva Regla
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-purple"></div></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rango de Mora</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estrategia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descuento Max.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuotas</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No hay reglas configuradas.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {rule.min_days} a {rule.max_days} días
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {rule.strategy_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-600 font-semibold">{parseFloat(rule.max_discount_percentage)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-600">{rule.allowed_installments} máx.</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-light-blue hover:text-light-blue/80 p-2"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-500 hover:text-red-600 p-2 ml-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRule ? 'Editar Regla' : 'Nueva Regla de Negociación'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Días Mora Mínimo</label>
                  <input
                    type="number"
                    name="min_days"
                    value={formData.min_days}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Días Mora Máximo</label>
                  <input
                    type="number"
                    name="max_days"
                    value={formData.max_days}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descuento Máximo (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="max_discount_percentage"
                    value={formData.max_discount_percentage}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuotas Autorizadas</label>
                  <input
                    type="number"
                    name="allowed_installments"
                    value={formData.allowed_installments}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Estrategia</label>
                <input
                  type="text"
                  name="strategy_name"
                  value={formData.strategy_name}
                  onChange={handleInputChange}
                  placeholder="Ej: early_collection"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Prompt / Instrucción para IA (Opcional)</label>
                <textarea
                  name="ai_message_prompt"
                  value={formData.ai_message_prompt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-light-purple/20 focus:border-light-purple resize-none"
                  placeholder="Instrucciones adicionales para el agente en este rango..."
                />
                <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                  <AlertCircle size={14} className="mt-0.5" />
                  Este texto se inyectará en las reglas de la IA para condicionar su comportamiento al negociar con este segmento.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-light-purple text-white rounded-xl hover:bg-light-purple/90 transition-colors shadow-sm font-medium"
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
