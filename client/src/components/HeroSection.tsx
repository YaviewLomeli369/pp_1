import React from "react";
import AnimatedSection from "./AnimatedSection";
import { useLocation } from "wouter";

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  appearance?: any;
  className?: string;
  pageId?: string; // Optional specific page ID
}

export default function HeroSection({
  title,
  subtitle,
  children,
  appearance = {},
  className = "",
  pageId,
}: HeroSectionProps) {
  const [location] = useLocation();

  // Determine the current page ID if not explicitly provided
  const currentPageId = pageId || (() => {
    if (location === "/" || location === "/home") return "home";
    if (location.startsWith("/servicios")) return "servicios";
    if (location.startsWith("/conocenos")) return "conocenos";
    if (location.startsWith("/faqs")) return "faqs";
    if (location.startsWith("/blog")) return "blog";
    return "home"; // fallback
  })();

  // Get page-specific background image or fallback to global
  const getBackgroundImage = () => {
    // Check for page-specific image first
    const pageSpecificKey = `hero${currentPageId.charAt(0).toUpperCase() + currentPageId.slice(1)}BackgroundImage`;
    const pageSpecificImage = appearance[pageSpecificKey];

    if (pageSpecificImage) {
      return pageSpecificImage;
    }

    // Fallback to global hero background image
    return appearance.heroBackgroundImage;
  };

  const backgroundImage = getBackgroundImage();

  // Get background styles
  const getBackgroundStyle = () => {
    if (appearance.heroBackgroundType === "gradient") {
      const direction = appearance.heroGradientDirection || "to right";
      const color1 = appearance.heroGradientColor1 || "#3B82F6";
      const color2 = appearance.heroGradientColor2 || "#1E40AF";
      const color3 = appearance.heroGradientColor3;
      const color4 = appearance.heroGradientColor4;

      let gradient = `linear-gradient(${direction}, ${color1}, ${color2}`;
      if (color3) gradient += `, ${color3}`;
      if (color4) gradient += `, ${color4}`;
      gradient += ")";

      return { backgroundImage: gradient };
    }

    // Use page-specific or fallback image
    const heroImage = backgroundImage || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2000&q=80";
    return {
      backgroundImage: `url("${heroImage}")`,
      backgroundSize: appearance.heroBackgroundSize || "cover",
      backgroundPosition: appearance.heroBackgroundPosition || "center",
      backgroundRepeat: "no-repeat",
    };
  };

  return (
    <AnimatedSection>
      <section
        className={`relative py-20 text-white text-center navbar-fixed-body ${className}`}
        style={{
          ...getBackgroundStyle(),
          fontFamily: appearance.fontFamily || "inherit",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: appearance.heroOverlayColor || "#000000",
            opacity: (appearance.heroOverlayOpacity || 50) / 100
          }}
        ></div>

        <div
          className="relative max-w-4xl mx-auto px-4"
          style={{ color: appearance.heroTextColor || '#ffffff' }}
        >
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg"
            style={{ color: appearance.heroTextColor || '#ffffff' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-lg md:text-xl mb-8 opacity-90"
              style={{ color: appearance.heroTextColor || '#ffffff' }}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </section>
    </AnimatedSection>
  );
}