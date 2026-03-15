import type { SensorReading, DeviceWithLocation, Alert, Ticket, TicketDetail, UserRecord } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Ticket API - uses Supabase edge functions
export const ticketApi = {
  async list(_token: string, _params: Record<string, string | boolean> = {}): Promise<Ticket[]> {
    // Placeholder - will be implemented with Supabase
    return [];
  },
  async get(_token: string, _id: string): Promise<TicketDetail> {
    throw new Error('Not implemented yet');
  },
  async create(_token: string, _subject: string, _description: string): Promise<Ticket> {
    throw new Error('Not implemented yet');
  },
  async sendMessage(_token: string, _id: string, _message: string): Promise<void> {},
  async proposeClose(_token: string, _id: string): Promise<void> {},
  async approveClose(_token: string, _id: string): Promise<void> {},
  async rejectClose(_token: string, _id: string): Promise<void> {},
  async escalate(_token: string, _id: string): Promise<void> {},
  async archive(_token: string, _id: string): Promise<void> {},
  async delete(_token: string, _id: string): Promise<void> {},
};

// User management API
export const userApi = {
  async list(_token: string): Promise<UserRecord[]> {
    return [];
  },
  async setStatus(_token: string, _id: number, _status: string): Promise<void> {},
  async setRole(_token: string, _id: number, _role: string): Promise<void> {},
};

class ApiService {
  async getLatestData(): Promise<{ success: boolean; data: DeviceWithLocation[] }> {
    // Mock data for now - will be replaced with Supabase queries
    return { success: true, data: [] };
  }

  async getDeviceHistory(
    deviceId: string,
    hours: number = 24,
    limit: number = 100
  ): Promise<{ success: boolean; data: SensorReading[]; count: number }> {
    return { success: true, data: [], count: 0 };
  }

  async getAllDevices(): Promise<{ success: boolean; data: DeviceWithLocation[]; count: number }> {
    return { success: true, data: [], count: 0 };
  }

  async getDeviceDetails(deviceId: string): Promise<{ success: boolean; data: DeviceWithLocation }> {
    throw new Error('Not implemented');
  }

  async registerDevice(
    name: string,
    deviceId: string
  ): Promise<{ success: boolean; message: string; data: DeviceWithLocation }> {
    throw new Error('Not implemented');
  }

  async deleteDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Not implemented');
  }

  async getActiveAlerts(): Promise<{ success: boolean; data: Alert[]; count: number }> {
    return { success: true, data: [], count: 0 };
  }

  async clearAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Not implemented');
  }

  async sendSensorData(data: {
    deviceId: string;
    ph: number;
    temperature: number;
    turbidity: number;
    conductivity: number;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; message: string }> {
    throw new Error('Not implemented');
  }
}

export const apiService = new ApiService();
export default ApiService;
