import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface LorryImageCarouselProps {
  images: (string | null)[];
  alt: string;
  className?: string;
}

const LorryImageCarousel = ({ images, alt, className = "" }: LorryImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter out null/empty images and add placeholder if no images
  const validImages = images.filter((img) => img && img.trim() !== "");
  const displayImages = validImages.length > 0 ? validImages : ["/placeholder.svg"];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Only show carousel controls if there are multiple images
  const showControls = displayImages.length > 1;

  return (
    <div className={`relative ${className}`}>
      <div ref={emblaRef} className="overflow-hidden rounded-md h-full">
        <div className="flex h-full">
          {displayImages.map((img, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <img src={img} alt={`${alt} ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-1.5 shadow-md hover:bg-background transition-colors disabled:opacity-30"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-1.5 shadow-md hover:bg-background transition-colors disabled:opacity-30"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedIndex ? "bg-primary w-4" : "bg-background/60 backdrop-blur-sm"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LorryImageCarousel;
