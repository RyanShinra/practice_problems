// test-optimizer.ts

import { optimizeBonuses } from './bonus-optimizer';

// Example scenario based on our earlier discussion
const zones = 3;
const predictedDemand = [120, 80, 150];
const currentDrivers = [40, 30, 50];
const driverResponseRate = [0.05, 0.08, 0.04]; // As decimals (5%, 8%, 4%)
const inactiveDrivers = [200, 100, 300];
const averageFare = [12, 8, 15];
const totalBudget = 1000;
const maxBonusPerZone = 20;

console.log('Zone Analysis');
console.log('-'.repeat(60));
console.log('Zone | Demand | Current | Inactive | Response | Avg Fare');
console.log('-'.repeat(60));

// console.log(`  i     | predictedDemand | currentDrivers | inactiveDrivers | driverResponseRate | averageFare`);
for (let i = 0; i < zones; i++) {
  console.log(`  ${i}  |   ${predictedDemand[i]}   |    ${currentDrivers[i]}   |    ${inactiveDrivers[i]}   |   ${driverResponseRate[i] * 100}%   |   $${averageFare[i]}`);
}

console.log('\nRunning optimization...\n');

// Run the optimizer
const optimalBonuses = optimizeBonuses(
  predictedDemand,
  currentDrivers,
  driverResponseRate,
  inactiveDrivers,
  averageFare,
  totalBudget, 
  maxBonusPerZone
);

// Display results
console.log('Optimization Results');
console.log('-'.repeat(60));
console.log('Zone | Optimal Bonus | New Drivers | Total Capacity | Demand Met?');
console.log('-'.repeat(60));

let totalBonus = 0;

for (let i = 0; i < zones; i++) {
  const bonus = optimalBonuses[i];
  
  const newDrivers = Math.floor(bonus * driverResponseRate[i] * inactiveDrivers[i]);
  const totalDrivers = currentDrivers[i] + newDrivers;
  const capacity = totalDrivers * 2; // Each driver handles 2 rides
  const demandMet = capacity >= predictedDemand[i];
  
  totalBonus = totalBonus + bonus * totalDrivers;
  console.log(`  ${i}  |      $${bonus}      |     ${newDrivers}     |       ${capacity}      |    ${demandMet ? 'Yes' : 'No'}`);
}

console.log('-'.repeat(60));
console.log(`Total budget used: $${totalBonus} out of $${totalBudget}`);

// Calculate overall metrics
const totalRevenue = optimalBonuses.reduce((sum, bonus, i) => {
  const newDrivers = Math.floor(bonus * driverResponseRate[i] * inactiveDrivers[i]);
  const totalDrivers = currentDrivers[i] + newDrivers;
  const capacity = totalDrivers * 2;
  const rides = Math.min(capacity, predictedDemand[i]);
  return sum + (rides * averageFare[i]);
}, 0);

const totalBonusPaid = optimalBonuses.reduce((sum, bonus, i) => {
  const newDrivers = Math.floor(bonus * driverResponseRate[i] * inactiveDrivers[i]);
  const totalDrivers = currentDrivers[i] + newDrivers;
  return sum + (totalDrivers * bonus);
}, 0);

const profit = totalRevenue - totalBonusPaid;

console.log(`Total revenue: $${totalRevenue.toFixed(2)}`);
console.log(`Total bonuses paid: $${totalBonusPaid.toFixed(2)}`);
console.log(`Total profit: $${profit.toFixed(2)}`);