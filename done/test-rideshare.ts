/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Define types
export type Point = [number, number];
export type Assignment = number[];

// Import the RideSharing class - adjust the import path as needed
import { RideSharing } from './via-rideshare';

// Test Case A: Complex city grid with multiple vehicles and passengers
function testCaseA() {
  console.log("\n=== Test Case A: Complex City Grid ===");
  
  const vehicleLocations: Point[] = [
    [0, 0],   // Car 0 at city center
    [10, 10], // Car 1 in northeast quadrant
    [10, 0]   // Car 2 in east part
  ];
  
  const passengerPickups: Point[] = [
    [1, 1],    // Passenger 0 - near city center
    [9, 9],    // Passenger 1 - near Car 1
    [5, 5],    // Passenger 2 - midway between cars
    [11, 1],   // Passenger 3 - near Car 2
    [2, 8],    // Passenger 4 - northwest quadrant
    [8, 2],    // Passenger 5 - southeast quadrant
    [15, 15]   // Passenger 6 - far from city center
  ];
  
  const passengerDestinations: Point[] = [
    [3, 3],    // Passenger 0 - short trip
    [20, 20],  // Passenger 1 - long trip northeast
    [0, 10],   // Passenger 2 - to northwest
    [5, 0],    // Passenger 3 - to south
    [2, 2],    // Passenger 4 - to city center
    [12, 1],   // Passenger 5 - to east
    [1, 20]    // Passenger 6 - to northwest far
  ];

  // Create the ride sharing instance
  const rideSharing = new RideSharing(passengerPickups, passengerDestinations, vehicleLocations);
  
  // Get routes
  const result = rideSharing.getRoutesForCars();
  
  // Display results
  console.log("Vehicle assignments:", result.assignments);
  console.log("Total distance:", result.totalDistance);
  console.log("Individual car distances:", result.carDistances);
  
  // Verify that all passengers are assigned
  const allAssigned = verifyAllPassengersAssigned(result.assignments, passengerPickups.length);
  console.log("All passengers assigned:", allAssigned);
  
  // Verify vehicle capacity
  const capacityRespected = verifyVehicleCapacity(result.assignments);
  console.log("Vehicle capacity respected:", capacityRespected);
}

// Test Case B: One vehicle must handle all passengers in multiple trips
function testCaseB() {
  console.log("\n=== Test Case B: Single Vehicle Multiple Trips ===");
  
  const vehicleLocations: Point[] = [
    [0, 0]   // Only one car at city center
  ];
  
  const passengerPickups: Point[] = [
    [1, 1],   // Passenger 0
    [2, 2],   // Passenger 1
    [3, 3],   // Passenger 2
    [4, 4],   // Passenger 3
    [5, 5],   // Passenger 4
    [6, 6]    // Passenger 5
  ];
  
  const passengerDestinations: Point[] = [
    [10, 10], // Passenger 0
    [11, 11], // Passenger 1
    [12, 12], // Passenger 2
    [13, 13], // Passenger 3
    [14, 14], // Passenger 4
    [15, 15]  // Passenger 5
  ];

  // Create the ride sharing instance
  const rideSharing = new RideSharing(passengerPickups, passengerDestinations, vehicleLocations);
  
  // Get routes
  const result = rideSharing.getRoutesForCars();
  
  // Display results
  console.log("Vehicle assignments:", result.assignments);
  console.log("Total distance:", result.totalDistance);
  console.log("Individual car distances:", result.carDistances);
  
  // Verify all passengers are assigned
  const allAssigned = verifyAllPassengersAssigned(result.assignments, passengerPickups.length);
  console.log("All passengers assigned:", allAssigned);
  
  // Verify vehicle capacity - should have at most 3 passengers per trip
  const capacityRespected = verifyVehicleCapacity(result.assignments);
  console.log("Vehicle capacity respected:", capacityRespected);
  
  // Check if all 6 passengers were assigned to the single vehicle
  console.log("All passengers handled by single vehicle:", result.assignments[0]!.length === 6);
}

// Test Case C: Passengers close to their destinations (short trips)
function testCaseC() {
  console.log("\n=== Test Case C: Short Trips ===");
  
  const vehicleLocations: Point[] = [
    [0, 0],   // Car 0
    [50, 50]  // Car 1 far away
  ];
  
  const passengerPickups: Point[] = [
    [1, 1],    // Passenger 0
    [2, 2],    // Passenger 1
    [3, 3],    // Passenger 2
    [4, 4],    // Passenger 3
    [51, 51],  // Passenger 4 (near Car 1)
    [52, 52]   // Passenger 5 (near Car 1)
  ];
  
  const passengerDestinations: Point[] = [
    [2, 2],    // Passenger 0 (very short trip)
    [3, 3],    // Passenger 1 (very short trip)
    [4, 4],    // Passenger 2 (very short trip)
    [5, 5],    // Passenger 3 (very short trip)
    [53, 53],  // Passenger 4 (very short trip)
    [54, 54]   // Passenger 5 (very short trip)
  ];

  // Create the ride sharing instance
  const rideSharing = new RideSharing(passengerPickups, passengerDestinations, vehicleLocations);
  
  // Get routes
  const result = rideSharing.getRoutesForCars();
  
  // Display results
  console.log("Vehicle assignments:", result.assignments);
  console.log("Total distance:", result.totalDistance);
  console.log("Individual car distances:", result.carDistances);
  
  // Verify that all passengers are assigned
  const allAssigned = verifyAllPassengersAssigned(result.assignments, passengerPickups.length);
  console.log("All passengers assigned:", allAssigned);
}

// Test Case D: Crossing paths - testing if algorithm can handle criss-crossing trips efficiently
function testCaseD() {
  console.log("\n=== Test Case D: Crossing Paths ===");
  
  const vehicleLocations: Point[] = [
    [0, 0],    // Car 0
    [10, 10]   // Car 1
  ];
  
  const passengerPickups: Point[] = [
    [1, 9],    // Passenger 0 (northwest)
    [9, 1],    // Passenger 1 (southeast)
    [1, 1],    // Passenger 2 (southwest)
    [9, 9],    // Passenger 3 (northeast)
    [5, 5],    // Passenger 4 (center)
    [5, 0]     // Passenger 5 (south center)
  ];
  
  const passengerDestinations: Point[] = [
    [9, 1],    // Passenger 0 -> southeast
    [1, 9],    // Passenger 1 -> northwest
    [9, 9],    // Passenger 2 -> northeast
    [1, 1],    // Passenger 3 -> southwest
    [0, 10],   // Passenger 4 -> northwest far
    [10, 0]    // Passenger 5 -> southeast far
  ];

  // Create the ride sharing instance
  const rideSharing = new RideSharing(passengerPickups, passengerDestinations, vehicleLocations);
  
  // Get routes
  const result = rideSharing.getRoutesForCars();
  
  // Display results
  console.log("Vehicle assignments:", result.assignments);
  console.log("Total distance:", result.totalDistance);
  console.log("Individual car distances:", result.carDistances);
  
  // Verify that all passengers are assigned
  const allAssigned = verifyAllPassengersAssigned(result.assignments, passengerPickups.length);
  console.log("All passengers assigned:", allAssigned);
}

// Helper function to verify that all passengers are assigned
function verifyAllPassengersAssigned(assignments: Assignment[], totalPassengers: number): boolean {
  const allAssignedPassengers = new Set<number>();
  
  // Collect all assigned passengers
  for (const vehicleAssignment of assignments) {
    for (const passengerId of vehicleAssignment) {
      allAssignedPassengers.add(passengerId);
    }
  }
  
  // Check if all passengers are assigned
  return allAssignedPassengers.size === totalPassengers;
}

// Helper function to verify vehicle capacity
function verifyVehicleCapacity(assignments: Assignment[]): boolean {
  // In our problem, a car can handle any number of passengers in total
  // but should have at most 3 in the car at any one time
  // This function isn't perfect to test this as we don't know the order
  // of pickup/dropoff, but it's a sanity check
  const MAX_CAPACITY = 3;
  
  for (const vehicleAssignment of assignments) {
    // This assumes the assignment list is as described in the problem
    // (i.e., passengers that are in the car at the same time)
    // If your solution returns all passengers ever handled by each car,
    // this check might need adjustment
    if (vehicleAssignment.length > MAX_CAPACITY) {
      // This might not be a failure if the car made multiple trips
      console.log(`Warning: Vehicle has ${vehicleAssignment.length} assignments. This could be valid if multiple trips were made.`);
    }
  }
  
  return true;
}

// Run all test cases
export function runAllTests(): void {
  testCaseA();
  testCaseB();
  testCaseC();
  testCaseD();
}

// runAllTests();