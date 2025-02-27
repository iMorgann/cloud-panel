import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Box, FileCode, File, X, Calendar, User, Clock, ChevronLeft, 
  Upload, Download, CheckCircle, AlertCircle, Shield 
} from 'lucide-react';
import { ConfigUploadModal } from '../upload/ConfigUploadModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ConfigFile {
  id: string;
  name: string;
  type: string;
  content: string;
  user_id: string;
  status: 'verified' | 'pending' | 'rejected';
  downloads: number;
  rating: number;
  created_at: string;
  user_rating?: number;
}

interface ConfigFolder {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  fileExtension: string;
  themeColor: string;
}

interface ConfigCount {
  type: string;
  count: number;
}

const ConfigsTab: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'submitter'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [configs, setConfigs] = useState<ConfigFile[]>([]);
  const [configCounts, setConfigCounts] = useState<ConfigCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const configFolders: ConfigFolder[] = [
    { 
      id: 'openbullet', 
      label: 'OpenBullet', 
      icon: Box, 
      description: 'OpenBullet configurations (.anom, .loli)',
      fileExtension: '.anom/.loli',
      themeColor: 'from-blue-600/20 to-purple-600/20'
    },
    { 
      id: 'openbullet2', 
      label: 'OpenBullet 2', 
      icon: Box, 
      description: 'OpenBullet 2 configurations (.opk)',
      fileExtension: '.opk',
      themeColor: 'from-purple-600/20 to-pink-600/20'
    },
    { 
      id: 'silverbullet', 
      label: 'SilverBullet', 
      icon: Shield, 
      description: 'SilverBullet configurations (.svb)',
      fileExtension: '.svb',
      themeColor: 'from-emerald-600/20 to-teal-600/20'
    },
    { 
      id: 'cookiebullet', 
      label: 'CookieBullet', 
      icon: FileCode, 
      description: 'CookieBullet configurations (.lce)',
      fileExtension: '.lce',
      themeColor: 'from-amber-600/20 to-orange-600/20'
    },
    { 
      id: 'bas', 
      label: 'BAS', 
      icon: File, 
      description: 'Browser Automation Studio (.xml)',
      fileExtension: '.xml',
      themeColor: 'from-cyan-600/20 to-blue-600/20'
    },
    { 
      id: 'bltools', 
      label: 'BL Tools', 
      icon: Box, 
      description: 'BL Tools configurations (.proj)',
      fileExtension: '.proj',
      themeColor: 'from-rose-600/20 to-red-600/20'
    }
  ];

  useEffect(() => {
    fetchConfigCounts();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchConfigs();
    }
  }, [selectedFolder, sortBy, sortOrder]);

  const fetchConfigCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('configs')
        .select('type, count')
        .select('type')
        .then(result => {
          if (result.error) throw result.error;
          
          // Count configs by type
          const counts = result.data.reduce((acc, config) => {
            acc[config.type] = (acc[config.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            data: Object.entries(counts).map(([type, count]) => ({ type, count })),
            error: null
          };
        });

      if (error) throw error;
      setConfigCounts(data || []);
    } catch (error) {
      console.error('Error fetching config counts:', error);
    }
  };

  const fetchConfigs = async () => {
    if (!selectedFolder) return;

    try {
      setLoading(true);
      
      // Get user session
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch configs with user ratings
      const { data, error } = await supabase
        .from('configs')
        .select(`
          *,
          user_ratings!inner (
            rating
          )
        `)
        .eq('type', selectedFolder)
        .order(sortBy === 'date' ? 'created_at' : sortBy === 'name' ? 'name' : 'user_id', 
          { ascending: sortOrder === 'asc' });

      if (error) throw error;

      // Get user's ratings for these configs
      if (user) {
        const { data: userRatings, error: ratingsError } = await supabase
          .from('user_ratings')
          .select('config_id, rating')
          .eq('user_id', user.id)
          .in('config_id', data.map(c => c.id));

        if (!ratingsError && userRatings) {
          const ratingsMap = Object.fromEntries(
            userRatings.map(r => [r.config_id, r.rating])
          );

          data.forEach(config => {
            config.user_rating = ratingsMap[config.id];
          });
        }
      }

      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (configId: string, rating: number) => {
    try {
      setRatingLoading(configId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to rate configs');
        return;
      }

      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          config_id: configId,
          user_id: user.id,
          rating
        });

      if (error) throw error;

      // Update local state
      setConfigs(prev => 
        prev.map(config => 
          config.id === configId 
            ? { ...config, user_rating: rating }
            : config
        )
      );

      toast.success('Rating updated successfully');
    } catch (error) {
      console.error('Rating failed:', error);
      toast.error('Failed to update rating');
    } finally {
      setRatingLoading(null);
    }
  };

  const RatingStars: React.FC<{ 
    rating: number;
    userRating?: number;
    onRate: (rating: number) => void;
    isLoading: boolean;
  }> = ({ rating, userRating, onRate, isLoading }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => !isLoading && onRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isLoading}
            className={`transition-colors ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Star
              size={16}
              className={`
                ${isLoading ? 'text-gray-500' : 'text-yellow-400'}
                ${(hoverRating || userRating || rating) >= star ? 'fill-current' : 'fill-transparent'}
              `}
            />
          </motion.button>
        ))}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="ml-2"
          >
            <Clock size={14} className="text-blue-400" />
          </motion.div>
        )}
      </div>
    );
  };

  const handleDownload = async (config: ConfigFile) => {
    try {
      // Create a blob from the config content
      const blob = new Blob([config.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = config.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      const { error } = await supabase
        .from('configs')
        .update({ downloads: config.downloads + 1 })
        .eq('id', config.id);

      if (error) throw error;
      
      // Update local state
      setConfigs(prev => 
        prev.map(c => 
          c.id === config.id 
            ? { ...c, downloads: c.downloads + 1 }
            : c
        )
      );

      toast.success('Config downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download config');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return AlertCircle;
      default:
        return Shield;
    }
  };

  const renderInventory = () => {
    const folder = configFolders.find(f => f.id === selectedFolder);
    if (!folder) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFolder(null)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Folders</span>
          </motion.button>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'submitter')}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-300"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="submitter">Sort by Submitter</option>
            </select>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${folder.themeColor} backdrop-blur-xl rounded-lg border border-gray-700/50 overflow-hidden`}>
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-900/30 rounded-lg backdrop-blur-sm">
                  <folder.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{folder.label}</h3>
                  <p className="text-sm text-gray-300">{folder.description}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              >
                <Upload size={18} />
                <span>Upload New Config</span>
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <File className="text-gray-400" size={32} />
                </motion.div>
                <p className="mt-4 text-gray-400">Loading configs...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {configs.map(config => (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <File className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium flex items-center space-x-2">
                            <span>{config.name}</span>
                            {config.status === 'verified' && (
                              <CheckCircle className="text-green-400" size={16} />
                            )}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1 text-gray-300">
                              <User size={14} />
                              <span>{config.user_id}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-300">
                              <Calendar size={14} />
                              <span>{new Date(config.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-gray-300 text-sm">
                              <Download size={14} />
                              <span>{config.downloads} downloads</span>
                            </div>
                            <RatingStars
                              rating={config.rating}
                              userRating={config.user_rating}
                              onRate={(rating) => handleRating(config.id, rating)}
                              isLoading={ratingLoading === config.id}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className={`flex items-center space-x-1 text-sm ${getStatusColor(config.status)}`}>
                          {React.createElement(getStatusIcon(config.status), { size: 14 })}
                          <span className="capitalize">{config.status}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(config)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {configs.length === 0 && (
                  <div className="text-center py-12 text-gray-300">
                    <File className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="text-lg mb-2">No configurations found</p>
                    <p className="text-sm text-gray-400">
                      Be the first to upload a config for {folder.label}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && folder && (
          <ConfigUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            fileExtension={folder.fileExtension}
            folderName={folder.label}
            onUploadComplete={fetchConfigs}
          />
        )}
      </motion.div>
    );
  };

  const renderFolders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Configuration Files</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configFolders.map((folder) => {
          const count = configCounts.find(c => c.type.toLowerCase() === folder.id)?.count || 0;
          
          return (
            <motion.div
              key={folder.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFolder(folder.id)}
              className={`bg-gradient-to-br ${folder.themeColor} backdrop-blur-xl p-6 rounded-lg cursor-pointer border border-gray-700/50`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gray-900/30 rounded-lg">
                  <folder.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{folder.label}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-300">{count} configs</span>
                    {count > 0 && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle size={14} />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                {folder.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-600/50 flex items-center justify-between text-sm">
                <span className="text-gray-300">Extension: {folder.fileExtension}</span>
                <span className="text-white">View All →</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {selectedFolder ? renderInventory() : renderFolders()}
    </AnimatePresence>
  );
};

export default ConfigsTab;

export { ConfigsTab };