export interface TattooArtistResponseDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
}

export interface CreateTattooArtistDTO {
  name: string;
  phone: string;
  specialty: string;
  bio: string;
}

export interface BookedSlotResponseDTO {
  sessionDate: string;
  estimatedDurationMinutes: number;
}
