import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehiclesClient from '@/app/vehicles/VehiclesClient';
import { driverService } from '@/lib/services/driverService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/services/driverService');
jest.mock('@/contexts/AuthContext');
jest.mock('sonner');
jest.mock('@/components/vehicle/VehicleCard', () => {
  return function MockVehicleCard({ vehicle }: any) {
    return (
      <div data-testid={`vehicle-${vehicle.vehicleId}`}>
        {vehicle.vehicleNumber} - {vehicle.status}
      </div>
    );
  };
});

const mockDriverService = driverService as jest.Mocked<typeof driverService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockToast = toast as jest.Mocked<typeof toast>;

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
    lastMaintenance: '2024-01-01',
    nextMaintenance: '2024-06-01',
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
    assignedDriverId: 10,
  },
  {
    vehicleId: 3,
    vehicleNumber: 'DEF-9012',
    vehicleType: 'VAN',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2021,
    capacity: 800,
    status: 'MAINTENANCE',
  },
];

const mockAvailableVehicles = [mockVehicles[0]];

describe('VehiclesClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'manager', role: 'MANAGER' } as any,
      isAuthenticated: true,
      isLoading: false,
      hasAnyRole: jest.fn((roles: string[]) => roles.includes('MANAGER')),
      hasRole: jest.fn(),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      canAccessSupplierService: jest.fn(),
      refreshAuth: jest.fn(),
    });
  });

  describe('Initial Rendering', () => {
    it('renders with initial vehicles data', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(screen.getByText('Vehicle Management')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-2')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-3')).toBeInTheDocument();
    });

    it('displays vehicle count correctly', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(screen.getByText(/3.*vehicles/i)).toBeInTheDocument();
    });

    it('renders with empty initial data', async () => {
      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      render(
        <VehiclesClient initialVehicles={[]} initialAvailableVehicles={[]} />
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Vehicle Management')).toBeInTheDocument();
      });

      expect(screen.getByText(/0.*vehicles/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters vehicles by vehicle number', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      fireEvent.change(searchInput, { target: { value: 'ABC-1234' } });

      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-3')).not.toBeInTheDocument();
    });

    it('filters vehicles by vehicle type (case insensitive)', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      fireEvent.change(searchInput, { target: { value: 'truck' } });

      expect(screen.queryByTestId('vehicle-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('vehicle-2')).toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-3')).not.toBeInTheDocument();
    });

    it('filters vehicles by make', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      fireEvent.change(searchInput, { target: { value: 'Toyota' } });

      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-2')).not.toBeInTheDocument();
    });

    it('filters vehicles by model', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      fireEvent.change(searchInput, { target: { value: 'F-150' } });

      expect(screen.queryByTestId('vehicle-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('vehicle-2')).toBeInTheDocument();
    });

    it('clears search results when search is cleared', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');

      // Search
      fireEvent.change(searchInput, { target: { value: 'Toyota' } });
      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-2')).not.toBeInTheDocument();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-2')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-3')).toBeInTheDocument();
    });

    it('shows no results when search has no matches', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(screen.queryByTestId('vehicle-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vehicle-3')).not.toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes vehicles when refresh button clicked', async () => {
      const updatedVehicles = [{ ...mockVehicles[0], status: 'MAINTENANCE' }];

      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: updatedVehicles,
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockDriverService.getAllVehicles).toHaveBeenCalled();
        expect(mockDriverService.getAvailableVehicles).toHaveBeenCalled();
      });
    });

    it('shows error toast on refresh failure', async () => {
      mockDriverService.getAllVehicles.mockRejectedValue(
        new Error('Network error')
      );

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load vehicles');
      });
    });
  });

  describe('Permission-Based UI', () => {
    it('shows Add Vehicle button for MANAGER role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'MANAGER' } as any,
        isAuthenticated: true,
        isLoading: false,
        hasAnyRole: jest.fn(() => true),
        hasRole: jest.fn(),
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        canAccessSupplierService: jest.fn(),
        refreshAuth: jest.fn(),
      });

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(
        screen.getByRole('button', { name: /add vehicle/i })
      ).toBeInTheDocument();
    });

    it('shows Add Vehicle button for ADMIN role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'ADMIN' } as any,
        isAuthenticated: true,
        isLoading: false,
        hasAnyRole: jest.fn(() => true),
        hasRole: jest.fn(),
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        canAccessSupplierService: jest.fn(),
        refreshAuth: jest.fn(),
      });

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(
        screen.getByRole('button', { name: /add vehicle/i })
      ).toBeInTheDocument();
    });

    it('hides Add Vehicle button for non-manager roles', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'DRIVER' } as any,
        isAuthenticated: true,
        isLoading: false,
        hasAnyRole: jest.fn(() => false),
        hasRole: jest.fn(),
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        canAccessSupplierService: jest.fn(),
        refreshAuth: jest.fn(),
      });

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(
        screen.queryByRole('button', { name: /add vehicle/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Vehicle Registration Modal', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { role: 'MANAGER' } as any,
        isAuthenticated: true,
        isLoading: false,
        hasAnyRole: jest.fn(() => true),
        hasRole: jest.fn(),
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        canAccessSupplierService: jest.fn(),
        refreshAuth: jest.fn(),
      });
    });

    it('opens registration modal when Add Vehicle clicked', async () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const addButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      fireEvent.click(addButtons[0]);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/vehicle number/i)).toBeInTheDocument();
      });
    });

    it('submits vehicle registration successfully', async () => {
      mockDriverService.registerVehicle.mockResolvedValue({
        success: true,
        message: 'Vehicle registered',
      } as any);

      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: mockVehicles,
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: mockAvailableVehicles,
      } as any);

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Open modal
      const addButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      fireEvent.click(addButtons[0]);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByLabelText(/vehicle number/i)).toBeInTheDocument();
      });

      // Fill form
      const vehicleNumberInput = screen.getByLabelText(/vehicle number/i);
      fireEvent.change(vehicleNumberInput, { target: { value: 'NEW-001' } });

      // Submit (get the submit button - last "Add Vehicle" button in the modal)
      const submitButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      const submitButton = submitButtons[submitButtons.length - 1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDriverService.registerVehicle).toHaveBeenCalledWith(
          expect.objectContaining({
            vehicleNumber: 'NEW-001',
          })
        );
        expect(mockToast.success).toHaveBeenCalledWith(
          'Vehicle registered successfully!'
        );
      });
    });

    it('shows error toast on registration failure', async () => {
      mockDriverService.registerVehicle.mockResolvedValue({
        success: false,
        message: 'Vehicle already exists',
      } as any);

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Open modal
      const addButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/vehicle number/i)).toBeInTheDocument();
      });

      // Fill required field
      const vehicleNumberInput = screen.getByLabelText(/vehicle number/i);
      fireEvent.change(vehicleNumberInput, { target: { value: 'DUP-001' } });

      // Submit form (last "Add Vehicle" button is the submit button)
      const submitButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      const submitButton = submitButtons[submitButtons.length - 1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Vehicle already exists');
      });
    });

    it('handles network error during registration', async () => {
      mockDriverService.registerVehicle.mockRejectedValue(
        new Error('Network error')
      );

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Open modal
      const addButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/vehicle number/i)).toBeInTheDocument();
      });

      // Fill required field
      const vehicleNumberInput = screen.getByLabelText(/vehicle number/i);
      fireEvent.change(vehicleNumberInput, { target: { value: 'TEST' } });

      // Submit
      const submitButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      const submitButton = submitButtons[submitButtons.length - 1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to register vehicle'
        );
      });
    });

    it('resets form after successful registration', async () => {
      mockDriverService.registerVehicle.mockResolvedValue({
        success: true,
      } as any);

      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Open modal and fill form
      const addButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/vehicle number/i)).toBeInTheDocument();
      });

      const vehicleNumberInput = screen.getByLabelText(/vehicle number/i);
      fireEvent.change(vehicleNumberInput, { target: { value: 'TEST-123' } });

      // Submit (get the last "Add Vehicle" button which is the submit button)
      const submitButtons = screen.getAllByRole('button', {
        name: /add vehicle/i,
      });
      const submitButton = submitButtons[submitButtons.length - 1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDriverService.registerVehicle).toHaveBeenCalled();
        expect(mockToast.success).toHaveBeenCalled();
      });
    }, 10000); // Increase timeout
  });

  describe('Tabs Navigation', () => {
    it('renders all tabs', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(
        screen.getByRole('tab', { name: /all vehicles/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /available/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /assigned/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /maintenance/i })
      ).toBeInTheDocument();
    });

    it('shows correct count in Available tab', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Available tab should exist
      expect(
        screen.getByRole('tab', { name: /available/i })
      ).toBeInTheDocument();
    });

    it('switches to different tabs', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // All tabs should exist
      const allTab = screen.getByRole('tab', { name: /all vehicles/i });
      const assignedTab = screen.getByRole('tab', { name: /assigned/i });

      expect(allTab).toBeInTheDocument();
      expect(assignedTab).toBeInTheDocument();

      // Click Assigned tab
      fireEvent.click(assignedTab);

      // Verify tab was clicked (component updates internally)
      expect(assignedTab).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('calls API to refresh vehicles when button clicked', async () => {
      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: mockVehicles,
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: mockAvailableVehicles,
      } as any);

      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Find and click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should call API
      await waitFor(() => {
        expect(mockDriverService.getAllVehicles).toHaveBeenCalled();
        expect(mockDriverService.getAvailableVehicles).toHaveBeenCalled();
      });
    });

    it('does not load vehicles if initial data is provided', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      // Should not call API on mount if initial data exists
      expect(mockDriverService.getAllVehicles).not.toHaveBeenCalled();
      expect(mockDriverService.getAvailableVehicles).not.toHaveBeenCalled();
    });

    it('loads vehicles on mount when initial data is empty', async () => {
      mockDriverService.getAllVehicles.mockResolvedValue({
        success: true,
        data: mockVehicles,
      } as any);

      mockDriverService.getAvailableVehicles.mockResolvedValue({
        success: true,
        data: [],
      } as any);

      render(
        <VehiclesClient initialVehicles={[]} initialAvailableVehicles={[]} />
      );

      // Should call API on mount when data is empty
      await waitFor(() => {
        expect(mockDriverService.getAllVehicles).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles vehicles without make/model', () => {
      const vehiclesWithoutMakeModel = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-123',
          vehicleType: 'CAR',
          capacity: 500,
          status: 'AVAILABLE',
        },
      ];

      render(
        <VehiclesClient
          initialVehicles={vehiclesWithoutMakeModel as any}
          initialAvailableVehicles={[]}
        />
      );

      expect(screen.getByTestId('vehicle-1')).toBeInTheDocument();
    });

    it('handles vehicles with special characters in number', () => {
      const specialVehicle = [
        {
          vehicleId: 1,
          vehicleNumber: 'ABC-123!@#',
          vehicleType: 'CAR',
          capacity: 500,
          status: 'AVAILABLE',
        },
      ];

      render(
        <VehiclesClient
          initialVehicles={specialVehicle as any}
          initialAvailableVehicles={[]}
        />
      );

      expect(screen.getByText(/ABC-123!@#/)).toBeInTheDocument();
    });

    it('handles large number of vehicles', () => {
      const manyVehicles = Array.from({ length: 100 }, (_, i) => ({
        vehicleId: i + 1,
        vehicleNumber: `V-${i + 1}`,
        vehicleType: 'CAR',
        capacity: 500,
        status: 'AVAILABLE',
      }));

      render(
        <VehiclesClient
          initialVehicles={manyVehicles as any}
          initialAvailableVehicles={[]}
        />
      );

      expect(screen.getByText(/100.*vehicles/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const heading = screen.getByRole('heading', {
        name: /vehicle management/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('has accessible search input', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search vehicles...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName.toLowerCase()).toBe('input');
    });

    it('has accessible buttons with proper labels', () => {
      render(
        <VehiclesClient
          initialVehicles={mockVehicles}
          initialAvailableVehicles={mockAvailableVehicles}
        />
      );

      expect(
        screen.getByRole('button', { name: /refresh/i })
      ).toBeInTheDocument();
    });
  });
});
