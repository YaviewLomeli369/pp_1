
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AnimatedSection from "./AnimatedSection";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isVisible: boolean;
  order: number;
}

interface CarouselSectionProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  appearance?: any;
  height?: number;
}

export default function CarouselSection({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  appearance = {},
  height = 600
}: CarouselSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const visibleSlides = slides.filter(slide => slide.isVisible).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!autoPlay || visibleSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, visibleSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % visibleSlides.length);
  };

  if (visibleSlides.length === 0) {
    return null;
  }

  const currentSlideData = visibleSlides[currentSlide];

  return (
    <AnimatedSection>
      <section 
        className={`relative w-full overflow-hidden ${className}`}
        style={{ height: `${height}px` }}
      >
        {/* Slide Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: currentSlideData.image ? `url("${currentSlideData.image}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: appearance.heroOverlayColor || '#000000',
              opacity: (appearance.heroOverlayOpacity || 50) / 100
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div 
            className="text-center max-w-4xl mx-auto px-4"
            style={{ color: appearance.heroTextColor || '#ffffff' }}
          >
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg"
              style={{ 
                color: appearance.heroTextColor || '#ffffff',
                fontFamily: appearance.fontFamily || 'inherit'
              }}
            >
              {currentSlideData.title}
            </h1>
            
            {currentSlideData.subtitle && (
              <h2 
                className="text-xl md:text-2xl mb-6 opacity-90"
                style={{ 
                  color: appearance.heroTextColor || '#ffffff',
                  fontFamily: appearance.fontFamily || 'inherit'
                }}
              >
                {currentSlideData.subtitle}
              </h2>
            )}
            
            {currentSlideData.description && (
              <p 
                className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto"
                style={{ 
                  color: appearance.heroTextColor || '#ffffff',
                  fontFamily: appearance.fontFamily || 'inherit'
                }}
              >
                {currentSlideData.description}
              </p>
            )}
            
            {currentSlideData.buttonText && currentSlideData.buttonLink && (
              <div className="space-x-4">
                {currentSlideData.buttonLink.startsWith('http') ? (
                  <a
                    href={currentSlideData.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button size="lg" variant="secondary">
                      {currentSlideData.buttonText}
                    </Button>
                  </a>
                ) : (
                  <Button size="lg" variant="secondary" asChild>
                    <Link href={currentSlideData.buttonLink}>
                      {currentSlideData.buttonText}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && visibleSlides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all text-white"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all text-white"
              aria-label="Siguiente slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && visibleSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {visibleSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {visibleSlides.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-black bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
            {currentSlide + 1} / {visibleSlides.length}
          </div>
        )}
      </section>
    </AnimatedSection>
  );
}
