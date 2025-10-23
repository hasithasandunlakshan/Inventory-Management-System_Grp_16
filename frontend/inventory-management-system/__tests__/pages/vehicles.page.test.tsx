import { render, screen } from '@testing-library/react';
import VehiclesPage from '@/app/vehicles/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the VehiclesClient component
jest.mock('@/app/vehicles/VehiclesClient', () => {
  return function MockVehiclesClient({
    initialVehicles,
    initialAvailableVehicles,
  }: any) {
    return (
      <div>
        <div data-testid='vehicles-list'>
          {initialVehicles.length === 0 ? (
            <div>No vehicles available</div>
          ) : (
            initialVehicles.map((vehicle: any) => (
              <div key={vehicle.vehicleId} data-testid='vehicle-card'>
                {vehicle.vehicleNumber} - {vehicle.vehicleType}
              </div>
            ))
          )}
        </div>
        <div data-testid='available-vehicles-count'>
          Available: {initialAvailableVehicles.length}
        </div>
      </div>
    );
  };
});

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('VehiclesPage (Server Component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Data Fetching', () => {
    it('renders vehicles successfully with both API responses', async () => {
      const mockVehicles = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-1234',
          vehicleType: 'CAR',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          capacity: 500,
          status: 'AVAILABLE',
        },
        {
          vehicleId: 2,
          vehicleNumber: 'XYZ-5678',
          vehicleType: 'TRUCK',
          make: 'Ford',
          model: 'F-150',
          year: 2022,
          capacity: 1000,
          status: 'ASSIGNED',
        },
      ];

      const mockAvailableVehicles = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-1234',
          vehicleType: 'CAR',
          status: 'AVAILABLE',
        },
      ];

      // Mock both API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockVehicles,
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockAvailableVehicles,
          }),
        } as Response);

      render(await VehiclesPage());

      // Check vehicles are rendered
      expect(await screen.findByTestId('vehicles-list')).toBeInTheDocument();
      expect(screen.getByText('ABC-1234 - CAR')).toBeInTheDocument();
      expect(screen.getByText('XYZ-5678 - TRUCK')).toBeInTheDocument();

      // Check available vehicles count
      expect(screen.getByText('Available: 1')).toBeInTheDocument();
    });

    it('fetches vehicles with parallel API calls', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      // Verify both API calls were made in parallel
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/resources/vehicles'),
        expect.objectContaining({
          next: { revalidate: 180 },
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/resources/vehicles/available'),
        expect.objectContaining({
          next: { revalidate: 180 },
        })
      );
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no vehicles exist', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      expect(
        await screen.findByText(/No vehicles available/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Available: 0')).toBeInTheDocument();
    });

    it('renders empty state when API returns null data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }),
        } as Response);

      render(await VehiclesPage());

      expect(
        await screen.findByText(/No vehicles available/i)
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles vehicles API failure gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      // Should render empty state on failure
      expect(
        await screen.findByText(/No vehicles available/i)
      ).toBeInTheDocument();
    });

    it('handles available vehicles API failure gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

      render(await VehiclesPage());

      // Should still render even if second call fails
      expect(await screen.findByTestId('vehicles-list')).toBeInTheDocument();
      expect(screen.getByText('Available: 0')).toBeInTheDocument();
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(await VehiclesPage());

      // Should render empty state on exception
      expect(
        await screen.findByText(/No vehicles available/i)
      ).toBeInTheDocument();
    });

    it('handles both API failures', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        } as Response);

      render(await VehiclesPage());

      expect(
        await screen.findByText(/No vehicles available/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Available: 0')).toBeInTheDocument();
    });
  });

  describe('Environment Configuration', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it('uses NEXT_PUBLIC_RESOURCE_SERVICE_URL when provided', async () => {
      process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL = 'https://custom-api.com';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-api.com/api/resources/vehicles',
        expect.any(Object)
      );
    });

    it('falls back to localhost when env variable not set', async () => {
      delete process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8086/api/resources/vehicles',
        expect.any(Object)
      );
    });
  });

  describe('ISR Configuration', () => {
    it('uses correct revalidate time (180 seconds)', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      // Verify revalidate is set correctly in fetch options
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: { revalidate: 180 },
        })
      );
    });
  });

  describe('Data Types', () => {
    it('handles different vehicle types correctly', async () => {
      const diverseVehicles = [
        { vehicleId: 1, vehicleNumber: 'CAR-001', vehicleType: 'CAR' },
        { vehicleId: 2, vehicleNumber: 'TRUCK-001', vehicleType: 'TRUCK' },
        { vehicleId: 3, vehicleNumber: 'VAN-001', vehicleType: 'VAN' },
        { vehicleId: 4, vehicleNumber: 'BIKE-001', vehicleType: 'MOTORCYCLE' },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: diverseVehicles }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      expect(await screen.findByText('CAR-001 - CAR')).toBeInTheDocument();
      expect(screen.getByText('TRUCK-001 - TRUCK')).toBeInTheDocument();
      expect(screen.getByText('VAN-001 - VAN')).toBeInTheDocument();
      expect(screen.getByText('BIKE-001 - MOTORCYCLE')).toBeInTheDocument();
    });

    it('handles different vehicle statuses', async () => {
      const vehiclesWithStatuses = [
        {
          vehicleId: 1,
          vehicleNumber: 'V1',
          vehicleType: 'CAR',
          status: 'AVAILABLE',
        },
        {
          vehicleId: 2,
          vehicleNumber: 'V2',
          vehicleType: 'TRUCK',
          status: 'ASSIGNED',
        },
        {
          vehicleId: 3,
          vehicleNumber: 'V3',
          vehicleType: 'VAN',
          status: 'MAINTENANCE',
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: vehiclesWithStatuses }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(await VehiclesPage());

      expect(await screen.findByText('V1 - CAR')).toBeInTheDocument();
      expect(screen.getByText('V2 - TRUCK')).toBeInTheDocument();
      expect(screen.getByText('V3 - VAN')).toBeInTheDocument();
    });
  });
});
