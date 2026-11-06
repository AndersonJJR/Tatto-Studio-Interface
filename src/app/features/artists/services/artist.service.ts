import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BookedSlotResponseDTO, CreateTattooArtistDTO, TattooArtistResponseDTO } from '../../../core/models/artist.models';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/artists`;

  findAll(specialty?: string): Observable<TattooArtistResponseDTO[]> {
    let params = new HttpParams();
    if (specialty && specialty !== 'all') {
      params = params.set('specialty', specialty);
    }
    return this.http.get<TattooArtistResponseDTO[]>(this.baseUrl, { params });
  }

  findById(id: string): Observable<TattooArtistResponseDTO> {
    return this.http.get<TattooArtistResponseDTO>(`${this.baseUrl}/${id}`);
  }

  getProfile(): Observable<TattooArtistResponseDTO> {
    return this.http.get<TattooArtistResponseDTO>(`${this.baseUrl}/me`);
  }

  findBookedSlots(artistId: string, start?: string, end?: string): Observable<BookedSlotResponseDTO[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<BookedSlotResponseDTO[]>(`${this.baseUrl}/${artistId}/booked-slots`, { params });
  }

  update(id: string, dto: CreateTattooArtistDTO): Observable<TattooArtistResponseDTO> {
    return this.http.put<TattooArtistResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }
}
