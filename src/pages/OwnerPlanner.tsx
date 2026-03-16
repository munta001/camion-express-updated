import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Package, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
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

interface Lorry {
  id: string;
  name: string;
  registration_number: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const OwnerPlanner = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, approved } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLorry, setFilterLorry] = useState<string>("all");

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("transport_requests").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success("Status updated!");
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && !approved) navigate("/dashboard");
  }, [authLoading, user, approved, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [reqRes, lorRes] = await Promise.all([
        supabase.from("transport_requests").select("*").eq("assigned_owner_id", user.id).order("preferred_date", { ascending: true }),
        supabase.from("fleet_vehicles").select("id, name, registration_number").eq("owner_id", user.id),
      ]);
      if (!reqRes.error && reqRes.data) setDeliveries(reqRes.data as Delivery[]);
      if (!lorRes.error && lorRes.data) setLorries(lorRes.data as Lorry[]);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterLorry !== "all" && d.assigned_lorry_id !== filterLorry) return false;
      return true;
    });
  }, [deliveries, filterStatus, filterLorry]);

  const navigateDate = (direction: "prev" | "next") => {
    const fn = direction === "prev"
      ? { today: subDays, week: subWeeks, month: subMonths }
      : { today: addDays, week: addWeeks, month: addMonths };
    setCurrentDate((d) => fn[view](d, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

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
      className={`rounded-md border p-2 mb-1 text-xs ${statusColors[delivery.status] || "bg-muted text-muted-foreground border-border"} ${compact ? "truncate" : ""}`}
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
                My <span className="text-primary">Schedule</span>
              </h1>
              <p className="text-muted-foreground">View your assigned deliveries on a calendar</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 sm:mt-0 px-4 py-2 border border-border text-foreground rounded-md hover:bg-secondary transition-colors text-sm"
            >
              Back to Dashboard
            </button>
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
            {(filterStatus !== "all" || filterLorry !== "all") && (
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterStatus("all"); setFilterLorry("all"); }}
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
                      <div key={d.id} className={`rounded-lg border p-4 ${statusColors[d.status] || "bg-muted border-border"}`}>
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
                          <select
                            value={d.status}
                            onChange={(e) => { e.stopPropagation(); updateStatus(d.id, e.target.value); }}
                            className="text-xs font-medium capitalize px-2 py-1 rounded-md bg-background/20 border-none focus:outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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
    </Layout>
  );
};

export default OwnerPlanner;
