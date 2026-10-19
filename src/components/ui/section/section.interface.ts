export interface SectionProps {
  variant?: 'white' | 'light' | 'accent' | 'primary';
  bgImgPath?: string;
  children?: JSX.Element;
  fullWidth?: boolean;
  maxWidth?: number;
  className?: string;
  Comp?: keyof JSX.IntrinsicElements;
}
