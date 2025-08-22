import { useState, useEffect } from 'react'
import { ChevronLeft, UserPlus, Search, Check, X, Clock, Users, UserX, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  searchUsers, 
  sendFriendRequest, 
  getPendingFriendRequests, 
  getUserFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  checkFriendship,
  checkFriendRequest,
  UserProfile,
  FriendRequest,
  Friend
} from '../lib/friendUtils'
import { createNotification } from '../lib/notificationUtils'
import { supabase, TABLES } from '../lib/supabase'
import { UserProfileModal } from '../components/UserProfileModal'

interface FriendsPageProps {
  onBack: () => void
}

export function FriendsPage({ onBack }: FriendsPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [searchingUsers, setSearchingUsers] = useState<Set<string>>(new Set())
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set())
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  // Load friends and pending requests
  useEffect(() => {
    if (!user) return

    const unsubscribeFriends = getUserFriends(user.uid, (friendsList) => {
      setFriends(friendsList)
    })

    const unsubscribeRequests = getPendingFriendRequests(user.uid, (requests) => {
      setPendingRequests(requests)
    })

    return () => {
      unsubscribeFriends()
      unsubscribeRequests()
    }
  }, [user])

  // Search users function
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await searchUsers(searchQuery, user.uid)
      setSearchResults(results)
      
      // Check friendship status for each result
      const newSearchingUsers = new Set<string>()
      const newFriendRequests = new Set<string>()
      
      for (const result of results) {
        const isFriend = await checkFriendship(user.uid, result.uid)
        const hasRequest = await checkFriendRequest(user.uid, result.uid)
        
        if (!isFriend) {
          if (hasRequest) {
            newFriendRequests.add(result.uid)
          } else {
            newSearchingUsers.add(result.uid)
          }
        }
      }
      
      setSearchingUsers(newSearchingUsers)
      setFriendRequests(newFriendRequests)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced live suggestions on typing
  useEffect(() => {
    if (!user) return
    const term = searchQuery.trim()
    if (!term) { setSearchResults([]); setSearchingUsers(new Set()); setFriendRequests(new Set()); return }
    const t = setTimeout(() => { handleSearch() }, 350)
    return () => clearTimeout(t)
  }, [searchQuery, user])

  const openUserProfile = (uid: string) => {
    setProfileUserId(uid)
    setProfileOpen(true)
  }

  // Send friend request
  const handleSendFriendRequest = async (toUser: UserProfile) => {
    if (!user) return
    
    try {
      await sendFriendRequest(
        user.uid,
        user.displayName || 'Unknown User',
        toUser.uid,
        toUser.displayName
      )
      
      // Update local state
      setSearchingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(toUser.uid)
        return newSet
      })
      
      setFriendRequests(prev => {
        const newSet = new Set(prev)
        newSet.add(toUser.uid)
        return newSet
      })
      
      alert('Friend request sent successfully!')
    } catch (error) {
  console.error('Error sending friend request:', error)
  const message = error instanceof Error ? error.message : 'Unknown error'
  alert(`Failed to send friend request.\n${message}`)
    }
  }

  // Accept friend request
  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id)
      alert('Friend request accepted!')
    } catch (error) {
      console.error('Error accepting friend request:', error)
      alert('Failed to accept friend request. Please try again.')
    }
  }

  // Reject friend request
  const handleRejectRequest = async (request: FriendRequest) => {
    try {
      await rejectFriendRequest(request.id)
      alert('Friend request rejected.')
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      alert('Failed to reject friend request. Please try again.')
    }
  }

  // Remove friend
  const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
    if (confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      try {
        await removeFriend(friendshipId)
        alert('Friend removed successfully.')
      } catch (error) {
        console.error('Error removing friend:', error)
        alert('Failed to remove friend. Please try again.')
      }
    }
  }

  // Test notification function
  const handleTestNotification = async () => {
    if (!user) return
    
    try {
      // Create a test friend request notification
      await createNotification({
        userId: user.uid,
        type: 'info',
        title: 'Test Friend Request',
        message: 'This is a test friend request notification',
        priority: 'medium',
        actionType: 'friend_request',
        actionData: {
          fromUserId: 'test-user-123',
          fromUserName: 'Test User',
          requestId: 'test-request-123'
        }
      })
      
      alert('Test notification created! Check your notifications page.')
    } catch (error) {
      console.error('Error creating test notification:', error)
      alert('Failed to create test notification. Please try again.')
    }
  }

  // Create a real friend request notification
  const handleCreateRealNotification = async () => {
    if (!user) return
    
    try {
      // Create a real friend request notification
      await createNotification({
        userId: user.uid,
        type: 'info',
        title: 'New Friend Request',
        message: 'Aditya Routh sent you a friend request',
        priority: 'medium',
        actionType: 'friend_request',
        actionData: {
          fromUserId: 'aditya-routh-123',
          fromUserName: 'Aditya Routh',
          requestId: 'real-request-456'
        }
      })
      
      alert('Real friend request notification created! Check your notifications page.')
    } catch (error) {
      console.error('Error creating real notification:', error)
      alert('Failed to create real notification. Please try again.')
    }
  }

  // Debug function to check database status
  const handleDebugDatabase = async () => {
    if (!user) return
    try {
      console.log('🔍 Debugging Supabase for user:', user.uid)
      const [{ data: notifications, error: notifErr }, { data: requests, error: reqErr }] = await Promise.all([
        supabase.from(TABLES.NOTIFICATIONS).select('*').eq('user_id', user.uid).limit(50),
        supabase.from(TABLES.FRIEND_REQUESTS).select('*').eq('to_user_id', user.uid).limit(50)
      ])
      if (notifErr) console.error('Notification query error:', notifErr)
      if (reqErr) console.error('Friend request query error:', reqErr)
      console.log('📱 Notifications found:', notifications?.length || 0, notifications)
      console.log('👥 Friend requests found:', requests?.length || 0, requests)
      alert(`Debug complete! Check console for details.\nNotifications: ${notifications?.length || 0}\nFriend requests: ${requests?.length || 0}`)
    } catch (e) {
      console.error('Error debugging Supabase:', e)
      alert('Failed to debug database. Check console for error.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Friends</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleTestNotification}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            Test Notification
          </button>
          <button
            onClick={handleCreateRealNotification}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
          >
            Create Real Notification
          </button>
          <button
            onClick={handleDebugDatabase}
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
          >
            Debug DB
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Friends ({friends.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Requests ({pendingRequests.length})
            </div>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'friends' && (
      <div className="p-4 space-y-3">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
              <p className="text-gray-500">Search for users and send friend requests to connect!</p>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="bg-white p-4 rounded-xl flex items-center justify-between border shadow-sm">
            <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-red-600">
                      {friend.friendName.charAt(0).toUpperCase()}
                    </span>
              </div>
              <div>
                    <div className="font-medium text-gray-900">{friend.friendName}</div>
                    <div className="text-sm text-gray-500">Friend</div>
              </div>
            </div>
                <button
                  onClick={() => handleRemoveFriend(friend.id, friend.friendName)}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white rounded-xl border px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 outline-none text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSearching || !searchQuery.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Search Results</h3>
              {searchResults.map(user => (
                <div key={user.uid} className="bg-white p-4 rounded-xl flex items-center justify-between border shadow-sm">
                  <button onClick={() => openUserProfile(user.uid)} className="flex items-center gap-3 text-left hover:opacity-90">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openUserProfile(user.uid)} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {searchingUsers.has(user.uid) && (
                      <button
                        onClick={() => handleSendFriendRequest(user)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                    )}
                    {friendRequests.has(user.uid) && (
                      <span className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg">
                        Request Sent
                      </span>
        )}
      </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try searching with a different name or email.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="p-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            pendingRequests.map(request => (
              <div key={request.id} className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-600">
                      {request.fromUserName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{request.fromUserName}</div>
                    <div className="text-sm text-gray-500">Wants to be your friend</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileUserId && (
        <UserProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={profileUserId}
        />
      )}
    </div>
  )
}


