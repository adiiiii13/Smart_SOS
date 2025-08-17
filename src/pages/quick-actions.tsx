import React from 'react'
import { Phone, BookOpen, Heart, ChevronLeft } from 'lucide-react'

interface CallEmergencyPageProps { onBack: () => void }
export function CallEmergencyPage({ onBack }: CallEmergencyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Call Emergency</h1>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow border text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-3">
            <Phone className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-700 mb-4">Tap to call your local emergency number.</p>
          <a href="tel:112" className="inline-block bg-red-500 text-white px-5 py-3 rounded-xl font-medium">Call 112</a>
        </div>
      </div>
    </div>
  )
}

interface VideoGuidePageProps { onBack: () => void }
export function VideoGuidePage({ onBack }: VideoGuidePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Video Guide</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="aspect-video">
            <iframe
              title="CPR Basics"
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/8wBz4mPpWoc"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-4">
            <h2 className="font-semibold">CPR Basics - Save a Life</h2>
            <p className="text-sm text-gray-600 mt-1">A short, practical overview of performing CPR safely.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="aspect-video">
            <iframe
              title="Bleeding Control"
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Jm1eF1x8t0E"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-4">
            <h2 className="font-semibold">Control Severe Bleeding</h2>
            <p className="text-sm text-gray-600 mt-1">How to apply pressure and use tourniquets properly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ManualPageProps { onBack: () => void }
export function ManualPage({ onBack }: ManualPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">First Aid Manual</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow border">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold">Download Manual</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4">Comprehensive guidance for common emergencies, printable and offline friendly.</p>
          <a href="#" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg">Download PDF</a>
        </div>
      </div>
    </div>
  )
}

interface TipsPageProps { onBack: () => void }
export function TipsPage({ onBack }: TipsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Save Life Tips</h1>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-2xl p-5 shadow border">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold">Important Tips</h2>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>Ensure scene safety before assisting.</li>
            <li>Call emergency services early.</li>
            <li>Use protective gear like gloves when possible.</li>
            <li>Monitor breathing and bleeding continuously.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


