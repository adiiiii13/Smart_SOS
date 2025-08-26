import { supabase, TABLES } from './supabase';
import { createNotification } from './notificationUtils';
import { subscribeToTable } from './supabaseUtils';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  status: 'active';
  timestamp: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
}

// Search for users by name or email
export const searchUsers = async (searchQuery: string, currentUserId: string): Promise<UserProfile[]> => {
  if (!searchQuery.trim()) return [];
  try {
    const term = searchQuery.trim();
    // Case-insensitive search by name or email. Support schemas with either id or user_id.
    let query = supabase
      .from(TABLES.PROFILES)
      // Select both id and user_id to support either schema
      .select('id, user_id, full_name, email, phone')
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
      .order('full_name', { ascending: true })
      .limit(50);
    // Prefer only rows that have user_id to ensure we return auth.users IDs
    // If the column doesn't exist in your schema this may be ignored.
    // @ts-ignore - runtime filter
    query = (query as any).not('user_id', 'is', null);
    const { data, error } = await query;
    if (error) throw error;
    const users: UserProfile[] = (data || [])
  .map(row => ({ uid: (row as any).user_id, ...row }))
      .filter(row => row.uid !== currentUserId)
      .map(row => ({
        uid: (row as any).uid,
        displayName: row.full_name || 'Unknown User',
        email: row.email || '',
        phone: row.phone || ''
      }));
    return users;
  } catch (e) {
    console.error('Error searching users:', e);
    return [];
  }
}

// Send friend request
export const sendFriendRequest = async (
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  toUserName: string
): Promise<string> => {
  try {
    // Prevent sending to self
    if (fromUserId === toUserId) {
      throw new Error('You cannot send a friend request to yourself');
    }

    // Resolve toUserId to an auth.users id if the provided id came from profiles.id
    let resolvedToUserId = toUserId;
    try {
      // Try to find a profile whose id matches the provided toUserId and get its user_id
      const { data: profById } = await supabase
        .from(TABLES.PROFILES)
        .select('user_id')
        .eq('id', toUserId)
        .maybeSingle();
      if (profById && (profById as any).user_id) {
        resolvedToUserId = (profById as any).user_id as string;
      } else {
        // Or if provided id is already the user_id, ensure there is a matching profile
        const { data: profByUserId } = await supabase
          .from(TABLES.PROFILES)
          .select('user_id')
          .eq('user_id', toUserId)
          .maybeSingle();
        if (profByUserId && (profByUserId as any).user_id) {
          resolvedToUserId = (profByUserId as any).user_id as string;
        }
      }
    } catch (mapErr) {
      // Non-fatal; mapping is best-effort. Insert may still fail if target user doesn't exist.
      console.warn('Friend request target ID mapping warning:', mapErr);
    }

    const { data: existing, error: existErr } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .select('id')
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', resolvedToUserId)
      .eq('status', 'pending');
    if (existErr) throw existErr;
    if (existing && existing.length) throw new Error('Friend request already sent');

    const { data, error } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .insert([{ from_user_id: fromUserId, from_user_name: fromUserName, to_user_id: resolvedToUserId, to_user_name: toUserName, status: 'pending' }])
      .select('id')
      .single();
    if (error) throw error;

    // Best-effort notification; don't fail the request if RLS blocks notification insert
    try {
      await createNotification({
        userId: resolvedToUserId,
        type: 'info',
        title: 'New Friend Request',
        message: `${fromUserName} sent you a friend request`,
        priority: 'medium',
        actionType: 'friend_request',
        actionData: { fromUserId, fromUserName, requestId: data.id }
      });
    } catch (notifyErr) {
      console.warn('Notification insert blocked (RLS or other). Friend request created:', notifyErr);
    }
    return data.id;
  } catch (e) {
  console.error('Error sending friend request:', e);
  const msg = (e as any)?.message || (typeof e === 'string' ? e : 'Unknown error');
  throw new Error(`Supabase error while sending friend request: ${msg}`);
  }
}

// Accept friend request
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const { data: req, error } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .select('*')
      .eq('id', requestId)
      .single();
    if (error) throw error;
    if (!req) throw new Error('Friend request not found');

    const { error: updErr } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (updErr) throw updErr;

    const { error: insErr } = await supabase.from(TABLES.FRIENDS).insert([
      { user_id: req.to_user_id, friend_id: req.from_user_id, friend_name: req.from_user_name, friend_email: '' },
      { user_id: req.from_user_id, friend_id: req.to_user_id, friend_name: req.to_user_name, friend_email: '' }
    ]);
    if (insErr) throw insErr;

    await createNotification({
      userId: req.from_user_id,
      type: 'success',
      title: 'Friend Request Accepted',
      message: `${req.to_user_name} accepted your friend request`,
      priority: 'medium',
      actionType: 'friend_accepted',
      actionData: { fromUserId: req.to_user_id, fromUserName: req.to_user_name }
    });
  } catch (e) {
    console.error('Error accepting friend request:', e);
    throw e;
  }
}

// Reject friend request
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLES.FRIEND_REQUESTS)
    .update({ status: 'rejected' })
    .eq('id', requestId);
  if (error) {
    console.error('Error rejecting friend request:', error); throw error;
  }
}

// Get pending friend requests for a user
export const getPendingFriendRequests = (userId: string, callback: (requests: FriendRequest[]) => void) => {
  // Initial load
  supabase.from(TABLES.FRIEND_REQUESTS)
    .select('*')
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      const reqs = (data || []).map(r => ({
        id: r.id,
        fromUserId: r.from_user_id,
        fromUserName: r.from_user_name,
        toUserId: r.to_user_id,
        toUserName: r.to_user_name,
        status: r.status,
        timestamp: r.created_at
      })) as FriendRequest[];
      callback(reqs);
    });
  // Subscribe
  const channel = subscribeToTable(TABLES.FRIEND_REQUESTS, payload => {
    if (payload.new && payload.new.to_user_id === userId) {
      getPendingFriendRequests(userId, callback); // simple refresh strategy
    }
  });
  return () => { supabase.removeChannel(channel) };
}

// Get user's friends
export const getUserFriends = (userId: string, callback: (friends: Friend[]) => void) => {
  supabase.from(TABLES.FRIENDS)
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      const fr = (data || []).map(f => ({
        id: f.id,
        userId: f.user_id,
        friendId: f.friend_id,
        friendName: f.friend_name,
        friendEmail: f.friend_email,
        status: f.status,
        timestamp: f.created_at
      })) as Friend[];
      callback(fr);
    });
  const channel = subscribeToTable(TABLES.FRIENDS, payload => {
    if (payload.new && payload.new.user_id === userId) {
      getUserFriends(userId, callback);
    }
  });
  return () => { supabase.removeChannel(channel) };
}

// Remove friend
export const removeFriend = async (friendshipId: string): Promise<void> => {
  const { error } = await supabase.from(TABLES.FRIENDS).delete().eq('id', friendshipId);
  if (error) { console.error('Error removing friend:', error); throw error; }
}

// Check if two users are friends
export const checkFriendship = async (userId1: string, userId2: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from(TABLES.FRIENDS)
    .select('id')
    .eq('user_id', userId1)
    .eq('friend_id', userId2)
    .eq('status', 'active');
  if (error) { console.error('Error checking friendship:', error); return false; }
  return !!(data && data.length);
}

// Check if friend request exists
export const checkFriendRequest = async (fromUserId: string, toUserId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from(TABLES.FRIEND_REQUESTS)
    .select('id')
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', toUserId)
    .eq('status', 'pending');
  if (error) { console.error('Error checking friend request:', error); return false; }
  return !!(data && data.length);
}
