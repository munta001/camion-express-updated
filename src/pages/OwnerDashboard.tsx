import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Plus, Package, Clock, CheckCircle, AlertCircle, Loader2, XCircle, Pencil, CalendarDays } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, role, approved, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [lorries, setLorries] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [lorriesRes, deliveriesRes] = await Promise.all([
        supabase.from("fleet_vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("transport_requests").select("*").eq("assigned_owner_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (lorriesRes.data) setLorries(lorriesRes.data);
      if (deliveriesRes.data) setDeliveries(deliveriesRes.data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (authLoading || !user) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  if (!approved) {
    return (
      <Layout>
        <section className="py-20 min-h-[70vh] flex items-center">
          <div className="container max-w-lg text-center">
            <AlertCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl text-foreground mb-4">{t("ownerDash.pending")} <span className="text-primary">{t("ownerDash.pendingHighlight")}</span></h1>
            <p className="text-muted-foreground mb-6">{t("ownerDash.pendingMsg")}</p>
            <button onClick={signOut} className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-secondary transition-colors">{t("ownerDash.signOut")}</button>
          </div>
        </section>
      </Layout>
    );
  }

  const updateDeliveryStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("transport_requests").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    toast.success(`Delivery marked as ${newStatus}`);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress": return <Package className="h-4 w-4 text-blue-500" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const availabilityColor = (status: string) => {
    switch (status) {
      case "available": return "text-green-500";
      case "in_use": return "text-yellow-500";
      case "maintenance": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1">
                {t("ownerDash.title")} <span className="text-primary">{t("ownerDash.titleHighlight")}</span>
              </h1>
              <p className="text-muted-foreground">{t("ownerDash.welcome")} {profile?.full_name || "Owner"}</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Link to="/dashboard/planner" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors">
                <CalendarDays className="h-4 w-4" /> Planner
              </Link>
              <Link to="/dashboard/add-lorry" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" /> {t("ownerDash.addLorry")}
              </Link>
              <button onClick={signOut} className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-secondary transition-colors text-sm">
                {t("ownerDash.signOut")}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="deliveries" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="deliveries" className="gap-2">
                  <Package className="h-4 w-4" /> {t("ownerDash.assignedDeliveries")} ({deliveries.length})
                </TabsTrigger>
                <TabsTrigger value="lorries" className="gap-2">
                  <Truck className="h-4 w-4" /> {t("ownerDash.myLorries")} ({lorries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deliveries">
                {deliveries.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">{t("ownerDash.noDeliveries")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliveries.map((d) => (
                      <div key={d.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-foreground font-semibold">{d.material} — {d.quantity}</span>
                          <span className="flex items-center gap-1 text-xs capitalize">
                            {statusIcon(d.status)} {d.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("common.from")}: {d.pickup_location}</p>
                        <p className="text-xs text-muted-foreground">{t("common.to")}: {d.delivery_location}</p>
                        <p className="text-xs text-muted-foreground">{t("common.client")}: {d.name}</p>
                        {d.preferred_date && <p className="text-xs text-muted-foreground">{t("common.date")}: {d.preferred_date}</p>}
                        {(d.status === "pending" || d.status === "in_progress") && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => updateDeliveryStatus(d.id, "completed")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" /> Completed
                            </button>
                            <button
                              onClick={() => updateDeliveryStatus(d.id, "cancelled")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="h-3 w-3" /> Cancelled
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lorries">
                {lorries.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-4">{t("ownerDash.noLorries")}</p>
                    <Link to="/dashboard/add-lorry" className="text-primary hover:underline">{t("ownerDash.addFirst")}</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lorries.map((lorry) => (
                      <div key={lorry.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                          <img src={lorry.image_url || "/placeholder.svg"} alt={lorry.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-foreground font-semibold truncate">{lorry.name}</h3>
                          <p className="text-xs text-muted-foreground">{lorry.registration_number} · {lorry.license_plate}</p>
                          <p className="text-xs text-muted-foreground">{t("fleet.capacity")}: {lorry.capacity} · Max: {lorry.max_load}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-medium capitalize ${availabilityColor(lorry.availability_status)}`}>
                            {lorry.availability_status.replace("_", " ")}
                          </span>
                          <Link to={`/dashboard/edit-lorry/${lorry.id}`} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:underline">
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OwnerDashboard;
