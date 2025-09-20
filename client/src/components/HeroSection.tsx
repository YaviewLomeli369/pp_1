import React from "react";
import AnimatedSection from "./AnimatedSection";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  appearance: any;
  className?: string;
}

export default function HeroSection({
  title,
  subtitle,
  children,
  appearance,
  className = ""
}: HeroSectionProps) {
  // Use optimized background image with fallback
  const getBackgroundImage = () => {
    if (appearance.heroBackgroundType === "gradient") {
      const color1 = appearance.heroGradientColor1 || "#3B82F6";
      const color2 = appearance.heroGradientColor2 || "#1E40AF";
      const color3 = appearance.heroGradientColor3;
      const color4 = appearance.heroGradientColor4;
      const direction = appearance.heroGradientDirection || "to right";
      const type = appearance.heroGradientType || "linear";

      let colors = [color1, color2];
      if (color3) colors.push(color3);
      if (color4) colors.push(color4);

      return type === "radial"
        ? `radial-gradient(circle, ${colors.join(", ")})`
        : `linear-gradient(${direction}, ${colors.join(", ")})`;
    }
    
    // Use smaller, optimized image
    if (appearance.heroBackgroundImage) {
      return `url("${appearance.heroBackgroundImage}")`;
    }
    
    // Default to a much smaller gradient instead of heavy image
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <AnimatedSection>
      <section
        className={`relative py-20 text-white text-center navbar-fixed-body ${className}`}
        style={{
          background: getBackgroundImage(),
          backgroundSize: appearance.heroBackgroundSize || "cover",
          backgroundPosition: appearance.heroBackgroundPosition || "center",
          backgroundRepeat: "no-repeat",
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