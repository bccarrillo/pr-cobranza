import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Lock, CheckCircle2, Shield, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const amount = parseFloat(queryParams.get('amount')) || 0;
  const debtorId = queryParams.get('debtor_id');

  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Basic formatters
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      setFormData({ ...formData, expiry: `${value.substring(0, 2)}/${value.substring(2, 4)}` });
    } else {
      setFormData({ ...formData, expiry: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!debtorId) {
      setStatus('error');
      setErrorMessage('Enlace de pago inválido. Falta el identificador del deudor.');
      return;
    }

    if (formData.cardNumber.length < 19 || formData.expiry.length < 5 || formData.cvc.length < 3 || !formData.name) {
      setStatus('error');
      setErrorMessage('Por favor completa todos los campos de la tarjeta correctamente.');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      // Simulate network latency for payment processor
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Make the actual API call to register the payment in the DB
      await axios.post(`/api/v1/debtors/${debtorId}/payments`, {
        amount: amount,
        payment_method: 'Tarjeta de Crédito / Enlace IA',
        reference_number: paymentId,
        notes: `Pago procesado automáticamente vía pasarela online. Tarjeta terminada en ${formData.cardNumber.slice(-4)}`
      });

      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Hubo un problema al procesar tu pago. Por favor intenta de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Pago Exitoso!</h2>
          <p className="text-slate-600 mb-6">
            Hemos procesado tu pago por <span className="font-bold text-slate-800">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> correctamente. Tu recibo será enviado por correo.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl mb-8 flex flex-col gap-2 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Referencia:</span>
              <span className="font-mono text-slate-700">{paymentId.split('_')[1] || paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/portal/${debtorId}`)}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Volver al Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Atrás
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-green-600" />
            <span className="text-sm font-medium text-slate-600">Pago Seguro 256-bit</span>
          </div>
        </div>

        {/* Checkout Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Order Summary */}
          <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <p className="text-slate-400 text-sm font-medium tracking-wide mb-2">MONTO A PAGAR</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-slate-400 text-sm mt-3">Ref: {paymentId}</p>
          </div>

          {/* Payment Form */}
          <div className="p-8">
            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre en la tarjeta</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Perez"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de tarjeta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vencimiento</label>
                  <input
                    type="text"
                    required
                    value={formData.expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">CVC</label>
                  <input
                    type="text"
                    required
                    value={formData.cvc}
                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'processing' || amount <= 0}
                className="w-full bg-light-blue hover:bg-blue-600 text-white py-4 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pagar ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center gap-6">
             <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
               <Shield size={14} /> Transacción encriptada
             </div>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          Powered by PR Cobranza Payments
        </p>
      </div>
    </div>
  );
};

export default Checkout;
