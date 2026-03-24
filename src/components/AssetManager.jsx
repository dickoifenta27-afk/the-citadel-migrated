import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Loader2, Trash2, ExternalLink, RefreshCw, Image as ImageIcon, Filter } from 'lucide-react';

const ASSET_TYPE_LABELS = {
  faction_icon: 'Faction Icon',
  building: 'Building',
  background: 'Background',
  resource_icon: 'Resource Icon',
  tech_icon: 'Technology Icon',
  advisor_portrait: 'Advisor Portrait'
};

export default function AssetManager() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    setError('');

    try {
      let query = supabase
        .from('game_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('asset_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError('Failed to fetch assets: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAsset = async (asset) => {
    if (!confirm(`Are you sure you want to delete "${asset.asset_name}"?`)) {
      return;
    }

    setDeletingId(asset.id);
    setError('');
    setSuccess('');

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('game-assets')
        .remove([asset.storage_path]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
        // Continue even if storage delete fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('game_assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) throw dbError;

      // Update local state
      setAssets(assets.filter(a => a.id !== asset.id));
      setSuccess(`Asset "${asset.asset_name}" deleted successfully`);
    } catch (err) {
      setError('Failed to delete asset: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: '#C9A84C' }}>
            Generated Assets
          </h3>
          <p className="text-[10px]" style={{ color: '#666' }}>
            {assets.length} assets in database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              fetchAssets();
            }}
            className="px-2 py-1.5 rounded text-xs"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#E0E0E0'
            }}
          >
            <option value="all">All Types</option>
            {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={fetchAssets}
            disabled={isLoading}
            className="p-1.5 rounded transition-all"
            style={{ 
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.3)'
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: '#C9A84C' }} />
          </button>
        </div>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="p-3 rounded-lg text-sm"
          style={{ background: 'rgba(192, 57, 43, 0.2)', color: '#E74C3C', border: '1px solid rgba(192, 57, 43, 0.3)' }}
        >
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg text-sm"
          style={{ background: 'rgba(39, 174, 96, 0.2)', color: '#27AE60', border: '1px solid rgba(39, 174, 96, 0.3)' }}
        >
          {success}
        </div>
      )}

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 rounded-xl"
          style={{ background: 'rgba(10,8,5,0.4)', border: '1px dashed rgba(201,168,76,0.2)' }}
        >
          <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: '#444' }} />
          <p className="text-sm" style={{ color: '#666' }}>No assets yet</p>
          <p className="text-[10px] mt-1" style={{ color: '#555' }}>
            Generate your first asset using the AI Generator
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl overflow-hidden group"
              style={{ 
                background: 'rgba(10,8,5,0.6)',
                border: '1px solid rgba(201,168,76,0.2)'
              }}
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden bg-black/40">
                <img
                  src={asset.public_url}
                  alt={asset.asset_name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={asset.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-all"
                    style={{ background: 'rgba(201,168,76,0.2)' }}
                    title="View Full Size"
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#C9A84C' }} />
                  </a>
                  <button
                    onClick={() => deleteAsset(asset)}
                    disabled={deletingId === asset.id}
                    className="p-2 rounded-lg transition-all"
                    style={{ background: 'rgba(192, 57, 43, 0.2)' }}
                    title="Delete"
                  >
                    {deletingId === asset.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#E74C3C' }} />
                    ) : (
                      <Trash2 className="w-4 h-4" style={{ color: '#E74C3C' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-medium truncate" style={{ color: '#E0E0E0' }}>
                  {asset.asset_name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ 
                      background: 'rgba(201,168,76,0.15)',
                      color: '#8B7355'
                    }}
                  >
                    {ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}
                  </span>
                  <span className="text-[9px]" style={{ color: '#666' }}>
                    {formatDate(asset.created_at)}
                  </span>
                </div>
                <p className="text-[9px] mt-1" style={{ color: '#555' }}>
                  {asset.width}×{asset.height} • {formatFileSize(asset.file_size_bytes)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
