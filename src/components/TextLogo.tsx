import React from 'react';

type Size = 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  sm: 'text-lg leading-tight',
  md: 'text-xl md:text-2xl leading-tight',
  lg: 'text-2xl md:text-3xl leading-tight',
};

export interface TextLogoProps {
  className?: string;
  size?: Size;
}

export const TextLogo: React.FC<TextLogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div
      className={`font-bold tracking-tight text-foreground select-none ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <span className="block">PATCHWORK</span>
      <span className="block">DIZAYN</span>
    </div>
  );
};
