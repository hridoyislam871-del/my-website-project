export type ElementType = 'text' | 'shape' | 'abstract' | 'badge' | 'image';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'rounded-rect'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'hexagon'
  | 'line'
  | 'ring'
  | 'glow-orb'
  | 'sparkle';

export type PatternType =
  | 'none'
  | 'lowpoly'
  | 'dots'
  | 'hexgrid'
  | 'waves'
  | 'stars'
  | 'diagonal-stripes'
  | 'circuit';

export interface GradientStop {
  offset: number; // 0 to 1
  color: string;
  opacity?: number;
}

export interface BannerBackground {
  type: 'solid' | 'linear-gradient' | 'radial-gradient';
  color: string;
  gradientAngle: number; // in degrees
  gradientStops: GradientStop[];
  pattern: PatternType;
  patternOpacity: number; // 0 to 1
  patternColor: string;
  patternScale: number; // default 1
  glowEffect: boolean;
  glowColor: string;
  glowIntensity: number; // 0 to 1
  blur: number; // 0 to 20
}

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  x: number; // in px relative to inner banner (0..1584)
  y: number; // in px relative to inner banner (0..396)
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number; // 0 to 1
  locked?: boolean;
  visible?: boolean;
  blendMode?: 'normal' | 'screen' | 'multiply' | 'overlay' | 'soft-light' | 'color-dodge';
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  fill: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // tracking in px
  lineHeight: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  fillType?: 'solid' | 'gradient';
  gradientStops?: GradientStop[];
  gradientAngle?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  cornerRadius?: number;
  filterBlur?: number;
}

export interface AbstractElement extends BaseElement {
  type: 'abstract';
  abstractType:
    | 'mesh-facet'
    | 'glowing-orb'
    | 'particle-cluster'
    | 'molecular-node'
    | 'wave-ribbon'
    | 'geometric-burst'
    | 'glass-card';
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  variant?: number;
  customSvgPath?: string;
}

export interface BadgeElement extends BaseElement {
  type: 'badge';
  text: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize: number;
  paddingX?: number;
  paddingY?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  borderRadius?: number;
}

export type BannerElement = TextElement | ShapeElement | AbstractElement | BadgeElement | ImageElement;

export interface BannerDocument {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
  // Exact Artboard Dimensions
  artboardWidth: 2000;
  artboardHeight: 2000;
  // Exact Inner Banner Dimensions
  bannerWidth: 1584;
  bannerHeight: 396;
  background: BannerBackground;
  elements: BannerElement[];
}

export type ActiveTab = 'templates' | 'background' | 'text' | 'elements' | 'colors' | 'layers' | 'saved';

export type ViewMode = 'artboard' | 'banner' | 'preview';
