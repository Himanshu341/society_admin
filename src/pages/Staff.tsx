import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserRound, Plus, Pencil, Trash2, X, Phone, Briefcase, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Staff {
  _id: string;
  name: string;
  role: string;
  phone: string;
  timing: string;
  status: string;
}

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    timing: '',
    status: 'Active',
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/society/staff');
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await apiClient.delete(`/society/staff/${id}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to remove staff');
    }
  };

  const handleEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      role: s.role,
      phone: s.phone,
      timing: s.timing,
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await apiClient.put(`/society/staff/${editingStaff._id}`, formData);
        toast.success('Staff updated');
      } else {
        await apiClient.post('/society/staff', formData);
        toast.success('Staff member added');
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to save staff');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Society Staff</h1>
          <p className="text-slate-500 text-sm">Manage security, maintenance, and utility staff.</p>
        </div>
        <button 
          onClick={() => {
            setEditingStaff(null);
            setFormData({ name: '', role: '', phone: '', timing: '', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No staff members added yet.</div>
        ) : (
          staff.map((s) => (
            <div key={s._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center italic">
                      <Briefcase size={12} className="mr-1" /> {s.role}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleEdit(s)} className="p-1 text-slate-400 hover:text-primary transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 flex items-center">
                  <Phone size={14} className="mr-2 text-slate-400" /> {s.phone}
                </p>
                <p className="text-sm text-slate-600 flex items-center">
                  <Clock size={14} className="mr-2 text-slate-400" /> {s.timing}
                </p>
                <div className="mt-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingStaff ? 'Edit Staff' : 'Add New Staff Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Job Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Security Guard, Plumber"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 9 AM - 6 PM"
                    value={formData.timing}
                    onChange={(e) => setFormData({...formData, timing: e.target.value})}
                    required
                  />
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
                  {editingStaff ? 'Update' : 'Add'} Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
