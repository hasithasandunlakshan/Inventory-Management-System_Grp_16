package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.dto.VehicleRegistrationRequest;
import com.resourseservice.resourseservice.entity.Vehicle;
import com.resourseservice.resourseservice.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        log.info("Fetching all vehicles");
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getAvailableVehicles() {
        log.info("Fetching available vehicles");
        return vehicleRepository.findAvailableVehicles();
    }

    public Optional<Vehicle> getVehicleById(Long vehicleId) {
        log.info("Fetching vehicle by ID: {}", vehicleId);
        return vehicleRepository.findById(vehicleId);
    }

    public Optional<Vehicle> getVehicleByNumber(String vehicleNumber) {
        log.info("Fetching vehicle by number: {}", vehicleNumber);
        return vehicleRepository.findByVehicleNumber(vehicleNumber);
    }

    public List<Vehicle> getVehiclesByStatus(Vehicle.VehicleStatus status) {
        log.info("Fetching vehicles by status: {}", status);
        return vehicleRepository.findByStatus(status);
    }

    public List<Vehicle> getVehiclesByType(Vehicle.VehicleType vehicleType) {
        log.info("Fetching vehicles by type: {}", vehicleType);
        return vehicleRepository.findByVehicleType(vehicleType);
    }

    public List<Vehicle> getVehiclesByTypeAndStatus(Vehicle.VehicleType vehicleType, Vehicle.VehicleStatus status) {
        log.info("Fetching vehicles by type: {} and status: {}", vehicleType, status);
        return vehicleRepository.findByVehicleTypeAndStatus(vehicleType, status);
    }

    public Optional<Vehicle> getVehicleByDriverId(Long driverId) {
        log.info("Fetching vehicle by driver ID: {}", driverId);
        return vehicleRepository.findByAssignedDriverId(driverId);
    }

    public long getVehicleCountByStatus(Vehicle.VehicleStatus status) {
        log.info("Counting vehicles by status: {}", status);
        return vehicleRepository.countByStatus(status);
    }

    @Transactional
    public Vehicle registerVehicle(VehicleRegistrationRequest request) {
        log.info("Registering vehicle with number: {}", request.getVehicleNumber());

        // Check if vehicle number already exists
        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new RuntimeException("Vehicle with number " + request.getVehicleNumber() + " already exists");
        }

        // Create new vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setLastMaintenance(request.getLastMaintenance());
        vehicle.setNextMaintenance(request.getNextMaintenance());
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE); // Default status

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Successfully registered vehicle with ID: {} and number: {}",
                savedVehicle.getVehicleId(), savedVehicle.getVehicleNumber());

        return savedVehicle;
    }
}
