import { authService } from '../lib/services/authService';

const PAYMENT_API_BASE_URL =
  'https://order.shopmindnotification.app/api/payments';

export interface PaymentData {
  paymentId: number;
  orderId: number | null;
  customerId: number | null;
  stripePaymentIntentId: string | null;
  stripePaymentMethodId: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  orderStatus: string | null;
  orderTotalAmount: number | null;
  orderDate: string | null;
}

export interface PaymentsResponse {
  success: boolean;
  message: string;
  payments: PaymentData[];
  totalPayments: number;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    last: boolean;
    first: boolean;
  };
}

class PaymentService {
  private async getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAllPayments(
    page: number = 0,
    size: number = 10
  ): Promise<PaymentsResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(`${PAYMENT_API_BASE_URL}/all?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Payment analytics
  calculatePaymentStats(payments: PaymentData[]) {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

    // Group by status
    const statusGroups = payments.reduce(
      (acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by payment method
    const methodGroups = payments.reduce(
      (acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Recent payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = payments.filter(
      payment => new Date(payment.createdAt) >= thirtyDaysAgo
    );

    return {
      totalPayments,
      totalAmount,
      averagePayment,
      statusGroups,
      methodGroups,
      recentPayments: recentPayments.length,
      recentAmount: recentPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ),
    };
  }
}

export const paymentService = new PaymentService();
