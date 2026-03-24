-- =====================================================
-- MIGRATION: Add Auth System, AI Assets & Usage Counter
-- For: The Citadel: Crown & Counsel
-- =====================================================

-- =====================================================
-- 1. USER PROFILES (with Role-based Access)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('developer', 'player')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow insert on signup" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. GAME ASSETS (AI Generated Assets Storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS game_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN (
    'faction_icon', 
    'building', 
    'background', 
    'resource_icon', 
    'tech_icon',
    'advisor_portrait'
  )),
  category VARCHAR(50),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  prompt_used TEXT,
  ai_model VARCHAR(50) DEFAULT 'pollinations',
  width INTEGER DEFAULT 512,
  height INTEGER DEFAULT 512,
  file_size_bytes INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE game_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only developer can CRUD
CREATE POLICY "Developer full access on game_assets" 
  ON game_assets FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Players can view active assets" 
  ON game_assets FOR SELECT 
  USING (is_active = true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_game_assets_type ON game_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_game_assets_active ON game_assets(is_active);

-- =====================================================
-- 3. AI USAGE COUNTER (Free Tier Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_usage_counter (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_count INTEGER DEFAULT 0,
  monthly_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  last_reset_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_usage_counter ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own usage" 
  ON ai_usage_counter FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update usage" 
  ON ai_usage_counter FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for new users" 
  ON ai_usage_counter FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to reset daily counter (run via cron)
CREATE OR REPLACE FUNCTION reset_daily_ai_counter()
RETURNS void AS $$
BEGIN
  UPDATE ai_usage_counter 
  SET daily_count = 0, 
      last_reset_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly counter (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_ai_counter()
RETURNS void AS $$
BEGIN
  UPDATE ai_usage_counter 
  SET monthly_count = 0, 
      last_reset_month = DATE_TRUNC('month', CURRENT_DATE),
      updated_at = NOW()
  WHERE last_reset_month < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS TABLE (
  daily_count INTEGER,
  monthly_count INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  can_generate BOOLEAN
) AS $$
DECLARE
  v_daily_limit INTEGER := 50;
  v_monthly_limit INTEGER := 500;
  v_record ai_usage_counter%ROWTYPE;
BEGIN
  -- Get or create record
  SELECT * INTO v_record 
  FROM ai_usage_counter 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO ai_usage_counter (user_id) 
    VALUES (p_user_id) 
    RETURNING * INTO v_record;
  END IF;
  
  -- Reset counters if needed
  IF v_record.last_reset_date < CURRENT_DATE THEN
    v_record.daily_count := 0;
    v_record.last_reset_date := CURRENT_DATE;
  END IF;
  
  IF v_record.last_reset_month < DATE_TRUNC('month', CURRENT_DATE) THEN
    v_record.monthly_count := 0;
    v_record.last_reset_month := DATE_TRUNC('month', CURRENT_DATE);
  END IF;
  
  -- Check limits
  IF v_record.daily_count >= v_daily_limit OR v_record.monthly_count >= v_monthly_limit THEN
    RETURN QUERY SELECT 
      v_record.daily_count,
      v_record.monthly_count,
      v_daily_limit,
      v_monthly_limit,
      FALSE;
    RETURN;
  END IF;
  
  -- Increment counters
  UPDATE ai_usage_counter 
  SET daily_count = daily_count + 1,
      monthly_count = monthly_count + 1,
      last_reset_date = v_record.last_reset_date,
      last_reset_month = v_record.last_reset_month,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT 
    v_record.daily_count + 1,
    v_record.monthly_count + 1,
    v_daily_limit,
    v_monthly_limit,
    TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is developer
CREATE OR REPLACE FUNCTION is_developer(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = p_user_id AND role = 'developer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email = 'dickoifenta27@gmail.com' THEN 'developer'
      ELSE 'player'
    END
  );
  
  -- Also create usage counter
  INSERT INTO ai_usage_counter (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_assets_updated_at ON game_assets;
CREATE TRIGGER update_game_assets_updated_at
  BEFORE UPDATE ON game_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_usage_updated_at ON ai_usage_counter;
CREATE TRIGGER update_ai_usage_updated_at
  BEFORE UPDATE ON ai_usage_counter
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INITIAL DATA (Optional - for testing)
-- =====================================================

-- Note: Developer role will be auto-assigned when user with 
-- dickoifenta27@gmail.com signs up via the trigger above

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT 'Migration 002 completed successfully!' as status;
