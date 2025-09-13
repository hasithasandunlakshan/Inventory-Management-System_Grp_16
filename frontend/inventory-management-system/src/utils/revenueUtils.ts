import { MonthlyRevenueData } from '@/types/revenue';

export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  if (currency.toLowerCase() === 'usd') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
};

export const formatMonth = (month: string): string => {
  return month.charAt(0) + month.slice(1).toLowerCase();
};

export const calculatePercentage = (value: number, max: number): number => {
  if (max === 0) return 0;
  return (value / max) * 100;
};

export const getMonthsWithRevenue = (
  monthlyData: MonthlyRevenueData[],
  limit: number = 6
) => {
  return monthlyData.filter(month => month.revenue > 0).slice(-limit);
};

export const getCurrentMonth = (monthlyData: MonthlyRevenueData[]) => {
  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];
  const currentMonthName = monthNames[new Date().getMonth()];
  return monthlyData.find(m => m.month === currentMonthName);
};
