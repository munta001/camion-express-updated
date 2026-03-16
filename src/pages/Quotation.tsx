import Layout from "@/components/Layout";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const materialOptions = [
  "Basalt Aggregates",
  "Crushed Stone",
  "Sand",
  "Gravel",
  "Cement",
  "Steel / Rebar",
  "Bricks / Blocks",
  "Other",
];

const Quotation = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "",
    material: "", quantity: "", pickupLocation: "", deliveryLocation: "",
    preferredDate: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isOtherMaterial = form.material === "Other";

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOtherMaterial && !form.notes.trim()) {
      toast.error(t("quotation.notesRequiredForOther"));
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("transport_requests").insert({
        name: form.name,
        company: form.company || null,
        email: form.email,
        phone: form.phone,
        material: form.material,
        quantity: form.quantity || null,
        pickup_location: form.pickupLocation || "To be confirmed",
        delivery_location: form.deliveryLocation,
        preferred_date: form.preferredDate || null,
        notes: form.notes || null,
      });

      if (error) throw error;

      await supabase.functions.invoke("send-transport-email", {
        body: {
          name: form.name, company: form.company, email: form.email, phone: form.phone,
          material: form.material, quantity: form.quantity,
          pickup_location: form.pickupLocation, delivery_location: form.deliveryLocation,
          preferred_date: form.preferredDate, notes: form.notes,
        },
      });

      toast.success(t("quotation.success"));
      setForm({ name: "", company: "", email: "", phone: "", material: "", quantity: "", pickupLocation: "", deliveryLocation: "", preferredDate: "", notes: "" });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(t("quotation.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-2">
            {t("quotation.title")} <span className="text-primary">{t("quotation.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground mb-10">{t("quotation.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("quotation.fullName")} required value={form.name} onChange={(e) => update("name", e.target.value)} />
              <input className={inputClass} placeholder={t("quotation.companyName")} value={form.company} onChange={(e) => update("company", e.target.value)} />
              <input className={inputClass} placeholder={t("quotation.email")} type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              <input className={inputClass} placeholder={t("quotation.phone")} type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <select className={inputClass} required value={form.material} onChange={(e) => update("material", e.target.value)}>
                <option value="" disabled>{t("quotation.selectMaterial")}</option>
                {materialOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input className={inputClass} placeholder={t("quotation.quantity")} value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("quotation.pickupLocation")} value={form.pickupLocation} onChange={(e) => update("pickupLocation", e.target.value)} />
              <input className={inputClass} placeholder={t("quotation.deliveryLocation")} required value={form.deliveryLocation} onChange={(e) => update("deliveryLocation", e.target.value)} />
            </div>

            <input className={inputClass} placeholder={t("quotation.preferredDate")} type="date" required value={form.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} />

            <div>
              <textarea
                className={`${inputClass} resize-none`}
                placeholder={isOtherMaterial ? t("quotation.notesRequiredPlaceholder") : t("quotation.notes")}
                rows={4}
                value={form.notes}
                required={isOtherMaterial}
                onChange={(e) => update("notes", e.target.value)}
              />
              {isOtherMaterial && (
                <p className="text-sm text-primary mt-1">{t("quotation.notesRequiredHint")}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-md text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t("quotation.submitting") : t("quotation.submit")}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Quotation;
