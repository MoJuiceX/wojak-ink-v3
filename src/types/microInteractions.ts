/**
 * Micro-Interactions Type Definitions
 *
 * Types for animations, haptics, loading states, and feedback patterns.
 */

// ============ Animation Configuration ============

export type EasingPreset =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | 'bounce'
  | 'snappy';

export interface AnimationConfig {
  duration: number;
  easing: EasingPreset | string;
  delay?: number;
  reduceMotionFallback?: AnimationConfig;
}

export interface HoverConfig {
  scale?: number;
  y?: number;
  x?: number;
  rotate?: number;
  boxShadow?: string;
  borderColor?: string;
  backgroundColor?: string;
  opacity?: number;
  filter?: string;
}

export interface PressConfig {
  scale: number;
  y?: number;
}

export interface FocusConfig {
  outline: string;
  outlineOffset: string;
  boxShadow?: string;
}

// ============ Haptic Patterns ============

export type HapticPattern =
  | 'tap'
  | 'success'
  | 'error'
  | 'warning'
  | 'notification'
  | 'selection'
  | 'toggle'
  | number
  | number[];

export interface HapticConfig {
  enabled: boolean;
  pattern: HapticPattern;
  respectSilentMode: boolean;
}

// ============ Loading States ============

export type LoadingVariant =
  | 'skeleton'
  | 'shimmer'
  | 'pulse'
  | 'spinner'
  | 'bar'
  | 'dots';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonConfig {
  variant: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation: 'shimmer' | 'pulse' | 'none';
  animationDuration: number;
}

export interface LoadingState {
  isLoading: boolean;
  variant: LoadingVariant;
  message?: string;
  progress?: number;
}

// ============ Scroll Animations ============

export type ScrollAnimationType =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'slideIn';

export interface ScrollAnimationConfig {
  type: ScrollAnimationType;
  threshold: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
  rootMargin?: string;
}

// ============ Empty States ============

export interface EmptyStateConfig {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

// ============ Error States ============

export type ErrorType =
  | 'network'
  | 'notFound'
  | 'serverError'
  | 'validation'
  | 'timeout'
  | 'imageLoad';

export interface ErrorStateConfig {
  type: ErrorType;
  title: string;
  message: string;
  retryable: boolean;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

// ============ Copy to Clipboard ============

export interface CopyConfig {
  text: string;
  successMessage: string;
  successDuration: number;
  showToast: boolean;
  haptic: HapticPattern;
}

// ============ Interaction Feedback ============

export interface InteractionFeedback {
  hover: HoverConfig;
  press: PressConfig;
  focus: FocusConfig;
  disabled: {
    opacity: number;
    cursor: string;
  };
}

// ============ Motion Preferences ============

export interface MotionPreferences {
  prefersReducedMotion: boolean;
  enableHaptics: boolean;
  enableSoundEffects: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}
