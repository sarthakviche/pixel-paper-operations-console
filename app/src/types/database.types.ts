// ─────────────────────────────────────────────────────
// AUTO-GENERATED SUPABASE DATABASE TYPES
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
// ─────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "admin" | "manager" | "editor";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: "admin" | "manager" | "editor";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: "admin" | "manager" | "editor";
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          status: "draft" | "breakdown" | "in_production" | "review" | "approved" | "delivered";
          deadline: string | null;
          transcript_raw: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          status?: "draft" | "breakdown" | "in_production" | "review" | "approved" | "delivered";
          deadline?: string | null;
          transcript_raw?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          status?: "draft" | "breakdown" | "in_production" | "review" | "approved" | "delivered";
          deadline?: string | null;
          transcript_raw?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          label: string;
          due_date: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          label: string;
          due_date: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          label?: string;
          due_date?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      project_editors: {
        Row: {
          project_id: string;
          editor_id: string;
          assigned_at: string;
        };
        Insert: {
          project_id: string;
          editor_id: string;
          assigned_at?: string;
        };
        Update: {
          project_id?: string;
          editor_id?: string;
          assigned_at?: string;
        };
      };
      transcript_lines: {
        Row: {
          id: string;
          project_id: string;
          line_order: number;
          text: string;
          output_type: "motion_graphics" | "b_roll" | "static_image_animation" | "text_animation" | "split_screen" | "live_footage" | "other" | null;
          llm_suggested_type: string | null;
          llm_confidence: number | null;
          status: "not_started" | "in_progress" | "needs_review" | "approved";
          assigned_editor_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          line_order: number;
          text: string;
          output_type?: "motion_graphics" | "b_roll" | "static_image_animation" | "text_animation" | "split_screen" | "live_footage" | "other" | null;
          llm_suggested_type?: string | null;
          llm_confidence?: number | null;
          status?: "not_started" | "in_progress" | "needs_review" | "approved";
          assigned_editor_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          line_order?: number;
          text?: string;
          output_type?: "motion_graphics" | "b_roll" | "static_image_animation" | "text_animation" | "split_screen" | "live_footage" | "other" | null;
          llm_suggested_type?: string | null;
          llm_confidence?: number | null;
          status?: "not_started" | "in_progress" | "needs_review" | "approved";
          assigned_editor_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          transcript_line_id: string;
          storage_path: string;
          asset_type: "uploaded" | "ai_generated";
          generation_prompt: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transcript_line_id: string;
          storage_path: string;
          asset_type: "uploaded" | "ai_generated";
          generation_prompt?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transcript_line_id?: string;
          storage_path?: string;
          asset_type?: "uploaded" | "ai_generated";
          generation_prompt?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          project_id: string | null;
          actor_id: string | null;
          action: string;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          actor_id?: string | null;
          action: string;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          actor_id?: string | null;
          action?: string;
          meta?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_manager: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};
