export interface DriverProfile {
  driverId: number;
  userId: number;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  emergencyContact?: string;
  availabilityStatus: DriverStatus;
  assignedVehicleId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDropdownInfo {
  userId: number;
  username: string;
}

export interface DriverRegistrationForm {
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  emergencyContact: string;
}

export interface FormErrors {
  [key: string]: string;
}

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';

export interface DriverStats {
  totalDrivers: number;
  availableDrivers: number;
  busyDrivers: number;
}

export interface DriverFilters {
  searchTerm: string;
  status?: DriverStatus;
}

export interface DriverServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DriverRegistrationRequest {
  userId: number;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  emergencyContact?: string;
}
