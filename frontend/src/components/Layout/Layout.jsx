import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Building2, UserCircle, UploadCloud, Bot, Banknote, Megaphone, Menu, X } from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-light-bg text-light-text-primary font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphism */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-white/90 md:bg-white/70 backdrop-blur-md border-r border-slate-200/80 flex flex-col transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-light-blue to-light-purple">
              PR Cobranza
            </h1>
            <p className="text-xs text-light-text-secondary mt-1 tracking-wider uppercase font-semibold">Workspace</p>
          </div>
          <button 
            className="md:hidden p-1 text-slate-400 hover:text-slate-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto pb-4">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-light-blue-soft text-light-blue shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tenants"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-light-blue-soft text-light-blue shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <Building2 size={20} />
            <span>Empresas</span>
          </NavLink>

          <NavLink
            to="/users"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-light-blue-soft text-light-blue shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <UserCircle size={20} />
            <span>Usuarios</span>
          </NavLink>

          <NavLink
            to="/debtors"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-light-blue-soft text-light-blue shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <Users size={20} />
            <span>Deudores</span>
          </NavLink>

          <NavLink
            to="/payments"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-green-50 text-green-600 shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <Banknote size={20} />
            <span>Pagos y Recaudos</span>
          </NavLink>

          <NavLink
            to="/campaigns"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-purple-50 text-purple-600 shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <Megaphone size={20} />
            <span>Automatizaciones</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-slate-200 text-slate-800 shadow-sm'
                  : 'text-light-text-secondary hover:bg-slate-100 hover:text-light-text-primary'
              }`
            }
          >
            <Settings size={20} />
            <span>Configuración</span>
          </NavLink>

          <NavLink
            to="/ai-integration"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mt-4 border border-dashed border-slate-200 ${
                isActive
                  ? 'bg-light-purple-soft/50 text-light-purple border-light-purple/30 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-light-purple'
              }`
            }
          >
            <Bot size={20} />
            <span>Integración IA</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-200/80 mt-auto bg-white/50">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-light-text-secondary hover:bg-red-50 hover:text-red-500 font-medium">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center text-light-text-secondary">
            <button 
              className="md:hidden p-2 mr-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            {/* Breadcrumbs placeholder or Search bar */}
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-light-text-secondary">
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-light-blue to-light-purple flex items-center justify-center text-white font-bold shadow-md text-sm md:text-base">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-light-blue-soft rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-light-purple-soft rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-0 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
