
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
  return (
    <AnimatedSection>
      <section
        className={`relative py-20 text-white text-center navbar-fixed-body ${className}`}
        style={{
          background: appearance.heroBackgroundType === "gradient" 
            ? (() => {
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
              })()
            : appearance.heroBackgroundImage 
              ? `url("${appearance.heroBackgroundImage}")`
              : 'url("https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </section>
    </AnimatedSection>
  );
}
