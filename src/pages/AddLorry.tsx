import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Loader2, Upload, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const AddLorry = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, approved } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", registrationNumber: "", licensePlate: "", capacity: "", maxLoad: "",
    body: "", bodySize: "", engine: "", ideal: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && !approved) navigate("/dashboard");
  }, [authLoading, user, approved, navigate]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be less than 5MB");
        return;
      }
    }
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const imageUrls: string[] = [];

    // Upload all images
    for (const imageFile of imageFiles) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("fleet-images")
        .upload(filePath, imageFile);
      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("fleet-images").getPublicUrl(filePath);
      imageUrls.push(urlData.publicUrl);
    }

    const { error } = await supabase.from("fleet_vehicles").insert({
      owner_id: user.id, name: form.name, registration_number: form.registrationNumber,
      license_plate: form.licensePlate, capacity: form.capacity, max_load: form.maxLoad,
      body: form.body, body_size: form.bodySize, engine: form.engine, ideal: form.ideal,
      availability_status: "pending", image_urls: imageUrls,
    });
    setSubmitting(false);
    if (error) { toast.error("Failed to add lorry: " + error.message); }
    else { toast.success("Lorry added successfully!"); navigate("/dashboard"); }
  };

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
            {t("addLorry.title")} <span className="text-primary">{t("addLorry.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground mb-8">{t("addLorry.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                {t("addLorry.image") || "Lorry Images"} ({imageFiles.length}/3)
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-full h-32 rounded-md overflow-hidden border border-border">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    >
                      <X className="h-3 w-3 text-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              {imageFiles.length < 3 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors bg-card">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">{t("addLorry.uploadImage") || "Click to upload images"}</span>
                  <span className="text-xs text-muted-foreground mt-1">Max 3 images, 5MB each</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <input className={inputClass} placeholder={t("addLorry.name")} required value={form.name} onChange={(e) => update("name", e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("addLorry.regNumber")} required value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} />
              <input className={inputClass} placeholder={t("addLorry.licensePlate")} required value={form.licensePlate} onChange={(e) => update("licensePlate", e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("addLorry.capacity")} required value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
              <input className={inputClass} placeholder={t("addLorry.maxLoad")} required value={form.maxLoad} onChange={(e) => update("maxLoad", e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("addLorry.bodyType")} required value={form.body} onChange={(e) => update("body", e.target.value)} />
              <input className={inputClass} placeholder={t("addLorry.bodySize")} required value={form.bodySize} onChange={(e) => update("bodySize", e.target.value)} />
            </div>
            <input className={inputClass} placeholder={t("addLorry.engine")} required value={form.engine} onChange={(e) => update("engine", e.target.value)} />
            <input className={inputClass} placeholder={t("addLorry.idealFor")} value={form.ideal} onChange={(e) => update("ideal", e.target.value)} />
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? t("addLorry.adding") : t("addLorry.add")}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")} className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-secondary transition-colors">
                {t("addLorry.cancel")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default AddLorry;
