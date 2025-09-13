import {
  DriverProfile,
  DriverRegistrationForm,
  FormErrors,
  DriverStatus,
  DriverStats,
  DriverFilters,
} from '@/types/driver';

/**
 * Validates the driver registration form
 */
export const validateDriverForm = (
  selectedUserId: string,
  form: DriverRegistrationForm
): FormErrors => {
  const errors: FormErrors = {};

  // User selection validation
  if (!selectedUserId) {
    errors.userId = 'Please select a user';
  }

  // License number validation
  if (!form.licenseNumber.trim()) {
    errors.licenseNumber = 'License number is required';
  } else if (form.licenseNumber.trim().length < 3) {
    errors.licenseNumber = 'License number must be at least 3 characters';
  }

  // License class validation (must be single uppercase letter or two uppercase letters)
  if (!form.licenseClass.trim()) {
    errors.licenseClass = 'License class is required';
  } else {
    const licenseClassRegex = /^[A-Z]$|^[A-Z]{2}$/;
    if (!licenseClassRegex.test(form.licenseClass.trim())) {
      errors.licenseClass =
        'License class must be a single letter (A, B, C) or two letters (AB, CD)';
    }
  }

  // License expiry validation
  if (!form.licenseExpiry) {
    errors.licenseExpiry = 'License expiry date is required';
  } else {
    const expiryDate = new Date(form.licenseExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate <= today) {
      errors.licenseExpiry = 'License expiry date must be in the future';
    }
  }

  // Emergency contact validation (optional but if provided, must be valid phone number)
  if (form.emergencyContact && form.emergencyContact.trim()) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(form.emergencyContact.trim())) {
      errors.emergencyContact =
        'Please enter a valid phone number (e.g., +1234567890)';
    }
  }

  return errors;
};

/**
 * Resets the driver registration form to initial state
 */
export const getInitialDriverForm = (): DriverRegistrationForm => ({
  licenseNumber: '',
  licenseClass: '',
  licenseExpiry: '',
  emergencyContact: '',
});

/**
 * Gets the badge variant for driver status
 */
export const getStatusBadgeVariant = (
  status: DriverStatus
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'AVAILABLE':
      return 'default';
    case 'BUSY':
      return 'secondary';
    case 'OFF_DUTY':
      return 'outline';
    case 'ON_LEAVE':
      return 'destructive';
    default:
      return 'outline';
  }
};

/**
 * Filters drivers based on search term and status
 */
export const filterDrivers = (
  drivers: DriverProfile[],
  filters: DriverFilters
): DriverProfile[] => {
  return drivers.filter(driver => {
    const matchesSearch =
      driver.licenseNumber
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      driver.licenseClass
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      driver.emergencyContact
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

    const matchesStatus =
      !filters.status || driver.availabilityStatus === filters.status;

    return matchesSearch && matchesStatus;
  });
};

/**
 * Calculates driver statistics
 */
export const calculateDriverStats = (
  drivers: DriverProfile[],
  availableDrivers: DriverProfile[]
): DriverStats => {
  return {
    totalDrivers: drivers.length,
    availableDrivers: availableDrivers.length,
    busyDrivers: drivers.filter(d => d.availabilityStatus === 'BUSY').length,
  };
};

/**
 * Gets the minimum date for license expiry (today)
 */
export const getMinLicenseExpiryDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Handles form field change and clears related error
 */
export const handleFormFieldChange = (
  field: keyof DriverRegistrationForm,
  value: string,
  form: DriverRegistrationForm,
  setForm: (form: DriverRegistrationForm) => void,
  errors: FormErrors,
  setErrors: (errors: FormErrors) => void
) => {
  setForm({ ...form, [field]: value });
  if (errors[field]) {
    setErrors({ ...errors, [field]: '' });
  }
};

/**
 * Handles user selection change and clears related error
 */
export const handleUserSelectionChange = (
  value: string,
  setSelectedUserId: (value: string) => void,
  errors: FormErrors,
  setErrors: (errors: FormErrors) => void
) => {
  setSelectedUserId(value);
  if (errors.userId) {
    setErrors({ ...errors, userId: '' });
  }
};

/**
 * Formats driver status for display
 */
export const formatDriverStatus = (status: DriverStatus): string => {
  return status
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Gets driver status color class
 */
export const getStatusColorClass = (status: DriverStatus): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'text-green-600 bg-green-50';
    case 'BUSY':
      return 'text-blue-600 bg-blue-50';
    case 'OFF_DUTY':
      return 'text-gray-600 bg-gray-50';
    case 'ON_LEAVE':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};
