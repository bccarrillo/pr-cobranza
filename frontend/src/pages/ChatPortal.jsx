import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Shield, Loader2, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';

const ChatPortal = () => {
  const { token } = useParams();
  const [debtor, setDebtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Cargar datos del deudor para personalizar la Landing Page
    const fetchDebtor = async () => {
      try {
        const response = await axios.get(`/api/v1/debtors/token/${token}`);
        setDebtor(response.data);
      } catch (err) {
        setError('No pudimos encontrar la información de tu cuenta. Por favor verifica el enlace.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebtor();

    // 2. Inyectar el script del Widget Externo
    const script = document.createElement("script");
    script.src = "https://sentient-canvas-pro.lovable.app/widget.js";
    script.setAttribute("data-channel-id", "ad2bd7af-4ac2-48f2-9a05-e1ede78a7d16");
    script.setAttribute("data-public-key", "dwk_vLm_ryd9U9d_IZtcuGZmWcLeaXQMQ5e2");
    script.setAttribute("data-title", "Asistente Virtual PR");
    script.setAttribute("data-color", "#3b82f6"); // Usamos el azul de nuestra marca
    script.setAttribute("data-welcome", "¡Hola! Estoy aquí para ayudarte a revisar tus opciones de pago. ¿En qué te puedo ayudar?");
    // Inyectamos el token como metadata (la IA puede pedirlo y el usuario copiarlo, o Lovable puede pasarlo)
    script.setAttribute("data-user-id", token);
    script.defer = true;
    
    document.body.appendChild(script);

    return () => {
      // Limpieza al desmontar la vista
      const existingScript = document.querySelector('script[src="https://sentient-canvas-pro.lovable.app/widget.js"]');
      if (existingScript) existingScript.remove();
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-light-blue mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Conectando de forma segura...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-100">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Enlace Inválido</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-light-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">PR</span>
          </div>
          <span className="font-bold text-slate-800 text-xl tracking-tight">PR Cobranza</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
          <Shield size={16} className="text-green-500" />
          <span className="hidden sm:inline">Portal de Negociación Seguro</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 md:px-12 max-w-6xl mx-auto flex-1 w-full">
        <div className="max-w-2xl">
          <p className="text-light-blue font-bold mb-2">Hola, {debtor?.full_name}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Te ayudamos a recuperar tu <span className="text-light-blue">tranquilidad financiera</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            Sabemos que los imprevistos suceden. En PR Cobranza estamos para ofrecerte soluciones justas, flexibles y a tu medida para normalizar tu estado de cuenta sin estrés.
          </p>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-light-blue flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Disponibilidad 24/7</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Nuestro asistente virtual en la esquina inferior derecha está disponible en cualquier momento.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Pagos Seguros</h3>
                <p className="text-sm text-slate-500 leading-relaxed">El asistente generará un enlace oficial para que pagues de forma segura cuando estés listo.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 sm:col-span-2 md:col-span-1 md:col-start-1">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Sin Intereses Ocultos</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Transparencia total en tus saldos. Lo que ves es lo que acuerdas pagar, sin letras pequeñas.</p>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 md:px-12 mt-auto text-sm relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PR Cobranza. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Políticas de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPortal;
