import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, Search, X } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Resident {
  _id: string;
  username: string;
  email: string;
  apartment: string;
  flat: string;
  block: string;
  role: string;
}

const Residents: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    flat: '',
    block: '',
    role: 'resident',
  });

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users/members');
      setResidents(response.data);
    } catch (error) {
      toast.error('Failed to fetch residents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resident?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success('Resident deleted successfully');
      fetchResidents();
    } catch (error) {
      toast.error('Failed to delete resident');
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      username: resident.username,
      email: resident.email,
      flat: resident.flat || '',
      block: resident.block || '',
      role: resident.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResident) {
        await apiClient.put(`/users/${editingResident._id}`, formData);
        toast.success('Resident updated successfully');
      } else {
        await apiClient.post('/users/register', { ...formData, password: 'password123' });
        toast.success('Resident added successfully (default password: password123)');
      }
      setIsModalOpen(false);
      fetchResidents();
      setFormData({ username: '', email: '', flat: '', block: '', role: 'resident' });
      setEditingResident(null);
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to save resident');
    }
  };

  const filteredResidents = residents.filter(r => 
    r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.flat?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Residents Management</h1>
          <p className="text-slate-500 text-sm">Manage society members and their roles.</p>
        </div>
        <button 
          onClick={() => {
            setEditingResident(null);
            setFormData({ username: '', email: '', flat: '', block: '', role: 'resident' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <UserPlus size={18} />
          <span>Add Resident</span>
        </button>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name, email or flat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 font-semibold text-slate-600">Resident</th>
                <th className="pb-4 font-semibold text-slate-600">Unit</th>
                <th className="pb-4 font-semibold text-slate-600">Role</th>
                <th className="pb-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">No residents found.</td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident._id} className="hover:bg-slate-50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {resident.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{resident.username}</p>
                          <p className="text-xs text-slate-500">{resident.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {resident.block}-{resident.flat}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resident.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {resident.role}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(resident)}
                          className="p-1 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(resident._id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingResident ? 'Edit Resident' : 'Add New Resident'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Block</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.block}
                    onChange={(e) => setFormData({...formData, block: e.target.value})}
                    placeholder="e.g. A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Flat No.</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.flat}
                    onChange={(e) => setFormData({...formData, flat: e.target.value})}
                    placeholder="e.g. 101"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    className="input"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingResident ? 'Update' : 'Add'} Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;
