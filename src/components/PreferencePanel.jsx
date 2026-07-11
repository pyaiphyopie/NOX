import { useState, useEffect } from 'react';
import { preferenceService } from '../services/preference-service';

export default function PreferencePanel({ onClose }) {
  const [preferences, setPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('genres');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPreferences(preferenceService.getPreferences());
  }, []);

  const handleSave = () => {
    if (preferences) {
      const errors = preferenceService.validatePreferences(preferences);
      if (errors.length === 0) {
        preferenceService.savePreferences(preferences);
        setHasChanges(false);
        onClose?.();
      } else {
        alert('Please fix the following errors:\n' + errors.join('\n'));
      }
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences to default?')) {
      preferenceService.resetPreferences();
      setPreferences(preferenceService.getPreferences());
      setHasChanges(false);
    }
  };

  const toggleGenre = (genre) => {
    setPreferences(prev => {
      const updated = { ...prev };
      if (updated.preferredGenres.includes(genre)) {
        updated.preferredGenres = updated.preferredGenres.filter(g => g !== genre);
      } else {
        updated.preferredGenres = [...updated.preferredGenres, genre];
      }
      setHasChanges(true);
      return updated;
    });
  };

  const toggleVenue = (venue) => {
    setPreferences(prev => {
      const updated = { ...prev };
      if (updated.preferredVenues.includes(venue)) {
        updated.preferredVenues = updated.preferredVenues.filter(v => v !== venue);
      } else {
        updated.preferredVenues = [...updated.preferredVenues, venue];
      }
      setHasChanges(true);
      return updated;
    });
  };

  const updateBudget = (field, value) => {
    setPreferences(prev => {
      const updated = { ...prev };
      updated.budgetRange = { ...updated.budgetRange, [field]: parseInt(value) || 0 };
      setHasChanges(true);
      return updated;
    });
  };

  if (!preferences) return null;

  const genres = ['Techno', 'Hip-Hop', 'EDM', 'Live Bands', 'Rooftop', 'House', 'Underground'];
  const venues = ['Warehouse 19', 'NOIR Rooftop', 'Atlas Terrace', 'The Foundry', 'Pulse Arena'];
  const areas = ['Dagon Township', 'Bahan Township', 'Sanchaung', 'Ahlone Township', 'Hlaing Township'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black">Nightlife Preferences</h2>
            <p className="text-white/50 text-sm mt-1">Customize your NOX experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/15 text-white/70 hover:border-cyan-400 hover:text-cyan-300 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {['genres', 'venues', 'areas', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'genres' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferred Music Genres</h3>
              <div className="grid grid-cols-2 gap-3">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`p-4 rounded-xl border transition ${
                      preferences.preferredGenres.includes(genre)
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'venues' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Favorite Venues</h3>
              <div className="space-y-2">
                {venues.map(venue => (
                  <button
                    key={venue}
                    onClick={() => toggleVenue(venue)}
                    className={`w-full p-4 rounded-xl border text-left transition ${
                      preferences.preferredVenues.includes(venue)
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40'
                    }`}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'areas' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferred Areas</h3>
              <div className="space-y-2">
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => {
                      setPreferences(prev => {
                        const updated = { ...prev };
                        if (updated.preferredAreas.includes(area)) {
                          updated.preferredAreas = updated.preferredAreas.filter(a => a !== area);
                        } else {
                          updated.preferredAreas = [...updated.preferredAreas, area];
                        }
                        setHasChanges(true);
                        return updated;
                      });
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition ${
                      preferences.preferredAreas.includes(area)
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Budget Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/50 mb-2 block">Minimum ($)</label>
                    <input
                      type="number"
                      value={preferences.budgetRange.min}
                      onChange={(e) => updateBudget('min', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/50 mb-2 block">Maximum ($)</label>
                    <input
                      type="number"
                      value={preferences.budgetRange.max}
                      onChange={(e) => updateBudget('max', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Time Preference</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['early_evening', 'evening', 'late_night'].map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setPreferences(prev => {
                          const updated = { ...prev, timePreference: time };
                          setHasChanges(true);
                          return updated;
                        });
                      }}
                      className={`p-3 rounded-xl border transition ${
                        preferences.timePreference === time
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40'
                      }`}
                    >
                      {time.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Social Preference</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['solo', 'small_group', 'mixed', 'large_group'].map(social => (
                    <button
                      key={social}
                      onClick={() => {
                        setPreferences(prev => {
                          const updated = { ...prev, socialPreference: social };
                          setHasChanges(true);
                          return updated;
                        });
                      }}
                      className={`p-3 rounded-xl border transition ${
                        preferences.socialPreference === social
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40'
                      }`}
                    >
                      {social.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(preferences.notificationPreferences).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-white/70">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <button
                        onClick={() => {
                          setPreferences(prev => {
                            const updated = {
                              ...prev,
                              notificationPreferences: {
                                ...prev.notificationPreferences,
                                [key]: !value
                              }
                            };
                            setHasChanges(true);
                            return updated;
                          });
                        }}
                        className={`w-12 h-6 rounded-full transition ${
                          value ? 'bg-cyan-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={handleReset}
            className="text-white/50 hover:text-white text-sm"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                hasChanges
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}