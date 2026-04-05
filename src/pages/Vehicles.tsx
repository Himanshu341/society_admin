import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Car, Search, User } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Vehicle {
  _id: string;
  userId: {
    username: string;
    flat: string;
    block: string;
  };
  model: string;
  plate: string;
  type: string;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      // We need a route for all vehicles in the societyController or use the resident ones
      // For now, let's assume getVehicles returns all if called by admin, 
      // but wait, the controller only returns for req.user.id.
      // Let's create a new route in backend for all vehicles.
      const response = await apiClient.get('/society/vehicles/all');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.userId?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vehicle Registry</h1>
        <p className="text-slate-500 text-sm">All vehicles registered by society residents.</p>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by plate number, model or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 font-semibold text-slate-600">Vehicle</th>
                <th className="pb-4 font-semibold text-slate-600">Plate Number</th>
                <th className="pb-4 font-semibold text-slate-600">Owner</th>
                <th className="pb-4 font-semibold text-slate-600">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">No vehicles found.</td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-slate-50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                          <Car size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{vehicle.model}</p>
                          <p className="text-xs text-slate-500 capitalize">{vehicle.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded font-mono text-sm tracking-wider">
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <User size={14} className="mr-2 opacity-50" />
                        {vehicle.userId?.username}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {vehicle.userId?.block}-{vehicle.userId?.flat}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
