import { Link, useLocation } from "react-router-dom";
import { Truck, Menu, X, LogIn, Globe } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

const langCycle = { cr: "en", en: "fr", fr: "cr" } as const;
const langLabel = { cr: "KR", en: "EN", fr: "FR" } as const;

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/fleet", label: t("nav.fleet") },
    { to: "/quotation", label: t("nav.quotation") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            
            <img
              src="https://jknnhftxmlrqrojihufl.supabase.co/storage/v1/object/public/fleet-images/cmexp-removebg-preview.png"
              alt="Camion Express Logo"
              className="h-12 w-12 object-contain"
            />

            <span className="font-display text-2xl tracking-wider text-foreground">
              CAMION<span className="text-primary">EXPRESS</span>
            </span>

          </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setLang(langCycle[lang])}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md flex items-center gap-1"
          >
            <Globe className="h-4 w-4" />
            {langLabel[lang]}
          </button>
        </div>

        {/* Mobile: language toggle + menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLang(langCycle[lang])}
            className="px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md flex items-center gap-1"
          >
            <Globe className="h-4 w-4" />
            {langLabel[lang]}
          </button>
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
