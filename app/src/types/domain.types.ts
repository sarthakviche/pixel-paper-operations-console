// ─────────────────────────────────────────────────────
// APPLICATION DOMAIN TYPES
// These are derived from and extend the raw database types.
// ─────────────────────────────────────────────────────

export type UserRole = "admin" | "manager" | "editor";

export type ProjectStatus =
  | "draft"
  | "breakdown"
  | "in_production"
  | "review"
  | "approved"
  | "delivered";

export type LineStatus =
  | "not_started"
  | "in_progress"
  | "needs_review"
  | "approved";

export type OutputType =
  | "motion_graphics"
  | "b_roll"
  | "static_image_animation"
  | "text_animation"
  | "split_screen"
  | "live_footage"
  | "other";

export type AssetType = "uploaded" | "ai_generated";

// ─────────────────────────────────────────────────────
// ENRICHED TYPES (with relations joined in queries)
// ─────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed (from query joins)
  active_project_count?: number;
  next_deadline?: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  deadline: string | null;
  transcript_raw: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  editors?: Profile[];
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  label: string;
  due_date: string;
  completed: boolean;
  created_at: string;
}

export interface TranscriptLine {
  id: string;
  project_id: string;
  line_order: number;
  text: string;
  output_type: OutputType | null;
  llm_suggested_type: string | null;
  llm_confidence: number | null;
  status: LineStatus;
  assigned_editor_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  assigned_editor?: Profile | null;
  assets?: Asset[];
}

export interface Asset {
  id: string;
  transcript_line_id: string;
  storage_path: string;
  asset_type: AssetType;
  generation_prompt: string | null;
  created_by: string | null;
  created_at: string;
  // Computed
  signed_url?: string;
}

export interface ActivityLogEntry {
  id: string;
  project_id: string | null;
  actor_id: string | null;
  action: string;
  meta: Record<string, unknown> | null;
  created_at: string;
  // Relations
  actor?: Profile | null;
}

// ─────────────────────────────────────────────────────
// UI TYPES
// ─────────────────────────────────────────────────────

/**
 * Project enriched with stats for the dashboard table.
 */
export interface DashboardProject extends Project {
  client_name: string;
  editor_count: number;
  editors: Profile[];
  deadline_status: "on_track" | "at_risk" | "overdue";
}

/**
 * Summary counts for the dashboard cards.
 */
export interface DashboardSummary {
  pending: number;
  awaiting_approval: number;
  overdue: number;
  in_progress: number;
}

/**
 * Editor stats for the editors roster.
 */
export interface EditorStats extends Profile {
  active_assignment_count: number;
  approved_line_count: number;
}

/**
 * Per-project payment split row for an editor.
 */
export interface PaymentSplitRow {
  project_id: string;
  project_name: string;
  client_name: string;
  approved_lines: number;
  total_lines: number;
}

/**
 * Approval queue item (transcript line needing manager review).
 */
export interface ApprovalQueueItem {
  line: TranscriptLine;
  project: Project;
  client: Client;
  asset?: Asset;
}

// ─────────────────────────────────────────────────────
// LLM TYPES
// ─────────────────────────────────────────────────────

/**
 * A single line returned by the transcript breakdown LLM.
 */
export interface LlmBreakdownLine {
  line_order: number;
  text: string;
  output_type: OutputType;
  confidence: number;
  reasoning?: string;
}

// ─────────────────────────────────────────────────────
// FORM STATE TYPES
// ─────────────────────────────────────────────────────

export interface NewClientFormData {
  name: string;
  notes?: string;
}

export interface NewProjectFormData {
  name: string;
  deadline?: string;
  client_id: string;
}

export interface TranscriptBreakdownInput {
  project_id: string;
  transcript: string;
}
