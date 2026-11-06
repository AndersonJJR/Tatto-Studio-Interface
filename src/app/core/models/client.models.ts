export interface ClientResponseDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  preferences: string;
}

export interface CreateClientDTO {
  name: string;
  phone: string;
  preferences: string;
}
