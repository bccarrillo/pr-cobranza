import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, UploadCloud } from 'lucide-react';
import axios from 'axios';
import ImportModal from '../components/Import/ImportModal';

const Debtors = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchDebtors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/debtors');
      setDebtors(response.data.data || response.data);
    } catch (err) {
      console.error("Error fetching debtors:", err);
      setError("Error al cargar la lista de deudores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  const getStatusPill = (status) => {
    const map = {
      'preventive': { class: 'pill-preventive', label: 'Preventivo' },
      'early_stage': { class: 'pill-early', label: 'Mora Temprana' },
      'medium_stage': { class: 'pill-medium', label: 'Mora Media' },
      'late_stage': { class: 'pill-late', label: 'Mora Tardía' },
    };
    const mapped = map[status] || { class: 'bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold', label: status };
    return <span className={mapped.class}>{mapped.label}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Deudores</h2>
          <p className="text-light-text-secondary mt-1">Gestiona el portafolio y monitorea los estados de cuenta.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-light-text-secondary hover:bg-slate-50 transition-colors font-medium"
          >
            <UploadCloud size={18} />
            Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-light-text-secondary hover:bg-slate-50 transition-colors font-medium">
            <Download size={18} />
            Exportar
          </button>
          <button className="btn-primary">
            + Nuevo Caso
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o identificación..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-light-blue/20 focus:border-light-blue transition-all"
            />
          </div>
          <button className="p-2 rounded-lg border border-slate-200 text-light-text-secondary hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Cliente</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Identificación</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Deuda Total</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Días Mora</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Estado</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Cargando deudores...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : debtors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No hay deudores registrados.</td>
                </tr>
              ) : debtors.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-medium text-light-text-primary">{d.full_name}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-light-text-secondary">{d.identification}</td>
                  <td className="py-4 px-6 font-semibold text-light-text-primary">
                    ${parseFloat(d.current_balance || d.total_debt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-medium ${d.days_overdue > 30 ? 'text-red-500' : 'text-slate-600'}`}>
                      {d.days_overdue} {d.days_overdue === 1 || d.days_overdue === -1 ? 'día' : 'días'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusPill(d.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1 rounded-md text-slate-400 hover:text-light-blue hover:bg-light-blue-soft transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchDebtors(); // Reload table data after successful import
          alert('¡Cartera importada exitosamente! Se procesará en segundo plano.');
        }}
      />
    </div>
  );
};

export default Debtors;
