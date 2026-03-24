-- ============================================================================
-- THE CITADEL: CROWN & COUNSEL - SUPABASE DATABASE SCHEMA
-- 100% Identical to Base44 Structure
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER STATES (Main game state for each player)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gold INTEGER NOT NULL DEFAULT 500,
    food INTEGER NOT NULL DEFAULT 200,
    iron INTEGER NOT NULL DEFAULT 100,
    wood INTEGER NOT NULL DEFAULT 150,
    mana INTEGER NOT NULL DEFAULT 50,
    stability INTEGER NOT NULL DEFAULT 50,
    population INTEGER NOT NULL DEFAULT 1000,
    prosperity INTEGER NOT NULL DEFAULT 50,
    political_points INTEGER NOT NULL DEFAULT 3,
    corruption_reduction INTEGER NOT NULL DEFAULT 0,
    turn_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user UNIQUE (user_id)
);

-- ============================================================================
-- 1.5 USERS (User profiles for authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';

-- ============================================================================
-- 2. REGIONS (Territories in the game world)
-- ============================================================================
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 1,
    population_capacity INTEGER NOT NULL DEFAULT 5000,
    gold_cost INTEGER NOT NULL DEFAULT 0,
    food_cost INTEGER NOT NULL DEFAULT 0,
    iron_richness INTEGER NOT NULL DEFAULT 50,
    food_richness INTEGER NOT NULL DEFAULT 50,
    clash_risk INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Unconquered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. COUNCIL MEMBERS (Factions in the Royal Council)
-- ============================================================================
CREATE TABLE IF NOT EXISTS council_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_name VARCHAR(100) NOT NULL UNIQUE,
    spokesperson_name VARCHAR(100) NOT NULL,
    seat_count INTEGER NOT NULL DEFAULT 1,
    favor_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. FACTION REGISTRY (All factions with loyalty tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS faction_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_name VARCHAR(100) NOT NULL UNIQUE,
    loyalty INTEGER NOT NULL DEFAULT 50,
    influence INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. FACTION INFLUENCE CONFIGS (Resource bonuses per faction)
-- ============================================================================
CREATE TABLE IF NOT EXISTS faction_influence_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_name VARCHAR(100) NOT NULL REFERENCES faction_registry(faction_name) ON DELETE CASCADE,
    resource_bonuses JSONB NOT NULL DEFAULT '{}',
    seat_weight INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. BUILDING TYPES (Available building categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS building_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_type_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_level INTEGER NOT NULL DEFAULT 3,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    base_cost_gold INTEGER NOT NULL DEFAULT 100,
    base_cost_food INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. BUILDING STATS (Stats per building type and level)
-- ============================================================================
CREATE TABLE IF NOT EXISTS building_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_type_id VARCHAR(50) NOT NULL REFERENCES building_types(building_type_id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    maintenance_cost JSONB NOT NULL DEFAULT '{}',
    resource_bonus JSONB NOT NULL DEFAULT '{}',
    stability_bonus INTEGER NOT NULL DEFAULT 0,
    population_capacity_bonus INTEGER NOT NULL DEFAULT 0,
    food_consumption_reduction INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_building_level UNIQUE (building_type_id, level)
);

-- ============================================================================
-- 8. BUILDINGS (Player-constructed buildings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_type_id VARCHAR(50) NOT NULL REFERENCES building_types(building_type_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. LAW LIBRARY (Available laws and edicts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS law_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    intensity INTEGER NOT NULL DEFAULT 1,
    faction_stances JSONB NOT NULL DEFAULT '{}',
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    image_url TEXT,
    effects JSONB NOT NULL DEFAULT '{}',
    pp_cost DECIMAL(5,2) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. EVENT MASTER (Event definitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    condition_script TEXT,
    is_triggered BOOLEAN NOT NULL DEFAULT false,
    choice_a_title VARCHAR(200),
    choice_a_effects JSONB NOT NULL DEFAULT '{}',
    choice_a_faction_alignment JSONB NOT NULL DEFAULT '{}',
    choice_b_title VARCHAR(200),
    choice_b_effects JSONB NOT NULL DEFAULT '{}',
    choice_b_faction_alignment JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. ACTIVE EVENTS (Currently triggered events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS active_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL REFERENCES event_master(event_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. SCENARIO MASTER (Campaign scenarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scenario_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Normal',
    difficulty_label VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT false,
    objective_desc TEXT,
    context_desc TEXT,
    target_turn INTEGER,
    target_stability INTEGER,
    initial_state JSONB NOT NULL DEFAULT '{}',
    faction_loyalties JSONB NOT NULL DEFAULT '{}',
    special_conditions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. TURN HISTORY (Historical turn records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS turn_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    food INTEGER NOT NULL,
    iron INTEGER NOT NULL,
    wood INTEGER NOT NULL,
    mana INTEGER NOT NULL,
    stability INTEGER NOT NULL,
    population INTEGER NOT NULL,
    prosperity INTEGER NOT NULL,
    political_points INTEGER NOT NULL,
    merchant_guild_loyalty INTEGER NOT NULL DEFAULT 50,
    military_order_loyalty INTEGER NOT NULL DEFAULT 50,
    common_folk_loyalty INTEGER NOT NULL DEFAULT 50,
    arcane_circle_loyalty INTEGER NOT NULL DEFAULT 50,
    agricultural_union_loyalty INTEGER NOT NULL DEFAULT 50,
    active_laws_count INTEGER NOT NULL DEFAULT 0,
    completed_buildings_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 14. MAILBOX (In-game messages and quests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mailbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'Message',
    title VARCHAR(200) NOT NULL,
    body TEXT,
    sender_name VARCHAR(100),
    sender_faction VARCHAR(100),
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    choice_a_label VARCHAR(100),
    choice_a_effects JSONB NOT NULL DEFAULT '{}',
    choice_b_label VARCHAR(100),
    choice_b_effects JSONB NOT NULL DEFAULT '{}',
    effects_on_expire JSONB NOT NULL DEFAULT '{}',
    expires_at_turn INTEGER,
    trigger_turn INTEGER,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. ELECTION CYCLES (Council election tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS election_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_length INTEGER NOT NULL DEFAULT 10,
    last_election_turn INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 16. GAME CONFIGS (Global game parameters)
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id VARCHAR(50) NOT NULL UNIQUE,
    strain_threshold INTEGER NOT NULL DEFAULT 30,
    max_corruption_cap INTEGER NOT NULL DEFAULT 50,
    base_pp INTEGER NOT NULL DEFAULT 3,
    starvation_stability_penalty INTEGER NOT NULL DEFAULT 5,
    food_consumption_rate DECIMAL(5,3) NOT NULL DEFAULT 0.1,
    region_iron_yield_multiplier DECIMAL(10,3) NOT NULL DEFAULT 1.0,
    starvation_prosperity_penalty INTEGER NOT NULL DEFAULT 10,
    prosperity_tax_bonus DECIMAL(5,3) NOT NULL DEFAULT 0.001,
    council_request_chance DECIMAL(5,3) NOT NULL DEFAULT 0.3,
    base_tax_rate DECIMAL(5,3) NOT NULL DEFAULT 0.05,
    corruption_per_10k_pop DECIMAL(5,3) NOT NULL DEFAULT 0.5,
    min_pp INTEGER NOT NULL DEFAULT 0,
    starvation_population_penalty INTEGER NOT NULL DEFAULT 50,
    region_food_yield_multiplier DECIMAL(10,3) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 17. TECHNOLOGY TREE (Researchable technologies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS technology_tree (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tech_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    research_cost_gold INTEGER NOT NULL DEFAULT 100,
    research_cost_mana INTEGER NOT NULL DEFAULT 0,
    research_turns INTEGER NOT NULL DEFAULT 5,
    prerequisites JSONB NOT NULL DEFAULT '[]',
    effects JSONB NOT NULL DEFAULT '{}',
    tier INTEGER NOT NULL DEFAULT 1,
    research_progress INTEGER NOT NULL DEFAULT 0,
    is_researched BOOLEAN NOT NULL DEFAULT false,
    is_researching BOOLEAN NOT NULL DEFAULT false,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 18. FACTION QUESTS (Quests from factions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS faction_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id VARCHAR(50) NOT NULL UNIQUE,
    faction_name VARCHAR(100) NOT NULL REFERENCES faction_registry(faction_name) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirement TEXT,
    quest_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    deadline_turns INTEGER,
    turn_activated INTEGER,
    reward_favor_points INTEGER NOT NULL DEFAULT 0,
    reward_loyalty INTEGER NOT NULL DEFAULT 0,
    reward_influence INTEGER NOT NULL DEFAULT 0,
    penalty_loyalty INTEGER NOT NULL DEFAULT 0,
    penalty_influence INTEGER NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 19. ARMIES (Military units)
-- ============================================================================
CREATE TABLE IF NOT EXISTS armies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    faction_name VARCHAR(100) REFERENCES faction_registry(faction_name) ON DELETE SET NULL,
    unit_count INTEGER NOT NULL DEFAULT 100,
    strength INTEGER NOT NULL DEFAULT 100,
    location_region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Idle',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 20. EXPEDITIONS (Military expeditions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expeditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    target_region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    army_id UUID REFERENCES armies(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Preparing',
    progress INTEGER NOT NULL DEFAULT 0,
    result TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 21. MARKET RATES (Resource exchange rates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turn_number INTEGER NOT NULL DEFAULT 1,
    gold_to_food DECIMAL(10,4) NOT NULL DEFAULT 2.0,
    gold_to_iron DECIMAL(10,4) NOT NULL DEFAULT 1.5,
    gold_to_wood DECIMAL(10,4) NOT NULL DEFAULT 1.2,
    food_to_gold DECIMAL(10,4) NOT NULL DEFAULT 0.4,
    iron_to_gold DECIMAL(10,4) NOT NULL DEFAULT 0.6,
    wood_to_gold DECIMAL(10,4) NOT NULL DEFAULT 0.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 22. ADVISORY CONFIGS (Advisor unlock conditions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS advisory_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    faction_name VARCHAR(100) REFERENCES faction_registry(faction_name) ON DELETE SET NULL,
    specialty VARCHAR(100),
    unlock_condition TEXT,
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    portrait_url TEXT,        -- Half-body portrait for Citadel panel
    portrait_full_url TEXT,   -- Full-body portrait for dialog/events
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 23. ADVISORY GUIDE (In-game help system)
-- ============================================================================
CREATE TABLE IF NOT EXISTS advisory_guide (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_key VARCHAR(50) NOT NULL,
    topic_title VARCHAR(200) NOT NULL,
    topic_key VARCHAR(100) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_states_user_id ON user_states(user_id);
CREATE INDEX IF NOT EXISTS idx_regions_status ON regions(status);
CREATE INDEX IF NOT EXISTS idx_council_members_faction ON council_members(faction_name);
CREATE INDEX IF NOT EXISTS idx_faction_registry_loyalty ON faction_registry(loyalty);
CREATE INDEX IF NOT EXISTS idx_buildings_user_id ON buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_building_stats_type_level ON building_stats(building_type_id, level);
CREATE INDEX IF NOT EXISTS idx_law_library_active ON law_library(is_active);
CREATE INDEX IF NOT EXISTS idx_event_master_triggered ON event_master(is_triggered);
CREATE INDEX IF NOT EXISTS idx_active_events_user_id ON active_events(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_master_active ON scenario_master(is_active);
CREATE INDEX IF NOT EXISTS idx_turn_history_user_id ON turn_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_user_id ON mailbox(user_id);
CREATE INDEX IF NOT EXISTS idx_technology_researched ON technology_tree(is_researched);
CREATE INDEX IF NOT EXISTS idx_faction_quests_faction ON faction_quests(faction_name);
CREATE INDEX IF NOT EXISTS idx_armies_user_id ON armies(user_id);
CREATE INDEX IF NOT EXISTS idx_expeditions_user_id ON expeditions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_influence_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE turn_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE armies ENABLE ROW LEVEL SECURITY;
ALTER TABLE expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_guide ENABLE ROW LEVEL SECURITY;

-- Users RLS
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS users_insert_own ON users;
CREATE POLICY users_insert_own ON users FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = auth.uid());

-- User States RLS
DROP POLICY IF EXISTS user_states_select_own ON user_states;
CREATE POLICY user_states_select_own ON user_states FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_states_insert_own ON user_states;
CREATE POLICY user_states_insert_own ON user_states FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS user_states_update_own ON user_states;
CREATE POLICY user_states_update_own ON user_states FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_states_delete_own ON user_states;
CREATE POLICY user_states_delete_own ON user_states FOR DELETE USING (user_id = auth.uid());

-- Regions RLS
DROP POLICY IF EXISTS regions_select_all ON regions;
CREATE POLICY regions_select_all ON regions FOR SELECT USING (true);
DROP POLICY IF EXISTS regions_insert_admin ON regions;
CREATE POLICY regions_insert_admin ON regions FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
DROP POLICY IF EXISTS regions_update_admin ON regions;
CREATE POLICY regions_update_admin ON regions FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Council Members RLS
DROP POLICY IF EXISTS council_members_select_all ON council_members;
CREATE POLICY council_members_select_all ON council_members FOR SELECT USING (true);
DROP POLICY IF EXISTS council_members_insert_admin ON council_members;
CREATE POLICY council_members_insert_admin ON council_members FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
DROP POLICY IF EXISTS council_members_update_admin ON council_members;
CREATE POLICY council_members_update_admin ON council_members FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Faction Registry RLS
DROP POLICY IF EXISTS faction_registry_select_all ON faction_registry;
CREATE POLICY faction_registry_select_all ON faction_registry FOR SELECT USING (true);
DROP POLICY IF EXISTS faction_registry_insert_admin ON faction_registry;
CREATE POLICY faction_registry_insert_admin ON faction_registry FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
DROP POLICY IF EXISTS faction_registry_update_admin ON faction_registry;
CREATE POLICY faction_registry_update_admin ON faction_registry FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Faction Influence Configs RLS
DROP POLICY IF EXISTS faction_influence_select_all ON faction_influence_configs;
CREATE POLICY faction_influence_select_all ON faction_influence_configs FOR SELECT USING (true);
DROP POLICY IF EXISTS faction_influence_insert_admin ON faction_influence_configs;
CREATE POLICY faction_influence_insert_admin ON faction_influence_configs FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Building Types RLS
DROP POLICY IF EXISTS building_types_select_all ON building_types;
CREATE POLICY building_types_select_all ON building_types FOR SELECT USING (true);
DROP POLICY IF EXISTS building_types_insert_admin ON building_types;
CREATE POLICY building_types_insert_admin ON building_types FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Building Stats RLS
DROP POLICY IF EXISTS building_stats_select_all ON building_stats;
CREATE POLICY building_stats_select_all ON building_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS building_stats_insert_admin ON building_stats;
CREATE POLICY building_stats_insert_admin ON building_stats FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Buildings RLS
DROP POLICY IF EXISTS buildings_select_own ON buildings;
CREATE POLICY buildings_select_own ON buildings FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS buildings_insert_own ON buildings;
CREATE POLICY buildings_insert_own ON buildings FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS buildings_update_own ON buildings;
CREATE POLICY buildings_update_own ON buildings FOR UPDATE USING (user_id = auth.uid());

-- Law Library RLS
DROP POLICY IF EXISTS law_library_select_all ON law_library;
CREATE POLICY law_library_select_all ON law_library FOR SELECT USING (true);
DROP POLICY IF EXISTS law_library_insert_admin ON law_library;
CREATE POLICY law_library_insert_admin ON law_library FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
DROP POLICY IF EXISTS law_library_update_admin ON law_library;
CREATE POLICY law_library_update_admin ON law_library FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Event Master RLS
DROP POLICY IF EXISTS event_master_select_all ON event_master;
CREATE POLICY event_master_select_all ON event_master FOR SELECT USING (true);
DROP POLICY IF EXISTS event_master_insert_admin ON event_master;
CREATE POLICY event_master_insert_admin ON event_master FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Active Events RLS
DROP POLICY IF EXISTS active_events_select_own ON active_events;
CREATE POLICY active_events_select_own ON active_events FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS active_events_insert_own ON active_events;
CREATE POLICY active_events_insert_own ON active_events FOR INSERT WITH CHECK (user_id = auth.uid());

-- Scenario Master RLS
DROP POLICY IF EXISTS scenario_master_select_all ON scenario_master;
CREATE POLICY scenario_master_select_all ON scenario_master FOR SELECT USING (true);
DROP POLICY IF EXISTS scenario_master_insert_admin ON scenario_master;
CREATE POLICY scenario_master_insert_admin ON scenario_master FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Turn History RLS
DROP POLICY IF EXISTS turn_history_select_own ON turn_history;
CREATE POLICY turn_history_select_own ON turn_history FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS turn_history_insert_own ON turn_history;
CREATE POLICY turn_history_insert_own ON turn_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- Mailbox RLS
DROP POLICY IF EXISTS mailbox_select_own ON mailbox;
CREATE POLICY mailbox_select_own ON mailbox FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS mailbox_insert_own ON mailbox;
CREATE POLICY mailbox_insert_own ON mailbox FOR INSERT WITH CHECK (user_id = auth.uid());

-- Election Cycles RLS
DROP POLICY IF EXISTS election_cycles_select_own ON election_cycles;
CREATE POLICY election_cycles_select_own ON election_cycles FOR SELECT USING (user_id = auth.uid());

-- Game Configs RLS
DROP POLICY IF EXISTS game_configs_select_all ON game_configs;
CREATE POLICY game_configs_select_all ON game_configs FOR SELECT USING (true);

-- Technology Tree RLS
DROP POLICY IF EXISTS technology_tree_select_all ON technology_tree;
CREATE POLICY technology_tree_select_all ON technology_tree FOR SELECT USING (true);

-- Faction Quests RLS
DROP POLICY IF EXISTS faction_quests_select_own ON faction_quests;
CREATE POLICY faction_quests_select_own ON faction_quests FOR SELECT USING (user_id = auth.uid());

-- Armies RLS
DROP POLICY IF EXISTS armies_select_own ON armies;
CREATE POLICY armies_select_own ON armies FOR SELECT USING (user_id = auth.uid());

-- Expeditions RLS
DROP POLICY IF EXISTS expeditions_select_own ON expeditions;
CREATE POLICY expeditions_select_own ON expeditions FOR SELECT USING (user_id = auth.uid());

-- Market Rates RLS
DROP POLICY IF EXISTS market_rates_select_all ON market_rates;
CREATE POLICY market_rates_select_all ON market_rates FOR SELECT USING (true);

-- Advisory Configs RLS
DROP POLICY IF EXISTS advisory_configs_select_own ON advisory_configs;
CREATE POLICY advisory_configs_select_own ON advisory_configs FOR SELECT USING (user_id = auth.uid());

-- Advisory Guide RLS
DROP POLICY IF EXISTS advisory_guide_select_all ON advisory_guide;
CREATE POLICY advisory_guide_select_all ON advisory_guide FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to user_states
DROP TRIGGER IF EXISTS update_user_states_updated_at ON user_states;
CREATE TRIGGER update_user_states_updated_at
    BEFORE UPDATE ON user_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
