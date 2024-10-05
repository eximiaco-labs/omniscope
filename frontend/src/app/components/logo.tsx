import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 200, height = 50, alt = 'Omniscope Logo' }) => {
  return (
    <Image
      src="/images/logo.png"
      width={width}
      height={height}
      alt={alt}
      priority
    />
  );
};

export default Logo;