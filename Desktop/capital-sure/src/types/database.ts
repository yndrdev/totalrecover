export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company_name: string | null;
          role: "admin" | "project_manager" | "contractor" | "client";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          role?: "admin" | "project_manager" | "contractor" | "client";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          role?: "admin" | "project_manager" | "contractor" | "client";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          address: string | null;
          client_id: string;
          project_manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?:
            | "planning"
            | "active"
            | "on_hold"
            | "completed"
            | "cancelled";
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          address?: string | null;
          client_id: string;
          project_manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?:
            | "planning"
            | "active"
            | "on_hold"
            | "completed"
            | "cancelled";
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          address?: string | null;
          client_id?: string;
          project_manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: "pending" | "in_progress" | "completed" | "on_hold";
          priority: "low" | "medium" | "high" | "urgent";
          assigned_to: string | null;
          start_date: string | null;
          end_date: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          dependencies: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: "pending" | "in_progress" | "completed" | "on_hold";
          priority?: "low" | "medium" | "high" | "urgent";
          assigned_to?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          dependencies?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: "pending" | "in_progress" | "completed" | "on_hold";
          priority?: "low" | "medium" | "high" | "urgent";
          assigned_to?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          dependencies?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: "pending" | "in_progress" | "completed";
          payment_amount: number | null;
          payment_status: "pending" | "escrowed" | "released" | "disputed";
          due_date: string | null;
          completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: "pending" | "in_progress" | "completed";
          payment_amount?: number | null;
          payment_status?: "pending" | "escrowed" | "released" | "disputed";
          due_date?: string | null;
          completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: "pending" | "in_progress" | "completed";
          payment_amount?: number | null;
          payment_status?: "pending" | "escrowed" | "released" | "disputed";
          due_date?: string | null;
          completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress_reports: {
        Row: {
          id: string;
          project_id: string;
          task_id: string | null;
          milestone_id: string | null;
          title: string;
          description: string | null;
          progress_percentage: number;
          photos: string[] | null;
          submitted_by: string;
          submitted_at: string;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          task_id?: string | null;
          milestone_id?: string | null;
          title: string;
          description?: string | null;
          progress_percentage: number;
          photos?: string[] | null;
          submitted_by: string;
          submitted_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          task_id?: string | null;
          milestone_id?: string | null;
          title?: string;
          description?: string | null;
          progress_percentage?: number;
          photos?: string[] | null;
          submitted_by?: string;
          submitted_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role:
            | "project_manager"
            | "contractor"
            | "subcontractor"
            | "inspector";
          permissions: string[] | null;
          hourly_rate: number | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role:
            | "project_manager"
            | "contractor"
            | "subcontractor"
            | "inspector";
          permissions?: string[] | null;
          hourly_rate?: number | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?:
            | "project_manager"
            | "contractor"
            | "subcontractor"
            | "inspector";
          permissions?: string[] | null;
          hourly_rate?: number | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "project_manager" | "contractor" | "client";
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled";
      task_status: "pending" | "in_progress" | "completed" | "on_hold";
      task_priority: "low" | "medium" | "high" | "urgent";
      milestone_status: "pending" | "in_progress" | "completed";
      payment_status: "pending" | "escrowed" | "released" | "disputed";
      team_role:
        | "project_manager"
        | "contractor"
        | "subcontractor"
        | "inspector";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
