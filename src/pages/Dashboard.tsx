import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bell, 
  Calendar, 
  UserRound, 
  Car, 
  AlertCircle 
} from 'lucide-react';
import apiClient from '../services/apiClient';

interface Stats {
  noticeCount: number;
  staffCount: number;
  eventCount: number;
  memberCount: number;
  pendingMaintenance: number;
  vehicleCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/society/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Residents', value: stats?.memberCount || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Total Staff', value: stats?.staffCount || 0, icon: UserRound, color: 'bg-green-500' },
    { name: 'Total Vehicles', value: stats?.vehicleCount || 0, icon: Car, color: 'bg-purple-500' },
    { name: 'Active Notices', value: stats?.noticeCount || 0, icon: Bell, color: 'bg-orange-500' },
    { name: 'Total Events', value: stats?.eventCount || 0, icon: Calendar, color: 'bg-pink-500' },
    { name: 'Pending Maintenance', value: stats?.pendingMaintenance || 0, icon: AlertCircle, color: 'bg-red-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Welcome back to the society management panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-xl shadow-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-slate-500 text-sm italic">Coming soon: Recent log of society activities...</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn btn-outline text-sm py-3">Post Notice</button>
            <button className="btn btn-outline text-sm py-3">Add Resident</button>
            <button className="btn btn-outline text-sm py-3">Create Event</button>
            <button className="btn btn-outline text-sm py-3">Add Staff</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
