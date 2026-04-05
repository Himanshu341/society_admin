import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, X, CheckCircle, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Maintenance {
  _id: string;
  userId: {
    _id: string;
    username: string;
    flat: string;
    block: string;
  };
  amount: number;
  month: string;
  status: string;
  paidDate?: string;
  createdAt: string;
}

const MaintenancePage: React.FC = () => {
  const [bills, setBills] = useState<Maintenance[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    month: '',
    status: 'Pending',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [billsRes, residentsRes] = await Promise.all([
        apiClient.get('/society/maintenance/all'),
        apiClient.get('/users/members')
      ]);
      setBills(billsRes.data);
      setResidents(residentsRes.data.filter((r: any) => r.role === 'resident'));
    } catch (error) {
      toast.error('Failed to fetch maintenance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
    const paidDate = newStatus === 'Paid' ? new Date().toISOString() : undefined;
    try {
      await apiClient.put(`/society/maintenance/${id}`, { status: newStatus, paidDate });
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/society/maintenance', formData);
      toast.success('Maintenance bill created');
      setIsModalOpen(false);
      fetchData();
      setFormData({ userId: '', amount: '', month: '', status: 'Pending' });
    } catch (error) {
      toast.error('Failed to create bill');
    }
  };

  const filteredBills = bills.filter(b => 
    b.userId?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userId?.flat?.includes(searchQuery) ||
    b.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Tracking</h1>
          <p className="text-slate-500 text-sm">Monitor and manage society maintenance payments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Bill</span>
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
            placeholder="Search by resident, flat or month..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 font-semibold text-slate-600">Resident</th>
                <th className="pb-4 font-semibold text-slate-600">Month</th>
                <th className="pb-4 font-semibold text-slate-600">Amount</th>
                <th className="pb-4 font-semibold text-slate-600">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No bills found.</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-slate-900">{bill.userId?.username}</p>
                        <p className="text-xs text-slate-500">{bill.userId?.block}-{bill.userId?.flat}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{bill.month}</td>
                    <td className="py-4 font-medium text-slate-900">₹{bill.amount}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {bill.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        <span>{bill.status}</span>
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleStatusUpdate(bill._id, bill.status)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          bill.status === 'Paid' 
                          ? 'border-slate-200 text-slate-500 hover:bg-slate-100' 
                          : 'border-primary text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        Mark as {bill.status === 'Paid' ? 'Pending' : 'Paid'}
                      </button>
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
              <h2 className="text-xl font-bold text-slate-900">Create New Bill</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Resident</label>
                <select
                  className="input"
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  required
                >
                  <option value="">Choose a resident...</option>
                  {residents.map(r => (
                    <option key={r._id} value={r._id}>{r.username} ({r.block}-{r.flat})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. May 2026"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
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
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
