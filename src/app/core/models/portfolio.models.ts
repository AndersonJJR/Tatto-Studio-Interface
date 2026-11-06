export interface PortfolioItemResponseDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  styleTag: string;
  authorCredits?: string;
  isPublic?: boolean;
  artistId: string;
  artistName: string;
  createdAt: string;
}

export interface CreatePortfolioItemDTO {
  title: string;
  description: string;
  imageUrl: string;
  styleTag: string;
  authorCredits?: string;
  isPublic?: boolean;
}
