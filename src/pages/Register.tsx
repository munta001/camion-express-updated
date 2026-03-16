import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Truck, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Register = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName: "", companyName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.fullName, company_name: form.companyName, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); } else { setRegistered(true); }
  };

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  if (registered) {
    return (
      <Layout>
        <section className="py-20 min-h-[70vh] flex items-center">
          <div className="container max-w-md text-center">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl text-foreground mb-4">{t("register.checkEmail")} <span className="text-primary">{t("register.checkEmailHighlight")}</span></h1>
            <p className="text-muted-foreground mb-2">{t("register.verificationSent")} <strong className="text-foreground">{form.email}</strong>.</p>
            <p className="text-muted-foreground text-sm">{t("register.afterVerifying")}</p>
            <Link to="/login" className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
              {t("register.goToLogin")}
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-md">
          <div className="text-center mb-8">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              {t("register.title")} <span className="text-primary">{t("register.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground">{t("register.subtitle")}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input className={inputClass} placeholder={t("register.fullName")} required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            <input className={inputClass} placeholder={t("register.companyName")} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
            <input className={inputClass} placeholder={t("register.phone")} type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            <input className={inputClass} placeholder={t("register.email")} type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            <div className="relative">
              <input className={inputClass} type={showPassword ? "text" : "password"} placeholder={t("register.password")} required value={form.password} onChange={(e) => update("password", e.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <input className={inputClass} type={showPassword ? "text" : "password"} placeholder={t("register.confirmPassword")} required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? t("register.registering") : t("register.register")}
            </button>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {t("register.alreadyAccount")} <Link to="/login" className="text-primary hover:underline">{t("register.signIn")}</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
