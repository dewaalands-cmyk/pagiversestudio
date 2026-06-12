export type UserRole = "admin" | "client";
export type InquiryStatus = "new" | "contacted" | "proposal_sent" | "closed";
export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "on_hold";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  technologies?: string;
  link?: string;
  featured: boolean;
  created_at: string;
}

export interface Testimony {
  id: number;
  client_name: string;
  client_company?: string;
  content: string;
  rating?: number;
  image_url?: string;
  approved: boolean;
  created_at: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  budget_range?: string;
  status: InquiryStatus;
  notes?: string;
  created_at: string;
}

export interface Client {
  id: number;
  user_id: number;
  company_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  user?: User;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  progress_percentage: number;
  created_at: string;
  client?: Client;
}

export interface Invoice {
  id: number;
  client_id: number;
  project_id?: number;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  client?: Client;
  project?: Project;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  client_id: number;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface AnalyticsEvent {
  id: number;
  event_type: string;
  page_path?: string;
  session_id?: string;
  timestamp: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface DashboardStats {
  total_inquiries: number;
  new_inquiries: number;
  total_clients: number;
  pending_revenue: number;
  paid_revenue: number;
  active_projects: number;
}

export interface PageViewData {
  date: string;
  views: number;
}
