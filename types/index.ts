// ─── Core Domain Types ───

export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  ghlConnected: boolean;
  createdAt: string;
}

export interface ClientAccount {
  id: string;
  agencyId: string;
  name: string;
  ghlLocationId: string;
  status: "active" | "paused" | "onboarding";
  callsToday: number;
  appointmentsToday: number;
  conversion: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  clientId: string;
  type: "ghl" | "twilio" | "vapi";
  status: "connected" | "disconnected" | "managed";
  metadata: Record<string, unknown>;
}

export interface AgentPrompt {
  id: string;
  clientId: string;
  name: string;
  systemPrompt: string;
  variables: Record<string, string>;
  active: boolean;
}

export interface CallLog {
  id: string;
  clientId: string;
  contactName: string;
  contactPhone: string;
  status: "completed" | "no-answer" | "voicemail" | "in-progress";
  duration: string;
  appointmentBooked: boolean;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  clientCount: number;
  status: "active" | "paused";
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
}

// ─── UI Types ───

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

export interface ConversationRow {
  id: number;
  time: string;
  callerName: string;
  channel: string;
  outcome: string;
}

export interface ChartDataPoint {
  day: string;
  calls: number;
}

export interface AgentLeaderboard {
  name: string;
  calls: number;
}

export type StatusType =
  | "Booked"
  | "No Answer"
  | "Callback"
  | "active"
  | "paused"
  | "completed"
  | "no-answer"
  | "voicemail"
  | "connected"
  | "disconnected"
  | "managed"
  | "onboarding";
