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
  
  // Quick Connect states
  const [isDiscoverable, setIsDiscoverable] = useState(false)
  const [isScanningForUsers, setIsScanningForUsers] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string; name: string; distance: string}>>([])
  const [showConnectionModal, setShowConnectionModal] = useState(false)

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
        // Remove from local state first for immediate UI update
        setFriends(prev => prev.filter(friend => friend.id !== friendshipId))
        
        // Try to remove from database
        await removeFriend(friendshipId)
        alert('Friend removed successfully.')
      } catch (error) {
        console.error('Error removing friend:', error)
        // If database removal fails, revert the local state change
        alert('Failed to remove friend from database. Please try again.')
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

  // Quick Connect functions
  const startDiscovery = () => {
    setIsDiscoverable(true)
    setShowConnectionModal(true)
    alert('You are now discoverable! Other users can find and connect to you.')
  }

  const stopDiscovery = () => {
    setIsDiscoverable(false)
    setShowConnectionModal(false)
    alert('You are no longer discoverable.')
  }

  const scanForUsers = () => {
    setIsScanningForUsers(true)
    setAvailableUsers([])
    
    // Simulate scanning for nearby users
    setTimeout(() => {
      const mockUsers = [
        { id: '1', name: 'John Smith', distance: '2m away' },
        { id: '2', name: 'Sarah Johnson', distance: '5m away' },
        { id: '3', name: 'Mike Wilson', distance: '8m away' }
      ]
      setAvailableUsers(mockUsers)
      setIsScanningForUsers(false)
      setShowConnectionModal(true)
    }, 3000)
  }

  const connectToUser = async (userId: string, userName: string) => {
    if (!user) return
    
    try {
      // Create a mock friend object and add to friends list
      const newFriend: Friend = {
        id: Date.now().toString(),
        userId: user.uid,
        friendId: userId,
        friendName: userName,
        createdAt: new Date().toISOString()
      }
      
      // Add to local friends state
      setFriends(prev => [...prev, newFriend])
      
      alert(`Successfully connected to ${userName}! They have been added to your friends list.`)
      setShowConnectionModal(false)
      setAvailableUsers([])
    } catch (error) {
      console.error('Error connecting to user:', error)
      alert('Failed to connect to user. Please try again.')
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

      {/* Quick Connect Section */}
      <div className="p-4 bg-white border-b">
        <h3 className="text-md font-medium mb-3 text-gray-800">Quick Connect</h3>
        <div className="grid grid-cols-2 gap-3">
                     <button
             onClick={startDiscovery}
             className={`p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
               isDiscoverable 
                 ? 'border-green-500 bg-green-50 text-green-700' 
                 : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
             }`}
             title="Make yourself discoverable to other users"
           >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
               isDiscoverable ? 'bg-green-100' : 'bg-gray-100'
             }`}>
               <Users className={`w-5 h-5 ${isDiscoverable ? 'text-green-600' : 'text-gray-500'}`} />
             </div>
             <span className="font-medium text-sm">Connect</span>
             <span className="text-xs text-center">
               {isDiscoverable ? 'You are discoverable' : 'Make yourself discoverable'}
             </span>
           </button>
           
           <button
             onClick={scanForUsers}
             className="p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500 flex flex-col items-center justify-center gap-2 transition-all"
             title="Scan for nearby discoverable users"
           >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-500" />
            </div>
            <span className="font-medium text-sm">Get Connected</span>
            <span className="text-xs text-center">Find nearby users</span>
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
                   title={`Remove ${friend.friendName} from friends`}
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

      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isDiscoverable ? 'You are Discoverable' : 'Available Users'}
              </h3>
              <button 
                onClick={() => {
                  setShowConnectionModal(false)
                  setIsDiscoverable(false)
                  setAvailableUsers([])
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Close connection modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isDiscoverable ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">You are discoverable!</h4>
                  <p className="text-gray-600 mb-4">
                    Other users can now find and connect to you. Keep this screen open.
                  </p>
                  <div className="animate-pulse">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                  </div>
                  <button
                    onClick={stopDiscovery}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Stop Discovery
                  </button>
                </div>
              ) : isScanningForUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h4 className="text-lg font-semibold mb-2">Scanning for users...</h4>
                  <p className="text-gray-600">Looking for nearby discoverable users</p>
                </div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Found {availableUsers.length} user(s) nearby:</p>
                  {availableUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.distance}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => connectToUser(user.id, user.name)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400">Make sure other users have tapped "Connect"</p>
                </div>
              )}
            </div>
          </div>
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


