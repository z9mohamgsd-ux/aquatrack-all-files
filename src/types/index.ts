export type Theme = 'light' | 'dark';

export type TimeRange = '1H' | '24H' | '7D' | '30D';

export interface SensorStatus {
  status: 'safe' | 'warning' | 'danger';
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface ConnectionStatus {
  type: 'websocket' | 'polling' | 'disconnected';
}

export interface SensorReading {
  id: string;
  device_id: string;
  deviceId: string;
  ph: number;
  temperature: number;
  turbidity: number;
  conductivity: number;
  latitude?: number | null;
  longitude?: number | null;
  recorded_at: string;
  timestamp: string;
}

export interface DeviceWithLocation {
  id: string;
  deviceId: string;
  name: string;
  owner_id: string;
  status: 'connected' | 'disconnected';
  last_seen?: string | null;
  created_at: string;
  latest_reading?: SensorReading | null;
  readings?: SensorReading | null;
}

export interface Alert {
  id: string;
  device_id: string;
  rule_id: string;
  parameter: 'ph' | 'temperature' | 'turbidity' | 'conductivity';
  value: number;
  type: 'low' | 'high';
  message: string;
  triggered_at: string;
  deviceId?: string;
  deviceName?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface Ticket {
  id: string;
  user_id: string;
  user_email?: string;
  assigned_email?: string;
  status: 'open' | 'pending_close' | 'escalated' | 'closed' | 'archived';
  subject: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  created_by_role?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_email?: string;
  sender_role?: string;
  message: string;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}

export interface UserRecord {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  status: 'active' | 'suspended' | 'banned';
  provider?: string;
  created_at: string;
}

export interface AlertRule {
  id: string;
  user_id: string;
  parameter: 'ph' | 'temperature' | 'turbidity' | 'conductivity';
  min_value?: number | null;
  max_value?: number | null;
  created_at: string;
}
