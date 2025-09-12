
const API_BASE_URL = 'http://localhost:8090';

export interface DriverProfile {
  driverId: number;
  userId: number;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';
  assignedVehicleId?: number;
  emergencyContact?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'CAR';
  capacity: number;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  assignedDriverId?: number;
  make?: string;
  model?: string;
  year?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverVehicleAssignment {
  assignmentId: number;
  driverId: number;
  vehicleId: number;
  assignedAt: string;
  unassignedAt?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface DriverRegistrationRequest {
  userId: number;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  emergencyContact?: string;
  address?: string;
}

export interface VehicleRegistrationRequest {
  vehicleNumber: string;
  vehicleType: 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'CAR';
  capacity: number;
  make?: string;
  model?: string;
  year?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface AssignmentRequest {
  driverId: number;
  vehicleId: number;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  createdAt?: string;
  dateOfBirth?: string;
}

export interface UserDropdownInfo {
  userId: number;
  username: string;
}

class DriverService {
  private getAuthHeaders() {
    const token = localStorage.getItem('inventory_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Driver Management
  async registerDriver(request: DriverRegistrationRequest): Promise<ApiResponse<DriverProfile>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/drivers/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse<DriverProfile>(response);
  }

  async getAllDrivers(): Promise<ApiResponse<DriverProfile[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/drivers`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverProfile[]>(response);
  }

  async getDriverById(driverId: number): Promise<ApiResponse<DriverProfile>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/drivers/${driverId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverProfile>(response);
  }

  async getDriverByUserId(userId: number): Promise<ApiResponse<DriverProfile>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/drivers/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverProfile>(response);
  }

  async getAvailableDrivers(): Promise<ApiResponse<DriverProfile[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/drivers/available`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverProfile[]>(response);
  }

  // Vehicle Management
  async registerVehicle(request: VehicleRegistrationRequest): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/vehicles/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse<Vehicle>(response);
  }

  async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/vehicles`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Vehicle[]>(response);
  }

  async getAvailableVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/vehicles/available`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Vehicle[]>(response);
  }

  // Assignment Management
  async createAssignment(request: AssignmentRequest): Promise<ApiResponse<DriverVehicleAssignment>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/assignments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse<DriverVehicleAssignment>(response);
  }

  async getAllAssignments(): Promise<ApiResponse<DriverVehicleAssignment[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/assignments`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverVehicleAssignment[]>(response);
  }

  async getActiveAssignments(): Promise<ApiResponse<DriverVehicleAssignment[]>> {
    const response = await fetch(`${API_BASE_URL}/api/resources/assignments/active`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DriverVehicleAssignment[]>(response);
  }

  // User Management (for driver account creation)
  async createDriverAccount(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
  }): Promise<{ success: boolean; message: string; userId?: number }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || 'Failed to create driver account');
    }

    const result = await response.text();
    return {
      success: true,
      message: result,
      // Note: You'll need to modify UserService to return the created user ID
      // For now, we'll handle this in the UI flow
    };
  }

  // Get users by role for driver selection dropdown
  async getUsersByRole(role: string = 'USER'): Promise<UserInfo[]> {
    const headers = this.getAuthHeaders();
    console.log('🔍 getUsersByRole - Headers:', headers);
    console.log('🔍 getUsersByRole - URL:', `${API_BASE_URL}/api/auth/users?role=${role}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/users?role=${role}`, {
      method: 'GET',
      headers: headers,
    });

    console.log('🔍 getUsersByRole - Response status:', response.status);
    console.log('🔍 getUsersByRole - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 getUsersByRole - Error response:', errorText);
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    console.log('🔍 getUsersByRole - Success data:', data);
    return data;
  }
}

export const driverService = new DriverService();
