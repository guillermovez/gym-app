import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService } from './billing-api.service';
import { MemberApi } from '../member/member-api'; // 🎯 CORREGIDO: Importación exacta de tu clase
import { InvoiceResponseDTO, PaymentRequestDTO } from './billing.models';

// 🧠 Interfaz extendida para que el HTML reconozca los datos mapeados del cliente
interface EnrichedInvoice extends InvoiceResponseDTO {
  clientName: string;
  clientDni: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  private readonly billingService = inject(BillingApiService);
  private readonly memberService = inject(MemberApi);

  // Estado de Pestañas y señales base del servicio
  activeTab = signal<'pending' | 'history'>('pending');
  readonly overdueInvoices = this.billingService.overdueInvoices;
  readonly cashHistory = this.billingService.cashHistory;
  
  // Estado para el Modal de Cobro
  isPaymentModalOpen = signal(false);
  selectedInvoice = signal<EnrichedInvoice | null>(null);
  
  // Formulario de Pago
  paymentMethod: 'cash' | 'transfer' = 'cash';
  referenceNumber = '';
  notes = '';
  isSubmitting = signal(false);

  // 🧠 SEÑAL COMPUTADA 1: Para la pestaña de deudas pendientes
  readonly enrichedInvoices = computed<EnrichedInvoice[]>(() => {
    const memberList = this.memberService.members();
    return this.overdueInvoices().map(invoice => {
      const member = memberList.find(m => m.id === invoice.memberId);
      return {
        ...invoice,
        clientName: member ? `${member.name} ${member.lastName}` : 'Miembro No Encontrado',
        clientDni: member ? member.dni : '---'
      };
    });
  });

  // 🧠 SEÑAL COMPUTADA 2: Para la pestaña de historial de caja
  readonly enrichedPayments = computed(() => {
    const memberList = this.memberService.members();
    return this.cashHistory().map(payment => {
      const member = memberList.find(m => m.id === payment.memberId);
      return {
        ...payment,
        clientName: member ? `${member.name} ${member.lastName}` : 'Miembro No Encontrado',
        clientDni: member ? member.dni : '---'
      };
    });
  });

  ngOnInit(): void {
    this.memberService.loadMembers();
    this.billingService.loadOverdueInvoices();
    this.billingService.loadCashHistory();
  }
  
  // 🧠 Regla de negocio: Habilita el cobro solo si faltan 5 días o menos, o si ya venció
  canCollect(dueDateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Limpiamos horas para comparar solo fechas

    // Forzamos formato ISO local para evitar que la zona horaria mueva el día
    const dueDate = new Date(dueDateStr + 'T00:00:00');

    // Diferencia en milisegundos convertida a días
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si diffDays es negativo significa que ya venció (Moroso). 
    // Se habilita si ya venció O si faltan 5 días o menos para el vencimiento.
    return diffDays <= 5;
  }

  openPaymentModal(invoice: EnrichedInvoice): void {
    this.selectedInvoice.set(invoice);
    this.paymentMethod = 'cash';
    this.referenceNumber = '';
    this.notes = '';
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
    this.selectedInvoice.set(null);
  }

  processPayment(): void {
    const invoice = this.selectedInvoice();
    if (!invoice || this.isSubmitting()) return;

    if (this.paymentMethod === 'transfer' && !this.referenceNumber.trim()) {
      alert('Por favor, ingrese el número de referencia u operación bancaria.');
      return;
    }

    this.isSubmitting.set(true);

    const payload: PaymentRequestDTO = {
      invoiceId: invoice.id,
      membershipId: invoice.membershipId,
      memberId: invoice.memberId,
      amount: invoice.amount,
      paymentMethod: this.paymentMethod,
      referenceNumber: this.paymentMethod === 'transfer' ? this.referenceNumber.trim() : undefined,
      notes: this.notes.trim() || undefined
    };

    this.billingService.registrarPago(payload).subscribe({
      next: () => {
        alert(`¡Pago de la cuota ${invoice.invoiceNumber} registrado con éxito!`);
        this.isSubmitting.set(false);
        this.closePaymentModal();
      },
      error: (err) => {
        console.error(err);
        alert(err.error || 'Hubo un error al procesar el cobro en caja.');
        this.isSubmitting.set(false);
      }
    });
  }
}