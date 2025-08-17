import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, MapPin, Phone, MessageCircle, ArrowLeft, Plus, Volume2 } from 'lucide-react';
import notificationSound from '../assets/Notifi.wav';
import { useAuth } from '../contexts/AuthContext';
import { doc, collection, query, where, orderBy, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createSampleNotifications } from '../lib/notificationUtils';

interface Notification {
  id: string;
  type: 'emergency' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  location?: string;
  phone?: string;
  emergencyType?: string;
  priority: 'high' | 'medium' | 'low';
}

export function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');
  const [loading, setLoading] = useState(true);
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to test notification sound
  const testNotificationSound = () => {
    try {
      const audio = new Audio(notificationSound);
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.error('Error playing test notification sound:', error);
      });
    } catch (error) {
      console.error('Error creating test notification audio:', error);
    }
  };

  console.log('NotificationsPage rendered, user:', user?.uid, 'loading:', loading, 'user object:', user);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Setting up Firebase listener for user:', user.uid);

    try {
      // Subscribe to notifications for the current user
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Firebase snapshot received, size:', snapshot.size);
        const notifs: Notification[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          try {
            notifs.push({
              id: doc.id,
              type: data.type || 'info',
              title: data.title || '',
              message: data.message || '',
              timestamp: data.timestamp?.toDate() || new Date(),
              read: data.read || false,
              location: data.location,
              phone: data.phone,
              emergencyType: data.emergencyType,
              priority: data.priority || 'medium'
            });
          } catch (error) {
            console.error('Error processing notification:', error, data);
          }
        });
        setNotifications(notifs);
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      setError('Failed to connect to notifications');
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createSampleNotificationsHandler = async () => {
    if (!user) return;
    
    setIsCreatingSamples(true);
    try {
      await createSampleNotifications(user.uid);
      alert('Sample notifications created successfully!');
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      alert('Failed to create sample notifications.');
    } finally {
      setIsCreatingSamples(false);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'emergency':
        return notifications.filter(n => n.type === 'emergency');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

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

  const filteredNotifications = getFilteredNotifications();

  // Debug: Always show something to test if the component renders
  console.log('About to render, user:', !!user, 'loading:', loading, 'error:', error);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please Login</h3>
          <p className="text-gray-500 mb-4">You need to be logged in to view notifications.</p>
          <button
            onClick={onBack}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Notifications</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
            { key: 'emergency', label: 'Emergency', count: notifications.filter(n => n.type === 'emergency').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Mark All as Read */}
        <div className="flex justify-between items-center mt-3">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={createSampleNotificationsHandler}
            disabled={isCreatingSamples}
            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isCreatingSamples ? 'Creating...' : 'Add Sample Notifications'}
          </button>
          <button
            onClick={testNotificationSound}
            className="flex items-center gap-1 text-sm text-green-500 hover:text-green-600 font-medium"
            title="Test notification sound"
          >
            <Volume2 className="w-4 h-4" />
            Test Sound
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! No notifications yet."
                : `No ${filter} notifications to show.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} p-4 transition-all hover:shadow-md ${
                !notification.read ? 'ring-2 ring-red-100' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium text-sm ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    {/* Emergency-specific details */}
                    {notification.type === 'emergency' && (
                      <div className="space-y-1 mb-2">
                        {notification.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{notification.location}</span>
                          </div>
                        )}
                        {notification.emergencyType && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="capitalize">{notification.emergencyType}</span>
                          </div>
                        )}
                        {notification.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{notification.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete notification"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error rendering NotificationsPage:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">There was an error loading the notifications page.</p>
          <button
            onClick={onBack}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
}
