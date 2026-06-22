import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Users, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AdminUser = { user_id: string; full_name: string; phone: string; created_at: string };
type Bucket = "day" | "week" | "month";
type AnalyticsRow = { bucket_start: string; login_count: number; unique_users: number };

export default function AdminSettings() {
  const navigate = useNavigate();
  const { roles, loading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [bucket, setBucket] = useState<Bucket>("day");
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      navigate("/patient", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  const loadUsers = async () => {
    setUsersLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) toast.error(error.message);
    else setUsers((data ?? []) as AdminUser[]);
    setUsersLoading(false);
  };

  const loadAnalytics = async (b: Bucket) => {
    setAnalyticsLoading(true);
    const { data, error } = await supabase.rpc("admin_login_analytics", { bucket: b });
    if (error) toast.error(error.message);
    else setAnalytics((data ?? []) as AnalyticsRow[]);
    setAnalyticsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) loadAnalytics(bucket);
  }, [isAdmin, bucket]);

  const chartData = useMemo(
    () =>
      analytics.map((r) => ({
        label: formatBucket(r.bucket_start, bucket),
        logins: Number(r.login_count),
        users: Number(r.unique_users),
      })),
    [analytics, bucket],
  );

  const totals = useMemo(() => {
    const logins = analytics.reduce((s, r) => s + Number(r.login_count), 0);
    const usersMax = analytics.reduce((m, r) => Math.max(m, Number(r.unique_users)), 0);
    return { logins, usersMax };
  }, [analytics]);

  const downloadUsersPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Tathmini Afya — Orodha ya Watumiaji", 14, 18);
    doc.setFontSize(10);
    doc.text(`Imetolewa: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Jumla ya watumiaji: ${users.length}`, 14, 31);

    autoTable(doc, {
      startY: 38,
      head: [["#", "Jina kamili", "Namba ya simu", "Tarehe ya kujiunga"]],
      body: users.map((u, i) => [
        String(i + 1),
        u.full_name || "—",
        u.phone || "—",
        new Date(u.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`tathmini-afya-users-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/patient")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Admin Settings</h1>
              <p className="text-xs text-muted-foreground">Usimamizi wa mfumo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Watumiaji</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Ripoti</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle>Watumiaji wote ({users.length})</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Pakua orodha kamili ya majina na namba za simu</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadUsers} disabled={usersLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={downloadUsersPdf} disabled={!users.length}>
                    <Download className="h-4 w-4 mr-2" />
                    Pakua PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table className="text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 sm:px-4 w-8">#</TableHead>
                        <TableHead className="px-2 sm:px-4">Jina</TableHead>
                        <TableHead className="px-2 sm:px-4">Simu</TableHead>
                        <TableHead className="px-2 sm:px-4 whitespace-nowrap">Tarehe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Inapakia…</TableCell></TableRow>
                      ) : users.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Hakuna watumiaji</TableCell></TableRow>
                      ) : (
                        users.map((u, i) => (
                          <TableRow key={u.user_id}>
                            <TableCell className="px-2 sm:px-4">{i + 1}</TableCell>
                            <TableCell className="px-2 sm:px-4 font-medium break-words max-w-[120px] sm:max-w-none">{u.full_name || "—"}</TableCell>
                            <TableCell className="px-2 sm:px-4 whitespace-nowrap">{u.phone || "—"}</TableCell>
                            <TableCell className="px-2 sm:px-4 whitespace-nowrap text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                {(["day", "week", "month"] as Bucket[]).map((b) => (
                  <Button key={b} size="sm" variant={bucket === b ? "default" : "outline"} onClick={() => setBucket(b)}>
                    {b === "day" ? "Kila siku" : b === "week" ? "Kila wiki" : "Kila mwezi"}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => loadAnalytics(bucket)} disabled={analyticsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Jumla ya login</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{totals.logins}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Watumiaji wengi zaidi (kipindi)</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{totals.usersMax}</p></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Idadi ya Login</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="logins" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Watumiaji wa kipekee (User interaction)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" name="Unique users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="logins" name="Logins" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function formatBucket(iso: string, bucket: Bucket): string {
  const d = new Date(iso);
  if (bucket === "day") return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  if (bucket === "week") return `W${getWeek(d)}`;
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
function getWeek(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
}
