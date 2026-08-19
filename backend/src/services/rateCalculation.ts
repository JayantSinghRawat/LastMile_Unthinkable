import Zone from '../models/Zone';
import RateCard from '../models/RateCard';

interface CalculationInput {
  pickupAddress: string;
  dropAddress: string;
  length: number;
  width: number;
  height: number;
  actualWeight: number;
  orderType: 'B2B' | 'B2C';
  paymentType: 'PREPAID' | 'COD';
}

/**
 * Calculates volumetric weight: (L x B x H) / 5000
 */
export const calculateVolumetricWeight = (length: number, width: number, height: number): number => {
  return (length * width * height) / 5000;
};

/**
 * Detects the zone matching the area names found within the address string.
 */
export const detectZoneFromAddress = async (address: string): Promise<any> => {
  // Simple heuristic: search the address text for matching Area names.
  const zones = await Zone.find({});
  for (const zone of zones) {
    for (const area of zone.areas) {
      const escapedArea = area.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedArea}\\b`, 'i');
      if (regex.test(address)) {
        return zone;
      }
    }
  }
  return null;
};

/**
 * Executes the pricing logic calculation.
 */
export const calculateOrderCharge = async (input: CalculationInput) => {
  const { pickupAddress, dropAddress, length, width, height, actualWeight, orderType, paymentType } = input;

  // 1. Calculate volumetric weight
  const volumetricWt = calculateVolumetricWeight(length, width, height);

  // 2. Billable weight is the max of actual vs volumetric weight
  const billableWeight = Math.max(actualWeight, volumetricWt);

  // 3. Detect pickup and drop zones
  const sourceZone = await detectZoneFromAddress(pickupAddress);
  const destZone = await detectZoneFromAddress(dropAddress);

  if (!sourceZone || !destZone) {
    throw new Error('Could not identify pricing zones for the provided addresses. Please enter valid operational areas.');
  }

  // 4. Lookup matching rate card
  const rateCard = await RateCard.findOne({
    sourceZoneId: sourceZone._id,
    destZoneId: destZone._id,
    orderType,
  });

  if (!rateCard) {
    throw new Error(`No rate card configured for delivery from ${sourceZone.name} to ${destZone.name} under order type ${orderType}.`);
  }

  // 5. Calculate base charge + additional rate per kg above base (1kg base weight included in base rate)
  const additionalWeight = Math.max(0, billableWeight - 1);
  let totalCharge = rateCard.baseRate + (additionalWeight * rateCard.ratePerKg);

  // 6. Add COD Surcharge if applicable
  if (paymentType === 'COD') {
    totalCharge += rateCard.codSurcharge;
  }

  return {
    volumetricWt,
    billableWeight,
    totalCharge,
    sourceZoneId: sourceZone._id,
    destZoneId: destZone._id,
  };
};
