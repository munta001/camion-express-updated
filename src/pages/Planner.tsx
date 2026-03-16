import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Package, MapPin, Clock, Pencil, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  eachDayOfInterval,
  parseISO,
} from "date-fns";

type ViewMode = "today" | "week" | "month";

interface Delivery {
  id: string;
  material: string;
  quantity: string;
  pickup_location: string;
  delivery_location: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  assigned_owner_id: string | null;
  assigned_lorry_id: string | null;
  created_at: string;
}

interface OwnerProfile {
  id: string;
  full_name: string;
  company_name: string | null;
}

interface Lorry {
  id: string;
  name: string;
  registration_number: string;
  owner_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const Planner = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, role } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [owners, setOwners] = useState<OwnerProfile[]>([]);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterLorry, setFilterLorry] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate("/login");
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (!user || role !== "admin") return;
    const fetchAll = async () => {
      const [reqRes, ownRes, lorRes] = await Promise.all([
        supabase.from("transport_requests").select("*").order("preferred_date", { ascending: true }),
        supabase.from("profiles").select("id, full_name, company_name"),
        supabase.from("fleet_vehicles").select("id, name, registration_number, owner_id"),
      ]);
      if (!reqRes.error && reqRes.data) setDeliveries(reqRes.data as Delivery[]);
      if (!ownRes.error && ownRes.data) setOwners(ownRes.data as OwnerProfile[]);
      if (!lorRes.error && lorRes.data) setLorries(lorRes.data as Lorry[]);
      setLoading(false);
    };
    fetchAll();
  }, [user, role]);

  const openEditModal = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setEditDate(delivery.preferred_date ? parseISO(delivery.preferred_date) : undefined);
    setEditTime(delivery.preferred_time || "");
    setEditStatus(delivery.status);
  };

  const saveDateTime = async () => {
    if (!editingDelivery) return;
    const updateData: any = {
      preferred_date: editDate ? format(editDate, "yyyy-MM-dd") : null,
      preferred_time: editTime || null,
      status: editStatus,
    };
    const { error } = await supabase.from("transport_requests").update(updateData).eq("id", editingDelivery.id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success("Delivery updated!");
    setDeliveries((prev) =>
      prev.map((d) => (d.id === editingDelivery.id ? { ...d, ...updateData } : d))
    );
    setEditingDelivery(null);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const fn = direction === "prev"
      ? { today: subDays, week: subWeeks, month: subMonths }
      : { today: addDays, week: addWeeks, month: addMonths };
    setCurrentDate((d) => fn[view](d, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterOwner !== "all" && d.assigned_owner_id !== filterOwner) return false;
      if (filterLorry !== "all" && d.assigned_lorry_id !== filterLorry) return false;
      return true;
    });
  }, [deliveries, filterStatus, filterOwner, filterLorry]);

  const getDeliveriesForDate = (date: Date) =>
    filteredDeliveries
      .filter((d) => {
        const deliveryDate = d.preferred_date ? parseISO(d.preferred_date) : null;
        return deliveryDate && isSameDay(deliveryDate, date);
      })
      .sort((a, b) => (a.preferred_time || "99:99").localeCompare(b.preferred_time || "99:99"));

  const headerLabel = useMemo(() => {
    switch (view) {
      case "today":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
      }
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  }, [view, currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const DeliveryCard = ({ delivery, compact = false }: { delivery: Delivery; compact?: boolean }) => (
    <div
      className={`rounded-md border p-2 mb-1 text-xs cursor-pointer hover:opacity-80 transition-opacity ${statusColors[delivery.status] || "bg-muted text-muted-foreground border-border"} ${compact ? "truncate" : ""}`}
      onClick={() => openEditModal(delivery)}
    >
      <div className="font-semibold truncate">{delivery.material}</div>
      {!compact && (
        <>
          {delivery.preferred_time && (
            <div className="flex items-center gap-1 mt-0.5 opacity-80">
              <Clock className="h-3 w-3 flex-shrink-0" /> <span>{delivery.preferred_time}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-0.5 opacity-80">
            <Package className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{delivery.quantity}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 opacity-80">
            <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{delivery.delivery_location}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 opacity-80">
            <span className="truncate">{delivery.name}</span>
          </div>
        </>
      )}
    </div>
  );

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1">
                Delivery <span className="text-primary">Planner</span>
              </h1>
              <p className="text-muted-foreground">Plan and manage deliveries — click a delivery to set date & time</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
              {(["today", "week", "month"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { setView(v); if (v === "today") goToToday(); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                    view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "today" ? "Day" : v === "week" ? "Week" : "Month"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm font-medium border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
              >
                Today
              </button>
              <button onClick={() => navigateDate("prev")} className="p-2 rounded-md hover:bg-secondary transition-colors text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-foreground font-medium text-sm min-w-[200px] text-center">{headerLabel}</span>
              <button onClick={() => navigateDate("next")} className="p-2 rounded-md hover:bg-secondary transition-colors text-foreground">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Owner</label>
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Owners</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.company_name || o.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Lorry</label>
              <select
                value={filterLorry}
                onChange={(e) => setFilterLorry(e.target.value)}
                className="px-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Lorries</option>
                {lorries.map((l) => (
                  <option key={l.id} value={l.id}>{l.registration_number} — {l.name}</option>
                ))}
              </select>
            </div>
            {(filterStatus !== "all" || filterOwner !== "all" || filterLorry !== "all") && (
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterStatus("all"); setFilterOwner("all"); setFilterLorry("all"); }}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {view === "today" && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/50">
                <h2 className="text-foreground font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {format(currentDate, "EEEE, MMMM d")}
                  {isToday(currentDate) && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Today</span>
                  )}
                </h2>
              </div>
              <div className="p-4">
                {getDeliveriesForDate(currentDate).length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No deliveries scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getDeliveriesForDate(currentDate).map((d) => (
                      <div
                        key={d.id}
                        onClick={() => openEditModal(d)}
                        className={`rounded-lg border p-4 cursor-pointer hover:opacity-80 transition-opacity ${statusColors[d.status] || "bg-muted border-border"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">{d.material} — {d.quantity}</h3>
                            {d.preferred_time && <p className="text-xs mt-1 opacity-80 flex items-center gap-1"><Clock className="h-3 w-3" /> {d.preferred_time}</p>}
                            <p className="text-xs mt-1 opacity-80">Client: {d.name}</p>
                            <p className="text-xs opacity-80">📞 {d.phone} · ✉ {d.email}</p>
                            <p className="text-xs opacity-80">From: {d.pickup_location}</p>
                            <p className="text-xs opacity-80">To: {d.delivery_location}</p>
                            {d.notes && <p className="text-xs opacity-70 italic mt-1">Notes: {d.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Pencil className="h-3.5 w-3.5 opacity-60" />
                            <span className="text-xs font-medium capitalize px-2 py-1 rounded-md bg-background/20">
                              {d.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Week View */}
          {view === "week" && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-3 text-center border-r border-border last:border-r-0 ${
                      isToday(day) ? "bg-primary/10" : "bg-secondary/30"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</div>
                    <div className={`text-lg font-display mt-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((day) => {
                  const dayDeliveries = getDeliveriesForDate(day);
                  return (
                    <div key={day.toISOString()} className={`border-r border-border last:border-r-0 p-2 ${isToday(day) ? "bg-primary/5" : ""}`}>
                      {dayDeliveries.length === 0 ? (
                        <p className="text-xs text-muted-foreground/40 text-center mt-4">—</p>
                      ) : (
                        dayDeliveries.map((d) => <DeliveryCard key={d.id} delivery={d} />)
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month View */}
          {view === "month" && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="p-2 text-center text-xs text-muted-foreground uppercase bg-secondary/30 border-r border-border last:border-r-0">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dayDeliveries = getDeliveriesForDate(day);
                  const inMonth = isSameMonth(day, currentDate);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[100px] border-r border-b border-border last:border-r-0 p-1.5 ${
                        !inMonth ? "opacity-30" : ""
                      } ${isToday(day) ? "bg-primary/5" : ""}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </div>
                      {dayDeliveries.slice(0, 3).map((d) => (
                        <DeliveryCard key={d.id} delivery={d} compact />
                      ))}
                      {dayDeliveries.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">+{dayDeliveries.length - 3} more</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: "Pending", cls: "bg-yellow-500/20 text-yellow-400" },
              { label: "In Progress", cls: "bg-blue-500/20 text-blue-400" },
              { label: "Completed", cls: "bg-green-500/20 text-green-400" },
              { label: "Cancelled", cls: "bg-red-500/20 text-red-400" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-sm ${s.cls}`} />
                <span className="text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edit Date/Time Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setEditingDelivery(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-foreground">
                Set <span className="text-primary">Date & Time</span>
              </h2>
              <button onClick={() => setEditingDelivery(null)} className="p-1 rounded-md hover:bg-secondary transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-foreground font-medium">{editingDelivery.material} — {editingDelivery.quantity}</p>
              <p className="text-xs text-muted-foreground">{editingDelivery.name} · {editingDelivery.pickup_location} → {editingDelivery.delivery_location}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Delivery Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full px-4 py-3 bg-secondary border border-border rounded-md text-left text-sm transition-colors hover:border-primary",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="h-4 w-4 inline mr-2" />
                      {editDate ? format(editDate, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Delivery Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveDateTime}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingDelivery(null)}
                  className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Planner;
