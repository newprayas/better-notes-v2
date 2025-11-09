'use client';

import { useState, useEffect, useRef } from 'react';
import { YouTubeVideo } from '@/types';
import { getYouTubeThumbnail, extractYouTubeId } from '@/lib/sanity/api';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';

interface YouTubeVideoSlideshowProps {
  videos: YouTubeVideo[];
  autoPlayInterval?: number; // in milliseconds
}

export default function YouTubeVideoSlideshow({ 
  videos, 
  autoPlayInterval = 5000 
}: YouTubeVideoSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play slideshow
  useEffect(() => {
    if (!isPaused && videos.length > 1 && !isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isPlaying, videos.length, autoPlayInterval]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handleVideoClick = () => {
    setIsPlaying(true);
    setIsPaused(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleThumbnailHover = () => {
    setIsPaused(true);
  };

  const handleThumbnailLeave = () => {
    if (!isPlaying) {
      setIsPaused(false);
    }
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];
  const videoId = extractYouTubeId(currentVideo.youtubeUrl);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Video Display */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl mb-4">
        {isPlaying && videoId ? (
          <div className="relative w-full h-full">
            <button
              onClick={handleClosePlayer}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={currentVideo.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={handleVideoClick}
            onMouseEnter={handleThumbnailHover}
            onMouseLeave={handleThumbnailLeave}
          >
            <img
              src={getYouTubeThumbnail(currentVideo.youtubeUrl, 'high') || ''}
              alt={currentVideo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-black" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white text-lg font-semibold mb-1">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="text-white/80 text-sm line-clamp-2">{currentVideo.description}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {videos.length > 1 && (
        <div className="flex justify-center mb-4">
          <div className="flex gap-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-yellow-400 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}