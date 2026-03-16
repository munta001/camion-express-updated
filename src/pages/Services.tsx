import { Link } from "react-router-dom";
import { Mountain, Truck, HardHat, Package, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";
import backhoeImg from "@/assets/backhoe-loader.jpg";
import bobcatImg from "@/assets/bobcat.jpg";
import excavatorImg from "@/assets/excavator.jpg";
import craneImg from "@/assets/crane.jpg";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Mountain,
      title: t("services.basaltTransport"),
      desc: t("services.basaltTransportDesc"),
      features: [t("services.quarryPickup"), t("services.bulkAggregates"), t("services.crushedStoneDelivery"), t("services.rawBasalt")],
    },
    {
      icon: Truck,
      title: t("services.constructionDelivery"),
      desc: t("services.constructionDeliveryDesc"),
      features: [t("services.sandGravel"), t("services.cementBags"), t("services.steelRebar"), t("services.bricksBlocks")],
    },
    {
      icon: HardHat,
      title: t("services.projectLogistics"),
      desc: t("services.projectLogisticsDesc"),
      features: [t("services.multiDrop"), t("services.scheduledRuns"), t("services.fleetCoordination"), t("services.siteTransfers")],
    },
    {
      icon: Package,
      title: t("services.generalHaulage"),
      desc: t("services.generalHaulageDesc"),
      features: [t("services.heavyEquipment"), t("services.machineryTransport"), t("services.bulkGoods"), t("services.islandCoverage")],
    },
  ];

  const comingSoonServices = [
    { image: backhoeImg, title: t("services.backhoeLoader"), desc: t("services.backhoeLoaderDesc") },
    { image: bobcatImg, title: t("services.bobcat"), desc: t("services.bobcatDesc") },
    { image: excavatorImg, title: t("services.excavator"), desc: t("services.excavatorDesc") },
    { image: craneImg, title: t("services.crane"), desc: t("services.craneDesc") },
  ];

  return (
    <Layout>
      <section className="py-20">
        <div className="container">
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-2">
            {t("services.title")} <span className="text-primary">{t("services.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground mb-16 max-w-lg">
            {t("services.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s) => (
              <div key={s.title} className="bg-card border border-border rounded-lg p-8 hover:border-primary/40 transition-colors">
                <s.icon className="h-12 w-12 text-primary mb-4" />
                <h2 className="font-display text-3xl text-foreground mb-3">{s.title}</h2>
                <p className="text-muted-foreground mb-6">{s.desc}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {s.features.map((f) => (
                    <li key={f} className="text-sm text-secondary-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-semibold text-sm rounded-full uppercase tracking-wider mb-4">
                {t("services.comingSoon")}
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
                {t("services.comingSoon")}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("services.comingSoonDesc")}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comingSoonServices.map((s) => (
                <div key={s.title} className="relative bg-card border border-dashed border-primary/30 rounded-lg overflow-hidden opacity-80">
                  <img src={s.image} alt={s.title} className="w-full h-40 object-cover" />
                  <div className="p-4 text-center">
                    <h3 className="font-display text-lg text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/quotation" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md text-lg hover:opacity-90 transition-opacity">
              {t("nav.quotation")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
