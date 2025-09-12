'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex justify-center items-center p-4"
      onClick={onClose}
    >
      {/* Image container */}
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
      >
        <Image
          src={imageUrl}
          alt="Enlarged view"
          fill
          className="object-contain rounded-lg"
        />
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-opacity-75 transition-opacity"
        aria-label="Close image view"
      >
        &times;
      </button>
    </div>
  );
}