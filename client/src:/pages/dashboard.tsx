import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define our data types (matching the backend)
interface Node {
  id: number;
  nodeId: string;
  location: string;
  section: string;
  row: string;
  isOnline: boolean;
  temperature: number | null;
  humidity: number | null;
  signalStrength: number;
  lastSeen: string;
  status: string;
  batteryLevel: number | null;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Fetch nodes data with automatic updates every 5 seconds
  const { data: nodes = [] } = useQuery<Node[]>({
    queryKey: ['/api/nodes'],
    queryFn: async () => {
      const res = await fetch('/api/nodes');
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch stats data
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    uptime: string;
  }>({
    queryKey: ['/api/nodes/stats'],
    queryFn: async () => {
      const res = await fetch('/api/nodes/stats');
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Filter Nodes based on search and status
  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      searchQuery === '' ||
      node.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'online' && node.isOnline) ||
      (activeFilter === 'offline' && !node.isOnline);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/*Header*/}
      <header className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Agricultural Field Monitor
          </h1>
        </div>
      </header>

      {/* Statistics Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">Total Nodes</h2>
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.totalNodes}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">Online Nodes</h2>
            <p className="text-2xl font-bold text-green-600">
              {statsLoading ? '...' : stats?.onlineNodes}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">Offline Nodes</h2>
            <p className="text-2xl font-bold text-red-600">
              {statsLoading ? '...' : stats?.offlineNodes}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800">Uptime</h2>
            <p className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : stats?.uptime}
            </p>
          </div>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('online')}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === 'online'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setActiveFilter('offline')}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === 'offline'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>
      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNodes.map((node) => (
          <div
            key={node.id}
            className="bg-white p-4 rounded-lg shadow flex flex-col space-y-2"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  node.isOnline
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {node.isOnline ? 'Online' : 'Offline'}
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 h-3 rounded ${
                      node.isOnline && node.signalStrength >= bar
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold">{node.nodeId}</div>
              <div className="text-xs text-gray-500">{node.location}</div>
              <div className="text-xs text-gray-400">
                Section: {node.section}, Row: {node.row}
              </div>
              <div className="text-xs text-gray-400">
                Last seen: {node.lastSeen}
              </div>
              <div className="text-xs text-gray-400">
                Battery: {node.batteryLevel !== null ? `${node.batteryLevel}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-400">
                Temp: {node.temperature !== null ? `${node.temperature}°C` : 'N/A'} | Humidity: {node.humidity !== null ? `${node.humidity}%` : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 