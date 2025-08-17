import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationUtils';

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
  try {
    if (!searchQuery.trim()) return [];
    
    const usersRef = collection(db, 'profiles');
    const q = query(
      usersRef,
      where('displayName', '>=', searchQuery),
      where('displayName', '<=', searchQuery + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Don't include current user in search results
      if (doc.id !== currentUserId) {
        users.push({
          uid: doc.id,
          displayName: data.displayName || 'Unknown User',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    });
    
    // Also search by email if it's an email query
    if (searchQuery.includes('@')) {
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchQuery),
        where('email', '<=', searchQuery + '\uf8ff')
      );
      
      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== currentUserId && !users.find(u => u.uid === doc.id)) {
          users.push({
            uid: doc.id,
            displayName: data.displayName || 'Unknown User',
            email: data.email || '',
            phone: data.phone || ''
          });
        }
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Send friend request
export const sendFriendRequest = async (
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  toUserName: string
): Promise<string> => {
  try {
    // Check if request already exists
    const existingRequests = await getDocs(
      query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId)
      )
    );
    
    if (!existingRequests.empty) {
      throw new Error('Friend request already sent');
    }
    
    // Add friend request
    const requestRef = await addDoc(collection(db, 'friendRequests'), {
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      status: 'pending',
      timestamp: new Date()
    });
    
    // Send notification to recipient
    await createNotification({
      userId: toUserId,
      type: 'info',
      title: 'New Friend Request',
      message: `${fromUserName} sent you a friend request`,
      priority: 'medium',
      actionType: 'friend_request',
      actionData: {
        fromUserId,
        fromUserName,
        requestId: requestRef.id
      }
    });
    
    return requestRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDocs(query(collection(db, 'friendRequests'), where('__name__', '==', requestId)));
    
    if (requestDoc.empty) {
      throw new Error('Friend request not found');
    }
    
    const requestData = requestDoc.docs[0].data() as FriendRequest;
    
    // Update request status to accepted
    await updateDoc(requestRef, { status: 'accepted' });
    
    // Add both users as friends
    const friendsRef = collection(db, 'friends');
    
    // Add current user as friend of requester
    await addDoc(friendsRef, {
      userId: requestData.toUserId,
      friendId: requestData.fromUserId,
      friendName: requestData.fromUserName,
      friendEmail: '', // Will be filled when we get user data
      status: 'active',
      timestamp: new Date()
    });
    
    // Add requester as friend of current user
    await addDoc(friendsRef, {
      userId: requestData.fromUserId,
      friendId: requestData.toUserId,
      friendName: requestData.toUserName,
      friendEmail: '', // Will be filled when we get user data
      status: 'active',
      timestamp: new Date()
    });
    
    // Send notification to requester
    await createNotification({
      userId: requestData.fromUserId,
      type: 'success',
      title: 'Friend Request Accepted',
      message: `${requestData.toUserName} accepted your friend request`,
      priority: 'medium',
      actionType: 'friend_accepted',
      actionData: {
        fromUserId: requestData.toUserId,
        fromUserName: requestData.toUserName
      }
    });
    
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Reject friend request
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// Get pending friend requests for a user
export const getPendingFriendRequests = (userId: string, callback: (requests: FriendRequest[]) => void) => {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as FriendRequest);
    });
    callback(requests);
  });
};

// Get user's friends
export const getUserFriends = (userId: string, callback: (friends: Friend[]) => void) => {
  const friendsRef = collection(db, 'friends');
  const q = query(
    friendsRef,
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const friends: Friend[] = [];
    snapshot.forEach((doc) => {
      friends.push({
        id: doc.id,
        ...doc.data()
      } as Friend);
    });
    callback(friends);
  });
};

// Remove friend
export const removeFriend = async (friendshipId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'friends', friendshipId));
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Check if two users are friends
export const checkFriendship = async (userId1: string, userId2: string): Promise<boolean> => {
  try {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef,
      where('userId', '==', userId1),
      where('friendId', '==', userId2),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

// Check if friend request exists
export const checkFriendRequest = async (fromUserId: string, toUserId: string): Promise<boolean> => {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking friend request:', error);
    return false;
  }
};
