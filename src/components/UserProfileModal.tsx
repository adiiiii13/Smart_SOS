import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Check, X as XIcon, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  acceptFriendRequest, 
  rejectFriendRequest, 
  checkFriendship, 
  checkFriendRequest,
  UserProfile as FriendUserProfile
} from '../lib/friendUtils';
import { supabase, TABLES } from '../lib/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  requestId?: string;
  notificationType?: 'friend_request' | 'friend_accepted' | 'emergency_alert';
}

export function UserProfileModal({ 
  isOpen, 
  onClose, 
  userId, 
  requestId, 
  notificationType 
}: UserProfileModalProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<FriendUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load user profile and check friendship status
  useEffect(() => {
    if (!isOpen || !userId || !user) return;

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get user profile. Support schemas where profiles has id or user_id referencing auth.users.
        let { data, error } = await supabase
          .from(TABLES.PROFILES)
          .select('id, user_id, full_name, email, phone')
          .eq('id', userId)
          .maybeSingle();
        if (!data) {
          const alt = await supabase
            .from(TABLES.PROFILES)
            .select('id, user_id, full_name, email, phone')
            .eq('user_id', userId)
            .maybeSingle();
          data = alt.data as any;
          error = alt.error as any;
        }
        if (!error && data) {
          setUserProfile({
      uid: (data as any).user_id || data.id,
            displayName: data.full_name || 'Unknown User',
            email: data.email || '',
            phone: data.phone || ''
          });
        }

        // Check if already friends
        const friendshipStatus = await checkFriendship(user.uid, userId);
        setIsFriend(friendshipStatus);

        // Check if friend request exists
        const requestStatus = await checkFriendRequest(user.uid, userId);
        setHasRequest(requestStatus);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isOpen, userId, user]);

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    
    try {
      setProcessing(true);
      await acceptFriendRequest(requestId);
      setIsFriend(true);
      setHasRequest(false);
      alert('Friend request accepted!');
      onClose();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestId) return;
    
    try {
      setProcessing(true);
      await rejectFriendRequest(requestId);
      setHasRequest(false);
      alert('Friend request rejected.');
      onClose();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading profile...</p>
            </div>
          ) : userProfile ? (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-red-600">
                    {userProfile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{userProfile.displayName}</h3>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{userProfile.phone}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                {isFriend ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Already Friends</span>
                  </div>
                ) : hasRequest ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Request Sent</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Not Connected</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {notificationType === 'friend_request' && requestId && !isFriend && !hasRequest && (
                <div className="space-y-3">
                  <button
                    onClick={handleAcceptRequest}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    {processing ? 'Accepting...' : 'Accept Friend Request'}
                  </button>
                  <button
                    onClick={handleRejectRequest}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XIcon className="w-5 h-5" />
                    {processing ? 'Rejecting...' : 'Reject Friend Request'}
                  </button>
                </div>
              )}

              {notificationType === 'friend_accepted' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Friend Request Accepted!</span>
                  </div>
                  <p className="text-gray-500 mt-2">You are now friends with {userProfile.displayName}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
              <p className="text-gray-500">This user profile could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
