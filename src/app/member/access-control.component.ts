import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessControlService, AttendanceRecord } from './access-control.service';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css']
})
export class AccessControlComponent implements OnInit {
  private readonly accessService = inject(AccessControlService);

  // Exponemos la señal del historial para el HTML
  readonly attendanceHistory = this.accessService.history;
  
  // Estado local para el formulario y el banner de respuesta
  dniInput = '';
  loading = signal(false);
  lastResult = signal<AttendanceRecord | null>(null);

  ngOnInit(): void {
    this.accessService.loadHistory(); // Carga las asistencias del día al entrar
  }

  onSubmitCheckIn(): void {
    if (!this.dniInput.trim() || this.loading()) return;

    this.loading.set(true);
    this.accessService.checkIn(this.dniInput.trim()).subscribe({
      next: (result) => {
        this.lastResult.set(result); // Guardamos el resultado para mostrar el banner
        this.dniInput = ''; // Limpiamos el input para el siguiente cliente
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}