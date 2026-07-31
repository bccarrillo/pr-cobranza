import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle, Search, Plus, X } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', tenant_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsersAndTenants = async () => {
    setLoading(true);
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        axios.get('/api/v1/users'),
        axios.get('/api/v1/tenants')
      ]);
      setUsers(usersRes.data);
      setTenants(tenantsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTenants();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', // Leave empty on edit unless changing
        tenant_id: user.tenant_id 
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', tenant_id: tenants.length > 0 ? tenants[0].id : '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', tenant_id: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Construct payload
    const payload = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password; // Don't send empty password if editing
    }

    try {
      if (editingUser) {
        await axios.put(`/api/v1/users/${editingUser.id}`, payload);
      } else {
        await axios.post('/api/v1/users', payload);
      }
      fetchUsersAndTenants();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Hubo un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Usuarios</h2>
          <p className="text-light-text-secondary mt-1">Gestiona los usuarios y accesos al sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Nombre</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Email</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200">Empresa</th>
                <th className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">Cargando...</td>
                </tr>
              ) : users.map((user) => {
                const userTenant = tenants.find(t => t.id === user.tenant_id);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <UserCircle size={24} className="text-slate-400" />
                      <span className="font-medium text-light-text-primary">{user.name}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-light-text-secondary">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {userTenant ? userTenant.name : `Tenant ${user.tenant_id}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="text-light-blue text-sm font-medium hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-light-text-primary">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary mb-1">Empresa Asociada</label>
                <select 
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50 focus:border-light-blue"
                  required
                >
                  <option value="" disabled>Seleccione una empresa</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50 focus:border-light-blue"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50 focus:border-light-blue"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary mb-1">
                  Contraseña {editingUser && <span className="text-xs text-slate-400 font-normal">(Dejar en blanco para mantener)</span>}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-light-blue/50 focus:border-light-blue"
                  required={!editingUser}
                  minLength="6"
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-medium bg-light-blue hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
