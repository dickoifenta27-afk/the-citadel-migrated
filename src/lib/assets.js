// Asset URLs from Base44
// These URLs still work and redirect to media.base44.com

// ============================================
// ADVISOR PORTRAITS - Half-body (for Citadel panel)
// ============================================
export const ADVISOR_PORTRAITS_HALF = {
  elric: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/614f695a4_elric_transparent.png",
  valerius: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/246f87180_valerius_transparent.png",
  seraphina: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/77d1507ae_seraphina_transparent.png",
  silas: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/cc3d5cf7b_silas_transparent.png"
};

// ============================================
// ADVISOR PORTRAITS - Full-body (for dialog/events)
// ============================================
// Note: Currently using same URLs as half-body (Base44 only provided one version)
// TODO: Update with full-body URLs when available
export const ADVISOR_PORTRAITS_FULL = {
  elric: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/614f695a4_elric_transparent.png",
  valerius: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/246f87180_valerius_transparent.png",
  seraphina: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/77d1507ae_seraphina_transparent.png",
  silas: "https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/cc3d5cf7b_silas_transparent.png"
};

// ============================================
// BACKGROUND IMAGES - For each page
// ============================================
export const BACKGROUND_MAP = {
  citadel: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/0401a2039_generated_image.png",
  diplomacy: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/585e32815_generated_image.png",
  marketplace: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/4cb4a1b4e_generated_image.png",
  war_room: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/dc4fc725c_generated_image.png",
  hall_of_laws: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/6f25335ac_generated_image.png",
  tech_lab: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c5b6c74df_generated_image.png",
  infrastructure: "https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/24194bdf0_generated_image.png"
};

// ============================================
// PAGE TO BACKGROUND MAPPING
// ============================================
export const PAGE_BACKGROUNDS = {
  '/Citadel': BACKGROUND_MAP.citadel,
  '/Marketplace': BACKGROUND_MAP.marketplace,
  '/HallOfLawsPage': BACKGROUND_MAP.hall_of_laws,
  '/Diplomacy': BACKGROUND_MAP.diplomacy,
  '/WarRoom': BACKGROUND_MAP.war_room,
  '/TechLab': BACKGROUND_MAP.tech_lab,
  '/Infrastructure': BACKGROUND_MAP.infrastructure
};

// ============================================
// HELPER FUNCTION - Get advisor portrait
// ============================================
export function getAdvisorPortrait(advisorKey, type = 'half') {
  const portraits = type === 'full' ? ADVISOR_PORTRAITS_FULL : ADVISOR_PORTRAITS_HALF;
  return portraits[advisorKey.toLowerCase()] || null;
}

// ============================================
// HELPER FUNCTION - Get page background
// ============================================
export function getPageBackground(path) {
  return PAGE_BACKGROUNDS[path] || BACKGROUND_MAP.citadel;
}
