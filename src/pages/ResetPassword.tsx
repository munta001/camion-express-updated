import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

const ResetPassword = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Invalid reset link");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Minimum 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success("Password updated!"); navigate("/login"); }
  };

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20 min-h-[70vh] flex items-center">
        <div className="container max-w-md">
          <h1 className="font-display text-4xl text-foreground mb-6 text-center">{t("reset.title")} <span className="text-primary">{t("reset.titleHighlight")}</span></h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className={inputClass} type="password" placeholder={t("reset.newPassword")} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className={inputClass} type="password" placeholder={t("reset.confirmPassword")} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? t("reset.updating") : t("reset.update")}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
