import {
  PhoneCall,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import type {
  ClientAccount,
  CallLog,
  ConversationRow,
  StatCardData,
  ChartDataPoint,
  AgentLeaderboard,
  PromptTemplate,
  Agent,
} from "@/types";

export const STATS: StatCardData[] = [
  { label: "Total Conversations", value: "2,847", change: "+12% from last week", icon: PhoneCall, color: "#6C5CE7" },
  { label: "Appointments Booked", value: "1,253", change: "+8% from last week", icon: Calendar, color: "#6C5CE7" },
  { label: "Lead Conversion Rate", value: "68%", change: "+3% from last week", icon: Target, color: "#6C5CE7" },
  { label: "Active Clinics", value: "47", change: "+2 new clinics", icon: Activity, color: "#6C5CE7" },
];

export const CONVERSATIONS: ConversationRow[] = [
  { id: 1, time: "10:30 AM", callerName: "Sarah Johnson", channel: "Call", outcome: "Booked" },
  { id: 2, time: "10:28 AM", callerName: "Mike Chen", channel: "Call", outcome: "Booked" },
  { id: 3, time: "10:25 AM", callerName: "Lisa Park", channel: "Call", outcome: "No Answer" },
  { id: 4, time: "10:20 AM", callerName: "David Kim", channel: "Call", outcome: "Booked" },
  { id: 5, time: "10:15 AM", callerName: "Emma Wilson", channel: "Call", outcome: "Callback" },
  { id: 6, time: "10:10 AM", callerName: "James Lee", channel: "Call", outcome: "Booked" },
];

export const CLIENTS: ClientAccount[] = [
  { id: "1", agencyId: "a1", name: "Bright Smile Dental", ghlLocationId: "loc_1", status: "active", callsToday: 34, appointmentsToday: 12, conversion: "35%", createdAt: "2024-01-15" },
  { id: "2", agencyId: "a1", name: "Peak Performance PT", ghlLocationId: "loc_2", status: "active", callsToday: 28, appointmentsToday: 9, conversion: "32%", createdAt: "2024-02-01" },
  { id: "3", agencyId: "a1", name: "Clear Vision Eye Care", ghlLocationId: "loc_3", status: "active", callsToday: 45, appointmentsToday: 18, conversion: "40%", createdAt: "2024-02-10" },
  { id: "4", agencyId: "a1", name: "Harmony Med Spa", ghlLocationId: "loc_4", status: "paused", callsToday: 0, appointmentsToday: 0, conversion: "0%", createdAt: "2024-03-05" },
  { id: "5", agencyId: "a1", name: "Summit Chiropractic", ghlLocationId: "loc_5", status: "active", callsToday: 22, appointmentsToday: 7, conversion: "31%", createdAt: "2024-03-12" },
  { id: "6", agencyId: "a1", name: "Glow Aesthetics", ghlLocationId: "loc_6", status: "active", callsToday: 51, appointmentsToday: 21, conversion: "41%", createdAt: "2024-04-01" },
  { id: "7", agencyId: "a1", name: "Restore Wellness", ghlLocationId: "loc_7", status: "active", callsToday: 19, appointmentsToday: 5, conversion: "26%", createdAt: "2024-04-20" },
];

export const CALL_LOGS: CallLog[] = [
  { id: "cl1", clientId: "1", contactName: "Sarah Johnson", contactPhone: "(555) 123-4567", status: "completed", duration: "2:34", appointmentBooked: true, createdAt: "10:30 AM" },
  { id: "cl2", clientId: "1", contactName: "Mike Chen", contactPhone: "(555) 234-5678", status: "completed", duration: "1:45", appointmentBooked: true, createdAt: "10:28 AM" },
  { id: "cl3", clientId: "1", contactName: "Lisa Park", contactPhone: "(555) 345-6789", status: "no-answer", duration: "0:00", appointmentBooked: false, createdAt: "10:25 AM" },
  { id: "cl4", clientId: "1", contactName: "David Kim", contactPhone: "(555) 456-7890", status: "completed", duration: "3:12", appointmentBooked: true, createdAt: "10:20 AM" },
  { id: "cl5", clientId: "2", contactName: "Emma Wilson", contactPhone: "(555) 567-8901", status: "completed", duration: "1:58", appointmentBooked: false, createdAt: "10:15 AM" },
  { id: "cl6", clientId: "2", contactName: "James Lee", contactPhone: "(555) 678-9012", status: "completed", duration: "4:01", appointmentBooked: true, createdAt: "10:10 AM" },
  { id: "cl7", clientId: "3", contactName: "Anna Smith", contactPhone: "(555) 789-0123", status: "voicemail", duration: "0:32", appointmentBooked: false, createdAt: "10:05 AM" },
  { id: "cl8", clientId: "3", contactName: "Tom Brown", contactPhone: "(555) 890-1234", status: "completed", duration: "2:15", appointmentBooked: true, createdAt: "10:00 AM" },
];

export const AGENTS: Agent[] = [
  { id: "ag1", name: "Appointment Setter", type: "setter", clientCount: 3, status: "active" },
  { id: "ag2", name: "Follow-up Agent", type: "followup", clientCount: 2, status: "active" },
  { id: "ag3", name: "Lead Qualifier", type: "qualifier", clientCount: 1, status: "active" },
];

export const AGENT_LEADERBOARD: AgentLeaderboard[] = [
  { name: "John Doe", calls: 258 },
  { name: "Jane Smith", calls: 234 },
  { name: "Alex Rivera", calls: 212 },
  { name: "Sam Taylor", calls: 198 },
  { name: "Chris Wu", calls: 187 },
  { name: "Pat Morgan", calls: 165 },
];

export const CHART_DATA: ChartDataPoint[] = [
  { day: "Mon", calls: 120 },
  { day: "Tue", calls: 340 },
  { day: "Wed", calls: 680 },
  { day: "Thu", calls: 800 },
  { day: "Fri", calls: 520 },
  { day: "Sat", calls: 280 },
  { day: "Sun", calls: 180 },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: "pt1", name: "Dental Appointment Setter", prompt: "You are a friendly AI assistant for {{clinic_name}}. Your goal is to schedule dental appointments. Be warm, professional, and efficient. Always confirm the caller's preferred date and time, and provide a brief overview of what to expect at their visit." },
  { id: "pt2", name: "Med Spa Consultation Booker", prompt: "You are a professional AI assistant for {{spa_name}}. Help callers book consultations for aesthetic treatments. Be knowledgeable about common procedures, reassuring about the process, and always emphasize the complimentary nature of initial consultations." },
  { id: "pt3", name: "Chiropractic Follow-up", prompt: "You are a caring AI assistant for {{practice_name}}. Reach out to patients for follow-up appointments. Reference their previous visit, ask about their recovery progress, and suggest a follow-up schedule based on their treatment plan." },
  { id: "pt4", name: "General Healthcare", prompt: "You are a helpful AI assistant for {{business_name}}. Your primary goal is to assist callers with scheduling, answering common questions, and routing complex inquiries to the appropriate staff member." },
];

// Helper to get a client by ID
export function getClientById(id: string): ClientAccount | undefined {
  return CLIENTS.find((c) => c.id === id);
}

// Helper to get call logs for a client
export function getCallLogsByClientId(clientId: string): CallLog[] {
  return CALL_LOGS.filter((c) => c.clientId === clientId);
}
