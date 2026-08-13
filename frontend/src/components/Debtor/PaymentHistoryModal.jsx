import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Receipt, Calendar, CreditCard, Banknote, Plus } from 'lucide-react';

const PaymentHistoryModal = ({ isOpen, onClose, debtor, onSuccess }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Nuevo estado para el formulario
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: '',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && debtor) {
      fetchPayments();
    }
  }, [isOpen, debtor]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/debtors/${debtor.id}/payments`);
      setPayments(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el historial de pagos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post(`/api/v1/debtors/${debtor.id}/payments`, formData);
      setFormData({ amount: '', payment_method: '', reference_number: '', notes: '' });
      setShowForm(false);
      fetchPayments();
      if (onSuccess) onSuccess(); // Recargar tabla principal para ver el nuevo saldo
    } catch (err) {
      console.error(err);
      setError('Error al registrar el abono.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-light-text-primary">Historial de Pagos</h3>
              <p className="text-sm text-slate-500">{debtor?.full_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-light-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              {showForm ? 'Cancelar' : 'Nuevo Abono'}
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {showForm && (
            <form onSubmit={handleRegisterPayment} className="bg-white p-5 rounded-xl border border-light-blue/30 shadow-sm mb-6">
              <h4 className="font-bold text-slate-800 mb-4">Registrar Nuevo Abono</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monto (COP)</label>
                  <input type="number" required min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700" placeholder="Ej: 50000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Método de Pago</label>
                  <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    <option value="">Seleccionar...</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Pasarela de Pago">Pasarela de Pago (Stripe/Wompi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Número de Referencia</label>
                  <input type="text" value={formData.reference_number} onChange={(e) => setFormData({...formData, reference_number: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700" placeholder="# Comprobante" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas</label>
                  <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700" placeholder="Detalles adicionales" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm flex items-center gap-2">
                  {saving ? 'Guardando...' : 'Confirmar Abono'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-light-blue/30 border-t-light-blue rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-lg text-center font-medium">
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Banknote size={48} className="mb-4 opacity-50" />
              <p className="font-medium text-lg text-slate-500">Sin pagos registrados</p>
              <p className="text-sm text-slate-400">El deudor aún no ha realizado ningún abono.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold tracking-wide uppercase">
                        Abono
                      </div>
                      <span className="text-slate-400 text-sm">#{payment.id}</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{formatDate(payment.payment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <CreditCard size={16} className="text-slate-400" />
                      <span>{payment.payment_method || 'N/A'}</span>
                    </div>
                  </div>

                  {(payment.reference_number || payment.notes) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 text-sm rounded-b-xl text-slate-600">
                      {payment.reference_number && (
                        <p className="mb-1"><span className="font-medium">Ref:</span> {payment.reference_number}</p>
                      )}
                      {payment.notes && (
                        <p className="text-slate-500 italic">"{payment.notes}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Total abonado: <span className="font-bold text-slate-800">
              {formatCurrency(payments.reduce((sum, p) => sum + parseFloat(p.amount), 0))}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;
