// Asset URLs Configuration for The Citadel: Crown & Counsel
// Assets diakses dari folder public/assets/

const ASSETS_BASE = '/assets';

export const ASSETS = {
  baseUrl: ASSETS_BASE,
  
  // ========== FACTION ICONS ==========
  icons: {
    factions: {
      merchantGuild: `${ASSETS_BASE}/icons/faction_merchant.png`,
      militaryOrder: `${ASSETS_BASE}/icons/faction_military.png`,
      commonFolk: `${ASSETS_BASE}/icons/faction_common.png`,
      arcaneCircle: `${ASSETS_BASE}/icons/faction_arcane.png`,
      agriculturalUnion: `${ASSETS_BASE}/icons/faction_agriculture.png`,
    },
    // ========== TECHNOLOGY ICONS ==========
    technology: {
      economy: `${ASSETS_BASE}/icons/tech_economy.png`,
      military: `${ASSETS_BASE}/icons/tech_military.png`,
      civic: `${ASSETS_BASE}/icons/tech_civic.png`,
      mystical: `${ASSETS_BASE}/icons/tech_mystical.png`,
    },
  },
  
  // ========== BUILDING ILLUSTRATIONS ==========
  buildings: {
    castle: `${ASSETS_BASE}/buildings/castle.png`,
    granary: `${ASSETS_BASE}/buildings/granary.png`,
    barracks: `${ASSETS_BASE}/buildings/barracks.png`,
    marketplace: `${ASSETS_BASE}/buildings/marketplace.png`,
    academy: `${ASSETS_BASE}/buildings/academy.png`,
    temple: `${ASSETS_BASE}/buildings/temple.png`,
    houses: `${ASSETS_BASE}/buildings/houses.png`,
    farm: `${ASSETS_BASE}/buildings/farm.png`,
    mine: `${ASSETS_BASE}/buildings/mine.png`,
    lumberMill: `${ASSETS_BASE}/buildings/lumber_mill.png`,
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get faction icon URL
 * @param {string} faction - 'merchantGuild', 'militaryOrder', 'commonFolk', 'arcaneCircle', 'agriculturalUnion'
 * @returns {string} Icon URL
 */
export const getFactionIcon = (faction) => {
  return ASSETS.icons.factions[faction] || '';
};

/**
 * Get technology icon URL
 * @param {string} category - 'economy', 'military', 'civic', 'mystical'
 * @returns {string} Icon URL
 */
export const getTechnologyIcon = (category) => {
  return ASSETS.icons.technology[category] || '';
};

/**
 * Get building illustration URL
 * @param {string} building - 'castle', 'granary', 'barracks', dll
 * @returns {string} Image URL
 */
export const getBuildingImage = (building) => {
  return ASSETS.buildings[building] || '';
};

export default ASSETS;
