import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Truck, Shield, Clock, Mountain, ArrowRight, AlertCircle, CheckCircle, Weight, Ruler, Fuel, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Layout from "@/components/Layout";
import LorryImageCarousel from "@/components/LorryImageCarousel";
import heroImage from "@/assets/hero-truck.jpg";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";

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
}

const Index = () => {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("fleet_vehicles")
        .select("*")
        .eq("availability_status", "available")
        .order("sort_order")
        .limit(6);
      if (!error && data) setVehicles(data as FleetVehicle[]);
      setLoading(false);
    };
    fetchVehicles();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
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

  const highlights = [
    { icon: Mountain, title: t("home.basaltProducts"), desc: t("home.basaltProductsDesc") },
    { icon: Truck, title: t("home.constructionHaulage"), desc: t("home.constructionHaulageDesc") },
    { icon: Shield, title: t("home.safeInsured"), desc: t("home.safeInsuredDesc") },
    { icon: Clock, title: t("home.onTimeDelivery"), desc: t("home.onTimeDeliveryDesc") },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Camion Express lorry transporting materials" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10">
          <h1 className="font-display text-5xl md:text-7xl lg:text-7xl text-foreground leading-none mb-2 animate-fade-in-up">
            CAMION<br />
            <span className="text-primary">EXPRESS</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary/80 font-medium italic mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {t("home.tagline")}
          </p>
          <p className="text-lg text-muted-foreground max-w-lg mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {t("home.subtitle")}
          </p>
          <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <Link to="/quotation" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
              {t("home.requestQuotation")}
            </Link>
            <Link to="/services" className="inline-flex items-center px-6 py-3 border border-border text-foreground font-semibold rounded-md hover:bg-secondary transition-colors">
              {t("home.ourServices")}
            </Link>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-12">
            {t("home.whatWeDo")} <span className="text-primary">{t("home.whatWeDoHighlight")}</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((s) => (
              <div key={s.title} className="bg-card p-6 rounded-lg border border-border hover:border-primary/40 transition-colors">
                <s.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-display text-xl text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Lorry */}
      <section className="py-20">
        <div className="container">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
            {t("fleet.title")} <span className="text-primary">{t("fleet.titleHighlight")}</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">{t("fleet.subtitle")}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">{t("fleet.noVehicles")}</p>
          ) : (
            <div className="relative">
              <div ref={emblaRef} className="overflow-hidden rounded-lg">
                <div className="flex">
                  {vehicles.map((lorry) => (
                    <div key={lorry.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3">
                      <div className="bg-card border border-border rounded-lg overflow-hidden h-full">
                        <div className="h-48 overflow-hidden">
                          <LorryImageCarousel
                            images={lorry.image_urls || (lorry.image_url ? [lorry.image_url] : [])}
                            alt={lorry.name}
                            className="h-full"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-xl text-foreground mb-1">{lorry.name}</h3>
                          <p className="text-primary font-semibold text-sm mb-3">{t("fleet.capacity")}: {lorry.capacity}</p>
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                            {[
                              { icon: Weight, label: t("fleet.maxLoad"), value: lorry.max_load },
                              { icon: Ruler, label: t("fleet.bodySize"), value: lorry.body_size },
                              { icon: Fuel, label: t("fleet.engine"), value: lorry.engine },
                            ].map((spec) => (
                              <div key={spec.label} className="text-center">
                                <spec.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                                <div className="text-xs text-muted-foreground">{spec.label}</div>
                                <div className="text-xs font-semibold text-foreground">{spec.value}</div>
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/fleet" className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-md hover:bg-secondary transition-colors">
              {t("home.viewFleet")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
            {t("home.paymentTerms")} <span className="text-primary">{t("home.paymentTermsHighlight")}</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8">{t("home.paymentTermsDesc")}</p>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-lg font-semibold text-foreground">{t("home.depositRule")}</p>
            </div>
            <div className="space-y-4 ml-9">
              {["home.depositDetail1", "home.depositDetail2", "home.depositDetail3"].map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-muted-foreground">{t(key as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            {t("home.readyTo")} <span className="text-primary">{t("home.move")}</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t("home.ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quotation" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md text-lg hover:opacity-90 transition-opacity">
              {t("home.requestQuotation")} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/fleet" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-md text-lg hover:bg-secondary transition-colors">
              {t("home.viewFleet")}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
