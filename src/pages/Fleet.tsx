import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Weight, Ruler, Fuel, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Layout from "@/components/Layout";
import LorryImageCarousel from "@/components/LorryImageCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface FleetVehicle {
  id: string;
  name: string;
  capacity: string;
  body: string;
  ideal: string;
  image_url: string | null;
  image_urls: string[] | null;
  max_load: string;
  body_size: string;
  engine: string;
  sort_order: number;
}

const Fleet = () => {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("fleet_vehicles")
        .select("*")
        .eq("availability_status", "available")
        .order("sort_order");
      if (!error && data) setVehicles(data as FleetVehicle[]);
      setLoading(false);
    };
    fetchVehicles();
  }, []);

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
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <Layout>
      <section className="py-20">
        <div className="container">
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-2">
            {t("fleet.title")} <span className="text-primary">{t("fleet.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground mb-12 max-w-lg">
            {t("fleet.subtitle")}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">{t("fleet.noVehicles")}</p>
          ) : (
            <>
              <div className="relative">
                <div ref={emblaRef} className="overflow-hidden rounded-lg">
                  <div className="flex">
                    {vehicles.map((lorry) => (
                      <div key={lorry.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_80%] px-2">
                        <div className="bg-card border border-border rounded-lg overflow-hidden md:flex">
                          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                            <LorryImageCarousel
                              images={lorry.image_urls || (lorry.image_url ? [lorry.image_url] : [])}
                              alt={lorry.name}
                              className="h-full"
                            />
                          </div>
                          <div className="md:w-1/2 p-8 flex flex-col justify-center">
                            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">{lorry.name}</h2>
                            <p className="text-primary font-semibold text-lg mb-4">{t("fleet.capacity")}: {lorry.capacity}</p>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="text-secondary-foreground font-medium">{t("fleet.body")}:</span> {lorry.body}
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                              <span className="text-secondary-foreground font-medium">{t("fleet.idealFor")}:</span> {lorry.ideal}
                            </p>
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                              {[
                                { icon: Weight, label: t("fleet.maxLoad"), value: lorry.max_load },
                                { icon: Ruler, label: t("fleet.bodySize"), value: lorry.body_size },
                                { icon: Fuel, label: t("fleet.engine"), value: lorry.engine },
                              ].map((spec) => (
                                <div key={spec.label} className="text-center">
                                  <spec.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                                  <div className="text-xs text-muted-foreground">{spec.label}</div>
                                  <div className="text-sm font-semibold text-foreground">{spec.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={!canScrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                  aria-label="Previous lorry"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={!canScrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                  aria-label="Next lorry"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                {vehicles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => emblaApi?.scrollTo(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${idx === selectedIndex ? "bg-primary" : "bg-border"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mt-16 text-center">
            <Link to="/quotation" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md text-lg hover:opacity-90 transition-opacity">
              {t("fleet.requestCamion")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Fleet;
