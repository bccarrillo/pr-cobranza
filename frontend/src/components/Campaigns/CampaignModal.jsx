import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Megaphone } from 'lucide-react';

const CampaignModal = ({ isOpen, onClose, tenantId, onSuccess, campaignToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    days_offset: 0,
    message_template: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (campaignToEdit) {
        setFormData({
          name: campaignToEdit.name,
          days_offset: campaignToEdit.days_offset,
          condition_type: campaignToEdit.condition_type || 'exact',
          message_template: campaignToEdit.message_template,
          is_active: campaignToEdit.is_active
        });
      } else {
        setFormData({ name: '', days_offset: 0, condition_type: 'exact', message_template: '', is_active: true });
      }
      setError(null);
    }
  }, [isOpen, campaignToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (campaignToEdit) {
        await axios.put(`/api/v1/campaigns/${campaignToEdit.id}`, formData);
      } else {
        await axios.post('/api/v1/campaigns', { ...formData, tenant_id: tenantId });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar la campaña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {campaignToEdit ? 'Editar Campaña' : 'Nueva Campaña'}
              </h3>
              <p className="text-sm text-slate-500">Configura la regla de automatización</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-white">
          {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Regla</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700"
              placeholder="Ej: Recordatorio Preventivo 3 días"
            />
            <p className="text-xs text-slate-500 mt-1">Usa números negativos para "días de atraso" y positivos para "preventivos (antes de vencer)".</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Días de desfase</label>
              <input
                type="number"
                name="days_offset"
                required
                value={formData.days_offset}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700"
                placeholder="0 = Día de vencimiento"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Ejecución</label>
              <select
                name="condition_type"
                required
                value={formData.condition_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 bg-white"
              >
                <option value="exact">Día Exacto (Una sola vez)</option>
                <option value="continuous">Continuo (Repetitivo)</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            *Días en negativo (-3) actúan como atrasos (vencieron hace 3 días). "Continuo" enviará correos diariamente a quienes superen la regla.
          </p>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plantilla del Mensaje (Email / WhatsApp)</label>
            <textarea
              name="message_template"
              required
              rows="4"
              value={formData.message_template}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 resize-none"
              placeholder="Hola {nombre}, te recordamos que tu cuota vence pronto..."
            />
            <p className="text-xs text-slate-500 mt-1">Puedes usar variables dinámicas que serán reemplazadas por la IA.</p>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="relative">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only" />
              <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="text-sm font-medium text-slate-700">
              {formData.is_active ? 'Campaña Activa' : 'Campaña Pausada'}
            </div>
          </label>
          
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-purple-200">
              {loading ? 'Guardando...' : 'Guardar Automatización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;
