import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeDeadlineStatus } from "@/lib/calendar-utils";
import type { DashboardProject, DashboardSummary } from "@/types/domain.types";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all active projects with client and editor info
  const { data: projectsRaw, error: projectsError } = await supabase
    .from("projects")
    .select(`
      *,
      clients:client_id (id, name),
      project_editors (
        profiles:editor_id (id, full_name, avatar_url, role)
      )
    `)
    .not("status", "eq", "delivered")
    .order("updated_at", { ascending: false })
    .limit(50);

  // Fetch summary counts
  const today = new Date().toISOString().split("T")[0];

  const [pendingRes, awaitingRes, overdueRes, inProgressRes] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("transcript_lines").select("id", { count: "exact", head: true })
      .eq("status", "needs_review"),
    supabase.from("projects").select("id", { count: "exact", head: true })
      .lt("deadline", today).not("status", "in", '("approved","delivered")'),
    supabase.from("projects").select("id", { count: "exact", head: true })
      .eq("status", "in_production"),
  ]);

  const summary: DashboardSummary = {
    pending: pendingRes.count ?? 0,
    awaiting_approval: awaitingRes.count ?? 0,
    overdue: overdueRes.count ?? 0,
    in_progress: inProgressRes.count ?? 0,
  };

  // Enrich projects with deadline status and flatten editors
  const projects: DashboardProject[] = (projectsRaw ?? []).map((p: any) => ({
    ...p,
    client: p.clients,
    client_name: p.clients?.name ?? "Unknown",
    editor_count: p.project_editors?.length ?? 0,
    editors: (p.project_editors ?? []).map((pe: any) => pe.profiles).filter(Boolean),
    deadline_status: computeDeadlineStatus(p.deadline, p.status),
  }));

  return (
    <DashboardClient
      projects={projects}
      summary={summary}
      error={projectsError?.message}
    />
  );
}
