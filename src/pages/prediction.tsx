import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, MapPin, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRecentEmergencies, generateRiskPredictions, EmergencyReport, EmergencyPrediction } from '../lib/emergencyUtils';
import { supabase, TABLES } from '../lib/supabase';

export function PredictionPage() {
  const { user } = useAuth();
  const [selectedArea] = useState('Kothrud');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyPredictions, setEmergencyPredictions] = useState<EmergencyPrediction[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<EmergencyReport[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get recent emergencies
      const emergencies = await getRecentEmergencies(20);
      setRecentEmergencies(emergencies);
      
      // Generate predictions based on recent emergencies
      const predictions = generateRiskPredictions(emergencies);
      setEmergencyPredictions(predictions);
    } catch (error) {
      console.error('Error loading prediction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    
    // Supabase real-time subscription
    const channel = supabase.channel('realtime_emergencies')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.EMERGENCIES }, () => {
        loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Emergency Predictions</h1>
            <p className="text-gray-600 mt-1">AI-powered risk assessment and analysis</p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Area Selection */}
      <div className="p-6">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Selected Area</h2>
              <p className="text-red-500">{selectedArea}, Pune</p>
            </div>
            <MapPin className="text-red-500 w-6 h-6" />
          </div>
          
          <div className="flex gap-2">
            {['24h', '48h', '7d'].map((time) => (
              <button
                key={time}
                onClick={() => setTimeRange(time)}
                className={`px-4 py-2 rounded-full text-sm ${
                  timeRange === time
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Predictions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading predictions...</p>
            </div>
          ) : emergencyPredictions.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No risk predictions available</p>
              <p className="text-sm text-gray-400">Submit emergency reports to generate predictions</p>
            </div>
          ) : (
            emergencyPredictions.map((prediction, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      prediction.risk === 'High' ? 'text-red-500' :
                      prediction.risk === 'Medium' ? 'text-orange-500' : 'text-green-500'
                    }`} />
                    <h3 className="font-semibold">{prediction.type}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    prediction.risk === 'High' ? 'bg-red-100 text-red-500' :
                    prediction.risk === 'Medium' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'
                  }`}>
                    {prediction.risk} Risk
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{prediction.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{prediction.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <div className="flex gap-2 flex-wrap">
                      {prediction.factors.map((factor, fidx) => (
                        <span key={fidx} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Confidence: {prediction.confidence}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Emergencies */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Emergencies</h2>
            <button className="text-red-500 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading emergencies...</p>
              </div>
            ) : recentEmergencies.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent emergencies</p>
                <p className="text-sm text-gray-400">Emergency reports will appear here</p>
              </div>
            ) : (
              recentEmergencies.map((emergency, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{emergency.specificType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      emergency.status === 'active' 
                        ? 'bg-red-100 text-red-500' 
                        : emergency.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-500'
                    }`}>
                      {emergency.status.charAt(0).toUpperCase() + emergency.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{emergency.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{emergency.location}</span>
                    <span>{formatTime(emergency.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Reported by: {emergency.userName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}