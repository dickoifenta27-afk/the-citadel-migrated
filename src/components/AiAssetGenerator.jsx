import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Loader2, Wand2, Save, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';

// Pollinations AI Configuration
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

// Asset Type Configurations
const ASSET_TYPES = {
  faction_icon: {
    label: 'Faction Icon',
    width: 128,
    height: 128,
    aspectRatio: '1:1',
    styleHint: 'Circular badge, emblem style, transparent background'
  },
  building: {
    label: 'Building Image',
    width: 512,
    height: 512,
    aspectRatio: '1:1',
    styleHint: 'Detailed illustration, painterly style, game card art'
  },
  background: {
    label: 'Background Scene',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    styleHint: 'Wide landscape, atmospheric, dramatic lighting'
  },
  resource_icon: {
    label: 'Resource Icon',
    width: 64,
    height: 64,
    aspectRatio: '1:1',
    styleHint: 'Simple icon, flat design, game UI'
  },
  tech_icon: {
    label: 'Technology Icon',
    width: 128,
    height: 128,
    aspectRatio: '1:1',
    styleHint: 'Circular badge, knowledge/tech theme'
  },
  advisor_portrait: {
    label: 'Advisor Portrait',
    width: 512,
    height: 1024,
    aspectRatio: '1:2',
    styleHint: 'Half-body portrait, medieval fantasy character'
  }
};

// Style Presets
const STYLE_PRESETS = {
  medieval: 'Medieval fantasy game art style, detailed illustration, golden accents, dark atmospheric background',
  realistic: 'Photorealistic style, professional lighting, high detail, cinematic composition',
  stylized: 'Stylized cartoon art, vibrant colors, clean lines, game asset style'
};

export default function AiAssetGenerator() {
  const [assetType, setAssetType] = useState('faction_icon');
  const [assetName, setAssetName] = useState('');
  const [stylePreset, setStylePreset] = useState('medieval');
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [usage, setUsage] = useState({ daily: 0, monthly: 0, dailyLimit: 50, monthlyLimit: 500 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_usage_counter')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUsage({
          daily: data.daily_count,
          monthly: data.monthly_count,
          dailyLimit: 50,
          monthlyLimit: 500
        });
      }
    } catch (err) {
      console.error('Fetch usage error:', err);
    }
  };

  const checkAndIncrementUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('increment_ai_usage', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (!data.can_generate) {
        throw new Error(`Usage limit reached: ${data.daily_count}/${data.daily_limit} daily, ${data.monthly_count}/${data.monthly_limit} monthly`);
      }

      setUsage({
        daily: data.daily_count,
        monthly: data.monthly_count,
        dailyLimit: data.daily_limit,
        monthlyLimit: data.monthly_limit
      });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const generateImage = async () => {
    if (!prompt.trim() || !assetName.trim()) {
      setError('Please enter both asset name and prompt');
      return;
    }

    setError('');
    setSuccess('');
    setIsGenerating(true);
    setGeneratedUrl(null);

    try {
      // Check usage limits
      const canGenerate = await checkAndIncrementUsage();
      if (!canGenerate) {
        setIsGenerating(false);
        return;
      }

      const config = ASSET_TYPES[assetType];
      const styleHint = STYLE_PRESETS[stylePreset];
      
      // Build full prompt
      const fullPrompt = `${prompt}, ${styleHint}, ${config.styleHint}`;
      
      // Generate seed for reproducibility
      const seed = Math.floor(Math.random() * 1000000);
      
      // Build Pollinations URL
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const url = `${POLLINATIONS_BASE}/${encodedPrompt}?width=${config.width}&height=${config.height}&seed=${seed}&nologo=true`;
      
      // Preload image to verify it works
      const img = new Image();
      img.onload = () => {
        setGeneratedUrl(url);
        setIsGenerating(false);
      };
      img.onerror = () => {
        setError('Failed to generate image. Please try again.');
        setIsGenerating(false);
      };
      img.src = url;

    } catch (err) {
      setError(err.message || 'Generation failed');
      setIsGenerating(false);
    }
  };

  const saveToDatabase = async () => {
    if (!generatedUrl) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const config = ASSET_TYPES[assetType];
      
      // Determine storage path
      const folderMap = {
        faction_icon: 'faction-icons',
        building: 'buildings',
        background: 'backgrounds',
        resource_icon: 'resource-icons',
        tech_icon: 'tech-icons',
        advisor_portrait: 'advisor-portraits'
      };
      
      const folder = folderMap[assetType];
      const fileName = `${assetName.toLowerCase().replace(/\s+/g, '-')}.png`;
      const storagePath = `${folder}/${fileName}`;

      // Fetch image as blob
      const response = await fetch(generatedUrl);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('game-assets')
        .upload(storagePath, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-assets')
        .getPublicUrl(storagePath);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('game_assets')
        .insert({
          asset_name: assetName,
          asset_type: assetType,
          category: folder,
          storage_path: storagePath,
          public_url: publicUrl,
          prompt_used: prompt,
          ai_model: 'pollinations',
          width: config.width,
          height: config.height,
          file_size_bytes: blob.size,
          created_by: user.id
        });

      if (dbError) throw dbError;

      setSuccess(`Asset "${assetName}" saved successfully!`);
      
      // Reset form
      setAssetName('');
      setPrompt('');
      setGeneratedUrl(null);

    } catch (err) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setIsSaving(false);
    }
  };

  const config = ASSET_TYPES[assetType];
  const usagePercent = (usage.daily / usage.dailyLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Usage Counter */}
      <div className="p-4 rounded-xl"
        style={{ background: 'rgba(10,8,5,0.6)', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: '#8B7355' }}>
            AI Generation Usage (Free Tier)
          </span>
          <span className="text-xs" style={{ color: usagePercent > 80 ? '#E74C3C' : '#27AE60' }}>
            {usage.daily}/{usage.dailyLimit} daily
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${Math.min(usagePercent, 100)}%`,
              background: usagePercent > 80 
                ? 'linear-gradient(to right, #E74C3C, #C0392B)' 
                : 'linear-gradient(to right, #27AE60, #2ECC71)'
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: '#666' }}>
            Monthly: {usage.monthly}/{usage.monthlyLimit}
          </span>
          <span className="text-[10px]" style={{ color: '#666' }}>
            Resets daily at midnight UTC
          </span>
        </div>
      </div>

      {/* Generator Form */}
      <div className="grid grid-cols-2 gap-4">
        {/* Asset Type */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
            Asset Type
          </label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#E0E0E0'
            }}
          >
            {Object.entries(ASSET_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label} ({value.aspectRatio})
              </option>
            ))}
          </select>
          <p className="text-[10px] mt-1" style={{ color: '#666' }}>
            {config.width}×{config.height}px
          </p>
        </div>

        {/* Style Preset */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
            Art Style
          </label>
          <select
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#E0E0E0'
            }}
          >
            <option value="medieval">Medieval Fantasy</option>
            <option value="realistic">Realistic</option>
            <option value="stylized">Stylized/Cartoon</option>
          </select>
        </div>
      </div>

      {/* Asset Name */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
          Asset Name <span style={{ color: '#666' }}>(used for filename)</span>
        </label>
        <input
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder="e.g., Merchant Guild Icon"
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#E0E0E0'
          }}
        />
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
          AI Prompt <span style={{ color: '#666' }}>(describe what you want)</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`e.g., Golden balance scale with coins, intricate filigree border, wealthy merchant aesthetic`}
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm resize-none"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#E0E0E0'
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateImage}
        disabled={isGenerating || !prompt.trim() || !assetName.trim() || usage.daily >= usage.dailyLimit}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
          color: '#0A0A0F',
          fontFamily: 'Cinzel, serif'
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate Image
          </>
        )}
      </button>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(192, 57, 43, 0.2)', border: '1px solid rgba(192, 57, 43, 0.3)' }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: '#E74C3C' }} />
          <span className="text-sm" style={{ color: '#E74C3C' }}>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg"
          style={{ background: 'rgba(39, 174, 96, 0.2)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
        >
          <span className="text-sm" style={{ color: '#27AE60' }}>{success}</span>
        </div>
      )}

      {/* Preview */}
      {generatedUrl && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl"
            style={{ background: 'rgba(10,8,5,0.6)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <p className="text-xs mb-3 font-medium" style={{ color: '#8B7355' }}>
              Preview
            </p>
            <div className="flex justify-center">
              <img
                src={generatedUrl}
                alt="Generated preview"
                className="rounded-lg max-h-96 object-contain"
                style={{ border: '1px solid rgba(201,168,76,0.2)' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={saveToDatabase}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #27AE60 0%, #1E8449 100%)',
                color: '#FFF'
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Database
                </>
              )}
            </button>
            <button
              onClick={generateImage}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              style={{
                background: 'rgba(201,168,76,0.2)',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#C9A84C'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
