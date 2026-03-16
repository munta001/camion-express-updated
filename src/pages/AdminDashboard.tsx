import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Users, Truck, Package, Pencil, CalendarDays, Filter, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [owners, setOwners] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allLorries, setAllLorries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"owners" | "requests" | "lorries">("owners");
  const [assignModal, setAssignModal] = useState<{ requestId: string } | null>(null);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedLorry, setSelectedLorry] = useState("");
  const [lorryOwnerFilter, setLorryOwnerFilter] = useState("all");
  const [requestDateFilter, setRequestDateFilter] = useState("");
  const [requestAssignFilter, setRequestAssignFilter] = useState<"all" | "unassigned">("all");

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate("/login");
  }, [authLoading, user, role, navigate]);

  const fetchData = async () => {
    const [ownersRes, requestsRes, lorriesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transport_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("fleet_vehicles").select("*"),
    ]);
    if (ownersRes.data) setOwners(ownersRes.data);
    if (requestsRes.data) setRequests(requestsRes.data);
    if (lorriesRes.data) setAllLorries(lorriesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    if (user && role === "admin") fetchData();
  }, [user, role]);

  const toggleApproval = async (profileId: string, currentlyApproved: boolean) => {
    const { error } = await supabase.from("profiles").update({ approved: !currentlyApproved }).eq("id", profileId);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(currentlyApproved ? "Owner unapproved" : "Owner approved!");
    setOwners((prev) => prev.map((o) => o.id === profileId ? { ...o, approved: !currentlyApproved } : o));
  };

  const assignDelivery = async () => {
    if (!assignModal || !selectedOwner) return;
    const updateData: any = { assigned_owner_id: selectedOwner };
    if (selectedLorry) updateData.assigned_lorry_id = selectedLorry;
    const { error } = await supabase.from("transport_requests").update(updateData).eq("id", assignModal.requestId);
    if (error) { toast.error("Failed to assign"); return; }
    toast.success("Delivery assigned!");
    setAssignModal(null); setSelectedOwner(""); setSelectedLorry("");
    fetchData();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("transport_requests").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success("Status updated!");
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const updateLorryStatus = async (id: string, availability_status: string) => {
    const { error } = await supabase.from("fleet_vehicles").update({ availability_status }).eq("id", id);
    if (error) { toast.error("Failed to update lorry status"); return; }
    toast.success("Lorry status updated!");
    setAllLorries((prev) => prev.map((l) => l.id === id ? { ...l, availability_status } : l));
  };

  if (authLoading || loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const approvedOwners = owners.filter((o) => o.approved);

  const tabs = [
    { key: "owners" as const, label: t("adminDash.owners"), icon: Users, count: owners.length },
    { key: "requests" as const, label: t("adminDash.requests"), icon: Package, count: requests.length },
    { key: "lorries" as const, label: t("adminDash.allLorries"), icon: Truck, count: allLorries.length },
  ];

  return (
    <Layout>
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1">
                {t("adminDash.title")} <span className="text-primary">{t("adminDash.titleHighlight")}</span>
              </h1>
              <p className="text-muted-foreground">{t("adminDash.subtitle")}</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Link to="/admin/planner" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity">
                <CalendarDays className="h-4 w-4" /> Planner
              </Link>
              <button onClick={signOut} className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-secondary transition-colors text-sm">
                {t("adminDash.signOut")}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === tb.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <tb.icon className="h-4 w-4" /> {tb.label} ({tb.count})
              </button>
            ))}
          </div>

          {tab === "owners" && (
            <div className="space-y-3">
              {owners.map((owner) => (
                <div key={owner.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">{owner.full_name || "Unnamed"}</h3>
                    <p className="text-xs text-muted-foreground">{owner.email} {owner.company_name ? `· ${owner.company_name}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{owner.phone || "No phone"}</p>
                  </div>
                  <button
                    onClick={() => toggleApproval(owner.id, owner.approved)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      owner.approved
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                    }`}
                  >
                    {owner.approved ? <><CheckCircle className="h-3.5 w-3.5" /> {t("adminDash.approved")}</> : <><XCircle className="h-3.5 w-3.5" /> {t("adminDash.pendingApproval")}</>}
                  </button>
                </div>
              ))}
              {owners.length === 0 && <p className="text-muted-foreground text-center py-8">{t("adminDash.noOwners")}</p>}
            </div>
          )}

          {tab === "requests" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" />
                </div>
                <button
                  onClick={() => setRequestAssignFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    requestAssignFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("adminDash.filterAll")}
                </button>
                <button
                  onClick={() => setRequestAssignFilter("unassigned")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    requestAssignFilter === "unassigned" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("adminDash.filterUnassigned")}
                </button>
                <input
                  type="date"
                  value={requestDateFilter}
                  onChange={(e) => setRequestDateFilter(e.target.value)}
                  className="px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-primary"
                  title={t("adminDash.filterDate")}
                />
                {(requestDateFilter || requestAssignFilter !== "all") && (
                  <button
                    onClick={() => { setRequestDateFilter(""); setRequestAssignFilter("all"); }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" /> {t("adminDash.clearFilters")}
                  </button>
                )}
              </div>
              <div className="space-y-3">
              {requests
                .filter((r) => {
                  if (requestAssignFilter === "unassigned" && r.assigned_owner_id) return false;
                  if (requestDateFilter) {
                    const reqDate = r.preferred_date || r.created_at?.split("T")[0];
                    if (reqDate && reqDate < requestDateFilter) return false;
                  }
                  return true;
                })
                .map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-foreground font-semibold">{r.material} — {r.quantity}</h3>
                      <p className="text-xs text-muted-foreground">{t("common.client")}: {r.name} · {r.email} · {r.phone}</p>
                      <p className="text-xs text-muted-foreground">{t("common.from")}: {r.pickup_location} → {t("common.to")}: {r.delivery_location}</p>
                      {r.preferred_date && <p className="text-xs text-muted-foreground">{t("common.date")}: {r.preferred_date}</p>}
                      {r.notes && <p className="text-xs text-muted-foreground">{t("common.notes")}: {r.notes}</p>}
                      {r.assigned_owner_id && (() => {
                        const owner = owners.find((o) => o.id === r.assigned_owner_id);
                        const lorry = allLorries.find((l) => l.id === r.assigned_lorry_id);
                        return (
                          <p className="text-xs text-primary mt-1">
                            {t("common.assignedTo")}: {lorry?.registration_number || "N/A"}{owner?.company_name ? ` (${owner.company_name})` : ` (${owner?.full_name || "Unknown"})`}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={r.status}
                        onChange={(e) => updateRequestStatus(r.id, e.target.value)}
                        className="px-3 py-1.5 bg-secondary border border-border rounded-md text-xs text-foreground focus:outline-none"
                      >
                        <option value="pending">{t("common.pending")}</option>
                        <option value="in_progress">{t("common.inProgress")}</option>
                        <option value="completed">{t("common.completed")}</option>
                        <option value="cancelled">{t("common.cancelled")}</option>
                      </select>
                      <button
                        onClick={() => setAssignModal({ requestId: r.id })}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        {t("adminDash.assign")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {requests.filter((r) => {
                if (requestAssignFilter === "unassigned" && r.assigned_owner_id) return false;
                if (requestDateFilter) {
                  const reqDate = r.preferred_date || r.created_at?.split("T")[0];
                  if (reqDate && reqDate < requestDateFilter) return false;
                }
                return true;
              }).length === 0 && <p className="text-muted-foreground text-center py-8">{t("adminDash.noRequests")}</p>}
              </div>
            </div>
          )}

          {tab === "lorries" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <select
                  value={lorryOwnerFilter}
                  onChange={(e) => setLorryOwnerFilter(e.target.value)}
                  className="px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none"
                >
                  <option value="all">All Owners</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.full_name} {o.company_name ? `(${o.company_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
              {allLorries
                .filter(lorry => lorryOwnerFilter === "all" || lorry.owner_id === lorryOwnerFilter)
                .map((lorry) => (
                <div key={lorry.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    <img src={lorry.image_url || "/placeholder.svg"} alt={lorry.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{lorry.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("common.owner")}: {owners.find((o) => o.id === lorry.owner_id)?.full_name || "Unknown"} {owners.find((o) => o.id === lorry.owner_id)?.company_name ? `(${owners.find((o) => o.id === lorry.owner_id)?.company_name})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{lorry.registration_number} · {lorry.license_plate} · {lorry.capacity}</p>
                  </div>
                  <select
                    value={lorry.availability_status || "available"}
                    onChange={(e) => updateLorryStatus(lorry.id, e.target.value)}
                    className={`px-2 py-1 bg-secondary border border-border rounded-md text-xs font-medium focus:outline-none focus:border-primary capitalize ${
                      lorry.availability_status === "available" ? "text-green-500" :
                      lorry.availability_status === "in_use" ? "text-yellow-500" :
                      lorry.availability_status === "maintenance" ? "text-red-500" :
                      "text-muted-foreground"
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <Link to={`/dashboard/edit-lorry/${lorry.id}`} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:underline">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                </div>
              ))}
              {allLorries.filter(lorry => lorryOwnerFilter === "all" || lorry.owner_id === lorryOwnerFilter).length === 0 && (
                <p className="text-muted-foreground text-center py-8">{t("adminDash.noLorries")}</p>
              )}
              </div>
            </div>
          )}
        </div>
      </section>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setAssignModal(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-foreground mb-4">{t("adminDash.assignDelivery")} <span className="text-primary">{t("adminDash.assignDeliveryHighlight")}</span></h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{t("adminDash.selectOwner")}</label>
                <select
                  value={selectedOwner}
                  onChange={(e) => { setSelectedOwner(e.target.value); setSelectedLorry(""); }}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">{t("adminDash.chooseOwner")}</option>
                  {approvedOwners.map((o) => (
                    <option key={o.id} value={o.id}>{o.full_name} {o.company_name ? `(${o.company_name})` : ""}</option>
                  ))}
                </select>
              </div>
              {selectedOwner && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">{t("adminDash.selectLorry")}</label>
                  <select
                    value={selectedLorry}
                    onChange={(e) => setSelectedLorry(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">{t("adminDash.chooseLorry")}</option>
                    {allLorries.filter((l) => l.owner_id === selectedOwner).map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.registration_number})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={assignDelivery} disabled={!selectedOwner} className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                  {t("adminDash.assign")}
                </button>
                <button onClick={() => setAssignModal(null)} className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-secondary transition-colors">
                  {t("adminDash.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;