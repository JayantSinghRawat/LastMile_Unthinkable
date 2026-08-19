import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Calculates the Haversine distance in kilometers between two sets of coordinates.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Auto-assigns the nearest available delivery agent to an order.
 * First tries to find available agents in the same active pickup zone.
 * Falls back to finding the closest available agent based on Haversine distance.
 */
export const findNearestAvailableAgent = async (
  pickupLat: number,
  pickupLng: number,
  sourceZoneId?: mongoose.Types.ObjectId
): Promise<any | null> => {
  // Find all active agents who are currently AVAILABLE
  const query: any = { role: 'AGENT', agentStatus: 'AVAILABLE' };
  
  const availableAgents = await User.find(query);

  if (availableAgents.length === 0) {
    return null;
  }

  // Phase 1: Try to match agents in the same active pickup zone
  if (sourceZoneId) {
    const zoneMatchAgents = availableAgents.filter(
      (agent) => agent.activeZoneId && agent.activeZoneId.toString() === sourceZoneId.toString()
    );

    if (zoneMatchAgents.length > 0) {
      // Find the closest agent within that zone
      let closestAgent = zoneMatchAgents[0];
      let minDistance = Infinity;

      for (const agent of zoneMatchAgents) {
        if (agent.currentLocation?.lat !== undefined && agent.currentLocation?.lng !== undefined) {
          const dist = calculateDistance(
            pickupLat,
            pickupLng,
            agent.currentLocation.lat,
            agent.currentLocation.lng
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestAgent = agent;
          }
        }
      }
      return closestAgent;
    }
  }

  // Phase 2: Fallback to global nearest available agent by distance
  let closestAgent = null;
  let minDistance = Infinity;

  for (const agent of availableAgents) {
    if (agent.currentLocation?.lat !== undefined && agent.currentLocation?.lng !== undefined) {
      const dist = calculateDistance(
        pickupLat,
        pickupLng,
        agent.currentLocation.lat,
        agent.currentLocation.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestAgent = agent;
      }
    }
  }

  return closestAgent;
};
