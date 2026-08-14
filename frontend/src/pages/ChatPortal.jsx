import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Bot, Shield, Loader2, AlertCircle, CheckCircle, Clock, CreditCard, ChevronDown, MessageSquare } from 'lucide-react';
import ChatMessage from '../components/Chat/ChatMessage';

const ChatPortal = () => {
  const { id } = useParams();
  const [debtor, setDebtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // En móviles empieza cerrado para que vean la landing page, en PC empieza abierto
  const [isChatOpen, setIsChatOpen] = useState(window.innerWidth >= 640);
  const messagesEndRef = useRef(null);

  // Fetch debtor info on load
  useEffect(() => {
    const fetchDebtor = async () => {
      try {
        const response = await axios.get(`/api/v1/debtors/${id}`);
        setDebtor(response.data);
        
        // Initial bot message greeting the user by name
        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: `¡Hola ${response.data.full_name}! Soy el Asistente Virtual de PR Cobranza. Estoy aquí para ayudarte a revisar tu estado de cuenta y encontrar las mejores opciones de pago.\n\nHe verificado que tu saldo actual es de $${parseFloat(response.data.financials.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}.\n\n¿En qué te puedo ayudar hoy?`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }
        ]);
        
      } catch (err) {
        setError('No pudimos encontrar la información de tu cuenta. Por favor verifica el enlace.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebtor();
  }, [id]);

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isChatOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // TODO: Here we will connect to the AI Orchestrator API
    // For now, simulate a response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'En este momento nuestro motor de Inteligencia Artificial está siendo integrado. Pronto podré procesar tu solicitud y ofrecerte acuerdos de pago dinámicos.',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

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
      
      {/* CORPORATE LANDING PAGE */}
      
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
                <p className="text-sm text-slate-500 leading-relaxed">Nuestro asistente virtual está disponible en cualquier momento para guiarte en tu proceso.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Pagos Seguros</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Múltiples opciones de pago con confirmación inmediata y seguridad bancaria garantizada.</p>
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
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800">¿Listo para empezar?</p>
              <p className="text-xs text-slate-500 mt-0.5">Habla con tu asesor virtual ahora mismo.</p>
            </div>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setIsChatOpen(true); }}
              className="bg-light-blue text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-md hover:bg-blue-600 transition-colors w-full sm:w-auto"
            >
              Abrir Asistente
            </button>
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


      {/* FLOATING CHAT WIDGET */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] z-50 shadow-2xl">
          
          {/* Chat Box */}
          <div className="bg-white sm:rounded-2xl flex flex-col h-[100dvh] sm:h-[600px] sm:max-h-[80vh] border border-slate-200 overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-light-blue px-4 py-4 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Bot className="text-white" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Asistente Virtual IA</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs font-medium text-blue-100">En línea</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setIsChatOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 mb-6 bg-white py-1.5 px-3 rounded-full border border-slate-100 shadow-sm mx-auto w-max">
                <Shield size={12} className="text-green-500" />
                CONEXIÓN ENCRIPTADA
              </div>
              
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} isWidget={true} />
              ))}

              {isTyping && (
                <div className="flex w-full mb-4 justify-start">
                  <div className="w-7 h-7 rounded-full bg-light-blue text-white flex items-center justify-center mr-2 shadow-md flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-white border-t border-slate-100 p-3 pb-safe">
              <form 
                onSubmit={handleSend}
                className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-light-blue/20 focus-within:border-light-blue transition-all"
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 max-h-24 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-slate-700 text-[14px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-light-blue hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-light-blue text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (when chat is closed) */}
      {!isChatOpen && (
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); setIsChatOpen(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-light-blue hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 z-40 group"
        >
          <MessageSquare size={24} />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatPortal;
