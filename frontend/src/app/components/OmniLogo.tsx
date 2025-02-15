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
    <div style={{ backgroundColor: 'black', display: 'inline-block', borderRadius: '4px', padding: '4px' }}>
      <Image
        src="/images/logo.png"
        width={width-4}
        height={height-4} 
        className={className}
        alt={alt}
      />
    </div>
  );
};

export default Logo;