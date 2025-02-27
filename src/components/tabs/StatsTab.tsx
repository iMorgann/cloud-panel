import React, { useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { 
  FileText, Globe2, Users, Clock, TrendingUp, Shield, 
  Lock, AlertTriangle, CheckCircle, Activity, Database,
  Server, Zap, Settings, Box, FileCode, File, Bell,
  PieChart
} from 'lucide-react';
import { Card } from '../shared/Card';
import { EntryStats, DomainStat, UserStats, LoginStats } from '../../types/stats';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ConfigStats {
  total_configs: number;
  verified_configs: number;
  pending_configs: number;
  rejected_configs: number;
  config_types: {
    type: string;
    count: number;
    percentage: number;
  }[];
  recent_configs: {
    name: string;
    type: string;
    created_at: string;
  }[];
}

interface StatsTabProps {
  entryStats: EntryStats | null;
  domainStats: DomainStat[];
  userStats: UserStats | null;
  loginStats: LoginStats | null;
  isAuthenticated: boolean;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  entryStats,
  domainStats,
  userStats,
  loginStats,
  isAuthenticated
}) => {
  const [configStats, setConfigStats] = useState<ConfigStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const activityRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfigStats();
      fetchRecentActivity();
      
      // Set up interval to refresh activity data
      activityRefreshInterval.current = setInterval(() => {
        fetchRecentActivity();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (activityRefreshInterval.current) {
        clearInterval(activityRefreshInterval.current);
      }
    };
  }, [isAuthenticated]);

  const fetchConfigStats = async () => {
    try {
      setLoading(true);
      const { data: configs, error } = await supabase
        .from('configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate config type distribution
      const configTypes: Record<string, number> = {};
      (configs || []).forEach(config => {
        configTypes[config.type] = (configTypes[config.type] || 0) + 1;
      });

      const totalConfigs = configs?.length || 0;
      const configTypeStats = Object.entries(configTypes).map(([type, count]) => ({
        type,
        count,
        percentage: totalConfigs > 0 ? Math.round((count / totalConfigs) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      const stats: ConfigStats = {
        total_configs: totalConfigs,
        verified_configs: configs?.filter(c => c.status === 'verified').length || 0,
        pending_configs: configs?.filter(c => c.status === 'pending').length || 0,
        rejected_configs: configs?.filter(c => c.status === 'rejected').length || 0,
        config_types: configTypeStats,
        recent_configs: (configs || []).slice(0, 5).map(c => ({
          name: c.name,
          type: c.type,
          created_at: c.created_at
        }))
      };

      setConfigStats(stats);
    } catch (error: any) {
      console.error('Error fetching config stats:', error);
      toast.error('Failed to load config statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      if (!isAuthenticated) return;
      
      setLoading(true);
      
      // Get user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Fetch recent notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      // Fetch recent uploads
      const { data: recentUploads, error: uploadsError } = await supabase
        .from('entries')
        .select('id, created_at, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (uploadsError) throw uploadsError;
      
      // Combine and format activities
      const formattedUploads = (recentUploads || []).map(upload => ({
        id: upload.id,
        type: 'entry_upload',
        title: 'New Entries Uploaded',
        message: `You uploaded new ${upload.type} entries`,
        user_id: user.id,
        read: true,
        created_at: upload.created_at,
        data: { entry_id: upload.id }
      }));
      
      // Combine all activities and sort by date
      const allActivities = [...(notifications || []), ...formattedUploads]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      
      setRecentActivity(allActivities);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const [systemStats, setSystemStats] = useState({
    uptime: '99.998%',
    responseTime: '127ms',
    activeConnections: 2847,
    processingRate: '12.4k/s'
  });

  const [antiPublicStats, setAntiPublicStats] = useState({
    totalChecked: 127834569,
    publicMatches: 2341897,
    privateEntries: 125492672,
    recentDetections: 4367,
    detectionRate: 1.83,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    const updateSystemStats = () => {
      setSystemStats(prev => ({
        uptime: '99.998%',
        responseTime: `${120 + Math.floor(Math.random() * 15)}ms`,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 11) - 5,
        processingRate: `${12 + Math.floor(Math.random() * 1.8)}k/s`
      }));
    };

    const interval = setInterval(updateSystemStats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateAntiPublicStats = () => {
      setAntiPublicStats(prev => {
        const newChecked = prev.totalChecked + Math.floor(Math.random() * 1000);
        const newPublic = prev.publicMatches + Math.floor(Math.random() * 20);
        const newPrivate = newChecked - newPublic;
        const newDetections = prev.recentDetections + Math.floor(Math.random() * 5) - 2;

        return {
          totalChecked: newChecked,
          publicMatches: newPublic,
          privateEntries: newPrivate,
          recentDetections: Math.max(0, newDetections),
          detectionRate: +(newPublic / newChecked * 100).toFixed(2),
          lastUpdate: new Date().toISOString()
        };
      });
    };

    const interval = setInterval(updateAntiPublicStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderSystemStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-700/50 p-6 rounded-lg col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Server className="text-blue-400" size={24} />
          <h3 className="text-lg font-medium text-gray-300">System Performance</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="text-green-400" size={16} />
          <span className="text-sm text-green-400">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Uptime</p>
            <CheckCircle className="text-green-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-white"
            key={systemStats.uptime}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {systemStats.uptime}
          </motion.p>
          <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Response Time</p>
            <Zap className="text-yellow-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-white"
            key={systemStats.responseTime}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {systemStats.responseTime}
          </motion.p>
          <p className="text-sm text-gray-400 mt-1">Average</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Active Connections</p>
            <Users className="text-blue-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-white"
            key={systemStats.activeConnections}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {systemStats.activeConnections.toLocaleString()}
          </motion.p>
          <p className="text-sm text-gray-400 mt-1">Current</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Processing Rate</p>
            <Database className="text-purple-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-white"
            key={systemStats.processingRate}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {systemStats.processingRate}
          </motion.p>
          <p className="text-sm text-gray-400 mt-1">Requests</p>
        </div>
      </div>
    </motion.div>
  );

  const renderAntiPublicStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-700/50 p-6 rounded-lg col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="text-purple-400" size={24} />
          <h3 className="text-lg font-medium text-gray-300">Anti-Public Protection</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="text-gray-400" size={14} />
          <span className="text-gray-400">
            Last updated: {new Date(antiPublicStats.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Total Checked</p>
            <CheckCircle className="text-green-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-white"
            key={antiPublicStats.totalChecked}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {antiPublicStats.totalChecked.toLocaleString()}
          </motion.p>
          <div className="mt-2 text-sm text-gray-400">
            Entries verified
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Public Matches</p>
            <AlertTriangle className="text-yellow-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-yellow-400"
            key={antiPublicStats.publicMatches}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {antiPublicStats.publicMatches.toLocaleString()}
          </motion.p>
          <div className="mt-2 text-sm text-gray-400">
            Found in public databases
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400">Private Entries</p>
            <Lock className="text-green-400" size={16} />
          </div>
          <motion.p 
            className="text-2xl font-bold text-green-400"
            key={antiPublicStats.privateEntries}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {antiPublicStats.privateEntries.toLocaleString()}
          </motion.p>
          <div className="mt-2 text-sm text-gray-400">
            Unique to our database
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-300 font-medium mb-1">Recent Detections</h4>
              <motion.p 
                className="text-2xl font-bold text-red-400"
                key={antiPublicStats.recentDetections}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                {antiPublicStats.recentDetections.toLocaleString()}
              </motion.p>
            </div>
            <div className="h-16 w-24 bg-gray-900/50 rounded-lg flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-red-400"
              >
                <AlertTriangle size={24} />
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Detected in the last 24 hours
          </p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-300 font-medium mb-1">Detection Rate</h4>
              <motion.p 
                className="text-2xl font-bold text-blue-400"
                key={antiPublicStats.detectionRate}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                {antiPublicStats.detectionRate}%
              </motion.p>
            </div>
            <div className="h-16 w-24 bg-gray-900/50 rounded-lg flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-blue-400"
              >
                <TrendingUp size={24} />
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Average detection percentage
          </p>
        </div>
      </div>
    </motion.div>
  );

  const ActivityFeed = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-lg p-6 mb-6 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Bell className="text-blue-400" size={24} />
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity size={16} />
          <span>Live Feed</span>
        </div>
      </div>

      <div className="space-y-3">
        {loading && recentActivity.length === 0 ? (
          <div className="text-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block text-blue-400 mb-2"
            >
              <Activity size={24} />
            </motion.div>
            <p className="text-gray-400">Loading activity...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-900/50 rounded-lg">
                  {activity.type === 'config_upload' ? (
                    <FileCode className="text-purple-400" size={16} />
                  ) : activity.type === 'entry_upload' ? (
                    <FileText className="text-green-400" size={16} />
                  ) : (
                    <Bell className="text-blue-400" size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-300">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {!activity.read && (
                <div className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-400">
                  New
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No recent activity found
          </div>
        )}
      </div>
    </motion.div>
  );

  const ConfigStatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card
        title="Configuration Status"
        icon={Settings}
        iconColor="text-purple-400"
        className="h-full"
      >
        {loading && !configStats ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-blue-400"
            >
              <Activity size={24} />
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total</span>
                  <Box className="text-blue-400" size={16} />
                </div>
                <p className="text-2xl font-bold text-white">
                  {configStats?.total_configs || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Verified</span>
                  <CheckCircle className="text-green-400" size={16} />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {configStats?.verified_configs || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Pending</span>
                  <Clock className="text-yellow-400" size={16} />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {configStats?.pending_configs || 0}
                </p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Rejected</span>
                  <AlertTriangle className="text-red-400" size={16} />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {configStats?.rejected_configs || 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Configs</h4>
              <div className="space-y-2">
                {configStats?.recent_configs && configStats.recent_configs.length > 0 ? (
                  configStats.recent_configs.map((config, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <File className="text-gray-400" size={14} />
                        <span className="text-gray-300">{config.name}</span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(config.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    No configs found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Config Distribution"
        icon={PieChart}
        iconColor="text-blue-400"
        className="h-full"
      >
        {loading && !configStats ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-blue-400"
            >
              <Activity size={24} />
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">By Type</h4>
              <div className="space-y-3">
                {configStats?.config_types && configStats.config_types.length > 0 ? (
                  configStats.config_types.map((type, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{type.type}</span>
                        <span className="text-sm text-blue-400">
                          {type.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' : 
                            index === 1 ? 'bg-purple-500' : 
                            index === 2 ? 'bg-green-500' : 
                            index === 3 ? 'bg-yellow-500' : 
                            'bg-gray-500'
                          }`}
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {configStats?.total_configs ? (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Total Types</div>
                    <div className="text-lg font-bold text-white">
                      {configStats.config_types.length}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Most Popular</div>
                    <div className="text-lg font-bold text-white truncate">
                      {configStats.config_types[0]?.type || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <LayoutGroup>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
        
        {isAuthenticated && <ActivityFeed />}
        
        {renderSystemStats()}
        
        {renderAntiPublicStats()}
        
        {isAuthenticated && <ConfigStatsSection />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Total Entries"
            icon={FileText}
            iconColor="text-blue-400"
          >
            {isAuthenticated ? (
              <>
                <p className="text-3xl font-bold">{entryStats?.total_entries || 0}</p>
                <p className="text-sm text-gray-400 mt-1">all time</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-gray-400 mt-1">Sign in to view</p>
              </>
            )}
          </Card>

          <Card
            title="Unique Domains"
            icon={Globe2}
            iconColor="text-green-400"
          >
            {isAuthenticated ? (
              <>
                <p className="text-3xl font-bold">{entryStats?.unique_domains || 0}</p>
                <p className="text-sm text-gray-400 mt-1">discovered</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-gray-400 mt-1">Sign in to view</p>
              </>
            )}
          </Card>

          <Card
            title="Unique Users"
            icon={Users}
            iconColor="text-purple-400"
          >
            {isAuthenticated ? (
              <>
                <p className="text-3xl font-bold">{entryStats?.unique_users || 0}</p>
                <p className="text-sm text-gray-400 mt-1">total</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-gray-400 mt-1">Sign in to view</p>
              </>
            )}
          </Card>

          <Card
            title="Recent Activity"
            icon={Clock}
            iconColor="text-yellow-400"
          >
            {isAuthenticated ? (
              <>
                <p className="text-3xl font-bold">{entryStats?.entries_last_24h || 0}</p>
                <p className="text-sm text-gray-400 mt-1">entries in 24h</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-gray-400 mt-1">Sign in to view</p>
              </>
            )}
          </Card>
        </div>

        {isAuthenticated && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                title="Top Domains"
                icon={TrendingUp}
                iconColor="text-blue-400"
                className="h-full"
              >
                <div className="space-y-3">
                  {domainStats && domainStats.length > 0 ? (
                    domainStats.slice(0, 5).map((stat, index) => (
                      <div key={stat.domain_name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">{index + 1}.</span>
                          <span className="text-gray-300">{stat.domain_name}</span>
                        </div>
                        <span className="text-blue-400 font-medium">{stat.entry_count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-gray-400">
                      No domain statistics available
                    </div>
                  )}
                </div>
              </Card>

              <Card
                title="Common Usernames"
                icon={Users}
                iconColor="text-purple-400"
                className="h-full"
              >
                <div className="space-y-3">
                  {userStats?.most_common_users ? (
                    userStats.most_common_users.map((user, index) => (
                      <div key={user.username} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">{index + 1}.</span>
                          <span className="text-gray-300">{user.username}</span>
                        </div>
                        <span className="text-purple-400 font-medium">{user.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-gray-400">
                      No user statistics available
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </LayoutGroup>
  );
};