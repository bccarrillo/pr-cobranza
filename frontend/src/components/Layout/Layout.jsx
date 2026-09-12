import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Layers, LayoutDashboard, Building2, User, Users,
  CreditCard, Zap, ClipboardList, Settings2, Sliders,
  Bot, LogOut, Menu, HelpCircle, Settings, ChevronDown, X
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 font-sans bg-bgLight">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-sidebarBg border-r border-borderLight flex flex-col justify-between shadow-sm z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="h-16 flex items-center px-6 border-b border-borderLight shrink-0 justify-between">
            <span className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              <Layers size={22} className="text-primary" /> PR Cobranza
            </span>
            <button 
              className="md:hidden p-1 text-slate-400 hover:text-slate-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="px-6 py-3 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Workspace</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
            <ul className="space-y-1">
              <li>
                <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <LayoutDashboard size={20} className="w-6 text-center" />
                  <span className="ml-2">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/tenants" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Building2 size={20} className="w-6 text-center" />
                  <span className="ml-2">Empresas</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/users" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <User size={20} className="w-6 text-center" />
                  <span className="ml-2">Usuarios</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/debtors" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Users size={20} className="w-6 text-center" />
                  <span className="ml-2">Deudores</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/payments" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <CreditCard size={20} className="w-6 text-center" />
                  <span className="ml-2">Pagos y Recaudos</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/campaigns" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Zap size={20} className="w-6 text-center" />
                  <span className="ml-2">Automatizaciones</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/inbox" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <ClipboardList size={20} className="w-6 text-center" />
                  <span className="ml-2">Bitácora IA</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/rules" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Settings2 size={20} className="w-6 text-center" />
                  <span className="ml-2">Reglas de Cobranza</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Sliders size={20} className="w-6 text-center" />
                  <span className="ml-2">Configuración</span>
                </NavLink>
              </li>
              
              {/* Separator line */}
              <li className="my-3 px-6">
                <div className="h-px bg-gray-100"></div>
              </li>
              
              <li>
                <NavLink to="/ai-integration" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `sidebar-item flex items-center px-6 py-2.5 text-sm ${isActive ? 'active' : 'text-secondary'}`}>
                  <Bot size={20} className="w-6 text-center" />
                  <span className="ml-2">Integración IA</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Logout area */}
          <div className="border-t border-borderLight p-4 shrink-0">
            <button className="flex w-full items-center px-2 py-2 text-secondary text-sm font-medium hover:text-red-600 transition-colors rounded-md hover:bg-red-50">
              <LogOut size={20} className="w-6 text-center" />
              <span className="ml-2">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-bgLight">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-borderLight flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 text-lg font-bold text-primary">PR Cobranza</span>
          </div>
          
          <div className="hidden md:flex flex-1">
            {/* Opcional: Breadcrumbs o barra de búsqueda global */}
          </div>

          {/* Right side Header items */}
          <div className="flex items-center space-x-3">
            {/* Help / Support */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors">
              <HelpCircle size={18} />
            </button>

            {/* Settings */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors">
              <Settings size={18} />
            </button>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* User Profile Dropdown trigger */}
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-none">Admin Usuario</p>
                <p className="text-[10px] text-gray-500 mt-0.5">admin@prcobranza.com</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1 hidden md:block" />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto relative custom-scrollbar p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
        
        {/* FOOTER */}
        <footer className="bg-white border-t border-borderLight p-4 shrink-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <div>
              <span className="font-medium text-gray-600">PR Cobranza</span> &copy; 2026. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                Soporte
              </a>
              <a href="#" className="hover:text-primary transition-colors">Términos de servicio</a>
              <a href="#" className="hover:text-primary transition-colors">Políticas de privacidad</a>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">v1.2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
