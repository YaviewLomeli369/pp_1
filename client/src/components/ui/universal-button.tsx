
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

// Default button variants as fallback
const defaultButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface UniversalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof defaultButtonVariants> {
  asChild?: boolean
  useConfig?: boolean // Whether to use dynamic config or fallback to default
}

const UniversalButton = React.forwardRef<HTMLButtonElement, UniversalButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, useConfig = true, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Fetch button configurations
    const { data: buttonConfigs } = useQuery({
      queryKey: ["/api/button-config"],
      enabled: useConfig,
      staleTime: 5 * 60 * 1000, // 5 minutes
      suspense: false,
      refetchOnWindowFocus: false,
    });

    // Find the configuration for this variant and size
    const config = React.useMemo(() => {
      if (!useConfig || !buttonConfigs || !Array.isArray(buttonConfigs)) {
        return null;
      }
      
      return buttonConfigs.find((config: any) => 
        config.variant === variant && 
        config.size === size && 
        config.isActive
      );
    }, [buttonConfigs, variant, size, useConfig]);

    // Generate dynamic styles from config
    const dynamicStyles = React.useMemo(() => {
      if (!config) return {};

      const styles: React.CSSProperties = {};

      // Apply colors
      if (config.colors) {
        styles.backgroundColor = config.colors.background;
        styles.color = config.colors.foreground;
        styles.borderColor = config.colors.border;
      }

      // Apply typography
      if (config.typography) {
        styles.fontFamily = config.typography.fontFamily;
        styles.fontSize = config.typography.fontSize;
        styles.fontWeight = config.typography.fontWeight;
        styles.lineHeight = config.typography.lineHeight;
        styles.letterSpacing = config.typography.letterSpacing;
      }

      // Apply spacing
      if (config.spacing) {
        styles.paddingLeft = config.spacing.paddingX;
        styles.paddingRight = config.spacing.paddingX;
        styles.paddingTop = config.spacing.paddingY;
        styles.paddingBottom = config.spacing.paddingY;
        styles.margin = config.spacing.margin;
      }

      // Apply borders
      if (config.borders) {
        styles.borderRadius = config.borders.radius;
        styles.borderWidth = config.borders.width;
        styles.borderStyle = config.borders.style;
      }

      // Apply effects
      if (config.effects) {
        styles.boxShadow = config.effects.shadow;
        styles.transition = config.effects.transition;
        styles.transform = config.effects.transform;
      }

      return styles;
    }, [config]);

    // Create hover styles
    const hoverStyles = React.useMemo(() => {
      if (!config) return {};

      return {
        backgroundColor: config.colors?.hoverBackground,
        color: config.colors?.hoverForeground,
        borderColor: config.colors?.hoverBorder,
        boxShadow: config.effects?.hoverShadow,
        transform: config.effects?.hoverTransform,
      };
    }, [config]);

    // Generate CSS variables for hover effects
    const cssVariables = React.useMemo(() => {
      if (!config) return {};

      return {
        '--hover-bg': config.colors?.hoverBackground,
        '--hover-color': config.colors?.hoverForeground,
        '--hover-border': config.colors?.hoverBorder,
        '--hover-shadow': config.effects?.hoverShadow,
        '--hover-transform': config.effects?.hoverTransform,
        '--focus-bg': config.colors?.focusBackground,
        '--focus-color': config.colors?.focusForeground,
        '--focus-border': config.colors?.focusBorder,
        '--active-bg': config.colors?.activeBackground,
        '--active-color': config.colors?.activeForeground,
        '--active-border': config.colors?.activeBorder,
      } as React.CSSProperties;
    }, [config]);

    const buttonClassName = useConfig && config 
      ? "universal-button" 
      : defaultButtonVariants({ variant, size, className });

    return (
      <>
        {useConfig && config && (
          <style>
            {`
              .universal-button:hover {
                background-color: var(--hover-bg) !important;
                color: var(--hover-color) !important;
                border-color: var(--hover-border) !important;
                box-shadow: var(--hover-shadow) !important;
                transform: var(--hover-transform) !important;
              }
              .universal-button:focus {
                background-color: var(--focus-bg) !important;
                color: var(--focus-color) !important;
                border-color: var(--focus-border) !important;
              }
              .universal-button:active {
                background-color: var(--active-bg) !important;
                color: var(--active-color) !important;
                border-color: var(--active-border) !important;
              }
            `}
          </style>
        )}
        <Comp
          className={cn(buttonClassName, className)}
          ref={ref}
          style={{
            ...cssVariables,
            ...dynamicStyles,
            ...style,
          }}
          {...props}
        />
      </>
    )
  }
)
UniversalButton.displayName = "UniversalButton"

export { UniversalButton, defaultButtonVariants }
