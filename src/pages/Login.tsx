import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Truck, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      // Check role to redirect appropriately
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      navigate(isAdmin ? "/admin" : "/dashboard");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20 min-h-[70vh] flex items-center">
        <div className="container max-w-md">
          <div className="text-center mb-8">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              {t("login.title")} <span className="text-primary">{t("login.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground">{t("login.subtitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input className={inputClass} type="email" placeholder={t("login.email")} required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="relative">
              <input className={inputClass} type={showPassword ? "text" : "password"} placeholder={t("login.password")} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="text-primary text-sm hover:underline">{t("login.forgotPassword")}</Link>
            <p className="text-muted-foreground text-sm">
              {t("login.noAccount")}{" "}
              <Link to="/register" className="text-primary hover:underline">{t("login.registerAsOwner")}</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
