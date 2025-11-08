'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getActiveSlideshow } from '@/lib/sanity/api';
import { urlFor } from '@/lib/sanity/client';
import { Slideshow, SlideshowImage } from '@/types';

const ImageSlideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(16/9); // Default fallback
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to calculate aspect ratio from image metadata
  const getAspectRatio = (image: SlideshowImage): number => {
    // Use standardized aspect ratios for perfect display
    if (isPortraitImage(image)) {
      return 800 / 1000; // 4:5 ratio for portrait images (reduced size)
    }
    return 1920 / 1080; // 16:9 ratio for landscape images
  };

  // Helper function to determine if image is portrait
  const isPortraitImage = (image: SlideshowImage): boolean => {
    if (image?.asset?.metadata?.dimensions) {
      const { width, height } = image.asset.metadata.dimensions;
      if (width && height) {
        return height > width;
      }
    }
    return false; // Default to landscape if metadata is not available
  };

  // Fetch slideshow data from Sanity
  useEffect(() => {
    async function fetchSlideshow() {
      try {
        const slideshowData = await getActiveSlideshow();
        setSlideshow(slideshowData);
      } catch (error) {
        console.error("Failed to fetch slideshow:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlideshow();
  }, []);

  // Update aspect ratio when current image changes
  useEffect(() => {
    const images = slideshow?.images || [];
    if (images.length > 0 && currentImageIndex < images.length) {
      const currentImage = images[currentImageIndex];
      const aspectRatio = getAspectRatio(currentImage);
      setCurrentAspectRatio(aspectRatio);
    }
  }, [currentImageIndex, slideshow?.images]);

  // Auto-advance slideshow
  useEffect(() => {
    const images = slideshow?.images || [];
    if (images.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 2800); // Change image every 2.8 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slideshow?.images?.length]);

  const images = slideshow?.images || [];

  if (isLoading) {
    return (
      <div className="relative w-11/12 md:w-4/5 lg:w-3/4 overflow-hidden bg-black rounded-lg mx-auto" style={{ aspectRatio: currentAspectRatio }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative w-11/12 md:w-4/5 lg:w-3/4 overflow-hidden bg-black rounded-lg mx-auto" style={{ aspectRatio: currentAspectRatio }}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
            <p>No slideshow images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-black rounded-lg mx-auto transition-all duration-500 ease-in-out ${
        images[currentImageIndex] && isPortraitImage(images[currentImageIndex])
          ? 'max-w-lg'
          : 'w-11/12 md:w-4/5 lg:w-3/4'
      }`}
      style={{ aspectRatio: currentAspectRatio }}
    >
      <div className="flex h-full transition-transform duration-500 ease-in-out"
           style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
        {images.map((image: SlideshowImage, index: number) => (
          <div
            key={image._key || index}
            className="w-full h-full flex-shrink-0 relative"
          >
            {image?.asset ? (
              <>
                <Image
                  src={urlFor(image)
                    .width(isPortraitImage(image) ? 800 : 1920)
                    .height(isPortraitImage(image) ? 1000 : 1080)
                    .fit("fill")
                    .url()}
                  alt={image.alt || `Slideshow image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 75vw"
                  priority={index === 0}
                  style={{
                    objectPosition: 'center'
                  }}
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                    <p className="text-center">{image.caption}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <p>Image {index + 1}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlideshow;