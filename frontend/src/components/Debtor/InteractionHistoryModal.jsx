import { useState, useEffect } from 'react';

const InteractionHistoryModal = ({ debtor, onClose }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchInteractions();
  }, [debtor]);

  const fetchInteractions = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/debtors/${debtor.id}/interactions`);
      if (!response.ok) throw new Error('Error al cargar historial de interacciones');
      const data = await response.json();
      setInteractions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'promise_to_pay':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold">Promesa de Pago</span>;
      case 'requires_human':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold">Requiere Humano</span>;
      case 'refusal':
        return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-semibold">Negativa</span>;
      case 'notification_sent':
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">Notificación Enviada</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">{outcome}</span>;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      default:
        return '🤖';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bitácora de IA</h2>
            <p className="text-sm text-slate-500">Historial de interacciones con {debtor.full_name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-slate-700">Sin Interacciones</h3>
              <p className="text-slate-500">El agente IA aún no ha interactuado con este deudor.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute w-8 h-8 bg-white border-2 border-slate-200 rounded-full -left-[17px] top-0 flex items-center justify-center text-sm shadow-sm">
                    {getChannelIcon(interaction.channel)}
                  </div>
                  
                  {/* Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(interaction.outcome)}
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(interaction.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{interaction.summary}</p>
                    
                    {/* Expandable Transcript */}
                    {interaction.metadata && interaction.metadata.transcript && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60">
                        <button 
                          onClick={() => setExpandedId(expandedId === interaction.id ? null : interaction.id)}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          {expandedId === interaction.id ? 'Ocultar Transcripción' : 'Ver Transcripción Completa'}
                          <svg className={`w-4 h-4 transform transition-transform ${expandedId === interaction.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedId === interaction.id && (
                          <div className="mt-2 bg-slate-800 text-slate-300 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {interaction.metadata.transcript}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractionHistoryModal;
