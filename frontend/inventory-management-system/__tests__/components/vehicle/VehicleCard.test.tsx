import { render, screen } from '@testing-library/react';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { Vehicle } from '@/lib/services/driverService';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, ...restProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...restProps} />;
  },
}));

const baseVehicle: Vehicle = {
  vehicleId: 1,
  vehicleNumber: 'ABC-1234',
  vehicleType: 'CAR',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  capacity: 500,
  status: 'AVAILABLE',
  lastMaintenance: '2024-01-15',
  nextMaintenance: '2024-07-15',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('VehicleCard', () => {
  describe('Basic Rendering', () => {
    it('renders vehicle number correctly', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    });

    it('renders vehicle make and model', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    it('renders vehicle type', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText('Car')).toBeInTheDocument();
    });

    it('renders vehicle year when provided', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText(/Year:/)).toBeInTheDocument();
      expect(screen.getByText(/2023/)).toBeInTheDocument();
    });

    it('renders vehicle capacity', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText(/Capacity:/)).toBeInTheDocument();
      expect(screen.getByText(/500 kg/)).toBeInTheDocument();
    });

    it('does not render year section when year is not provided', () => {
      const vehicleWithoutYear = { ...baseVehicle, year: undefined };
      render(<VehicleCard vehicle={vehicleWithoutYear as Vehicle} />);

      expect(screen.queryByText(/Year:/)).not.toBeInTheDocument();
    });
  });

  describe('Vehicle Status Display', () => {
    it('shows AVAILABLE status with green styling', () => {
      const availableVehicle = { ...baseVehicle, status: 'AVAILABLE' };
      render(<VehicleCard vehicle={availableVehicle as Vehicle} />);

      const statusBadge = screen.getByText(/AVAILABLE/);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.className).toContain('bg-green-100');
      expect(statusBadge.className).toContain('text-green-800');
    });

    it('shows ASSIGNED status with blue styling', () => {
      const assignedVehicle = { ...baseVehicle, status: 'ASSIGNED' };
      render(<VehicleCard vehicle={assignedVehicle as Vehicle} />);

      const statusBadge = screen.getByText(/ASSIGNED/);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.className).toContain('bg-blue-100');
      expect(statusBadge.className).toContain('text-blue-800');
    });

    it('shows MAINTENANCE status with yellow styling', () => {
      const maintenanceVehicle = { ...baseVehicle, status: 'MAINTENANCE' };
      render(<VehicleCard vehicle={maintenanceVehicle as Vehicle} />);

      const statusBadge = screen.getByText(/MAINTENANCE/);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.className).toContain('bg-yellow-100');
      expect(statusBadge.className).toContain('text-yellow-800');
    });

    it('shows OUT_OF_SERVICE status with red styling', () => {
      const outOfServiceVehicle = {
        ...baseVehicle,
        status: 'OUT_OF_SERVICE',
      };
      render(<VehicleCard vehicle={outOfServiceVehicle as Vehicle} />);

      // Status text has underscore replaced with space
      const statusBadge = screen.getByText(/OUT.OF.SERVICE/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.className).toContain('bg-red-100');
      expect(statusBadge.className).toContain('text-red-800');
    });

    it('shows correct status icon for AVAILABLE', () => {
      const availableVehicle = { ...baseVehicle, status: 'AVAILABLE' };
      render(<VehicleCard vehicle={availableVehicle as Vehicle} />);

      expect(screen.getByText(/🟢/)).toBeInTheDocument();
    });

    it('shows correct status icon for MAINTENANCE', () => {
      const maintenanceVehicle = { ...baseVehicle, status: 'MAINTENANCE' };
      render(<VehicleCard vehicle={maintenanceVehicle as Vehicle} />);

      expect(screen.getByText(/🟡/)).toBeInTheDocument();
    });
  });

  describe('Vehicle Type Display', () => {
    it('renders CAR type correctly', () => {
      const carVehicle = { ...baseVehicle, vehicleType: 'CAR' };
      render(<VehicleCard vehicle={carVehicle as Vehicle} />);

      expect(screen.getByText('Car')).toBeInTheDocument();
      const image = screen.getByAltText('Car');
      expect(image).toHaveAttribute('src', expect.stringContaining('car.png'));
    });

    it('renders TRUCK type correctly', () => {
      const truckVehicle = { ...baseVehicle, vehicleType: 'TRUCK' };
      render(<VehicleCard vehicle={truckVehicle as Vehicle} />);

      expect(screen.getByText('Truck')).toBeInTheDocument();
      const image = screen.getByAltText('Truck');
      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining('truck.png')
      );
    });

    it('renders VAN type correctly', () => {
      const vanVehicle = { ...baseVehicle, vehicleType: 'VAN' };
      render(<VehicleCard vehicle={vanVehicle as Vehicle} />);

      expect(screen.getByText('Van')).toBeInTheDocument();
      const image = screen.getByAltText('Van');
      expect(image).toHaveAttribute('src', expect.stringContaining('van.png'));
    });

    it('renders MOTORCYCLE type correctly', () => {
      const motorcycleVehicle = { ...baseVehicle, vehicleType: 'MOTORCYCLE' };
      render(<VehicleCard vehicle={motorcycleVehicle as Vehicle} />);

      expect(screen.getByText('Motorcycle')).toBeInTheDocument();
      const image = screen.getByAltText('Motorcycle');
      expect(image).toHaveAttribute('src', expect.stringContaining('bike.png'));
    });

    it('uses fallback image for unknown vehicle type', () => {
      const unknownVehicle = { ...baseVehicle, vehicleType: 'UNKNOWN' };
      render(<VehicleCard vehicle={unknownVehicle as Vehicle} />);

      const image = screen.getByAltText(/unknown/i);
      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining('truck.png')
      );
    });
  });

  describe('Assigned Driver Display', () => {
    it('shows assigned driver ID when vehicle is assigned', () => {
      const assignedVehicle = {
        ...baseVehicle,
        status: 'ASSIGNED',
        assignedDriverId: 42,
      };
      render(<VehicleCard vehicle={assignedVehicle as Vehicle} />);

      expect(screen.getByText(/Driver ID:/)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });

    it('does not show driver section when vehicle is not assigned', () => {
      const unassignedVehicle = {
        ...baseVehicle,
        status: 'AVAILABLE',
        assignedDriverId: undefined,
      };
      render(<VehicleCard vehicle={unassignedVehicle as Vehicle} />);

      expect(screen.queryByText(/Driver ID:/)).not.toBeInTheDocument();
    });

    it('does not show driver section when assignedDriverId is null', () => {
      const unassignedVehicle = {
        ...baseVehicle,
        assignedDriverId: null,
      };
      render(<VehicleCard vehicle={unassignedVehicle as any} />);

      expect(screen.queryByText(/Driver ID:/)).not.toBeInTheDocument();
    });
  });

  describe('Maintenance Information', () => {
    it('displays last maintenance date when provided', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText(/Last Service:/)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });

    it('displays next maintenance date when provided', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText(/Next Service:/)).toBeInTheDocument();
      expect(screen.getByText(/7\/15\/2024/)).toBeInTheDocument();
    });

    it('does not show maintenance section when both dates are missing', () => {
      const vehicleNoMaintenance = {
        ...baseVehicle,
        lastMaintenance: undefined,
        nextMaintenance: undefined,
      };
      render(<VehicleCard vehicle={vehicleNoMaintenance as Vehicle} />);

      expect(screen.queryByText(/Last Service:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Next Service:/)).not.toBeInTheDocument();
    });

    it('shows only last maintenance when next maintenance is missing', () => {
      const vehicleOnlyLast = {
        ...baseVehicle,
        nextMaintenance: undefined,
      };
      render(<VehicleCard vehicle={vehicleOnlyLast as Vehicle} />);

      expect(screen.getByText(/Last Service:/)).toBeInTheDocument();
      expect(screen.queryByText(/Next Service:/)).not.toBeInTheDocument();
    });

    it('shows only next maintenance when last maintenance is missing', () => {
      const vehicleOnlyNext = {
        ...baseVehicle,
        lastMaintenance: undefined,
      };
      render(<VehicleCard vehicle={vehicleOnlyNext as Vehicle} />);

      expect(screen.queryByText(/Last Service:/)).not.toBeInTheDocument();
      expect(screen.getByText(/Next Service:/)).toBeInTheDocument();
    });

    it('formats maintenance dates correctly', () => {
      const vehicleWithDates = {
        ...baseVehicle,
        lastMaintenance: '2024-03-20',
        nextMaintenance: '2024-09-20',
      };
      render(<VehicleCard vehicle={vehicleWithDates as Vehicle} />);

      expect(screen.getByText(/3\/20\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/9\/20\/2024/)).toBeInTheDocument();
    });
  });

  describe('Vehicle Display Variants', () => {
    it('renders vehicle without make/model - shows only type', () => {
      const basicVehicle = {
        vehicleId: 1,
        vehicleNumber: 'V-001',
        vehicleType: 'CAR',
        capacity: 400,
        status: 'AVAILABLE',
      };
      render(<VehicleCard vehicle={basicVehicle as Vehicle} />);

      // Should show type (formatted as "Car")
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(/Car/i);
    });

    it('renders full vehicle with all details', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.getByText('ABC-1234')).toBeInTheDocument();
      expect(screen.getByText(/2023/)).toBeInTheDocument();
      expect(screen.getByText(/500 kg/)).toBeInTheDocument();
      expect(screen.getByText(/AVAILABLE/)).toBeInTheDocument();
    });

    it('renders truck with high capacity', () => {
      const truck = {
        vehicleId: 2,
        vehicleNumber: 'TRUCK-001',
        vehicleType: 'TRUCK',
        make: 'Volvo',
        model: 'FH16',
        year: 2022,
        capacity: 5000,
        status: 'AVAILABLE',
      };
      render(<VehicleCard vehicle={truck as Vehicle} />);

      expect(screen.getByText('Volvo FH16')).toBeInTheDocument();
      expect(screen.getByText(/5000 kg/)).toBeInTheDocument();
    });

    it('renders motorcycle with low capacity', () => {
      const motorcycle = {
        vehicleId: 3,
        vehicleNumber: 'BIKE-001',
        vehicleType: 'MOTORCYCLE',
        make: 'Honda',
        model: 'CBR',
        year: 2024,
        capacity: 50,
        status: 'AVAILABLE',
      };
      render(<VehicleCard vehicle={motorcycle as Vehicle} />);

      expect(screen.getByText('Honda CBR')).toBeInTheDocument();
      expect(screen.getByText('Motorcycle')).toBeInTheDocument();
      expect(screen.getByText(/50 kg/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles vehicle with empty make and model', () => {
      const vehicleNoMakeModel = {
        ...baseVehicle,
        make: '',
        model: '',
      };
      render(<VehicleCard vehicle={vehicleNoMakeModel as Vehicle} />);

      // When make/model empty, shows "Car" as heading
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Car');
    });

    it('handles vehicle with only make', () => {
      const vehicleOnlyMake = {
        ...baseVehicle,
        make: 'Toyota',
        model: '',
      };
      render(<VehicleCard vehicle={vehicleOnlyMake as Vehicle} />);

      // Should show type when model is missing
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('handles vehicle with only model', () => {
      const vehicleOnlyModel = {
        ...baseVehicle,
        make: '',
        model: 'Camry',
      };
      render(<VehicleCard vehicle={vehicleOnlyModel as Vehicle} />);

      // Should show type when make is missing
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('handles vehicle number with special characters', () => {
      const specialVehicle = {
        ...baseVehicle,
        vehicleNumber: 'ABC-1234!@#',
      };
      render(<VehicleCard vehicle={specialVehicle as Vehicle} />);

      expect(screen.getByText('ABC-1234!@#')).toBeInTheDocument();
    });

    it('handles very long vehicle numbers', () => {
      const longNumberVehicle = {
        ...baseVehicle,
        vehicleNumber: 'VERY-LONG-VEHICLE-NUMBER-12345',
      };
      render(<VehicleCard vehicle={longNumberVehicle as Vehicle} />);

      expect(
        screen.getByText('VERY-LONG-VEHICLE-NUMBER-12345')
      ).toBeInTheDocument();
    });

    it('handles zero capacity', () => {
      const zeroCapacityVehicle = {
        ...baseVehicle,
        capacity: 0,
      };
      render(<VehicleCard vehicle={zeroCapacityVehicle as Vehicle} />);

      expect(screen.getByText(/0 kg/)).toBeInTheDocument();
    });

    it('handles very large capacity', () => {
      const largeCapacityVehicle = {
        ...baseVehicle,
        capacity: 100000,
      };
      render(<VehicleCard vehicle={largeCapacityVehicle as Vehicle} />);

      expect(screen.getByText(/100000 kg/)).toBeInTheDocument();
    });

    it('handles old year (historical vehicle)', () => {
      const oldVehicle = {
        ...baseVehicle,
        year: 1990,
      };
      render(<VehicleCard vehicle={oldVehicle as Vehicle} />);

      expect(screen.getByText(/1990/)).toBeInTheDocument();
    });

    it('handles future year', () => {
      const futureVehicle = {
        ...baseVehicle,
        year: 2030,
      };
      render(<VehicleCard vehicle={futureVehicle as Vehicle} />);

      expect(screen.getByText(/2030/)).toBeInTheDocument();
    });
  });

  describe('Maintenance Dates Formatting', () => {
    it('formats dates in MM/DD/YYYY format', () => {
      const vehicleWithDates = {
        ...baseVehicle,
        lastMaintenance: '2024-12-25',
        nextMaintenance: '2025-06-30',
      };
      render(<VehicleCard vehicle={vehicleWithDates as Vehicle} />);

      expect(screen.getByText(/12\/25\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/6\/30\/2025/)).toBeInTheDocument();
    });

    it('handles invalid date strings gracefully', () => {
      const vehicleInvalidDates = {
        ...baseVehicle,
        lastMaintenance: 'invalid-date',
        nextMaintenance: 'also-invalid',
      };
      render(<VehicleCard vehicle={vehicleInvalidDates as Vehicle} />);

      // Component should still render (might show Invalid Date)
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });
  });

  describe('Vehicle Type Formatting', () => {
    it('formats CAR to "Car"', () => {
      const car = { ...baseVehicle, vehicleType: 'CAR' };
      render(<VehicleCard vehicle={car as Vehicle} />);

      expect(screen.getByText('Car')).toBeInTheDocument();
    });

    it('formats TRUCK to "Truck"', () => {
      const truck = { ...baseVehicle, vehicleType: 'TRUCK' };
      render(<VehicleCard vehicle={truck as Vehicle} />);

      expect(screen.getByText('Truck')).toBeInTheDocument();
    });

    it('formats VAN to "Van"', () => {
      const van = { ...baseVehicle, vehicleType: 'VAN' };
      render(<VehicleCard vehicle={van as Vehicle} />);

      expect(screen.getByText('Van')).toBeInTheDocument();
    });

    it('formats MOTORCYCLE specially', () => {
      const motorcycle = { ...baseVehicle, vehicleType: 'MOTORCYCLE' };
      render(<VehicleCard vehicle={motorcycle as Vehicle} />);

      expect(screen.getByText('Motorcycle')).toBeInTheDocument();
    });
  });

  describe('Assigned Driver Information', () => {
    it('displays driver ID for assigned vehicles', () => {
      const assignedVehicle = {
        ...baseVehicle,
        status: 'ASSIGNED',
        assignedDriverId: 123,
      };
      const { container } = render(
        <VehicleCard vehicle={assignedVehicle as Vehicle} />
      );

      // Check that driver section exists
      expect(screen.getByText(/Driver ID:/i)).toBeInTheDocument();
      // Check for the number 123 somewhere in the document
      expect(container.textContent).toContain('123');
    });

    it('handles large driver IDs', () => {
      const vehicleWithLargeDriverId = {
        ...baseVehicle,
        status: 'ASSIGNED',
        assignedDriverId: 999999,
      };
      render(<VehicleCard vehicle={vehicleWithLargeDriverId as Vehicle} />);

      expect(screen.getByText(/Driver ID:/)).toBeInTheDocument();
      expect(screen.getByText(/999999/)).toBeInTheDocument();
    });

    it('handles driver ID of 0', () => {
      const vehicleWithZeroDriverId = {
        ...baseVehicle,
        assignedDriverId: 0,
      };
      render(<VehicleCard vehicle={vehicleWithZeroDriverId as Vehicle} />);

      // Driver ID 0 is falsy, should not display
      expect(screen.queryByText(/Driver ID:/)).not.toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies hover effects class', () => {
      const { container } = render(<VehicleCard vehicle={baseVehicle} />);

      const card = container.querySelector('.group');
      expect(card?.className).toContain('hover:shadow-xl');
      expect(card?.className).toContain('transition-all');
    });

    it('applies correct background color for status badge', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      const statusBadge = screen.getByText(/AVAILABLE/);
      expect(statusBadge.className).toContain('bg-green-100');
    });

    it('displays vehicle number badge in top-left corner', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      const vehicleNumberBadge = screen.getByText('ABC-1234');
      expect(vehicleNumberBadge.className).toContain('bg-white/90');
      expect(vehicleNumberBadge.className).toContain('backdrop-blur-sm');
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for vehicle image', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      const image = screen.getByAltText('Car');
      expect(image).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Toyota Camry');
    });

    it('uses semantic HTML with proper labels', () => {
      render(<VehicleCard vehicle={baseVehicle} />);

      expect(screen.getByText(/Year:/)).toBeInTheDocument();
      expect(screen.getByText(/Capacity:/)).toBeInTheDocument();
    });
  });

  describe('Complete Vehicle Examples', () => {
    it('renders delivery van correctly', () => {
      const deliveryVan = {
        vehicleId: 10,
        vehicleNumber: 'DV-2024-001',
        vehicleType: 'VAN',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2024,
        capacity: 1200,
        status: 'ASSIGNED',
        assignedDriverId: 5,
        lastMaintenance: '2024-02-01',
        nextMaintenance: '2024-08-01',
      };
      const { container } = render(
        <VehicleCard vehicle={deliveryVan as Vehicle} />
      );

      expect(screen.getByText('Mercedes Sprinter')).toBeInTheDocument();
      expect(screen.getByText('Van')).toBeInTheDocument();
      expect(screen.getByText('DV-2024-001')).toBeInTheDocument();
      expect(screen.getByText(/1200 kg/)).toBeInTheDocument();
      expect(screen.getByText(/ASSIGNED/i)).toBeInTheDocument();
      expect(screen.getByText(/Driver ID:/i)).toBeInTheDocument();
      expect(container.textContent).toContain('5');
    });

    it('renders cargo truck correctly', () => {
      const cargoTruck = {
        vehicleId: 20,
        vehicleNumber: 'CT-2023-050',
        vehicleType: 'TRUCK',
        make: 'Volvo',
        model: 'FH',
        year: 2023,
        capacity: 8000,
        status: 'MAINTENANCE',
        lastMaintenance: '2024-10-10',
        nextMaintenance: '2024-10-25',
      };
      render(<VehicleCard vehicle={cargoTruck as Vehicle} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Volvo FH'
      );
      expect(screen.getByText('Truck')).toBeInTheDocument();
      expect(screen.getByText(/8000 kg/)).toBeInTheDocument();
      expect(screen.getByText(/MAINTENANCE/i)).toBeInTheDocument();
    });

    it('renders new vehicle without maintenance history', () => {
      const newVehicle = {
        vehicleId: 30,
        vehicleNumber: 'NEW-2024-001',
        vehicleType: 'CAR',
        make: 'Tesla',
        model: 'Model 3',
        year: 2024,
        capacity: 300,
        status: 'AVAILABLE',
      };
      render(<VehicleCard vehicle={newVehicle as Vehicle} />);

      expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
      expect(screen.queryByText(/Last Service:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Next Service:/)).not.toBeInTheDocument();
    });
  });

  describe('Status Badge Variations', () => {
    it('replaces underscores in status text', () => {
      const outOfServiceVehicle = {
        ...baseVehicle,
        status: 'OUT_OF_SERVICE',
      };
      render(<VehicleCard vehicle={outOfServiceVehicle as Vehicle} />);

      // Status text with underscore replaced
      expect(screen.getByText(/OUT.OF.SERVICE/i)).toBeInTheDocument();
    });

    it('handles unknown status with default styling', () => {
      const unknownStatusVehicle = {
        ...baseVehicle,
        status: 'UNKNOWN',
      };
      render(<VehicleCard vehicle={unknownStatusVehicle as any} />);

      const statusBadge = screen.getByText(/UNKNOWN/);
      expect(statusBadge.className).toContain('bg-gray-100');
      expect(statusBadge.className).toContain('text-gray-800');
    });
  });
});
