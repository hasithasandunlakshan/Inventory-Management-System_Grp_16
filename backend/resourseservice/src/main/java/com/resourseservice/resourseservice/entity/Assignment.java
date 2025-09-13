package com.resourseservice.resourseservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "assigned_by")
    private Long assignedBy; // User ID who made the assignment

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;

    @Column(name = "unassigned_by")
    private Long unassignedBy; // User ID who unassigned

    @Column(name = "notes", length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AssignmentStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }

    // Helper methods
    public boolean isActive() {
        return status == AssignmentStatus.ACTIVE;
    }

    public void deactivate(Long unassignedBy, String notes) {
        this.status = AssignmentStatus.INACTIVE;
        this.unassignedAt = LocalDateTime.now();
        this.unassignedBy = unassignedBy;
        this.notes = notes;
    }
}
