import React from 'react';
import Image from 'next/image';

interface LogoProps {
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  alt = 'Omniscope Logo', 
  className,
  width = 72,
  height = 72 
}) => {
  return (
    <Image
      src="/images/logo.png"
      width={width}
      height={height} 
      className={className}
      alt={alt}
    />
  );
};

export default Logo;