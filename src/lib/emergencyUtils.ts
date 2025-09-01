import { supabase, TABLES } from './supabase';
import { createNotification } from './notificationUtils';

export interface EmergencyReport {
  id?: string;
  userId: string;
  userName: string;
  emergencyType: string;
  specificType: string;
  location: string;
  description: string;
  status: 'active' | 'resolved' | 'pending';
  priority: 'high' | 'medium' | 'low'; // may be omitted in DB if column absent
  timestamp: any;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  images?: string[];
  audioUrl?: string;
}

export interface EmergencyPrediction {
  type: string;
  risk: 'High' | 'Medium' | 'Low';
  location: string;
  time: string;
  factors: string[];
  confidence: number;
}

// Submit emergency report and notify all users
export const submitEmergencyReport = async (reportData: Omit<EmergencyReport, 'id' | 'timestamp' | 'status'>) => {
  // Basic validation
  const required: Array<[keyof typeof reportData, string]> = [
    ['userId','User ID'], ['userName','User Name'], ['emergencyType','Emergency Type'], ['specificType','Specific Type'], ['location','Location'], ['description','Description']
  ];
  for (const [field,label] of required) {
    if (!(reportData as any)[field]) {
      throw new Error(`Missing required field: ${label}`);
    }
  }
  try {
    console.log('[submitEmergencyReport] inserting report', reportData);
    // Build payload only with columns we are sure exist in current schema.
    // (audio_url / images / coordinates removed because DB reported audio_url missing.)
    const insertPayload: any = { 
      user_id: reportData.userId,
      user_name: reportData.userName,
      emergency_type: reportData.emergencyType,
      specific_type: reportData.specificType,
      location: reportData.location,
      description: reportData.description,
  status: 'active'
    };
    const { data, error } = await supabase
      .from(TABLES.EMERGENCIES)
      .insert([insertPayload])
      .select('id')
      .single();
    if (error) {
      console.error('[submitEmergencyReport] insert error', error, insertPayload);
      throw new Error(`Insert failed: ${error.message}`);
    }
    // Broadcast notifications
    const { data: users, error: usersError } = await supabase.from(TABLES.PROFILES).select('user_id');
    if (usersError) {
      console.warn('[submitEmergencyReport] fetch users warning', usersError);
    } else if (users) {
      const notificationPromises = users.map(u => createNotification({
        userId: u.user_id,
        type: 'emergency',
        title: 'Emergency Alert',
        message: `${reportData.specificType} reported in ${reportData.location}. Emergency services have been notified.`,
        priority: 'high',
        location: reportData.location,
        emergencyType: reportData.specificType
      }));
      await Promise.allSettled(notificationPromises);
    }
    return data.id as string;
  } catch (e: any) {
    console.error('[submitEmergencyReport] unexpected error', e);
    throw new Error(e?.message || 'Unknown error submitting emergency report');
  }
};

// Get recent emergencies for prediction page
export const getRecentEmergencies = async (limitCount: number = 10) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EMERGENCIES)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      userName: d.user_name,
      emergencyType: d.emergency_type,
      specificType: d.specific_type,
      location: d.location,
      description: d.description,
      status: d.status,
      priority: d.priority,
      timestamp: new Date(d.created_at),
      coordinates: d.coordinates || undefined,
      images: d.images || undefined,
      audioUrl: d.audio_url || undefined
    }))
  } catch (e) {
    console.error('Error fetching recent emergencies:', e);
    return [];
  }
}

// Get emergencies by area
export const getEmergenciesByArea = async (area: string, limitCount: number = 10) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.EMERGENCIES)
      .select('*')
      .ilike('location', `%${area}%`)
      .order('created_at', { ascending: false })
      .limit(limitCount);
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      userName: d.user_name,
      emergencyType: d.emergency_type,
      specificType: d.specific_type,
      location: d.location,
      description: d.description,
      status: d.status,
      priority: d.priority,
      timestamp: new Date(d.created_at),
      coordinates: d.coordinates || undefined,
      images: d.images || undefined,
      audioUrl: d.audio_url || undefined
    }))
  } catch (e) {
    console.error('Error fetching emergencies by area:', e);
    return [];
  }
}

// Generate risk predictions based on recent emergencies
export const generateRiskPredictions = (emergencies: EmergencyReport[]): EmergencyPrediction[] => {
  const predictions: EmergencyPrediction[] = [];
  
  // Analyze emergency patterns
  const emergencyCounts: { [key: string]: number } = {};
  const locationCounts: { [key: string]: number } = {};
  
  emergencies.forEach(emergency => {
    emergencyCounts[emergency.specificType] = (emergencyCounts[emergency.specificType] || 0) + 1;
    locationCounts[emergency.location] = (locationCounts[emergency.location] || 0) + 1;
  });

  // Generate predictions based on frequency
  Object.entries(emergencyCounts).forEach(([type, count]) => {
    if (count >= 2) {
      const risk = count >= 5 ? 'High' : count >= 3 ? 'Medium' : 'Low';
      const factors = [];
      
      if (count >= 5) factors.push('High Frequency');
      if (count >= 3) factors.push('Recent Incidents');
      if (count >= 2) factors.push('Pattern Detected');

      predictions.push({
        type,
        risk,
        location: 'Multiple Locations',
        time: 'Next 24 hours',
        factors,
        confidence: Math.min(count * 20, 95)
      });
    }
  });

  // Add location-specific predictions
  Object.entries(locationCounts).forEach(([location, count]) => {
    if (count >= 2) {
      const risk = count >= 3 ? 'High' : 'Medium';
      predictions.push({
        type: 'General Emergency',
        risk,
        location,
        time: 'Next 12 hours',
        factors: ['High Activity Area', 'Recent Incidents'],
        confidence: Math.min(count * 25, 90)
      });
    }
  });

  return predictions.slice(0, 5); // Return top 5 predictions
};

// Update emergency status
export const updateEmergencyStatus = async (emergencyId: string, status: 'active' | 'resolved' | 'pending') => {
  const { error } = await supabase
    .from(TABLES.EMERGENCIES)
    .update({ status })
    .eq('id', emergencyId);
  if (error) { console.error('Error updating emergency status:', error); throw error; }
}

// Reverse geocode coordinates into a human-readable address using Nominatim
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

// Send SOS alert notifications to all active friends of the user
export const sendSOSAlertToFriends = async (
  fromUserId: string,
  fromUserName: string,
  location: string,
  phone?: string,
  coords?: { lat: number; lng: number } | null,
  addressText?: string | null
) => {
  try {
    // Fetch active friendships where current user is the owner
    const { data: friends, error } = await supabase
      .from(TABLES.FRIENDS)
      .select('friend_id, friend_name, friend_email, status')
      .eq('user_id', fromUserId)
      .eq('status', 'active');
    if (error) throw error;
    const targets = (friends || []).map(f => f.friend_id).filter(Boolean) as string[];
    if (!targets.length) {
      // Self-test fallback so a single user can see the banner locally
      await createNotification({
        userId: fromUserId,
        type: 'emergency',
        title: `SOS Alert (self-test)`,
        message: `${fromUserName} pressed SOS. This is a self-test as no friends are linked.`,
        priority: 'high',
        location,
        phone,
        emergencyType: 'sos',
        actionType: 'emergency_alert',
        actionData: { fromUserId, fromUserName }
      });
      return 1;
    }
    const tasks = targets.map(fid => createNotification({
      userId: fid,
      type: 'emergency',
      title: `SOS Alert from ${fromUserName}`,
      message: `${fromUserName} pressed SOS. Please check on them immediately.${addressText ? `\nLocation: ${addressText}` : ''}`,
      priority: 'high',
      location: addressText || location,
      phone,
      emergencyType: 'sos',
      actionType: 'emergency_alert',
      actionData: { fromUserId, fromUserName, lat: coords?.lat, lng: coords?.lng, address: addressText || null }
    }));
    const results = await Promise.allSettled(tasks);
    const success = results.filter(r => r.status === 'fulfilled').length;
    if (success === 0 && targets.length > 0) {
      throw new Error('RLS likely blocked notification inserts. See SUPABASE_SETUP.md for policies.');
    }
    return success;
  } catch (e) {
    console.error('sendSOSAlertToFriends failed:', e);
    throw e;
  }
}
