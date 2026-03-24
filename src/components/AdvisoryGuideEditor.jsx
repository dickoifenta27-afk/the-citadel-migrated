import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';

const ADVISORS = [
  { key: 'elric', name: 'Lord Elric' },
  { key: 'valerius', name: 'Cdr. Valerius' },
  { key: 'seraphina', name: 'Lady Seraphina' },
  { key: 'silas', name: 'Master Silas' }
];

const CATEGORIES = ['economy', 'military', 'diplomacy', 'tech'];

export default function AdvisoryGuideEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    advisor_key: 'elric',
    topic_title: '',
    topic_key: '',
    content: '',
    category: 'economy',
    order: 0
  });

  const { data: guides = [] } = useQuery({
    queryKey: ['advisoryGuides'],
    queryFn: async () => await base44.entities.AdvisoryGuide.list()
  });

  const handleSelectGuide = (guide) => {
    setSelectedGuide(guide);
    setShowCreateForm(false);
    setForm({
      advisor_key: guide.advisor_key,
      topic_title: guide.topic_title,
      topic_key: guide.topic_key,
      content: guide.content,
      category: guide.category,
      order: guide.order ?? 0
    });
  };

  const handleNewGuide = () => {
    setSelectedGuide(null);
    setShowCreateForm(true);
    setForm({
      advisor_key: 'elric',
      topic_title: '',
      topic_key: '',
      content: '',
      category: 'economy',
      order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedGuide) {
        await base44.entities.AdvisoryGuide.update(selectedGuide.id, form);
      } else {
        await base44.entities.AdvisoryGuide.create(form);
      }

      queryClient.invalidateQueries({ queryKey: ['advisoryGuides'] });
      setShowCreateForm(false);
      setSelectedGuide(null);
      alert(selectedGuide ? 'Guide updated!' : 'Guide created!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save guide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this guide?')) return;
    try {
      await base44.entities.AdvisoryGuide.delete(id);
      queryClient.invalidateQueries({ queryKey: ['advisoryGuides'] });
      setSelectedGuide(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete guide');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left: Guides List */}
      <Card className="bg-[#1a1a1c] border-2 border-cyan-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-cyan-600">
          <CardTitle className="text-cyan-400 text-lg">Advisory Guides</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewGuide}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Guide
          </Button>

          <div className="space-y-2">
            {guides.length === 0 ? (
              <p className="text-cyan-400 text-sm text-center py-8">No guides yet</p>
            ) : (
              guides.map((guide) => {
                const advisor = ADVISORS.find(a => a.key === guide.advisor_key);
                return (
                  <button
                    key={guide.id}
                    onClick={() => handleSelectGuide(guide)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedGuide?.id === guide.id
                        ? 'bg-cyan-600/30 border-cyan-600 text-[#FFF8DC]'
                        : 'bg-[#101012] border-cyan-600/20 text-cyan-400 hover:border-cyan-600/50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{guide.topic_title}</p>
                    <p className="text-xs opacity-70 mt-1">{advisor?.name}</p>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right: Editor */}
      <Card className="bg-[#1a1a1c] border-2 border-cyan-600 col-span-2 flex flex-col">
        <CardHeader className="border-b border-cyan-600">
          <CardTitle className="text-cyan-400 text-lg">
            {showCreateForm ? 'New Guide' : selectedGuide ? 'Edit Guide' : 'Select a Guide'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedGuide && !showCreateForm ? (
            <div className="text-center py-12 text-cyan-400">
              <p>Select a guide or create a new one</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Advisor */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Advisor</label>
                <select
                  value={form.advisor_key}
                  onChange={(e) => setForm({ ...form, advisor_key: e.target.value })}
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  required
                >
                  {ADVISORS.map(a => <option key={a.key} value={a.key}>{a.name}</option>)}
                </select>
              </div>

              {/* Topic Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g., Cara Mengelola Gold"
                  value={form.topic_title}
                  onChange={(e) => setForm({ ...form, topic_title: e.target.value })}
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
              </div>

              {/* Topic Key */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Topic Key (slug)</label>
                <input
                  type="text"
                  placeholder="e.g., gold_management"
                  value={form.topic_key}
                  onChange={(e) => setForm({ ...form, topic_key: e.target.value })}
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  required
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#FFF8DC]">Content (in-character)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the guide content in the advisor's voice..."
                  className="w-full bg-[#101012] border border-cyan-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500 h-32"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedGuide ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedGuide ? 'Update Guide' : 'Create Guide'
                  )}
                </Button>
                {selectedGuide && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedGuide.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {(selectedGuide || showCreateForm) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedGuide(null);
                      setShowCreateForm(false);
                    }}
                    variant="outline"
                    className="bg-[#101012] border-cyan-600/50 text-cyan-400 hover:text-[#FFF8DC]"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}