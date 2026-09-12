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
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los usuarios y accesos al sistema.</p>
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
          <table className="w-full text-sm text-left text-gray-600 border-collapse">
            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Nombre</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Email</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200">Empresa</th>
                <th className="px-6 py-3 font-semibold border-b border-gray-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">Cargando...</td>
                </tr>
              ) : users.map((user) => {
                const userTenant = tenants.find(t => t.id === user.tenant_id);
                return (
                  <tr key={user.id} className="bg-white border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                      <UserCircle size={24} className="text-gray-400" />
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-gray-500">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                        {userTenant ? userTenant.name : `Tenant ${user.tenant_id}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="w-8 h-8 rounded text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors flex items-center justify-center" 
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Asociada</label>
                <select 
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                  required
                >
                  <option value="" disabled>Seleccione una empresa</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && <span className="text-xs text-gray-400 font-normal">(Dejar en blanco para mantener)</span>}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full p-2.5 outline-none transition-all shadow-sm"
                  required={!editingUser}
                  minLength="6"
                />
              </div>

              <div className="px-6 py-4 flex justify-end gap-4 items-center border-t border-gray-100 -mx-6 -mb-6 mt-6 bg-gray-50/50">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
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
