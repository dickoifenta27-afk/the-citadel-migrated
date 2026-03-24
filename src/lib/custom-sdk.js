import { supabase } from "./supabase-client.js";

/**
 * Base Entity class that provides CRUD operations compatible with Base44 SDK
 */
export class CustomEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async list() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*");
    
    if (error) {
      console.error(`Error listing ${this.tableName}:`, error);
      return [];
    }
    return data || [];
  }

  async filter(filters = {}) {
    let query = supabase.from(this.tableName).select("*");
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error filtering ${this.tableName}:`, error);
      return [];
    }
    return data || [];
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error(`Error getting ${this.tableName}:`, error);
      return null;
    }
    return data;
  }

  async create(record) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
    return true;
  }
}

/**
 * User Entity for authentication
 */
export class UserEntity {
  constructor() {
    this.tableName = "users";
  }

  async me() {
    // Get current user from Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error("Not authenticated");
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      const { data: newProfile, error: createError } = await supabase
        .from(this.tableName)
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          role: 'user',
          email_verified: authUser.email_confirmed_at ? true : false
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating user profile:", createError);
        throw createError;
      }
      
      return newProfile;
    }

    return userProfile;
  }

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  redirectToLogin(redirectUrl) {
    // For Supabase, we can use OAuth providers
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || window.location.origin
      }
    });
  }
}

/**
 * Main SDK object compatible with Base44
 */
export const base44 = {
  entities: {
    UserState: new CustomEntity("user_states"),
    Regions: new CustomEntity("regions"),
    CouncilMember: new CustomEntity("council_members"),
    FactionRegistry: new CustomEntity("faction_registry"),
    FactionInfluenceConfig: new CustomEntity("faction_influence_configs"),
    BuildingTypes: new CustomEntity("building_types"),
    BuildingStats: new CustomEntity("building_stats"),
    Buildings: new CustomEntity("buildings"),
    LawLibrary: new CustomEntity("law_library"),
    EventMaster: new CustomEntity("event_master"),
    ActiveEvent: new CustomEntity("active_events"),
    ScenarioMaster: new CustomEntity("scenario_master"),
    TurnHistory: new CustomEntity("turn_history"),
    Mailbox: new CustomEntity("mailbox"),
    ElectionCycles: new CustomEntity("election_cycles"),
    GameConfig: new CustomEntity("game_configs"),
    TechnologyTree: new CustomEntity("technology_tree"),
    FactionQuests: new CustomEntity("faction_quests"),
    Armies: new CustomEntity("armies"),
    Expeditions: new CustomEntity("expeditions"),
    MarketRates: new CustomEntity("market_rates"),
    AdvisoryConfigs: new CustomEntity("advisory_configs"),
    AdvisoryGuide: new CustomEntity("advisory_guide"),
    users: new CustomEntity("users"),
  },
  
  auth: new UserEntity(),
  
  functions: {
    async invoke(functionName, payload) {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });
      if (error) throw error;
      return data;
    }
  }
};

export default base44;
