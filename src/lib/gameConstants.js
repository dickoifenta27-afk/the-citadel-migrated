// Game faction names - centralized to prevent hardcoding
export const FACTIONS = {
  GILDED_COUNCIL: 'Gilded Council',
  IRON_VANGUARD: 'Iron Vanguard',
  COMMON_FOLK: 'Common Folk',
  ARCHIVE: 'Archive'
};

// Law IDs
export const LAW_IDS = {
  JUMAT_BERKAH: 'LAW_JUMAT_BERKAH'
};

// Faction styling
export const FACTION_COLORS = {
  [FACTIONS.GILDED_COUNCIL]: 'text-teal-400',
  [FACTIONS.IRON_VANGUARD]: 'text-red-400',
  [FACTIONS.COMMON_FOLK]: 'text-yellow-400',
  [FACTIONS.ARCHIVE]: 'text-purple-400'
};

// Clamp utility
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));