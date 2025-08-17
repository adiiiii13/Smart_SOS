import React, { useState } from 'react'
import { ChevronLeft, UserPlus, Search, User } from 'lucide-react'

interface FriendsPageProps {
  onBack: () => void
}

export function FriendsPage({ onBack }: FriendsPageProps) {
  const [query, setQuery] = useState('')
  const friends = [
    { id: '1', name: 'Rahul Sharma', status: 'Online' },
    { id: '2', name: 'Priya Verma', status: 'Offline' },
    { id: '3', name: 'Aman Gupta', status: 'Busy' }
  ]

  const filtered = friends.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Friends</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends"
            className="w-full outline-none text-sm"
          />
          <button className="flex items-center gap-1 text-sm text-red-500">
            <UserPlus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(friend => (
          <div key={friend.id} className="bg-white p-3 rounded-xl flex items-center justify-between border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium">{friend.name}</div>
                <div className="text-xs text-gray-500">{friend.status}</div>
              </div>
            </div>
            <button className="text-sm text-red-500">Message</button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 text-sm">No friends found</div>
        )}
      </div>
    </div>
  )
}


