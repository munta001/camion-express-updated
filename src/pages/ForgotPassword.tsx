import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); } else { setSent(true); }
  };

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20 min-h-[70vh] flex items-center">
        <div className="container max-w-md text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">{t("forgot.title")} <span className="text-primary">{t("forgot.titleHighlight")}</span></h1>
          {sent ? (
            <>
              <p className="text-muted-foreground mb-4">{t("forgot.checkEmail")}</p>
              <Link to="/login" className="text-primary hover:underline">{t("forgot.backToLogin")}</Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className={inputClass} type="email" placeholder={t("login.email")} required value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? t("forgot.sending") : t("forgot.send")}
              </button>
              <Link to="/login" className="text-muted-foreground text-sm hover:underline block">{t("forgot.backToLogin")}</Link>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
