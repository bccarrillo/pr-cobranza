import React, { useState, useEffect } from 'react';
import { Search, Download, Banknote, Calendar } from 'lucide-react';
import axios from 'axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  
  // Utilizamos toLocaleDateString('en-CA') para forzar el formato YYYY-MM-DD respetando la zona horaria local
  const today = new Date().toLocaleDateString('en-CA');
  const [filters, setFilters] = useState({
    q: '',
    date_from: today,
    date_to: today
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchPayments();
    }
  }, [selectedTenantId]);

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

  const fetchPayments = async () => {
    if (!selectedTenantId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenant_id: selectedTenantId,
        ...(filters.q && { q: filters.q }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });
      
      const response = await axios.get(`/api/v1/payments?${params.toString()}`);
      setPayments(response.data.data || []);
    } catch (err) {
      setError("Error cargando los pagos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleExport = async () => {
    if (!selectedTenantId) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({
        tenant_id: selectedTenantId,
        ...(filters.q && { q: filters.q }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });

      const response = await axios.get(`/api/v1/payments/export?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_pagos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Hubo un error al exportar los datos.");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Append T12:00:00 to prevent timezone shifting when parsing YYYY-MM-DD
    const date = new Date(dateString + 'T12:00:00');
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-green-200">
              <Banknote size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Pagos y Recaudos</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Consulta el historial global de transacciones registradas.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block px-4 py-2 outline-none shadow-sm"
          >
            <option value="" disabled>Seleccione Empresa</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button 
            onClick={handleExport}
            disabled={exporting || !selectedTenantId}
            className={`btn-secondary ${exporting || !selectedTenantId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={18} className="mr-2" />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        
        {/* Filters Area */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4 w-full">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Search size={14}/> Buscar Deudor
              </label>
              <input 
                type="text" 
                placeholder="Nombre o Identificación..."
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full px-3 py-2 outline-none transition-all shadow-sm"
                value={filters.q}
                onChange={(e) => setFilters({...filters, q: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={14}/> Desde
              </label>
              <input 
                type="date"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full px-3 py-2 outline-none transition-all shadow-sm"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={14}/> Hasta
              </label>
              <input 
                type="date"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full px-3 py-2 outline-none transition-all shadow-sm"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedTenantId}
              className="btn-primary"
            >
              Aplicar Filtros
            </button>
          </form>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left text-gray-600 border-collapse">
            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Fecha</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Deudor</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Método</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Referencia</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200 text-right">Monto (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!selectedTenantId ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">Por favor seleccione una empresa para ver los pagos.</td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">Cargando pagos...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 flex flex-col items-center">
                    <Banknote size={32} className="mb-2 opacity-30" />
                    No se encontraron pagos con los filtros actuales.
                  </td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="bg-white border-b border-gray-100 hover:bg-blue-50/50 transition-colors group">
                  <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{payment.debtor ? payment.debtor.full_name : 'N/A'}</div>
                    <div className="text-xs text-gray-400 font-mono">{payment.debtor ? payment.debtor.identification : ''}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                      {payment.payment_method || 'Desconocido'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                    {payment.reference_number || '-'}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-green-600">
                    +{formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Payments;
