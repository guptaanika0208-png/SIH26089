const Worker = require('../models/Worker');

// Haversine formula: distance between two lat/long points in km
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function findBestWorker(booking) {
  const eligibleWorkers = await Worker.find({
    cooperative: booking.cooperative,
    skills: booking.serviceType,
    availability: 'available'
  });

  if (eligibleWorkers.length === 0) return null;

  const bookingCoords = booking.location.coordinates.coordinates;

  // Emergency bookings: pure distance-priority matching, skip fairness/workload weighting
  if (booking.isEmergency) {
    const scored = eligibleWorkers.map((worker) => {
      const workerCoords = worker.location.coordinates.coordinates;
      const distance = calculateDistance(bookingCoords, workerCoords);
      return { worker, distance, totalScore: Math.max(0, 100 - distance * 2) };
    });
    scored.sort((a, b) => a.distance - b.distance);
    return scored[0];
  }

  // Normal bookings: weighted scoring (distance + workload + fairness)
  const scored = eligibleWorkers.map((worker) => {
    const workerCoords = worker.location.coordinates.coordinates;
    const distance = calculateDistance(bookingCoords, workerCoords);

    const distanceScore = Math.max(0, 100 - distance * 2);
    const workloadScore = Math.max(0, 100 - worker.currentWorkload * 10);
    const fairnessScore = Math.max(0, 100 - worker.utilizationScore);

    const totalScore =
      distanceScore * 0.4 + workloadScore * 0.35 + fairnessScore * 0.25;

    return { worker, distance, totalScore };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored[0];
}

module.exports = { findBestWorker, calculateDistance };