import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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
  };
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      ...data,
      timestamp: serverTimestamp(),
      read: false,
      priority: data.priority || 'medium'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

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
