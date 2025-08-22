import { useState } from 'react';
import { X, PlayCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

interface VideoCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  videos: VideoGuide[];
}

interface VideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoGuideModal({ isOpen, onClose }: VideoGuideModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);

  const videoCategories: VideoCategory[] = [
    {
      id: 'fire-safety',
      name: 'Fire & Safety',
      description: 'Learn about fire prevention, evacuation, and emergency response',
      icon: '🔥',
      color: 'bg-red-500',
      videos: [
        {
          id: 'fire-evacuation',
          title: 'Fire Evacuation Procedures',
          description: 'Step-by-step guide for safe fire evacuation',
          duration: '8 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example1'
        },
        {
          id: 'fire-extinguisher',
          title: 'How to Use Fire Extinguisher',
          description: 'Proper technique for using different types of fire extinguishers',
          duration: '6 min',
          thumbnail: 'https://images.unsplash.com/photo-1582735689369-4fe89db71174?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example2'
        }
      ]
    },
    {
      id: 'medical-emergencies',
      name: 'Medical Emergencies',
      description: 'First aid for common medical emergencies and injuries',
      icon: '🏥',
      color: 'bg-blue-500',
      videos: [
        {
          id: 'cpr-adult',
          title: 'Adult CPR - Complete Guide',
          description: 'Comprehensive CPR training for adults',
          duration: '12 min',
          thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example3'
        },
        {
          id: 'choking-relief',
          title: 'Heimlich Maneuver',
          description: 'How to help someone who is choking',
          duration: '5 min',
          thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example4'
        },
        {
          id: 'bleeding-control',
          title: 'Bleeding Control Techniques',
          description: 'Stop severe bleeding and prevent shock',
          duration: '7 min',
          thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example5'
        }
      ]
    },
    {
      id: 'water-emergencies',
      name: 'Water-Related Emergencies',
      description: 'Water safety and rescue techniques',
      icon: '🌊',
      color: 'bg-cyan-500',
      videos: [
        {
          id: 'drowning-rescue',
          title: 'Drowning Rescue Techniques',
          description: 'Safe methods to rescue drowning victims',
          duration: '9 min',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example6'
        },
        {
          id: 'water-safety',
          title: 'Water Safety Guidelines',
          description: 'Prevention and safety measures around water',
          duration: '6 min',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example7'
        }
      ]
    },
    {
      id: 'natural-disasters',
      name: 'Natural Disasters',
      description: 'Emergency preparedness for natural disasters',
      icon: '🌪',
      color: 'bg-orange-500',
      videos: [
        {
          id: 'earthquake-safety',
          title: 'Earthquake Safety Procedures',
          description: 'What to do during and after an earthquake',
          duration: '10 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example8'
        },
        {
          id: 'storm-preparedness',
          title: 'Storm and Hurricane Preparedness',
          description: 'Preparing for severe weather events',
          duration: '8 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example9'
        }
      ]
    },
    {
      id: 'travel-transport',
      name: 'Travel & Transport Emergencies',
      description: 'Emergency response for travel and transportation incidents',
      icon: '🚗',
      color: 'bg-purple-500',
      videos: [
        {
          id: 'car-accident',
          title: 'Car Accident Response',
          description: 'First aid for car accident victims',
          duration: '11 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example10'
        },
        {
          id: 'airplane-emergency',
          title: 'Airplane Emergency Procedures',
          description: 'Safety procedures during flight emergencies',
          duration: '7 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example11'
        }
      ]
    },
    {
      id: 'electrical-chemical',
      name: 'Electrical & Chemical Hazards',
      description: 'Safety measures for electrical and chemical emergencies',
      icon: '⚡',
      color: 'bg-yellow-500',
      videos: [
        {
          id: 'electrical-shock',
          title: 'Electrical Shock First Aid',
          description: 'How to help someone who has been electrocuted',
          duration: '6 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example12'
        },
        {
          id: 'chemical-exposure',
          title: 'Chemical Exposure Response',
          description: 'First aid for chemical burns and exposure',
          duration: '8 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example13'
        }
      ]
    },
    {
      id: 'personal-safety',
      name: 'Personal Safety',
      description: 'Self-defense and personal safety techniques',
      icon: '🛡',
      color: 'bg-green-500',
      videos: [
        {
          id: 'self-defense-basics',
          title: 'Basic Self-Defense Techniques',
          description: 'Simple self-defense moves for emergency situations',
          duration: '9 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example14'
        },
        {
          id: 'situational-awareness',
          title: 'Situational Awareness',
          description: 'How to stay alert and avoid dangerous situations',
          duration: '5 min',
          thumbnail: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=400&h=225&fit=crop',
          videoUrl: 'https://www.youtube.com/watch?v=example15'
        }
      ]
    }
  ];

  const handleCategorySelect = (category: VideoCategory) => {
    setSelectedCategory(category);
    setSelectedVideo(null);
  };

  const handleVideoSelect = (video: VideoGuide) => {
    setSelectedVideo(video);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedVideo(null);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
  };

  const handleVideoPlay = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {selectedCategory && (
              <button
                onClick={handleBackToCategories}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {selectedVideo && (
              <button
                onClick={handleBackToVideos}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold">
              {selectedVideo ? selectedVideo.title : selectedCategory ? selectedCategory.name : 'Video Guide'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!selectedCategory && !selectedVideo && (
            // Categories View
            <div>
              <p className="text-gray-600 mb-6">Select a category to view available video guides:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="text-left p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <div className="mt-3 text-sm text-gray-500">
                      {category.videos.length} videos available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCategory && !selectedVideo && (
            // Videos View
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{selectedCategory.name}</h3>
                <p className="text-gray-600">{selectedCategory.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCategory.videos.map((video) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{video.duration}</span>
                        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                          View here
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedVideo && (
            // Video Detail View
            <div>
              <div className="mb-6">
                <div className="relative mb-4">
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
                <p className="text-gray-600 mb-3">{selectedVideo.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <PlayCircle className="w-4 h-4 mr-1" />
                  <span>{selectedVideo.duration}</span>
                </div>
                <button
                  onClick={() => handleVideoPlay(selectedVideo.videoUrl)}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch on YouTube
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
