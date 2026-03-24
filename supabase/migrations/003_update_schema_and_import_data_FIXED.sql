-- =====================================================
-- MIGRATION: Update Schema (Decimal Loyalty) + Import All Data
-- FIXED: Use uuid_generate_v4() for IDs
-- For: The Citadel: Crown & Counsel
-- =====================================================

-- ============================================================================
-- PART 1: SCHEMA UPDATES (Decimal 0-1 for Loyalty/Influence)
-- ============================================================================

-- Note: faction_registry.loyalty, influence and faction_quests reward/penalty columns
-- are INTEGER (0-100) in schema - No ALTER needed

-- Note: regions.iron_richness, food_richness, clash_risk are INTEGER (0-100) in schema
-- No ALTER needed

-- ============================================================================
-- PART 2: CLEAN SLATE - DELETE ALL EXISTING DATA
-- ============================================================================

-- Delete in correct order (child tables first)
DELETE FROM faction_quests;
DELETE FROM faction_influence_configs;
DELETE FROM building_stats;
DELETE FROM council_members;
DELETE FROM advisory_configs;
DELETE FROM technology_tree;
DELETE FROM building_types;
DELETE FROM regions;
DELETE FROM law_library;
DELETE FROM event_master;
DELETE FROM faction_registry;
DELETE FROM scenario_master;

-- ============================================================================
-- PART 3: IMPORT SCENARIO_MASTER (6 scenarios)
-- ============================================================================

INSERT INTO scenario_master (
    id, scenario_id, title, difficulty, difficulty_label, is_active,
    objective_desc, context_desc, target_turn, target_stability,
    initial_state, faction_loyalties, special_conditions, created_at
) VALUES 
-- Scenario 1: The Young Ruler
(
    uuid_generate_v4(),
    'SCENARIO_YOUNG_RULER',
    'The Young Ruler',
    'Normal',
    'Recommended for beginners',
    true,
    'Maintain kingdom stability above 30% for 50 turns',
    'You have just ascended to the throne at a young age. The kingdom is stable but your inexperience is already being tested by the Royal Council. Can you navigate the treacherous waters of court politics and maintain your kingdom''s stability?',
    50,
    30,
    '{"gold": 1000, "food": 500, "iron": 200, "wood": 300, "mana": 100, "population": 1000, "stability": 50, "prosperity": 50, "political_points": 3}'::jsonb,
    '{"Merchant Guild": 50, "Military Order": 50, "Common Folk": 50, "Arcane Circle": 50, "Agricultural Union": 50}'::jsonb,
    '{"starting_laws": ["LAW_BASIC_LITERACY"]}'::jsonb,
    NOW()
),
-- Scenario 2: The Warlord Legacy
(
    uuid_generate_v4(),
    'SCENARIO_WARLORD_LEGACY',
    'The Warlord Legacy',
    'Hard',
    'Challenging - Military focus',
    true,
    'Conquer 3 regions within 40 turns while maintaining stability above 20%',
    'Your father was a great conqueror who expanded the kingdom through military might. Now you must continue his legacy. The Military Order expects great things from you, but the other factions grow wary of endless war.',
    40,
    20,
    '{"gold": 800, "food": 400, "iron": 500, "wood": 400, "mana": 50, "population": 1200, "stability": 40, "prosperity": 40, "political_points": 3}'::jsonb,
    '{"Merchant Guild": 45, "Military Order": 70, "Common Folk": 40, "Arcane Circle": 40, "Agricultural Union": 45}'::jsonb,
    '{"starting_laws": ["LAW_MILITARY_DRILL"], "starting_buildings": ["BUILDING_BARRACKS"]}'::jsonb,
    NOW()
),
-- Scenario 3: The Economic Miracle
(
    uuid_generate_v4(),
    'SCENARIO_ECONOMIC_MIRACLE',
    'The Economic Miracle',
    'Normal',
    'Economy & Trade focus',
    true,
    'Reach 5000 gold and 60% prosperity within 60 turns',
    'Your kingdom is in a prime position to become a trading powerhouse. The Merchant Guild is eager to help you build an economic empire, but you must balance profit with the needs of your people.',
    60,
    30,
    '{"gold": 1500, "food": 600, "iron": 150, "wood": 500, "mana": 80, "population": 1500, "stability": 55, "prosperity": 55, "political_points": 4}'::jsonb,
    '{"Merchant Guild": 65, "Military Order": 45, "Common Folk": 50, "Arcane Circle": 45, "Agricultural Union": 50}'::jsonb,
    '{"starting_laws": ["LAW_COMMERCIAL_TRADE_AGREEMENTS"]}'::jsonb,
    NOW()
),
-- Scenario 4: The Arcane Restoration
(
    uuid_generate_v4(),
    'SCENARIO_ARCANE_RESTORATION',
    'The Arcane Restoration',
    'Hard',
    'Magic & Research focus',
    true,
    'Research 5 mystical technologies and reach 200 mana capacity within 50 turns',
    'The Arcane Circle has fallen from its former glory. As a ruler with magical aptitude, you have the chance to restore the kingdom''s mystical prowess. But magic requires resources and focus that may strain other areas.',
    50,
    25,
    '{"gold": 700, "food": 400, "iron": 200, "wood": 300, "mana": 150, "population": 900, "stability": 45, "prosperity": 45, "political_points": 3}'::jsonb,
    '{"Merchant Guild": 40, "Military Order": 40, "Common Folk": 45, "Arcane Circle": 70, "Agricultural Union": 45}'::jsonb,
    '{"starting_laws": ["LAW_ELEMENTAL_MAGIC"], "starting_techs": ["TECH_ELEMENTAL_MAGIC"]}'::jsonb,
    NOW()
),
-- Scenario 5: The Famine Crisis
(
    uuid_generate_v4(),
    'SCENARIO_FAMINE_CRISIS',
    'The Famine Crisis',
    'Very Hard',
    'Survival challenge',
    true,
    'Survive 30 turns with starting food below 200 and prevent stability from reaching 0%',
    'A terrible blight has destroyed your kingdom''s food reserves. Famine grips the land and the people are desperate. The Agricultural Union looks to you for salvation, but every decision comes with a heavy cost.',
    30,
    10,
    '{"gold": 500, "food": 150, "iron": 100, "wood": 200, "mana": 50, "population": 800, "stability": 25, "prosperity": 30, "political_points": 2}'::jsonb,
    '{"Merchant Guild": 40, "Military Order": 45, "Common Folk": 35, "Arcane Circle": 40, "Agricultural Union": 60}'::jsonb,
    '{"starting_buildings": ["BUILDING_FARM"], "events_enabled": ["EVENT_PEASANT_UPRISING"]}'::jsonb,
    NOW()
),
-- Scenario 6: The Golden Age
(
    uuid_generate_v4(),
    'SCENARIO_GOLDEN_AGE',
    'The Golden Age',
    'Easy',
    'Sandbox mode - Relaxed',
    true,
    'Achieve 80% stability and 70% prosperity - No turn limit',
    'Your kingdom enters a period of unprecedented prosperity. With abundant resources and a content populace, you have the freedom to shape your realm as you see fit. How will you be remembered?',
    999,
    80,
    '{"gold": 2000, "food": 1000, "iron": 400, "wood": 600, "mana": 200, "population": 2000, "stability": 60, "prosperity": 60, "political_points": 5}'::jsonb,
    '{"Merchant Guild": 55, "Military Order": 55, "Common Folk": 55, "Arcane Circle": 55, "Agricultural Union": 55}'::jsonb,
    '{"all_features_unlocked": true}'::jsonb,
    NOW()
);

-- ============================================================================
-- PART 4: IMPORT EVENT_MASTER (5 events)
-- ============================================================================

INSERT INTO event_master (
    id, event_id, title, description, condition_script,
    choice_a_title, choice_a_effects, choice_a_faction_alignment,
    choice_b_title, choice_b_effects, choice_b_faction_alignment,
    is_triggered, created_at
) VALUES 
-- Event 1: Iron Discovery
(
    uuid_generate_v4(),
    'EVENT_IRON_DISCOVERY',
    'Iron Discovery',
    'A new iron vein has been discovered in the northern hills. The miners are eager to begin excavation, but the local druids warn that disturbing the land may anger the spirits.',
    '{"type": "random", "chance": 0.15, "min_turn": 5}',
    'Begin Mining Operations',
    '{"gold": -200, "iron": 500, "stability": -0.02}',
    '{"Military Order": 0.1, "Arcane Circle": -0.05}',
    'Respect the Druids'' Warning',
    '{"gold": -50, "stability": 0.03, "mana": 20}',
    '{"Military Order": -0.05, "Arcane Circle": 0.1}',
    false,
    NOW()
),
-- Event 2: Merchant Caravan Arrival
(
    uuid_generate_v4(),
    'EVENT_MERCHANT_CARAVAN',
    'Merchant Caravan Arrival',
    'A wealthy merchant caravan from the eastern kingdom has arrived at your gates. They offer exclusive trade deals, but demand special privileges in return.',
    '{"type": "random", "chance": 0.2, "min_turn": 3}',
    'Grant Trade Privileges',
    '{"gold": 300, "prosperity": 0.02, "political_points": -10}',
    '{"Merchant Guild": 0.15, "Common Folk": -0.03}',
    'Decline the Offer',
    '{"gold": 50, "stability": 0.01}',
    '{"Merchant Guild": -0.08}',
    false,
    NOW()
),
-- Event 3: Peasant Uprising
(
    uuid_generate_v4(),
    'EVENT_PEASANT_UPRISING',
    'Peasant Uprising',
    'Food shortages have sparked unrest among the common folk. A mob has gathered at the palace gates demanding immediate action.',
    '{"type": "conditional", "condition": "food < population * 0.3", "min_turn": 10}',
    'Distribute Emergency Rations',
    '{"food": -500, "stability": 0.05, "gold": -100}',
    '{"Common Folk": 0.1, "Agricultural Union": 0.05}',
    'Suppress the Mob',
    '{"stability": -0.08, "political_points": 15}',
    '{"Common Folk": -0.15, "Military Order": 0.05}',
    false,
    NOW()
),
-- Event 4: Arcane Anomaly
(
    uuid_generate_v4(),
    'EVENT_ARCANE_ANOMALY',
    'Arcane Anomaly',
    'Strange magical energies have been detected near the capital. The Arcane Circle requests permission to investigate, but warns of potential risks.',
    '{"type": "random", "chance": 0.12, "min_turn": 8, "requires": {"mana": "> 50"}}',
    'Fund the Investigation',
    '{"gold": -150, "mana": 30, "stability": -0.01}',
    '{"Arcane Circle": 0.12}',
    'Seal the Area',
    '{"stability": 0.02, "mana": -10}',
    '{"Arcane Circle": -0.08}',
    false,
    NOW()
),
-- Event 5: Diplomatic Crisis
(
    uuid_generate_v4(),
    'EVENT_DIPLOMATIC_CRISIS',
    'Diplomatic Crisis',
    'A neighboring kingdom has accused your realm of border violations. Tensions are rising and war seems imminent unless handled carefully.',
    '{"type": "conditional", "condition": "regions_conquered > 0", "min_turn": 15}',
    'Negotiate Peace',
    '{"gold": -300, "political_points": -20, "stability": 0.04}',
    '{"Merchant Guild": 0.08}',
    'Prepare for War',
    '{"iron": -200, "military_strength": 0.1, "stability": -0.03}',
    '{"Military Order": 0.12}',
    false,
    NOW()
);

-- ============================================================================
-- PART 5: IMPORT LAW_LIBRARY (30 laws)
-- ============================================================================

INSERT INTO law_library (
    id, law_id, name, description, category, is_active, intensity,
    faction_stances, image_url, effects, pp_cost, created_at
) VALUES 
-- Economy Laws
(uuid_generate_v4(), 'LAW_COMMERCIAL_TRADE_AGREEMENTS', 'Commercial Trade Agreements', 'Establishes profitable trade agreement networks with external powers, increasing gold flow.', 'Economy', false, 50, '{"Merchant Guild": 0.2, "Common Folk": 0.05}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png', '{"gold_per_turn": 150, "prosperity_bonus": 0.01}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_ORGANIZED_TAX_COLLECTION', 'Organized Tax Collection', 'Implements a more organized and comprehensive tax collection system, increasing kingdom revenue.', 'Economy', false, 50, '{"Merchant Guild": -0.05, "Common Folk": -0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png', '{"gold_per_turn": 120, "stability_bonus": -0.01}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_CURRENCY_STANDARDIZATION', 'Currency Standardization', 'Standardizes the kingdom''s currency, reducing corruption and improving economic efficiency.', 'Economy', false, 50, '{"Merchant Guild": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png', '{"corruption_reduction": 0.05, "gold_per_turn": 75}'::jsonb, 20, NOW()),

-- Resource Laws
(uuid_generate_v4(), 'LAW_ADVANCED_AGRICULTURE', 'Advanced Agriculture', 'Develops new farming techniques that increase crop yields and food production efficiency.', 'Environment', false, 50, '{"Agricultural Union": 0.2, "Common Folk": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/a61f3d29a_icon_env_final.png', '{"food_per_turn": 100, "population_capacity_bonus": 500}'::jsonb, 12, NOW()),
(uuid_generate_v4(), 'LAW_EFFICIENT_LOGGING', 'Efficient Logging', 'Develops more efficient and sustainable logging methods.', 'Environment', false, 50, '{"Agricultural Union": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/a61f3d29a_icon_env_final.png', '{"wood_per_turn": 80}'::jsonb, 10, NOW()),
(uuid_generate_v4(), 'LAW_METALLURGY_IMPROVEMENTS', 'Metallurgy Improvements', 'Refines metal extraction and purification processes, increasing iron production.', 'Environment', false, 50, '{"Military Order": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/a61f3d29a_icon_env_final.png', '{"iron_per_turn": 70, "building_construction_speed_bonus": 0.05}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_RESOURCE_CONSERVATION', 'Resource Conservation', 'Develops techniques to reduce waste and conserve critical resources.', 'Environment', false, 50, '{"Agricultural Union": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/a61f3d29a_icon_env_final.png', '{"food_consumption_reduction": 0.05, "resource_efficiency_bonus": 0.05}'::jsonb, 15, NOW()),

-- Military Laws
(uuid_generate_v4(), 'LAW_IMPROVED_WEAPONRY', 'Improved Weaponry', 'Designs and produces more effective weapons for the kingdom''s forces.', 'Military', false, 50, '{"Military Order": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"military_strength_bonus": 0.1, "iron_per_turn": -20}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_BASIC_FORTIFICATIONS', 'Basic Fortifications', 'Develops basic techniques for building fortresses and defensive structures.', 'Military', false, 50, '{"Military Order": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"stability_bonus": 0.01, "clash_risk_reduction": 0.05}'::jsonb, 12, NOW()),
(uuid_generate_v4(), 'LAW_MILITARY_DRILL', 'Military Drill', 'Implements rigorous training programs for troops.', 'Military', false, 50, '{"Military Order": 0.12}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"military_strength_bonus": 0.05, "political_points_regen": 3}'::jsonb, 10, NOW()),
(uuid_generate_v4(), 'LAW_SIEGE_ENGINEERING', 'Siege Engineering', 'Designs siege engines and tactics to breach enemy defenses.', 'Military', false, 50, '{"Military Order": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"conquest_difficulty_reduction_bonus": 0.15, "iron_per_turn": -50}'::jsonb, 20, NOW()),
(uuid_generate_v4(), 'LAW_LOGISTICS_AND_SUPPLY', 'Logistics and Supply', 'Optimizes military supply chains.', 'Military', false, 50, '{"Military Order": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"military_maintenance_cost_reduction": 0.1, "food_per_turn": -30}'::jsonb, 18, NOW()),
(uuid_generate_v4(), 'LAW_SCOUTING_AND_RECONNAISSANCE', 'Scouting and Reconnaissance', 'Trains specialized scout units.', 'Military', false, 50, '{"Military Order": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"quest_success_chance_bonus": 0.05, "clash_risk_reduction": 0.05}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_GUERRILLA_TACTICS', 'Guerrilla Tactics', 'Develops unconventional combat tactics.', 'Military', false, 50, '{"Military Order": 0.1, "Common Folk": -0.02}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png', '{"military_strength_bonus": 0.08, "stability_bonus": -0.01}'::jsonb, 15, NOW()),

-- Civic Laws
(uuid_generate_v4(), 'LAW_PUBLIC_ADMINISTRATION', 'Public Administration', 'Improves the kingdom''s administrative structure.', 'Education', false, 50, '{"Common Folk": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"corruption_reduction": 0.03, "political_points_regen": 5}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_URBAN_PLANNING', 'Urban Planning', 'Implements urban planning principles.', 'Education', false, 50, '{"Common Folk": 0.08}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"population_capacity_bonus": 800, "stability_bonus": 0.01}'::jsonb, 12, NOW()),
(uuid_generate_v4(), 'LAW_BASIC_LITERACY', 'Basic Literacy', 'Introduces basic literacy programs.', 'Education', false, 50, '{"Common Folk": 0.1, "Arcane Circle": 0.05}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"mana_regen": 5, "population_growth_bonus": 0.02}'::jsonb, 8, NOW()),
(uuid_generate_v4(), 'LAW_CIVIL_ENGINEERING', 'Civil Engineering', 'Develops infrastructure construction science.', 'Education', false, 50, '{"Common Folk": 0.08}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"population_capacity_bonus": 700, "building_construction_speed_bonus": 0.05}'::jsonb, 12, NOW()),
(uuid_generate_v4(), 'LAW_CENSUS_AND_RECORD_KEEPING', 'Census and Record Keeping', 'Implements detailed census systems.', 'Education', false, 50, '{"Common Folk": 0.05}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"political_points_regen": 7, "gold_per_turn": 30}'::jsonb, 15, NOW()),
(uuid_generate_v4(), 'LAW_DIPLOMATIC_PROTOCOLS', 'Diplomatic Protocols', 'Develops diplomatic protocols and etiquette.', 'Education', false, 50, '{"Merchant Guild": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"faction_loyalty_gain_bonus": 0.05, "quest_success_chance_bonus": 0.05}'::jsonb, 18, NOW()),
(uuid_generate_v4(), 'LAW_CODE_OF_LAWS', 'Code of Laws', 'Compiles a comprehensive written legal code.', 'Education', false, 50, '{"Common Folk": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png', '{"stability_bonus": 0.03, "corruption_reduction": 0.02}'::jsonb, 22, NOW()),

-- Mystical Laws
(uuid_generate_v4(), 'LAW_ELEMENTAL_MAGIC', 'Elemental Magic', 'Studies how to manipulate basic elements.', 'Magic', false, 50, '{"Arcane Circle": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"mana_regen": 5, "resource_production_bonus": 0.02}'::jsonb, 12, NOW()),
(uuid_generate_v4(), 'LAW_MANA_CHANNELING', 'Mana Channeling', 'Develops techniques to channel and store magical energy.', 'Magic', false, 50, '{"Arcane Circle": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"mana_regen": 15, "mana_capacity_bonus": 100}'::jsonb, 18, NOW()),
(uuid_generate_v4(), 'LAW_HERBAL_MEDICINE', 'Herbal Medicine', 'Develops knowledge of medicinal plants.', 'Magic', false, 50, '{"Arcane Circle": 0.1, "Common Folk": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"population_per_turn": 3, "stability_bonus": 0.01}'::jsonb, 8, NOW()),
(uuid_generate_v4(), 'LAW_SPIRITUAL_HARMONY', 'Spiritual Harmony', 'Promotes spiritual practices for balance.', 'Magic', false, 50, '{"Arcane Circle": 0.12}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"stability_bonus": 0.02, "mana_regen": 8}'::jsonb, 22, NOW()),
(uuid_generate_v4(), 'LAW_DIVINATION_RITUALS', 'Divination Rituals', 'Performs rituals to gain insights.', 'Magic', false, 50, '{"Arcane Circle": 0.12}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"quest_success_chance_bonus": 0.1, "clash_risk_reduction": 0.05}'::jsonb, 18, NOW()),
(uuid_generate_v4(), 'LAW_RUNIC_ENCHANTMENT', 'Runic Enchantment', 'Masters the art of imbuing objects with magic.', 'Magic', false, 50, '{"Arcane Circle": 0.1}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"building_efficiency_bonus": 0.05, "military_strength_bonus": 0.05}'::jsonb, 28, NOW()),
(uuid_generate_v4(), 'LAW_ARCANE_BARRIERS', 'Arcane Barriers', 'Builds magical barriers for protection.', 'Magic', false, 50, '{"Arcane Circle": 0.15}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"military_strength_bonus": 0.12, "clash_risk_reduction": 0.1}'::jsonb, 35, NOW()),
(uuid_generate_v4(), 'LAW_MANA_RESONANCE_FOCUS', 'Mana Resonance Focus', 'Builds structures for mana resonance.', 'Magic', false, 50, '{"Arcane Circle": 0.2}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"mana_regen": 25}'::jsonb, 50, NOW()),
(uuid_generate_v4(), 'LAW_TRANSMUTATION', 'Transmutation', 'Masters the art of transforming resources.', 'Magic', false, 50, '{"Arcane Circle": 0.25}'::jsonb, 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png', '{"unlocks_transmutation_ability": true}'::jsonb, 65, NOW());

-- ============================================================================
-- PART 6: IMPORT FACTION_REGISTRY (5 factions)
-- ============================================================================

INSERT INTO faction_registry (id, faction_name, loyalty, influence, is_active, created_at) VALUES 
(uuid_generate_v4(), 'Merchant Guild', 60, 15, true, NOW()),
(uuid_generate_v4(), 'Military Order', 55, 12, true, NOW()),
(uuid_generate_v4(), 'Common Folk', 50, 20, true, NOW()),
(uuid_generate_v4(), 'Arcane Circle', 45, 10, true, NOW()),
(uuid_generate_v4(), 'Agricultural Union', 52, 18, true, NOW());

-- ============================================================================
-- PART 7: IMPORT REGIONS (15 regions)
-- ============================================================================

INSERT INTO regions (id, region_id, name, difficulty, population_capacity, gold_cost, food_cost, iron_richness, food_richness, clash_risk, status, created_at) VALUES 
-- Easy regions (difficulty 1-3)
(uuid_generate_v4(), 'REGION_PLAINS_OF_AURORA', 'Plains of Aurora', 1, 3000, 500, 200, 30, 70, 10, 'available', NOW()),
(uuid_generate_v4(), 'REGION_WOODLAND_GROVE', 'Woodland Grove', 2, 2500, 400, 150, 20, 60, 15, 'available', NOW()),
(uuid_generate_v4(), 'REGION_SUNSET_FIELDS', 'Sunset Fields', 2, 3500, 600, 250, 25, 75, 12, 'available', NOW()),
(uuid_generate_v4(), 'REGION_RIVERSIDE_MEADOWS', 'Riverside Meadows', 3, 2800, 450, 180, 35, 65, 18, 'available', NOW()),

-- Medium regions (difficulty 4-6)
(uuid_generate_v4(), 'REGION_IRONHOLD_MINES', 'Ironhold Mines', 4, 2000, 800, 300, 80, 20, 25, 'available', NOW()),
(uuid_generate_v4(), 'REGION_THORNWOOD_FOREST', 'Thornwood Forest', 5, 2200, 700, 220, 40, 55, 30, 'available', NOW()),
(uuid_generate_v4(), 'REGION_STORMHAVEN_COAST', 'Stormhaven Coast', 5, 1800, 900, 280, 45, 40, 35, 'available', NOW()),
(uuid_generate_v4(), 'REGION_EMBERFALL_VALLEY', 'Emberfall Valley', 6, 2500, 1000, 350, 50, 45, 40, 'available', NOW()),

-- Hard regions (difficulty 7-9)
(uuid_generate_v4(), 'REGION_FROSTPEAK_MOUNTAINS', 'Frostpeak Mountains', 7, 1500, 1500, 400, 70, 15, 50, 'available', NOW()),
(uuid_generate_v4(), 'REGION_SHADOWMARCH_SWAMPS', 'Shadowmarch Swamps', 8, 1200, 1200, 320, 30, 35, 55, 'available', NOW()),
(uuid_generate_v4(), 'REGION_BLAZING_DESERT', 'Blazing Desert', 8, 1000, 1400, 380, 60, 10, 60, 'available', NOW()),
(uuid_generate_v4(), 'REGION_SKYREACH_PEAKS', 'Skyreach Peaks', 9, 800, 2000, 500, 55, 20, 65, 'available', NOW()),

-- Very Hard regions (difficulty 10)
(uuid_generate_v4(), 'REGION_ABYSSAL_DEPTHS', 'Abyssal Depths', 10, 500, 3000, 600, 85, 5, 80, 'available', NOW()),
(uuid_generate_v4(), 'REGION_VOIDWASTE_BORDER', 'Voidwaste Border', 10, 400, 3500, 700, 75, 8, 85, 'available', NOW()),
(uuid_generate_v4(), 'REGION_DRAGONSPINE_CITADEL', 'Dragonspine Citadel', 10, 600, 4000, 800, 90, 10, 90, 'available', NOW());

-- ============================================================================
-- PART 8: IMPORT BUILDING_TYPES (17 buildings)
-- ============================================================================

INSERT INTO building_types (id, building_type_id, name, description, category, max_level, base_cost_gold, base_cost_food, created_at) VALUES 
-- Population buildings
(uuid_generate_v4(), 'BUILDING_TOWN_HALL', 'Town Hall', 'Kingdom administrative center, essential for population management and stability.', 'population', 5, 300, 100, NOW()),
(uuid_generate_v4(), 'BUILDING_HOUSING_COMPLEX', 'Housing Complex', 'Provides housing for citizens, increasing population capacity.', 'population', 10, 150, 50, NOW()),
(uuid_generate_v4(), 'BUILDING_TEMPLE', 'Temple', 'Place of worship that increases morale and spirituality, contributing to stability and mana.', 'population', 5, 200, 80, NOW()),
(uuid_generate_v4(), 'BUILDING_UNIVERSITY', 'University', 'Higher education institution that accelerates research and technology development.', 'population', 3, 400, 150, NOW()),

-- Resource buildings
(uuid_generate_v4(), 'BUILDING_FARM', 'Farm', 'Produces food for the kingdom''s population.', 'resources', 10, 100, 0, NOW()),
(uuid_generate_v4(), 'BUILDING_LUMBER_MILL', 'Lumber Mill', 'Processes wood from surrounding forests.', 'resources', 10, 80, 20, NOW()),
(uuid_generate_v4(), 'BUILDING_MINE', 'Mine', 'Extracts minerals and iron ore from the ground.', 'resources', 10, 120, 30, NOW()),
(uuid_generate_v4(), 'BUILDING_MARKET', 'Market', 'Facilitates local trade and increases gold income.', 'resources', 5, 250, 50, NOW()),
(uuid_generate_v4(), 'BUILDING_AQUEDUCT', 'Aqueduct', 'Provides clean water for agriculture and population, crucial in arid regions.', 'resources', 3, 350, 70, NOW()),

-- Military buildings
(uuid_generate_v4(), 'BUILDING_BARRACKS', 'Barracks', 'Trains soldiers and increases the kingdom''s military strength.', 'military', 5, 200, 100, NOW()),
(uuid_generate_v4(), 'BUILDING_TRAINING_GROUNDS', 'Training Grounds', 'Dedicated area for training troops, improving combat quality.', 'military', 5, 250, 70, NOW()),
(uuid_generate_v4(), 'BUILDING_WATCHTOWER', 'Watchtower', 'Provides surveillance over surrounding areas, reducing attack risks.', 'military', 5, 150, 50, NOW()),
(uuid_generate_v4(), 'BUILDING_CITY_WALLS', 'City Walls', 'Strong defensive structures to protect the capital and population.', 'military', 3, 500, 200, NOW()),

-- Utility buildings
(uuid_generate_v4(), 'BUILDING_LIBRARY', 'Library', 'Extensive knowledge repository that accelerates research.', 'utility', 3, 200, 50, NOW()),
(uuid_generate_v4(), 'BUILDING_WORKSHOP', 'Workshop', 'Innovation and production center, increasing construction efficiency.', 'utility', 5, 180, 40, NOW()),
(uuid_generate_v4(), 'BUILDING_GRAND_MONUMENT', 'Grand Monument', 'Symbol of kingdom pride, increasing stability and political points.', 'utility', 1, 400, 100, NOW()),
(uuid_generate_v4(), 'BUILDING_ARCANUM_TOWER', 'Arcanum Tower', 'Magical structure that strengthens mana flow throughout the kingdom.', 'utility', 3, 350, 80, NOW()),
(uuid_generate_v4(), 'BUILDING_DIPLOMATIC_ENVOY_OFFICE', 'Diplomatic Envoy Office', 'Facilitates relations with other factions and kingdoms.', 'utility', 3, 280, 60, NOW());

-- ============================================================================
-- PART 9: IMPORT TECHNOLOGY_TREE (29 technologies)
-- ============================================================================

INSERT INTO technology_tree (id, tech_id, name, description, category, tier, research_cost_gold, research_cost_mana, research_turns, prerequisites, effects, is_researched, is_researching, research_progress, created_at) VALUES 
-- Tier 1 Technologies (Basic)
(uuid_generate_v4(), 'TECH_COMMERCIAL_TRADE_AGREEMENTS', 'Commercial Trade Agreements', 'Establishes profitable trade agreement networks with external powers.', 'Economy', 1, 300, 15, 4, '[]'::jsonb, '{"gold_per_turn":150,"prosperity_bonus":0.01}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_ADVANCED_AGRICULTURE', 'Advanced Agriculture', 'Develops new farming techniques that increase crop yields.', 'Economy', 1, 200, 10, 3, '[]'::jsonb, '{"food_per_turn":100,"population_capacity_bonus":500}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_EFFICIENT_LOGGING', 'Efficient Logging', 'Develops more efficient and sustainable logging methods.', 'Economy', 1, 150, 5, 2, '[]'::jsonb, '{"wood_per_turn":80}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_METALLURGY_IMPROVEMENTS', 'Metallurgy Improvements', 'Refines metal extraction and purification processes.', 'Economy', 1, 250, 10, 3, '[]'::jsonb, '{"iron_per_turn":70,"building_construction_speed_bonus":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_PUBLIC_ADMINISTRATION', 'Public Administration', 'Improves the kingdom''s administrative structure.', 'Civic', 1, 250, 15, 4, '[]'::jsonb, '{"corruption_reduction":0.03,"political_points_regen":5}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_URBAN_PLANNING', 'Urban Planning', 'Implements urban planning principles for orderly growth.', 'Civic', 1, 180, 8, 3, '[]'::jsonb, '{"population_capacity_bonus":800,"stability_bonus":0.01}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_BASIC_LITERACY', 'Basic Literacy', 'Introduces basic literacy programs to the population.', 'Civic', 1, 100, 5, 2, '[]'::jsonb, '{"mana_regen":5,"population_growth_bonus":0.02}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_CIVIL_ENGINEERING', 'Civil Engineering', 'Develops infrastructure construction science.', 'Civic', 1, 200, 10, 3, '[]'::jsonb, '{"population_capacity_bonus":700,"building_construction_speed_bonus":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_MILITARY_DRILL', 'Military Drill', 'Implements rigorous training programs for troops.', 'Military', 1, 150, 5, 2, '[]'::jsonb, '{"military_strength_bonus":0.05,"political_points_regen":3}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_IMPROVED_WEAPONRY', 'Improved Weaponry', 'Designs and produces more effective weapons.', 'Military', 1, 250, 15, 3, '[]'::jsonb, '{"military_strength_bonus":0.1,"iron_per_turn":-20}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_BASIC_FORTIFICATIONS', 'Basic Fortifications', 'Develops basic techniques for building defensive structures.', 'Military', 1, 200, 5, 2, '[]'::jsonb, '{"stability_bonus":0.01,"clash_risk_reduction":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_ELEMENTAL_MAGIC', 'Elemental Magic', 'Studies how to manipulate basic elements.', 'Mystical', 1, 200, 10, 4, '[]'::jsonb, '{"mana_regen":5,"resource_production_bonus":0.02}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_HERBAL_MEDICINE', 'Herbal Medicine', 'Develops knowledge of medicinal plants.', 'Mystical', 1, 100, 15, 2, '[]'::jsonb, '{"population_per_turn":3,"stability_bonus":0.01}'::jsonb, false, false, 0, NOW()),

-- Tier 2 Technologies (Intermediate)
(uuid_generate_v4(), 'TECH_ORGANIZED_TAX_COLLECTION', 'Organized Tax Collection', 'Implements comprehensive tax collection system.', 'Economy', 2, 400, 15, 4, '["TECH_COMMERCIAL_TRADE_AGREEMENTS"]'::jsonb, '{"gold_per_turn":120,"stability_bonus":-0.01}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_CURRENCY_STANDARDIZATION', 'Currency Standardization', 'Standardizes the kingdom''s currency.', 'Economy', 2, 500, 20, 5, '["TECH_COMMERCIAL_TRADE_AGREEMENTS"]'::jsonb, '{"corruption_reduction":0.05,"gold_per_turn":75}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_RESOURCE_CONSERVATION', 'Resource Conservation', 'Develops techniques to reduce waste.', 'Economy', 2, 350, 25, 4, '["TECH_ADVANCED_AGRICULTURE","TECH_EFFICIENT_LOGGING"]'::jsonb, '{"food_consumption_reduction":0.05,"resource_efficiency_bonus":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_CENSUS_AND_RECORD_KEEPING', 'Census and Record Keeping', 'Implements detailed census systems.', 'Civic', 2, 300, 15, 4, '["TECH_BASIC_LITERACY"]'::jsonb, '{"political_points_regen":7,"gold_per_turn":30}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_DIPLOMATIC_PROTOCOLS', 'Diplomatic Protocols', 'Develops diplomatic protocols and etiquette.', 'Civic', 2, 400, 25, 5, '["TECH_PUBLIC_ADMINISTRATION"]'::jsonb, '{"faction_loyalty_gain_bonus":0.05,"quest_success_chance_bonus":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_CODE_OF_LAWS', 'Code of Laws', 'Compiles a comprehensive written legal code.', 'Civic', 2, 550, 30, 6, '["TECH_PUBLIC_ADMINISTRATION"]'::jsonb, '{"stability_bonus":0.03,"corruption_reduction":0.02}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_SCOUTING_AND_RECONNAISSANCE', 'Scouting and Reconnaissance', 'Trains specialized scout units.', 'Military', 2, 300, 15, 4, '[]'::jsonb, '{"quest_success_chance_bonus":0.05,"clash_risk_reduction":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_GUERRILLA_TACTICS', 'Guerrilla Tactics', 'Develops unconventional combat tactics.', 'Military', 2, 350, 25, 4, '[]'::jsonb, '{"military_strength_bonus":0.08,"stability_bonus":-0.01}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_LOGISTICS_AND_SUPPLY', 'Logistics and Supply', 'Optimizes military supply chains.', 'Military', 2, 450, 20, 5, '["TECH_MILITARY_DRILL"]'::jsonb, '{"military_maintenance_cost_reduction":0.1,"food_per_turn":-30}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_SIEGE_ENGINEERING', 'Siege Engineering', 'Designs siege engines and tactics.', 'Military', 2, 600, 15, 6, '["TECH_IMPROVED_WEAPONRY","TECH_METALLURGY_IMPROVEMENTS"]'::jsonb, '{"conquest_difficulty_reduction_bonus":0.15,"iron_per_turn":-50}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_MANA_CHANNELING', 'Mana Channeling', 'Develops techniques to channel magical energy.', 'Mystical', 2, 450, 20, 5, '["TECH_ELEMENTAL_MAGIC"]'::jsonb, '{"mana_regen":15,"mana_capacity_bonus":100}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_SPIRITUAL_HARMONY', 'Spiritual Harmony', 'Promotes spiritual practices for balance.', 'Mystical', 2, 350, 40, 4, '[]'::jsonb, '{"stability_bonus":0.02,"mana_regen":8}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_RUNIC_ENCHANTMENT', 'Runic Enchantment', 'Masters the art of imbuing objects with magic.', 'Mystical', 2, 450, 30, 6, '["TECH_MANA_CHANNELING","TECH_METALLURGY_IMPROVEMENTS"]'::jsonb, '{"building_efficiency_bonus":0.05,"military_strength_bonus":0.05}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_DIVINATION_RITUALS', 'Divination Rituals', 'Performs rituals to gain insights.', 'Mystical', 2, 300, 50, 5, '["TECH_MANA_CHANNELING"]'::jsonb, '{"quest_success_chance_bonus":0.1,"clash_risk_reduction":0.05}'::jsonb, false, false, 0, NOW()),

-- Tier 3 Technologies (Advanced)
(uuid_generate_v4(), 'TECH_MANA_RESONANCE_FOCUS', 'Mana Resonance Focus', 'Builds structures for mana resonance.', 'Mystical', 3, 800, 120, 8, '["TECH_MANA_CHANNELING","TECH_SPIRITUAL_HARMONY"]'::jsonb, '{"mana_regen":25}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_ARCANE_BARRIERS', 'Arcane Barriers', 'Builds magical barriers for protection.', 'Mystical', 3, 500, 60, 7, '["TECH_ELEMENTAL_MAGIC","TECH_BASIC_FORTIFICATIONS"]'::jsonb, '{"military_strength_bonus":0.12,"clash_risk_reduction":0.1}'::jsonb, false, false, 0, NOW()),
(uuid_generate_v4(), 'TECH_TRANSMUTATION', 'Transmutation', 'Masters the art of transforming resources.', 'Mystical', 3, 1000, 150, 10, '["TECH_ELEMENTAL_MAGIC","TECH_METALLURGY_IMPROVEMENTS"]'::jsonb, '{"unlocks_transmutation_ability":true}'::jsonb, false, false, 0, NOW());

-- ============================================================================
-- PART 10: IMPORT ADVISORY_CONFIGS (5 advisors)
-- ============================================================================

INSERT INTO advisory_configs (id, advisor_id, name, title, faction_name, specialty, portrait_url, portrait_full_url, is_unlocked, created_at) VALUES 
(uuid_generate_v4(), 'elric', 'Lord Elric', 'Royal Treasurer', 'Merchant Guild', 'Economy & Trade',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/614f695a4_elric_transparent.png',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3a055d7db_elric_transparent.png',
 true, NOW()),

(uuid_generate_v4(), 'valerius', 'Cdr. Valerius', 'War Marshal', 'Military Order', 'Military & Defense',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/246f87180_valerius_transparent.png',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/e21ec6def_valerius_transparent.png',
 true, NOW()),

(uuid_generate_v4(), 'seraphina', 'Lady Seraphina', 'Royal Diplomat', 'Arcane Circle', 'Magic & Diplomacy',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/77d1507ae_seraphina_transparent.png',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/9df63b815_seraphina_transparent.png',
 true, NOW()),

(uuid_generate_v4(), 'silas', 'Master Silas', 'Arcane Advisor', 'Arcane Circle', 'Magic & Research',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/cc3d5cf7b_silas_transparent.png',
 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/558e565ff_silas_transparent.png',
 true, NOW()),

(uuid_generate_v4(), 'baroness_elara', 'Baroness Elara', 'Merchant Guild Representative', 'Merchant Guild', 'Trade & Commerce',
 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c9c26cb90_baroness_elara_v3_transparent.png',
 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c9c26cb90_baroness_elara_v3_transparent.png',
 true, NOW());

-- ============================================================================
-- PART 11: IMPORT FACTION_QUESTS (4 quests)
-- ============================================================================

INSERT INTO faction_quests (id, quest_id, faction_name, title, description, quest_type, requirement, deadline_turns, turn_activated, reward_loyalty, reward_influence, reward_favor_points, penalty_loyalty, penalty_influence, is_active, is_completed, created_at) VALUES 
-- Quest 1: Merchant Guild - Trade Focus
(uuid_generate_v4(), 'QUEST_MERCHANT_TRADE', 'Merchant Guild', 'Establish Trade Dominance', 'The Merchant Guild requests activation of Open Trade Routes to expand commerce and increase kingdom wealth.', 'law', '{"law_id":"LAW_COMMERCIAL_TRADE_AGREEMENTS","is_active":true}'::jsonb, 10, 0, 15, 8, 100, -20, -5, false, false, NOW()),

-- Quest 2: Military Order - Strength Focus
(uuid_generate_v4(), 'QUEST_MILITARY_STRENGTH', 'Military Order', 'Fortify the Realm', 'The Military Order demands accumulation of 1500 iron for defense preparations and military expansion.', 'resource', '{"iron":1500}'::jsonb, 8, 0, 12, 6, 80, -18, -4, false, false, NOW()),

-- Quest 3: Common Folk - Welfare Focus
(uuid_generate_v4(), 'QUEST_FOLK_WELFARE', 'Common Folk', 'Care for the People', 'The Common Folk petition for Universal Education or Social Safety Net to improve living conditions and reduce unrest.', 'law', '{"law_id":"LAW_PUBLIC_ADMINISTRATION","is_active":true}'::jsonb, 12, 0, 18, 5, 90, -15, -3, false, false, NOW()),

-- Quest 4: Arcane Circle - Magic Focus
(uuid_generate_v4(), 'QUEST_ARCANE_POWER', 'Arcane Circle', 'Unlock Mystical Potential', 'The Arcane Circle seeks to reach 70 Mana capacity for advanced research and magical development.', 'resource', '{"mana":70}'::jsonb, 15, 0, 14, 7, 110, -16, -6, false, false, NOW());

-- ============================================================================
-- PART 12: ADD MISSING CONSTRAINTS
-- ============================================================================

-- Add unique constraint to faction_influence_configs if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_faction_influence_config'
    ) THEN
        ALTER TABLE faction_influence_configs 
        ADD CONSTRAINT unique_faction_influence_config UNIQUE (faction_name);
    END IF;
END $$;

-- ============================================================================
-- PART 14: CREATE SUPPORTING DATA
-- ============================================================================

-- Building Stats (level 1 stats for each building type)
INSERT INTO building_stats (building_type_id, level, resource_bonus, maintenance_cost, stability_bonus, population_capacity_bonus, food_consumption_reduction)
SELECT DISTINCT bt.building_type_id, 1, '{}'::jsonb, '{}'::jsonb, 0, 0, 0
FROM building_types bt
ON CONFLICT (building_type_id, level) DO NOTHING;

-- Faction Influence Configs (default bonuses)
INSERT INTO faction_influence_configs (faction_name, resource_bonuses, seat_weight)
SELECT DISTINCT
    fr.faction_name,
    CASE fr.faction_name
        WHEN 'Merchant Guild' THEN '{"gold_per_turn": 20}'::jsonb
        WHEN 'Military Order' THEN '{"military_strength_bonus": 0.05}'::jsonb
        WHEN 'Common Folk' THEN '{"stability_bonus": 0.02}'::jsonb
        WHEN 'Arcane Circle' THEN '{"mana_regen": 5}'::jsonb
        WHEN 'Agricultural Union' THEN '{"food_per_turn": 30}'::jsonb
    END,
    1
FROM faction_registry fr
ON CONFLICT (faction_name) DO UPDATE SET
    resource_bonuses = EXCLUDED.resource_bonuses;

-- Council Members (default setup - only one spokesperson per faction)
INSERT INTO council_members (faction_name, spokesperson_name, seat_count, favor_points)
SELECT DISTINCT ON (ac.faction_name)
    ac.faction_name,
    ac.name,
    1,
    0
FROM advisory_configs ac
ORDER BY ac.faction_name, ac.advisor_id  -- Pick first advisor alphabetically per faction
ON CONFLICT (faction_name) DO UPDATE SET
    spokesperson_name = EXCLUDED.spokesperson_name;

-- ============================================================================
-- PART 15: VERIFICATION
-- ============================================================================

SELECT 'Data import completed!' as status;

-- Show counts
SELECT 'scenario_master' as table_name, COUNT(*) as rows FROM scenario_master
UNION ALL SELECT 'event_master', COUNT(*) FROM event_master
UNION ALL SELECT 'law_library', COUNT(*) FROM law_library
UNION ALL SELECT 'faction_registry', COUNT(*) FROM faction_registry
UNION ALL SELECT 'regions', COUNT(*) FROM regions
UNION ALL SELECT 'building_types', COUNT(*) FROM building_types
UNION ALL SELECT 'technology_tree', COUNT(*) FROM technology_tree
UNION ALL SELECT 'advisory_configs', COUNT(*) FROM advisory_configs
UNION ALL SELECT 'faction_quests', COUNT(*) FROM faction_quests
UNION ALL SELECT 'building_stats', COUNT(*) FROM building_stats
UNION ALL SELECT 'faction_influence_configs', COUNT(*) FROM faction_influence_configs
UNION ALL SELECT 'council_members', COUNT(*) FROM council_members
ORDER BY table_name;
