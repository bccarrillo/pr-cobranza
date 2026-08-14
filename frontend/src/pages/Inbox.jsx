import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Bot, User, PauseCircle, PlayCircle, Send, AlertTriangle } from 'lucide-react';
import ChatMessage from '../components/Chat/ChatMessage';

const Inbox = () => {
  const [debtors, setDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Poll for new debtors/chats every 5 seconds
  useEffect(() => {
    fetchDebtors();
    const interval = setInterval(fetchDebtors, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeDebtorId = useRef(null);

  // Poll for messages when a debtor is selected
  useEffect(() => {
    if (selectedDebtor) {
      activeDebtorId.current = selectedDebtor.id;
      fetchMessages(selectedDebtor.id);
      const interval = setInterval(() => fetchMessages(selectedDebtor.id), 3000);
      return () => {
        clearInterval(interval);
      };
    } else {
      activeDebtorId.current = null;
    }
  }, [selectedDebtor?.id]);

  useEffect(() => {
    // Solo auto-desplazar hacia abajo cuando cambia la cantidad de mensajes o cambiamos de chat.
    // Esto evita tirones molestos en la pantalla si el administrador está leyendo mensajes viejos.
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, selectedDebtor?.id]);

  const fetchDebtors = async () => {
    try {
      const res = await axios.get('/api/v1/inbox/debtors');
      setDebtors(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`/api/v1/inbox/debtors/${id}/messages`);
      // Prevenir race conditions: solo actualizar si el usuario sigue en este chat
      if (activeDebtorId.current === id) {
        setMessages(res.data.messages);
        setSelectedDebtor(res.data.debtor);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedDebtor) return;
    
    setSending(true);
    try {
      await axios.post(`/api/v1/inbox/debtors/${selectedDebtor.id}/messages`, {
        message: inputValue
      });
      setInputValue('');
      fetchMessages(selectedDebtor.id);
      fetchDebtors(); // update sidebar
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const toggleBot = async () => {
    if (!selectedDebtor) return;
    try {
      await axios.post(`/api/v1/inbox/debtors/${selectedDebtor.id}/toggle-bot`, {
        bot_paused: !selectedDebtor.bot_paused
      });
      setSelectedDebtor({...selectedDebtor, bot_paused: !selectedDebtor.bot_paused, requires_human: false});
      fetchDebtors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-purple-600" />
            Bitácora IA
          </h2>
          <p className="text-xs text-slate-500 mt-1">Supervisa e interviene en las conversaciones.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando chats...</div>
          ) : debtors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No hay conversaciones activas.
            </div>
          ) : (
            debtors.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDebtor(d)}
                className={`w-full text-left p-4 border-b border-slate-100 transition-colors hover:bg-slate-100 ${selectedDebtor?.id === d.id ? 'bg-purple-50 hover:bg-purple-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 truncate">{d.name}</h4>
                  {d.requires_human && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle size={10} /> AYUDA
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 truncate pr-4">{d.last_message || 'Inició el chat'}</span>
                  {d.bot_paused ? (
                    <span className="text-orange-500 font-medium shrink-0">Bot Pausado</span>
                  ) : (
                    <span className="text-green-500 font-medium shrink-0">IA Activa</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col bg-slate-50">
        {!selectedDebtor ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Selecciona una conversación para auditar.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selectedDebtor.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Deuda actual: <span className="font-semibold text-red-500">${Number(selectedDebtor.current_balance || 0).toLocaleString()}</span></span>
                  {selectedDebtor.requires_human && (
                    <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={12}/> SOLICITÓ HUMANO</span>
                  )}
                </p>
              </div>
              <button 
                onClick={toggleBot}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedDebtor.bot_paused 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {selectedDebtor.bot_paused ? (
                  <><PlayCircle size={18} /> Reactivar Bot</>
                ) : (
                  <><PauseCircle size={18} /> Pausar Bot</>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-10">No hay mensajes aún.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'user' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-sm shrink-0 ${msg.sender === 'agent' ? 'bg-purple-600 text-white' : 'bg-light-blue text-white'}`}>
                        {msg.sender === 'agent' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-slate-200 text-slate-800 rounded-tr-none' 
                        : msg.sender === 'agent'
                          ? 'bg-purple-100 border border-purple-200 text-purple-900 rounded-tl-none'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <span className="text-[10px] opacity-60 mt-1 block text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === 'agent' && ' • Tú'}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input (only enabled if bot is paused) */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
                <span>
                  {selectedDebtor.bot_paused 
                    ? "El Bot está en pausa. Estás chateando en vivo." 
                    : "El Bot responderá automáticamente. Si escribes un mensaje, el Bot se pausará automáticamente."}
                </span>
              </div>
              <form onSubmit={handleSend} className="flex gap-2 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe un mensaje al cliente..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-12"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || sending}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inbox;
