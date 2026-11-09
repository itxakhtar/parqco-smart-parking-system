// Single source of truth for the lot layout: 6 zones x 10 slots = 60 slots.
export const SLOTS_PER_ZONE = 10;

export const ZONES = [
  { code: 'A', floor: 1 },
  { code: 'B', floor: 2 },
  { code: 'C', floor: 3 },
  { code: 'D', floor: 4 },
  { code: 'E', floor: 5 },
  { code: 'F', floor: 6 },
];

// A-101 ... A-110, B-201 ... B-210, ... F-601 ... F-610
// floor is a number because the dashboard filters with slot.floor === floor.
export function buildSlotDefinitions() {
  return ZONES.flatMap((zone) =>
    Array.from({ length: SLOTS_PER_ZONE }, (_, i) => ({
      slotId: `${zone.code}-${zone.floor}${String(i + 1).padStart(2, '0')}`,
      floor: zone.floor,
      zone: zone.code,
    }))
  );
}
