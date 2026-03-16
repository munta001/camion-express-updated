import Layout from "@/components/Layout";
import aboutImage from "@/assets/about-quarry.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const About = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="relative h-[50vh] flex items-end overflow-hidden">
        <img src={aboutImage} alt="Quarry operations" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="container relative z-10 pb-12">
          <h1 className="font-display text-5xl md:text-7xl text-foreground">{t("about.title")} <span className="text-primary">{t("about.titleHighlight")}</span></h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl space-y-6 text-secondary-foreground">
          <p className="text-lg leading-relaxed">
            <strong className="text-primary">Camion Express</strong> {t("about.p1")}
          </p>
          <p className="leading-relaxed text-muted-foreground">{t("about.p2")}</p>
          <p className="leading-relaxed text-muted-foreground">{t("about.p3")}</p>

          <div className="grid sm:grid-cols-3 gap-6 pt-8">
            {[
              { num: "500+", label: t("about.deliveriesMonthly") },
              { num: "15+", label: t("about.lorriesInFleet") },
              { num: "10+", label: t("about.yearsExperience") },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-card border border-border rounded-lg">
                <div className="font-display text-4xl text-primary">{stat.num}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
