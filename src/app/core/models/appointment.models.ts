export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FINISHED';

export interface CreateAppointmentDTO {
  artistId: string;
  sessionDate: string;
  estimatedDurationMinutes: number;
  designSpecifications: string;
}

export interface UpdateAppointmentDTO {
  sessionDate?: string;
  estimatedDurationMinutes?: number;
  designSpecifications?: string;
  status?: AppointmentStatus;
}

export interface AppointmentResponseDTO {
  id: string;
  sessionDate: string;
  estimatedDurationMinutes: number;
  status: AppointmentStatus;
  designSpecifications: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  artistSpecialty: string;
  createdAt: string;
}
