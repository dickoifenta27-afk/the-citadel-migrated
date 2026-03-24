import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Entity wrapper compatible with Base44 API
const createEntityWrapper = (tableName) => ({
  async list() {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async filter(filters) {
    let query = supabase.from(tableName).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
});

// Functions wrapper
const functionsWrapper = {
  async invoke(functionName, payload) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    if (error) throw error;
    return data;
  }
};

// Auth wrapper
const authWrapper = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(redirectUrl) {
    // Supabase auth redirect
    const { error } = supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || window.location.origin
      }
    });
    if (error) console.error('Auth error:', error);
  }
};

// Main client compatible with Base44 API
export const base44 = {
  entities: {
    UserState: createEntityWrapper('user_states'),
    Regions: createEntityWrapper('regions'),
    CouncilMember: createEntityWrapper('council_members'),
    FactionRegistry: createEntityWrapper('faction_registry'),
    FactionInfluenceConfigs: createEntityWrapper('faction_influence_configs'),
    BuildingTypes: createEntityWrapper('building_types'),
    BuildingStats: createEntityWrapper('building_stats'),
    Buildings: createEntityWrapper('buildings'),
    LawLibrary: createEntityWrapper('law_library'),
    EventMaster: createEntityWrapper('event_master'),
    ActiveEvent: createEntityWrapper('active_events'),
    ScenarioMaster: createEntityWrapper('scenario_master'),
    TurnHistory: createEntityWrapper('turn_history'),
    Mailbox: createEntityWrapper('mailbox'),
    ElectionCycles: createEntityWrapper('election_cycles'),
    GameConfigs: createEntityWrapper('game_configs'),
    TechnologyTree: createEntityWrapper('technology_tree'),
    FactionQuests: createEntityWrapper('faction_quests'),
    Armies: createEntityWrapper('armies'),
    Expeditions: createEntityWrapper('expeditions'),
    MarketRates: createEntityWrapper('market_rates'),
    AdvisoryConfigs: createEntityWrapper('advisory_configs'),
    AdvisoryGuide: createEntityWrapper('advisory_guide'),
  },
  functions: functionsWrapper,
  auth: authWrapper
};

export default base44;
