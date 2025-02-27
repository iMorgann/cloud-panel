import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, FileText, Video, Download, ExternalLink, Globe, Shield, 
  Lock, Users, PenTool, Box, Code, FileCode, Settings, Edit, 
  Search, Clipboard, Folder, Database, Terminal, Wrench, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  version: string;
  size: string;
  category: string;
  downloadUrl: string;
}

export const ResourcesTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const toolCategories = [
    { id: 'all', label: 'All Tools', icon: Wrench },
    { id: 'automation', label: 'Automation', icon: Terminal },
    { id: 'editors', label: 'Text Editors', icon: Edit },
    { id: 'file-management', label: 'File Management', icon: Folder }
  ];

  const tools: Tool[] = [
    // Automation Tools
    {
      id: 'openbullet',
      name: 'OpenBullet',
      description: 'Advanced web automation and testing tool',
      icon: Box,
      version: '1.4.4',
      size: '24.3 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/openbullet/openbullet/releases/download/1.4.4/OpenBullet.zip'
    },
    {
      id: 'openbullet2',
      name: 'OpenBullet 2',
      description: 'Next generation web automation framework',
      icon: Box,
      version: '2.0.1',
      size: '28.7 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/openbullet/OpenBullet2/releases/download/2.0.1/OpenBullet2.zip'
    },
    {
      id: 'silverbullet',
      name: 'SilverBullet',
      description: 'Premium web automation solution',
      icon: Shield,
      version: '1.2.8',
      size: '31.2 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/silverbullet/releases/download/1.2.8/SilverBullet.zip'
    },
    {
      id: 'cookiebullet',
      name: 'CookieBullet',
      description: 'Cookie management and automation tool',
      icon: FileCode,
      version: '1.1.2',
      size: '18.5 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/cookiebullet/releases/download/1.1.2/CookieBullet.zip'
    },
    {
      id: 'bltools',
      name: 'BL Tools',
      description: 'Comprehensive browser automation toolkit',
      icon: Wrench,
      version: '3.2.1',
      size: '42.8 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/bltools/releases/download/3.2.1/BLTools.zip'
    },
    {
      id: 'bas',
      name: 'BAS',
      description: 'Browser Automation Studio',
      icon: Code,
      version: '2.1.0',
      size: '45.6 MB',
      category: 'automation',
      downloadUrl: 'https://github.com/bas/releases/download/2.1.0/BAS.zip'
    },
    
    // Text Editors
    {
      id: 'emeditor',
      name: 'EmEditor',
      description: 'Professional text editor with advanced features',
      icon: Edit,
      version: '21.5.0',
      size: '15.8 MB',
      category: 'editors',
      downloadUrl: 'https://www.emeditor.com/download/emed64_21.5.0.msi'
    },
    {
      id: 'notepadpp',
      name: 'Notepad++',
      description: 'Powerful source code editor',
      icon: FileText,
      version: '8.4.2',
      size: '4.2 MB',
      category: 'editors',
      downloadUrl: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.4.2/npp.8.4.2.Installer.x64.exe'
    },
    
    // File Management
    {
      id: 'filelocator',
      name: 'FileLocator Pro',
      description: 'Advanced file search and content analysis',
      icon: Search,
      version: '9.0.2',
      size: '12.4 MB',
      category: 'file-management',
      downloadUrl: 'https://www.mythicsoft.com/download/filelocatorpro_setup.exe'
    },
    {
      id: 'everything',
      name: 'Everything',
      description: 'Instant file and folder search',
      icon: Search,
      version: '1.4.1',
      size: '1.8 MB',
      category: 'file-management',
      downloadUrl: 'https://www.voidtools.com/Everything-1.4.1.1024.x64.zip'
    },
    {
      id: 'comfortclipboard',
      name: 'Comfort Clipboard Pro',
      description: 'Advanced clipboard manager with history',
      icon: Clipboard,
      version: '9.2.0',
      size: '8.6 MB',
      category: 'file-management',
      downloadUrl: 'https://www.comfort-software.com/download/clipboard-setup.exe'
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = async (tool: Tool) => {
    try {
      setDownloading(tool.id);
      
      const link = document.createElement('a');
      link.href = tool.downloadUrl;
      link.download = `${tool.name.toLowerCase().replace(/\s+/g, '-')}-${tool.version}.zip`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${tool.name}...`, {
        duration: 3000,
        icon: '⬇️'
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${tool.name}`, {
        duration: 3000
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Wrench className="text-blue-400" size={24} />
          </div>
          <h2 className="text-2xl font-semibold">Tools & Downloads</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-64 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2">
        {toolCategories.map(category => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            <category.icon size={16} />
            <span className="text-sm">{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className="relative group"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 flex flex-col min-h-[200px]">
                {/* Tool Header */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <tool.icon className="text-blue-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium truncate">{tool.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{tool.description}</p>
                  </div>
                </div>

                {/* Tool Info & Download Button */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>v{tool.version}</span>
                    <span>{tool.size}</span>
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredTool === tool.id ? 1 : 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(tool)}
                    disabled={downloading === tool.id}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm ${
                      downloading === tool.id ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {downloading === tool.id ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Download size={16} />
                        </motion.div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Info Tooltip */}
              <AnimatePresence>
                {hoveredTool === tool.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 -bottom-2 transform translate-y-full z-10 pointer-events-none"
                  >
                    <div className="bg-gray-900 rounded-lg p-3 shadow-xl border border-gray-700 text-sm">
                      <div className="flex items-start space-x-2">
                        <Info size={14} className="text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-gray-300">{tool.description}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-800/50 rounded p-1.5">
                              <span className="text-gray-400">Version:</span>
                              <span className="text-white ml-1">{tool.version}</span>
                            </div>
                            <div className="bg-gray-800/50 rounded p-1.5">
                              <span className="text-gray-400">Size:</span>
                              <span className="text-white ml-1">{tool.size}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};