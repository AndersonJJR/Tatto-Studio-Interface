import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AppointmentResponseDTO,
  AppointmentStatus,
  CreateAppointmentDTO,
  UpdateAppointmentDTO
} from '../../../core/models/appointment.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/appointments`;

  create(dto: CreateAppointmentDTO): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(this.baseUrl, dto);
  }

  findMyAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(this.baseUrl);
  }

  findById(id: string): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.baseUrl}/${id}`);
  }

  update(id: string, dto: UpdateAppointmentDTO): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<AppointmentResponseDTO> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AppointmentResponseDTO>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  cancel(id: string): Observable<AppointmentResponseDTO> {
    return this.http.delete<AppointmentResponseDTO>(`${this.baseUrl}/${id}`);
  }
}
