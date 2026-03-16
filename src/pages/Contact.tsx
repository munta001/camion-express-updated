import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Contact = () => {
  const { t } = useLanguage();

  const contactInfo = [
    { icon: Phone, label: t("contact.phone"), value: "+230 5851 9491 / +230 5422 2994", href: "tel:+230 58519491" },
    { icon: MessageCircle, label: "WhatsApp", value: "+230 5851 9491", href: "https://wa.me/23058519491?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20your%20transport%20services." },
    { icon: Mail, label: t("contact.email"), value: "info@camionexpress.mu", href: "mailto:info@camionexpress.mu" },
    { icon: MapPin, label: t("contact.address"), value: "Mahebourg, Mauritius", href: "#" },
  ];

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-2 flex items-center gap-3">
            <img src="https://jknnhftxmlrqrojihufl.supabase.co/storage/v1/object/public/fleet-images/cmexp-removebg-preview.png" alt="contact" className="w-20 h-20 md:w-20 md:h-20" />
            <span>
              {t("contact.title")}{" "}
              <span className="text-primary">{t("contact.titleHighlight")}</span>
            </span>
          </h1>
          <p className="text-muted-foreground mb-12">{t("contact.subtitle")}</p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {contactInfo.map((c) => (
                <a key={c.label} href={c.href} target={c.label === "WhatsApp" ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                    <div className="text-foreground whitespace-pre-line group-hover:text-primary transition-colors">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder={t("contact.yourName")} className="w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" required />
              <input type="email" placeholder={t("contact.yourEmail")} className="w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" required />
              <textarea placeholder={t("contact.yourMessage")} rows={5} className="w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none" required />
              <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
                {t("contact.sendMessage")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
