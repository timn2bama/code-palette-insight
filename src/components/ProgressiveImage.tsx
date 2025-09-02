import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  onClick?: () => void;
}

const ProgressiveImage = ({ src, alt, className, sizes, onClick }: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  if (!src || error) {
    return (
      <div className={cn(
        "bg-secondary/20 flex items-center justify-center text-muted-foreground",
        className
      )}>
        <div className="text-center">
          <div className="text-4xl mb-2">👕</div>
          <p className="text-sm">No photo</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          !loaded && "blur-sm scale-105 opacity-0",
          loaded && "blur-0 scale-100 opacity-100"
        )}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
      />
    </div>
  );
};

export default ProgressiveImage;