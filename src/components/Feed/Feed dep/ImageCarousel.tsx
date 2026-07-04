import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="profile-banner-fallback">No Preview Available</div>;
  }

  // Graceful fallback for single image
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={title}
        className="profile-banner-image"
      />
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div className="premium-carousel-container">
      {/* Main image presentation slot */}
      <div className="carousel-display-area">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className={`carousel-slide-item ${index === activeIndex ? 'active' : ''}`}
          >
            {index === activeIndex && (
              <>
                {/* Blur backdrop matching dominant colors of screenshot */}
                <img
                  src={imgUrl}
                  alt=""
                  className="carousel-ambient-backdrop"
                  aria-hidden="true"
                />
                {/* Actual image, contained inside area, fully visible with shadow */}
                <img
                  src={imgUrl}
                  alt={`${title} - Preview ${index + 1}`}
                  className="carousel-foreground-image"
                />
              </>
            )}
          </div>
        ))}

        {/* Overlay gradient */}
        <div className="profile-banner-overlay" />

        {/* Glassmorphic Arrows */}
        <button
          onClick={handlePrev}
          className="carousel-control-arrow prev"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="carousel-control-arrow next"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>

        {/* Interactive Overlay dots */}
        <div className="carousel-navigation-dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleDotClick(index, e)}
              className={`carousel-dot-btn ${index === activeIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Horizontal Interactive Thumbnail gallery */}
      <div className="carousel-thumbnail-row">
        {images.map((imgUrl, index) => (
          <button
            key={index}
            onClick={(e) => handleDotClick(index, e)}
            className={`carousel-thumbnail-item ${index === activeIndex ? 'active' : ''}`}
          >
            <img
              src={imgUrl}
              alt={`Thumbnail preview ${index + 1}`}
              className="carousel-thumb-img"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
