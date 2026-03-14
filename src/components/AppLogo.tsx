import React, { useState } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'navbar';

const sizeMap = {
  sm: { img: 'h-8 w-8' },
  md: { img: 'h-10 w-10' },
  lg: { img: 'h-14 w-14' },
  navbar: { img: 'h-14 w-14 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]' },
};

export interface AppLogoProps {
  className?: string;
  size?: Size;
  /** Show text next to logo - DEPRECATED: Text is now removed everywhere */
  showText?: boolean;
  /** Use light text (e.g. on dark nav) - DEPRECATED */
  light?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);
  const { img: imgClass } = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      {!imgError ? (
        <img
          src="/logo.png"
          alt="PATCHWORK DIZAYN"
          className={`${imgClass} w-auto object-contain shrink-0`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Patchwork squares fallback when image missing */
        <div className={`${imgClass} grid grid-cols-2 gap-px rounded border border-current opacity-80`}>
          <div className="bg-[#C46B4A]" />
          <div className="bg-[#D4A84B]" />
          <div className="bg-[#6B9B8A]" />
          <div className="bg-[#B8A9C9]" />
        </div>
      )}
    </div>
  );
};
