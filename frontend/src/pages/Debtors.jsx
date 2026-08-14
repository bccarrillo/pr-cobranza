import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, UploadCloud, Plus, Receipt, Bot, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ImportModal from '../components/Import/ImportModal';
import DebtorModal from '../components/Debtor/DebtorModal';
import PaymentHistoryModal from '../components/Debtor/PaymentHistoryModal';
import InteractionHistoryModal from '../components/Debtor/InteractionHistoryModal';

const Debtors = () => {
  const [debtors, setDebtors] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [filterRequiresHuman, setFilterRequiresHuman] = useState(false);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/v1/tenants');
      setTenants(response.data);
      if (response.data.length > 0) {
        setSelectedTenantId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchDebtors = async () => {
    if (!selectedTenantId) {
      setDebtors([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/debtors?tenant_id=${selectedTenantId}`);
      setDebtors(response.data.data || []);
    } catch (err) {
      setError("Error cargando la cartera");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchDebtors();
    }
  }, [selectedTenantId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`/api/v1/debtors/export?tenant_id=${selectedTenantId}`, {
        responseType: 'blob', // Necesario para descargar archivos
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cartera_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Error exporting:", err);
      alert("Error al exportar los datos.");
    } finally {
      setExporting(false);
    }
  };

  const getStatusPill = (status) => {
    const map = {
      'preventive': { class: 'pill-preventive', label: 'Preventivo' },
      'early_stage': { class: 'pill-early', label: 'Mora Temprana' },
      'medium_stage': { class: 'pill-medium', label: 'Mora Media' },
      'late_stage': { class: 'pill-late', label: 'Mora Tardía' },
      'requires_human': { class: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200 animate-pulse', label: 'Requiere Humano' },
      'pending': { class: 'bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold', label: 'Pendiente' },
    };
    const mapped = map[status] || { class: 'bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold', label: status };
    return <span className={mapped.class}>{mapped.label}</span>;
  };

  const displayedDebtors = filterRequiresHuman 
    ? debtors.filter(d => d.status === 'requires_human') 
    : debtors;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Deudores</h2>
          <p className="text-light-text-secondary mt-1">Gestiona el portafolio y monitorea los estados de cuenta.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-light-blue/20 focus:border-light-blue"
          >
            <option value="" disabled>Seleccione Empresa</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsDebtorModalOpen(true)}
            disabled={!selectedTenantId}
            className="flex items-center gap-2 px-4 py-2 bg-light-blue rounded-lg text-white hover:bg-blue-600 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            Nuevo Caso
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-light-text-secondary hover:bg-slate-50 transition-colors font-medium"
          >
            <UploadCloud size={18} />
            Importar
          </button>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-light-text-secondary hover:bg-slate-50 transition-colors font-medium disabled:opacity-70"
          >
            <Download size={18} />
            {exporting ? 'Exportando...' : 'Exportar'}
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
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterRequiresHuman(!filterRequiresHuman)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${filterRequiresHuman ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <AlertCircle size={16} />
              {filterRequiresHuman ? 'Mostrando Handoff' : 'Atención Requerida'}
            </button>
            <button className="p-2 rounded-lg border border-slate-200 text-light-text-secondary hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Cliente</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Identificación</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Saldo Actual</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Correo</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Fecha Venc.</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Días Mora</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Estado</th>
                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!selectedTenantId ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">Por favor seleccione una empresa para ver sus deudores.</td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">Cargando datos...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : displayedDebtors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">No hay deudores que coincidan con la búsqueda.</td>
                </tr>
              ) : displayedDebtors.map((d) => (
                <tr key={d.id} className={`transition-colors group ${d.status === 'requires_human' ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50/50'}`}>
                  <td className="py-4 px-6">
                    <p className="font-medium text-light-text-primary">{d.full_name}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-light-text-secondary">{d.identification}</td>
                  <td className="py-4 px-6 font-semibold text-light-text-primary">
                    ${parseFloat(d.current_balance || d.total_debt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-sm text-light-text-secondary">
                    {d.email || <span className="text-slate-300 italic">Sin correo</span>}
                  </td>
                  <td className="py-4 px-6 text-sm text-light-text-secondary">
                    {d.due_date ? d.due_date.substring(0, 10) : <span className="text-slate-300 italic">Sin fecha</span>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-medium ${d.days_overdue > 30 ? 'text-red-500' : 'text-slate-600'}`}>
                      {d.days_overdue} {d.days_overdue === 1 || d.days_overdue === -1 ? 'día' : 'días'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusPill(d.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setSelectedDebtor(d);
                          setIsInteractionModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-purple-500 transition-colors"
                        title="Ver Bitácora IA"
                      >
                        <Bot size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedDebtor(d);
                          setIsPaymentModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-green-500 transition-colors"
                        title="Ver Pagos"
                      >
                        <Receipt size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedDebtor(d);
                          setIsDebtorModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                        title="Editar Registro"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
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
        tenantId={selectedTenantId}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchDebtors(); // Reload table data after successful import
          alert('¡Cartera importada exitosamente! Se procesará en segundo plano.');
        }}
      />

      {/* Nuevo/Editar Caso Modal */}
      <DebtorModal 
        isOpen={isDebtorModalOpen}
        onClose={() => {
          setIsDebtorModalOpen(false);
          setSelectedDebtor(null);
        }}
        tenantId={selectedTenantId}
        debtorToEdit={selectedDebtor}
        onSuccess={() => {
          setIsDebtorModalOpen(false);
          setSelectedDebtor(null);
          fetchDebtors(); // Reload table data
        }}
      />

      {/* Historial de Pagos Modal */}
      <PaymentHistoryModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedDebtor(null);
        }}
        debtor={selectedDebtor}
        onSuccess={() => fetchDebtors()}
      />

      {/* Bitácora de Interacciones IA Modal */}
      {isInteractionModalOpen && selectedDebtor && (
        <InteractionHistoryModal
          debtor={selectedDebtor}
          onClose={() => {
            setIsInteractionModalOpen(false);
            setSelectedDebtor(null);
          }}
        />
      )}
    </div>
  );
};

export default Debtors;
