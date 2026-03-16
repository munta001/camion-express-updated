import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Loader2, Upload, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const EditLorry = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, role, approved } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loadingLorry, setLoadingLorry] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", registrationNumber: "", licensePlate: "", capacity: "", maxLoad: "",
    body: "", bodySize: "", engine: "", ideal: "", availabilityStatus: "available",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    const fetchLorry = async () => {
      const { data, error } = await supabase.from("fleet_vehicles").select("*").eq("id", id).single();
      if (error || !data) {
        toast.error("Lorry not found");
        navigate(role === "admin" ? "/admin" : "/dashboard");
        return;
      }
      // Only allow owner of the lorry or admin
      if (role !== "admin" && data.owner_id !== user.id) {
        toast.error("Unauthorized");
        navigate("/dashboard");
        return;
      }
      setForm({
        name: data.name || "", registrationNumber: data.registration_number || "",
        licensePlate: data.license_plate || "", capacity: data.capacity || "",
        maxLoad: data.max_load || "", body: data.body || "", bodySize: data.body_size || "",
        engine: data.engine || "", ideal: data.ideal || "",
        availabilityStatus: data.availability_status || "available",
      });
      // Load existing images from image_urls array
      if (data.image_urls && Array.isArray(data.image_urls)) {
        const validUrls = data.image_urls.filter((url: string) => url && url.trim() !== "");
        setExistingImageUrls(validUrls);
        setImagePreviews(validUrls);
      } else if (data.image_url) {
        // Fallback for old single image_url
        setExistingImageUrls([data.image_url]);
        setImagePreviews([data.image_url]);
      }
      setLoadingLorry(false);
    };
    fetchLorry();
  }, [user, id, role, navigate]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImageUrls.length + imageFiles.length + files.length;
    if (totalImages > 3) {
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
    const preview = imagePreviews[index];
    // If it's a blob URL (new upload), revoke it
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
      // Remove from imageFiles
      const blobIndex = imagePreviews.slice(0, index).filter((p) => p.startsWith("blob:")).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== blobIndex));
    } else {
      // Remove from existingImageUrls
      setExistingImageUrls((prev) => prev.filter((url) => url !== preview));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmitting(true);

    const newImageUrls: string[] = [];

    // Upload new images
    for (const imageFile of imageFiles) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("fleet-images").upload(filePath, imageFile);
      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("fleet-images").getPublicUrl(filePath);
      newImageUrls.push(urlData.publicUrl);
    }

    // Combine existing and new images
    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    const updateData: any = {
      name: form.name, registration_number: form.registrationNumber,
      license_plate: form.licensePlate, capacity: form.capacity, max_load: form.maxLoad,
      body: form.body, body_size: form.bodySize, engine: form.engine, ideal: form.ideal,
      availability_status: form.availabilityStatus,
      image_urls: finalImageUrls,
    };

    const { error } = await supabase.from("fleet_vehicles").update(updateData).eq("id", id);
    setSubmitting(false);
    if (error) { toast.error("Failed to update lorry: " + error.message); }
    else { toast.success("Lorry updated successfully!"); navigate(role === "admin" ? "/admin" : "/dashboard"); }
  };

  if (authLoading || loadingLorry) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const inputClass = "w-full px-4 py-3 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
            Edit <span className="text-primary">Lorry</span>
          </h1>
          <p className="text-muted-foreground mb-8">Update the lorry details below.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                {t("addLorry.image") || "Lorry Images"} ({imagePreviews.length}/3)
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
              {imagePreviews.length < 3 && (
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
            <select className={inputClass} value={form.availabilityStatus} onChange={(e) => update("availabilityStatus", e.target.value)}>
              <option value="available">{t("addLorry.available")}</option>
              <option value="in_use">{t("addLorry.inUse")}</option>
              <option value="maintenance">{t("addLorry.maintenance")}</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => navigate(role === "admin" ? "/admin" : "/dashboard")} className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-secondary transition-colors">
                {t("addLorry.cancel")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default EditLorry;
