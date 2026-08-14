import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, X } from 'lucide-react';

const DebtorModal = ({ isOpen, onClose, onSuccess, tenantId, debtorToEdit = null }) => {
  const [formData, setFormData] = useState({
    identification: '',
    full_name: '',
    total_debt: '',
    email: '',
    phone: '',
    due_date: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (debtorToEdit) {
      setFormData({
        identification: debtorToEdit.identification || '',
        full_name: debtorToEdit.full_name || '',
        total_debt: debtorToEdit.total_debt || '',
        email: debtorToEdit.email || '',
        phone: debtorToEdit.phone || '',
        due_date: debtorToEdit.due_date ? debtorToEdit.due_date.split('T')[0] : ''
      });
    } else {
      setFormData({
        identification: '',
        full_name: '',
        total_debt: '',
        email: '',
        phone: '',
        due_date: ''
      });
    }
  }, [debtorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tenantId && !debtorToEdit) {
      setError("Debes seleccionar una empresa primero.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (debtorToEdit) {
        await axios.put(`/api/v1/debtors/${debtorToEdit.id}`, formData);
      } else {
        await axios.post('/api/v1/debtors', { ...formData, tenant_id: tenantId });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Hubo un error al guardar el deudor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-light-text-primary">
            {debtorToEdit ? 'Editar Deudor' : 'Nuevo Caso (Deudor)'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[70vh]">
          {error && <div className="mb-4 text-sm text-red-500 font-medium">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-text-secondary mb-1">Identificación (DNI/NIT)</label>
            <input 
              type="text" 
              value={formData.identification}
              onChange={(e) => setFormData({...formData, identification: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-text-secondary mb-1">Nombre Completo / Razón Social</label>
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50"
              required
            />
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary mb-1">Deuda Original (Inicial)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.total_debt}
                onChange={(e) => setFormData({...formData, total_debt: e.target.value})}
                disabled={!!debtorToEdit}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-light-blue/50 ${
                  debtorToEdit 
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-white border-slate-300'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-secondary mb-1">Fecha Venc.</label>
              <input 
                type="date" 
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary mb-1">Teléfono</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-secondary mb-1">Correo (Opcional)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg font-medium bg-light-blue hover:bg-blue-600 text-white shadow-md transition-colors flex items-center gap-2"
            >
              {saving ? 'Guardando...' : debtorToEdit ? 'Guardar Cambios' : 'Crear Caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtorModal;
