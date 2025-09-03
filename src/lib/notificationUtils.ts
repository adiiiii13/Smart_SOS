import { supabase, TABLES } from './supabase';

export interface CreateNotificationData {
  userId: string;
  type: 'emergency' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  location?: string;
  phone?: string;
  emergencyType?: string;
  actionType?: 'friend_request' | 'friend_accepted' | 'emergency_alert';
  actionData?: {
    fromUserId?: string;
    fromUserName?: string;
    requestId?: string;
  // Optional emergency location context
  lat?: number;
  lng?: number;
  address?: string | null;
  };
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    const { error } = await supabase.from(TABLES.NOTIFICATIONS).insert([{ 
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      action_type: data.actionType,
      action_data: data.actionData || null,
      location: data.location,
      phone: data.phone,
      emergency_type: data.emergencyType,
      is_read: false
    }]);
    if (error) throw error;
  } catch (error) {
    console.warn('Error creating notification (using fallback):', error);
    // In offline mode, you could store notifications locally
    // For now, we'll just log the warning and continue
  }
}

export const createEmergencyNotification = async (
  userId: string,
  emergencyType: string,
  location: string,
  phone?: string
) => {
  return createNotification({
    userId,
    type: 'emergency',
    title: 'Emergency Alert',
    message: `Emergency situation detected: ${emergencyType}. Help is on the way.`,
    priority: 'high',
    location,
    phone,
    emergencyType
  });
};

export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' = 'info'
) => {
  return createNotification({
    userId,
    type,
    title,
    message,
    priority: 'medium'
  });
};

export const createWelcomeNotification = async (userId: string, userName: string) => {
  return createNotification({
    userId,
    type: 'success',
    title: 'Welcome to SOS!',
    message: `Welcome ${userName}! Your emergency response system is now active. Stay safe!`,
    priority: 'low'
  });
};

export const createSafetyTipNotification = async (userId: string, tip: string) => {
  return createNotification({
    userId,
    type: 'info',
    title: 'Safety Tip',
    message: tip,
    priority: 'low'
  });
};

// Sample notifications for testing
export const createSampleNotifications = async (userId: string) => {
  const notifications = [
    {
      type: 'emergency' as const,
      title: 'Emergency Alert',
      message: 'Fire emergency reported in your area. Please evacuate immediately.',
      priority: 'high' as const,
      location: 'Kothrud, Pune',
      emergencyType: 'fire'
    },
    {
      type: 'warning' as const,
      title: 'Weather Warning',
      message: 'Heavy rainfall expected in your area. Stay indoors and avoid flooded areas.',
      priority: 'medium' as const
    },
    {
      type: 'success' as const,
      title: 'Emergency Response',
      message: 'Emergency services have been notified and are on their way.',
      priority: 'medium' as const
    },
    {
      type: 'info' as const,
      title: 'Safety Reminder',
      message: 'Remember to keep your emergency contacts updated in your profile.',
      priority: 'low' as const
    }
  ];

  for (const notification of notifications) {
    await createNotification({
      userId,
      ...notification
    });
  }
};
