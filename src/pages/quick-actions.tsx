import { useState } from 'react'
import { Phone, BookOpen, Heart, ChevronLeft, Stethoscope, Flame, Globe, Car, Zap, Shield } from 'lucide-react'

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
  type Subtopic = { title: string; description: string; query: string; videoId: string }
  type Category = { id: string; name: string; emoji: string; color: string; description: string; subtopics: Subtopic[] }

  const categories: Category[] = [
    {
      id: 'fire-safety',
      name: 'Fire & Safety',
      emoji: '🔥',
      color: 'bg-red-500',
      description: 'Prevention and response to fire emergencies',
      subtopics: [
        { title: 'Use a Fire Extinguisher (PASS)', description: 'Pull, Aim, Squeeze, Sweep method explained with safety tips.', query: 'How to use a fire extinguisher PASS', videoId: 'PQV71INDaqY' },
        { title: 'Clothes on Fire: Stop, Drop, Roll', description: 'What to do immediately if clothes catch fire.', query: 'Stop Drop and Roll clothes on fire', videoId: 'dtIrvTttGJQ' },
        { title: 'Building Evacuation Procedures', description: 'Safe and orderly evacuation in buildings during fire.', query: 'Fire evacuation procedures building', videoId: 'AqwPyPlCOQk' },
        { title: 'Handling Kitchen Fires (Oil/Gas)', description: 'Respond safely to oil, grease, and gas stove fires.', query: 'How to put out grease fire kitchen safety', videoId: 'AFwkGTEles8' },
      ]
    },
    {
      id: 'medical',
      name: 'Medical Emergencies',
      emoji: '🚑',
      color: 'bg-blue-500',
      description: 'Immediate care for common medical emergencies',
      subtopics: [
        { title: 'Basic First Aid (Bleeding, Burns, Fractures)', description: 'Core first aid steps for common injuries.', query: 'basic first aid bleeding burns fractures', videoId: 'NxO5LvgqZe0' },
        { title: 'CPR & AED (Step-by-Step)', description: 'Adult CPR and AED usage safely and effectively.', query: 'CPR and AED step by step', videoId: 'msRft-g-k_s' },
        { title: 'Choking Rescue (Adult/Child/Infant)', description: 'Heimlich maneuver variations by age group.', query: 'choking heimlich maneuver adult child infant', videoId: 'GymXjJJ7Ugo' },
        { title: 'Recognize Heart Attack & Stroke', description: 'Key warning signs and what to do immediately.', query: 'recognize heart attack stroke symptoms what to do', videoId: 'OzA3WUQS5zE' },
      ]
    },
    {
      id: 'water',
      name: 'Water-Related Emergencies',
      emoji: '🌊',
      color: 'bg-cyan-500',
      description: 'Water safety, rescue, and survival basics',
      subtopics: [
        { title: 'Drowning Rescue Basics', description: 'Safe rescue approach and what not to do.', query: 'drowning rescue basics what to do and not to do', videoId: 'example9' },
        { title: 'Flood Safety Guidelines', description: 'Evacuation, safe shelter, and hazard avoidance.', query: 'flood safety guidelines evacuation safe shelter', videoId: 'example10' },
        { title: 'How to Use a Life Jacket', description: 'Proper fit and usage for different scenarios.', query: 'how to wear use a life jacket correctly', videoId: 'example11' },
      ]
    },
    {
      id: 'disasters',
      name: 'Natural Disasters',
      emoji: '🌍',
      color: 'bg-orange-500',
      description: 'Preparedness and response for natural hazards',
      subtopics: [
        { title: 'Earthquake: Drop, Cover, Hold On', description: 'Protect yourself during shaking, then evacuate safely.', query: 'earthquake safety drop cover hold on', videoId: 'example12' },
        { title: 'Cyclone/Tornado/Hurricane Prep', description: 'Family plan, go-bag, and shelter strategies.', query: 'hurricane cyclone tornado preparedness checklist', videoId: 'example13' },
        { title: 'Landslide & Avalanche Survival', description: 'Recognize signs and how to react to stay safe.', query: 'landslide avalanche survival tips', videoId: 'example14' },
        { title: 'Heatwave and Coldwave Precautions', description: 'Stay safe in extreme heat and cold.', query: 'heatwave safety tips and cold wave precautions', videoId: 'example15' },
      ]
    },
    {
      id: 'transport',
      name: 'Travel & Transport Emergencies',
      emoji: '🚗',
      color: 'bg-purple-500',
      description: 'Incidents on roads, flights, and transit',
      subtopics: [
        { title: 'Road Accident First Response', description: 'Call for help, scene safety, moving victims safely.', query: 'road accident first response what to do', videoId: 'example16' },
        { title: 'Car Fire / Vehicle Breakdown Safety', description: 'Manage fire risk and stay safe roadside.', query: 'car fire vehicle breakdown safety', videoId: 'example17' },
        { title: 'Airplane Emergency Procedures', description: 'Brace position, oxygen mask, exits.', query: 'airplane emergency procedures brace position oxygen mask', videoId: 'example18' },
      ]
    },
    {
      id: 'hazards',
      name: 'Electrical & Chemical Hazards',
      emoji: '⚡',
      color: 'bg-yellow-500',
      description: 'Respond to electrical and chemical exposures',
      subtopics: [
        { title: 'Electric Shock First Aid', description: 'Disconnect power, assess breathing, call help.', query: 'electric shock first aid what to do', videoId: 'example19' },
        { title: 'Handling Gas Leaks Safely', description: 'Evacuate, ventilate, no sparks or flames.', query: 'gas leak what to do safety', videoId: 'example20' },
        { title: 'Chemical Spill Safety', description: 'Eye/skin exposure first aid and decontamination.', query: 'chemical spill safety eye skin exposure first aid', videoId: 'example21' },
      ]
    },
    {
      id: 'personal',
      name: 'Personal Safety',
      emoji: '👮',
      color: 'bg-green-500',
      description: 'Everyday self-protection and preparedness',
      subtopics: [
        { title: 'Self-Defense Basics', description: 'Escape holds, create distance, call for help.', query: 'self defense basics escaping grabs', videoId: 'example22' },
        { title: 'Emergency Numbers & Apps', description: 'Country-wise numbers and helpful apps.', query: 'emergency numbers by country emergency apps', videoId: 'example23' },
        { title: 'Build an Emergency Kit', description: 'Torch, water, medicines, documents, and more.', query: 'how to make an emergency kit checklist', videoId: 'example24' },
      ]
    },
  ]

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null)

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null

  const openYouTube = (query: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => {
          if (selectedSubtopic) { setSelectedSubtopic(null); return }
          if (selectedCategoryId) { setSelectedCategoryId(null); return }
          onBack()
        }} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {selectedSubtopic ? selectedSubtopic.title : selectedCategory ? selectedCategory.name : 'Video Guide'}
        </h1>
      </div>

      <div className="p-4">
        {!selectedCategory && !selectedSubtopic && (
          <div>
            <p className="text-gray-600 mb-4">Choose a category to learn with short video guides.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="text-left bg-white border rounded-2xl p-5 shadow hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className={`${cat.color} w-10 h-10 rounded-lg`}></div>
                  </div>
                  <h3 className="font-semibold text-base">{cat.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                  <p className="text-xs text-gray-500 mt-3">{cat.subtopics.length} topics</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && !selectedSubtopic && (
          <div>
            <div className="bg-white border rounded-2xl p-5 shadow mb-4">
              <h2 className="font-semibold">{selectedCategory.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedCategory.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory.subtopics.map((s, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow flex flex-col">
                  <h4 className="font-medium">{s.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 flex-1">{s.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setSelectedSubtopic(s)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition">View here</button>
                    <button onClick={() => openYouTube(s.query)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition">Watch on YouTube</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSubtopic && (
          <div className="space-y-4">
            <div className="bg-white border rounded-2xl p-5 shadow">
              <h2 className="font-semibold">{selectedSubtopic.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedSubtopic.description}</p>
            </div>
            <div className="bg-white border rounded-2xl shadow overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  title={selectedSubtopic.title}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedSubtopic.videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                <button onClick={() => openYouTube(selectedSubtopic.query)} className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition">Watch on YouTube</button>
              </div>
            </div>
          </div>
        )}
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
  const emergencyTips = [
    {
      icon: Stethoscope,
      title: '🧑‍⚕ Medical Emergencies',
      color: 'bg-blue-500',
      tips: [
        'Learn CPR (for adults & kids) – it can double survival chances in cardiac arrest.',
        "Heimlich Maneuver – use it if someone is choking and can't breathe/speak.",
        'Control bleeding – apply firm pressure with a clean cloth until help arrives.',
        'Check responsiveness – always shout & shake gently before starting aid.'
      ]
    },
    {
      icon: Flame,
      title: '🔥 Fire & Burns',
      color: 'bg-red-500',
      tips: [
        'If clothes catch fire: Stop, Drop, and Roll.',
        'Never throw water on oil/gas fires – use a fire blanket or extinguisher.',
        "For burns: cool with clean running water for at least 10 minutes, don't apply toothpaste/oil."
      ]
    },
    {
      icon: Globe,
      title: '🌍 Natural Disasters',
      color: 'bg-orange-500',
      tips: [
        'Earthquake: Drop, Cover, and Hold On under a table.',
        'Floods: Move to higher ground, never walk/drive through moving water.',
        'Heatstroke: Move victim to shade, give sips of water, and cool with wet cloths.',
        'Lightning: Avoid trees/open fields; crouch low if outside.'
      ]
    },
    {
      icon: Car,
      title: '🚗 Travel & Road Safety',
      color: 'bg-purple-500',
      tips: [
        'Always wear seatbelts and helmets.',
        "In an accident, call emergency services first, don't move victims unless unsafe.",
        'Keep a first aid kit and a bottle of water in your car.'
      ]
    },
    {
      icon: Zap,
      title: '⚡ Electrical & Chemical Safety',
      color: 'bg-yellow-500',
      tips: [
        'For electric shock: turn off power first, then help the victim.',
        "For gas leaks: don't light a flame; open windows and leave immediately.",
        'For chemical splashes: rinse with running water for 15+ minutes.'
      ]
    },
    {
      icon: Shield,
      title: '👮 Personal Safety',
      color: 'bg-green-500',
      tips: [
        'Keep emergency numbers saved (local ambulance, police, fire).',
        'Carry a whistle, torch, or power bank when traveling.',
        'Trust instincts – avoid unsafe areas at night or alone.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Save Life Tips</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow border">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-lg">Emergency Safety Guidelines</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4">Essential tips to help you stay safe and respond effectively in emergency situations.</p>
        </div>

        {emergencyTips.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow border">
            <div className="flex items-center gap-3 mb-4">
              <div className={`${category.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{category.title}</h3>
            </div>
            <ul className="space-y-3">
              {category.tips.map((tip, tipIndex) => (
                <li key={tipIndex} className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-800">Remember</h3>
          </div>
          <p className="text-sm text-red-700">
            These tips are meant to help in emergency situations, but always call professional emergency services (112) when possible. 
            Your safety and the safety of others should always be the top priority.
          </p>
        </div>
      </div>
    </div>
  )
}


