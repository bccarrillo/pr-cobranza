import React from 'react';
import StatCard from '../components/Card/StatCard';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Resumen Ejecutivo</h2>
        <p className="text-light-text-secondary mt-1">Monitorea el estado general de la cobranza y la actividad del Agente IA.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Cartera Total" 
          value="$1.2M" 
          icon={DollarSign} 
          trend="up" 
          trendValue="12%"
          color="blue"
        />
        <StatCard 
          title="Recuperado (Mes)" 
          value="$345k" 
          icon={TrendingUp} 
          trend="up" 
          trendValue="8%"
          color="green"
        />
        <StatCard 
          title="Deudores Activos" 
          value="1,432" 
          icon={Users} 
          color="purple"
        />
        <StatCard 
          title="Riesgo Alto (+90 días)" 
          value="$150k" 
          icon={AlertCircle} 
          trend="down"
          trendValue="2%"
          color="red"
        />
      </div>

      {/* Chart / List Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-card flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-light-text-primary">Evolución de Recuperación</h3>
          <div className="flex-1 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-slate-50/50">
            <p className="text-light-text-secondary font-medium">Gráfico de líneas (Recharts)</p>
          </div>
        </div>
        
        <div className="glass-card flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-light-text-primary">Actividad de IA</h3>
          <div className="flex-1 space-y-4 overflow-auto pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-light-blue-soft text-light-blue flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold">IA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-primary">Acuerdo de pago cerrado</p>
                  <p className="text-xs text-light-text-secondary mt-0.5">Cliente: Juan Pérez • Hace {i * 15} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
