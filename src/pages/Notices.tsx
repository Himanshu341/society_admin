import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Megaphone, Pencil, Trash2, Plus, X } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Notice {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/society/notices');
      setNotices(response.data);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/society/notices/${id}`);
      toast.success('Notice deleted');
      fetchNotices();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      date: notice.date.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await apiClient.put(`/society/notices/${editingNotice._id}`, formData);
        toast.success('Notice updated');
      } else {
        await apiClient.post('/society/notices', formData);
        toast.success('Notice posted');
      }
      setIsModalOpen(false);
      fetchNotices();
    } catch (error) {
      toast.error('Failed to save notice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Society Notices</h1>
          <p className="text-slate-500 text-sm">Broadcast important information to all residents.</p>
        </div>
        <button 
          onClick={() => {
            setEditingNotice(null);
            setFormData({ title: '', description: '', category: 'General', date: new Date().toISOString().split('T')[0] });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Post Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No notices posted yet.</div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className="card flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Megaphone size={20} />
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleEdit(notice)} className="p-1 text-slate-400 hover:text-primary transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(notice._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{notice.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{notice.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 text-xs">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize">{notice.category}</span>
                <span className="text-slate-400">{new Date(notice.date).toLocaleDateString()}</span>
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
                {editingNotice ? 'Edit Notice' : 'Post New Notice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Event">Event</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="input min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                ></textarea>
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
                  {editingNotice ? 'Update' : 'Post'} Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
