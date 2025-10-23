import { driverService } from '@/lib/services/driverService';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('driverService - Vehicle Operations', () => {
  const mockResourceServiceUrl = 'http://localhost:8086';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL = mockResourceServiceUrl;
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
  });

  describe('getAllVehicles', () => {
    it('fetches all vehicles successfully', async () => {
      const mockVehicles = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-1234',
          vehicleType: 'CAR',
          status: 'AVAILABLE',
        },
        {
          vehicleId: 2,
          vehicleNumber: 'XYZ-5678',
          vehicleType: 'TRUCK',
          status: 'ASSIGNED',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVehicles }),
      } as Response);

      const result = await driverService.getAllVehicles();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVehicles);
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockResourceServiceUrl}/api/resources/vehicles`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
    });

    it('throws error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      } as Response);

      await expect(driverService.getAllVehicles()).rejects.toThrow();
    });

    it('throws error on network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(driverService.getAllVehicles()).rejects.toThrow(
        'Network error'
      );
    });

    it('includes authentication token in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await driverService.getAllVehicles();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'inventory_auth_token'
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
    });
  });

  describe('getAvailableVehicles', () => {
    it('fetches available vehicles successfully', async () => {
      const mockAvailableVehicles = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-1234',
          vehicleType: 'CAR',
          status: 'AVAILABLE',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAvailableVehicles }),
      } as Response);

      const result = await driverService.getAvailableVehicles();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAvailableVehicles);
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockResourceServiceUrl}/api/resources/vehicles/available`,
        expect.any(Object)
      );
    });

    it('returns empty array when no available vehicles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const result = await driverService.getAvailableVehicles();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('throws error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      } as Response);

      await expect(driverService.getAvailableVehicles()).rejects.toThrow();
    });
  });

  describe('registerVehicle', () => {
    const validRegistrationData = {
      vehicleNumber: 'NEW-001',
      vehicleType: 'CAR' as const,
      capacity: 500,
      make: 'Honda',
      model: 'Civic',
      year: 2024,
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-07-01',
    };

    it('registers a new vehicle successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Vehicle registered successfully',
        }),
      } as Response);

      const result = await driverService.registerVehicle(validRegistrationData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Vehicle registered successfully');
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockResourceServiceUrl}/api/resources/vehicles/register`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
    });

    it('sends correct vehicle data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await driverService.registerVehicle(validRegistrationData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockResourceServiceUrl}/api/resources/vehicles/register`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(validRegistrationData),
        })
      );
    });

    it('throws error on registration failure (duplicate vehicle)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          message: 'Vehicle number already exists',
        }),
      } as Response);

      await expect(
        driverService.registerVehicle(validRegistrationData)
      ).rejects.toThrow(/Vehicle number already exists/i);
    });

    it('throws error on network errors during registration', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(
        driverService.registerVehicle(validRegistrationData)
      ).rejects.toThrow('Connection timeout');
    });

    it('registers vehicle with minimal data', async () => {
      const minimalData = {
        vehicleNumber: 'MIN-001',
        vehicleType: 'CAR',
        capacity: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await driverService.registerVehicle(minimalData as any);

      expect(result.success).toBe(true);
    });

    it('registers different vehicle types correctly', async () => {
      const vehicleTypes = ['CAR', 'TRUCK', 'VAN', 'MOTORCYCLE'];

      for (const type of vehicleTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

        const data = {
          ...validRegistrationData,
          vehicleType: type,
          vehicleNumber: `${type}-001`,
        };

        const result = await driverService.registerVehicle(data as any);
        expect(result.success).toBe(true);
      }

      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Environment Configuration', () => {
    it('uses configured resource service URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await driverService.getAllVehicles();

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockResourceServiceUrl}/api/resources/vehicles`,
        expect.any(Object)
      );
    });

    it('falls back to localhost when env not set', async () => {
      delete process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await driverService.getAllVehicles();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8086/api/resources/vehicles',
        expect.any(Object)
      );
    });
  });

  describe('Response Format Handling', () => {
    it('handles response with nested data property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Success',
          data: [{ vehicleId: 1 }],
        }),
      } as Response);

      const result = await driverService.getAllVehicles();

      expect(result.data).toEqual([{ vehicleId: 1 }]);
    });

    it('handles empty data array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const result = await driverService.getAllVehicles();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('handles null data gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: null }),
      } as Response);

      const result = await driverService.getAllVehicles();

      expect(result.data).toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    it('uses GET method for getAllVehicles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await driverService.getAllVehicles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('uses GET method for getAvailableVehicles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await driverService.getAvailableVehicles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('uses POST method for registerVehicle', async () => {
      const data = {
        vehicleNumber: 'TEST',
        vehicleType: 'CAR' as const,
        capacity: 500,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await driverService.registerVehicle(data as any);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('Error Messages', () => {
    it('throws error with message from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Invalid vehicle data',
        }),
      } as Response);

      await expect(
        driverService.registerVehicle({
          vehicleNumber: 'BAD',
          vehicleType: 'CAR',
          capacity: 500,
        } as any)
      ).rejects.toThrow(/Invalid vehicle data/i);
    });

    it('throws error with default message when API error has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(driverService.getAllVehicles()).rejects.toThrow(
        /HTTP error/i
      );
    });
  });
});
