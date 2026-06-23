export interface InvoiceResponseDTO {
  id: string;
  tenantId: string;
  membershipId: string;
  memberId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string; // LocalDate de Java llega como YYYY-MM-DD
  status: 'unpaid' | 'paid' | 'overdue';
  createdAt: string;
}

export interface InvoiceRequestDTO {
  memberId: string;
  membershipId: string;
  amount: number;
  dueDate: string;
}

export interface PaymentRequestDTO {
  invoiceId: string | null; // Null si es pago directo sin cuota previa
  membershipId: string;
  memberId: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer';
  referenceNumber?: string; // Opcional para transferencias
  notes?: string;
}

export interface PaymentResponseDTO {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  memberId: string;
}