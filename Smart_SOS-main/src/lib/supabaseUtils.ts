import { supabase, TABLES } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Generic CRUD operations
export async function createRecord(table: string, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([{ ...data, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error);
    throw error;
  }
}

export async function findRecords(table: string, filter: any = {}) {
  try {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error finding records in ${table}:`, error);
    throw error;
  }
}

export async function findRecord(table: string, filter: any) {
  try {
    let query = supabase.from(table).select('*');
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error finding record in ${table}:`, error);
    throw error;
  }
}

export async function updateRecord(table: string, filter: any, updates: any) {
  try {
    let query = supabase.from(table).update({
      ...updates,
      updated_at: new Date().toISOString()
    });

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error);
    throw error;
  }
}

export async function deleteRecord(table: string, filter: any) {
  try {
    let query = supabase.from(table).delete();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting record in ${table}:`, error);
    throw error;
  }
}

// User operations
export async function createUser(userData: any) {
  return await createRecord(TABLES.USERS, userData);
}

export async function findUserByEmail(email: string) {
  return await findRecord(TABLES.USERS, { email });
}

export async function findUserById(userId: string) {
  return await findRecord(TABLES.USERS, { id: userId });
}

// Profile operations
export async function createProfile(profileData: any) {
  return await createRecord(TABLES.PROFILES, profileData);
}

export async function findProfileByUserId(userId: string) {
  return await findRecord(TABLES.PROFILES, { user_id: userId });
}

export async function updateProfile(userId: string, updateData: any) {
  return await updateRecord(TABLES.PROFILES, { user_id: userId }, updateData);
}

// Notification operations
export async function createNotification(notificationData: any) {
  return await createRecord(TABLES.NOTIFICATIONS, notificationData);
}

export async function findUserNotifications(userId: string) {
  return await findRecords(TABLES.NOTIFICATIONS, { user_id: userId });
}

export async function markNotificationAsRead(notificationId: string) {
  return await updateRecord(TABLES.NOTIFICATIONS, { id: notificationId }, { is_read: true });
}

// Emergency operations
export async function createEmergency(emergencyData: any) {
  return await createRecord(TABLES.EMERGENCIES, emergencyData);
}

export async function findRecentEmergencies(limit: number = 10) {
  const { data, error } = await supabase
    .from(TABLES.EMERGENCIES)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Friend operations
export async function createFriendRequest(requestData: any) {
  return await createRecord(TABLES.FRIEND_REQUESTS, requestData);
}

export async function findPendingFriendRequests(userId: string) {
  return await findRecords(TABLES.FRIEND_REQUESTS, { 
    to_user_id: userId, 
    status: 'pending' 
  });
}

export async function updateFriendRequestStatus(requestId: string, status: string) {
  return await updateRecord(TABLES.FRIEND_REQUESTS, { id: requestId }, { status });
}

export async function createFriendship(friendshipData: any) {
  return await createRecord(TABLES.FRIENDS, friendshipData);
}

export async function findUserFriends(userId: string) {
  return await findRecords(TABLES.FRIENDS, { user_id: userId, status: 'active' });
}

export async function removeFriendship(friendshipId: string) {
  return await deleteRecord(TABLES.FRIENDS, { id: friendshipId });
}

// Real-time subscriptions
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
}

export function subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`user_notifications_${userId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: TABLES.NOTIFICATIONS,
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
}
