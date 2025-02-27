import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Globe, UserCircle, Key, Trash2, Calendar, Clock, Shield, 
  AlertCircle, Copy, ExternalLink, Info, Lock, CheckCircle, Link
} from 'lucide-react';
import { Entry } from '../../types/entry';
import { toast } from 'react-hot-toast';

interface SearchMode {
  id: string;
  icon: React.ElementType;
  label: string;
}

interface SearchTabProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchMode: string;
  onSearchModeChange: (mode: string) => void;
  entries: Entry[];
  onDelete: (id: string) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({
  searchQuery,
  onSearch,
  searchMode,
  onSearchModeChange,
  entries,
  onDelete
}) => {
  const searchModes: SearchMode[] = [
    { id: 'url', icon: Globe, label: 'URL' },
    { id: 'username', icon: UserCircle, label: 'Username' },
    { id: 'password', icon: Key, label: 'Password' }
  ];

  const handleCopy = (content: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard', {
      icon: '📋',
      duration: 2000
    });
  };

  const formatContent = (content: string) => {
    if (!content) {
      return {
        url: '',
        username: '',
        password: ''
      };
    }

    // First try to split by pipe
    const parts = content.split('|');
    
    if (parts.length === 2) {
      // Handle EMAIL:PASSWORD format
      const [url, credentials] = parts;
      const [email, password] = (credentials || '').split(':').map(s => s?.trim() || '');
      
      return {
        url: url || '',
        username: email || '',
        password: password || ''
      };
    }

    // Handle URL:LOGIN:PASS format
    const colonParts = content.split(':');
    if (colonParts.length >= 3) {
      const url = colonParts[0] || '';
      const username = colonParts[1] || '';
      const password = colonParts.slice(2).join(':') || ''; // Rejoin password parts in case it contains colons
      
      return {
        url: url,
        username: username,
        password: password
      };
    }

    // Fallback for invalid format
    return {
      url: content,
      username: '',
      password: ''
    };
  };

  const getTimeAgo = (date: string) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const entryDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return entryDate.toLocaleDateString();
  };

  const openUrl = (url: string) => {
    if (!url) return;
    
    let finalUrl = url;
    if (!url.toLowerCase().startsWith('http')) {
      finalUrl = `https://${url}`;
    }
    window.open(finalUrl, '_blank');
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    // Remove http(s):// and trailing slashes
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={`Search by ${searchMode}...`}
              className="w-full px-4 py-2 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className="flex space-x-2">
          {searchModes.map(mode => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSearchModeChange(mode.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${searchMode === mode.id ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}
            >
              <mode.icon size={18} />
              <span>{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg">
            <Search className="mx-auto mb-4 text-gray-500" size={48} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search query or search mode</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400 px-4">
              <span>{entries.length} results found</span>
              <div className="flex items-center space-x-2">
                <Info size={14} />
                <span>Click any field to copy</span>
              </div>
            </div>
            
            {entries.map(entry => {
              const { url, username, password } = formatContent(entry.content);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gray-800/30 rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gray-700/30 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="text-blue-400" size={16} />
                      <span className="text-sm font-medium text-gray-300">Credential Entry</span>
                      <div className="flex items-center space-x-1 text-xs">
                        <Lock size={12} className="text-green-400" />
                        <span className="text-green-400">Secure</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{getTimeAgo(entry.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* URL */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Globe className="text-green-400 shrink-0" size={16} />
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <Link size={14} className="text-gray-500 shrink-0" />
                          <span className="text-sm text-gray-300 truncate">{formatUrl(url)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openUrl(url)}
                          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(url)}
                          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy size={14} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <UserCircle className="text-blue-400 shrink-0" size={16} />
                        <span className="text-sm text-gray-300 truncate font-mono">{username}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(username)}
                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy size={14} />
                      </motion.button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Key className="text-purple-400 shrink-0" size={16} />
                        <span className="text-sm text-gray-300 truncate font-mono">{password}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(password)}
                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy size={14} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-700/30 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-xs text-green-400">Verified</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};