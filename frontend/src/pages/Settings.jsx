import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Send } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${baseUrl}/api/v1/settings/test-email`, { email });
      
      setStatus('success');
      setMessage(response.data.message || '¡Correo enviado exitosamente!');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Ocurrió un error al intentar enviar el correo. Verifica las credenciales SMTP en tu servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Configuración</h2>
        <p className="text-light-text-secondary mt-1">Administra los parámetros técnicos del sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel SMTP */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Prueba de Servidor SMTP</h3>
              <p className="text-sm text-slate-500">Valida que el sistema pueda enviar correos automáticos.</p>
            </div>
          </div>

          <form onSubmit={handleTestEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico de Destino
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={18} />
                  Enviar Correo de Prueba
                </>
              )}
            </button>
          </form>

          {/* Status Message */}
          {status && (
            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 border ${
              status === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {status === 'success' ? <CheckCircle className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
              <p className="text-sm font-medium leading-relaxed">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
