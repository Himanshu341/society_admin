import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Plus, Pencil, Trash2, X, MapPin, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  time: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    time: '',
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/society/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await apiClient.delete(`/society/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      location: event.location,
      time: event.time,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await apiClient.put(`/society/events/${editingEvent._id}`, formData);
        toast.success('Event updated');
      } else {
        await apiClient.post('/society/events', formData);
        toast.success('Event created');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Society Events</h1>
          <p className="text-slate-500 text-sm">Plan and manage upcoming community events.</p>
        </div>
        <button 
          onClick={() => {
            setEditingEvent(null);
            setFormData({ title: '', description: '', date: '', location: '', time: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No events scheduled.</div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex flex-col items-center justify-center font-bold">
                    <span className="text-xs uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg leading-none">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{event.title}</h3>
                    <div className="flex items-center text-slate-500 text-xs space-x-3 mt-1">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> {event.time}</span>
                      <span className="flex items-center"><MapPin size={12} className="mr-1" /> {event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleEdit(event)} className="p-1 text-slate-400 hover:text-primary transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(event._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm">{event.description}</p>
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
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 6:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="input min-h-[100px]"
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
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
