import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePortfolioItemDTO, PortfolioItemResponseDTO } from '../../../core/models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portfolio`;

  findAll(artistId?: string, styleTag?: string): Observable<PortfolioItemResponseDTO[]> {
    let params = new HttpParams();
    if (artistId && artistId !== 'all') {
      params = params.set('artistId', artistId);
    }
    if (styleTag && styleTag !== 'all') {
      params = params.set('styleTag', styleTag);
    }
    return this.http.get<PortfolioItemResponseDTO[]>(this.baseUrl, { params });
  }

  findById(id: string): Observable<PortfolioItemResponseDTO> {
    return this.http.get<PortfolioItemResponseDTO>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreatePortfolioItemDTO): Observable<PortfolioItemResponseDTO> {
    return this.http.post<PortfolioItemResponseDTO>(this.baseUrl, dto);
  }

  upload(formData: FormData): Observable<PortfolioItemResponseDTO> {
    return this.http.post<PortfolioItemResponseDTO>(this.baseUrl, formData);
  }

  update(id: string, dto: CreatePortfolioItemDTO): Observable<PortfolioItemResponseDTO> {
    return this.http.put<PortfolioItemResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
