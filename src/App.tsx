import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '@supabase/supabase-js';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/auth/AuthModal';
import { Header } from './components/shared/Header';
import { Navigation } from './components/shared/Navigation';
import { Footer } from './components/shared/Footer';
import { Onboarding } from './components/shared/Onboarding';
import { StatsTab } from './components/tabs/StatsTab';
import { SearchTab } from './components/tabs/SearchTab';
import { UploadTab } from './components/tabs/UploadTab';
import { ConfigsTab } from './components/tabs/ConfigsTab';
import { ChatTab } from './components/chat/ChatTab';
import { ResourcesTab } from './components/tabs/ResourcesTab';
import { Entry } from './types/entry';
import { EntryStats, DomainStat, UserStats, LoginStats } from './types/stats';
import { FileProcessor } from './components/upload/FileProcessor';

type SearchMode = 'url' | 'username' | 'password';

interface UploadProgress {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  content?: string[];
  showPreview?: boolean;
  stats?: {
    processedChunks: number;
    totalChunks: number;
    uniqueLines: number;
    duplicates: number;
    fileSize: number;
    validLines: number;
    invalidLines: number;
  };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('url');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [entryStats, setEntryStats] = useState<EntryStats | null>(null);
  const [domainStats, setDomainStats] = useState<DomainStat[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loginStats, setLoginStats] = useState<LoginStats | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showGradientBackground, setShowGradientBackground] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchEntries();
        fetchAllStats();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchEntries();
        fetchAllStats();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleFooterOpen = () => {
      setIsDrawerOpen(true);
      setShowGradientBackground(true);
    };

    const handleFooterClose = () => {
      setIsDrawerOpen(false);
      setShowGradientBackground(false);
    };

    window.addEventListener('footerOpened', handleFooterOpen);
    window.addEventListener('footerClosed', handleFooterClose);

    return () => {
      window.removeEventListener('footerOpened', handleFooterOpen);
      window.removeEventListener('footerClosed', handleFooterClose);
    };
  }, []);

  const fetchAllStats = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);

      // Fetch domain stats
      const { data: domainData, error: domainError } = await supabase
        .rpc('get_domain_stats', { p_user_id: session.user.id });
      
      if (domainError) {
        console.error('Domain stats error:', domainError);
        // Continue with other fetches even if this one fails
      } else {
        setDomainStats(domainData || []);
      }

      // Fetch user stats
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_stats', { p_user_id: session.user.id });
      
      if (userError) {
        console.error('User stats error:', userError);
      } else {
        setUserStats(userData?.[0] || null);
      }

      // Fetch entry stats
      const { data: entryData, error: entryError } = await supabase
        .rpc('get_entry_stats', { p_user_id: session.user.id });
      
      if (entryError) {
        console.error('Entry stats error:', entryError);
      } else {
        setEntryStats(entryData?.[0] || null);
      }

      // Fetch login stats
      const { data: loginData, error: loginError } = await supabase
        .rpc('get_login_stats', { p_user_id: session.user.id });
      
      if (loginError) {
        console.error('Login stats error:', loginError);
      } else {
        setLoginStats(loginData?.[0] || null);
      }

    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to improve performance
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error('Failed to fetch entries:', error);
      toast.error(error.message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setEntries([]);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user) {
      toast.error('Please sign in to delete entries');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      await fetchEntries();
      await fetchAllStats();
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!session?.user) {
      toast.error('Please sign in to search entries');
      return;
    }

    if (!query.trim()) {
      await fetchEntries();
      return;
    }

    try {
      setLoading(true);
      let searchFilter = '';
      
      switch (searchMode) {
        case 'url':
          searchFilter = `%${query}%:%:%`;
          break;
        case 'username':
          searchFilter = `%:%${query}%:%`;
          break;
        case 'password':
          searchFilter = `%:%:%${query}%`;
          break;
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', session.user.id)
        .ilike('content', searchFilter)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to improve performance
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        if (data.user && !data.session) {
          toast.success('Account created! Please check your email for verification.');
        } else {
          toast.success('Account created and signed in successfully!');
          setShowAuthModal(false);
        }
        setIsSignUp(false);
      } else {
        toast.success('Signed in successfully!');
        setShowAuthModal(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!session?.user) {
      toast.error('Please sign in to upload files');
      return;
    }

    const fileArray = Array.from(files);
    const textFiles = fileArray.filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    
    if (textFiles.length === 0) {
      toast.error('Please upload only text files');
      return;
    }

    setUploadProgress(textFiles.map(file => ({
      fileName: file.name,
      status: 'pending',
      progress: 0,
      showPreview: false
    })));

    for (const file of textFiles) {
      try {
        const processor = new FileProcessor(file, session.user.id);
        updateFileProgress(file.name, 25, 'processing');

        const result = await processor.process((progress, stats) => {
          updateFileProgress(file.name, progress, 'processing', undefined, stats);
        });

        if (result.success) {
          updateFileProgress(file.name, 100, 'completed', undefined, {
            ...result.stats,
            processedChunks: 1,
            totalChunks: 1,
            fileSize: file.size
          });
          await fetchEntries();
          await fetchAllStats();
          toast.success(`Successfully processed ${result.stats.uniqueLines} unique entries`);
        } else {
          updateFileProgress(file.name, 100, 'error');
          toast.error(result.error || 'Failed to process file');
        }
      } catch (error: any) {
        console.error('File processing failed:', error);
        updateFileProgress(file.name, 100, 'error');
        toast.error(`Failed to process ${file.name}: ${error.message}`);
      }
    }
  };

  const handleManualUpload = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.trim()) {
      setUploadProgress([{
        fileName: 'Manual Input',
        status: 'pending',
        progress: 0,
        showPreview: false
      }]);
      await processFileContent(content, 'Manual Input');
      e.target.value = '';
    }
  };

  const processFileContent = async (content: string, fileName: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      updateFileProgress(fileName, 100, 'error');
      toast.error('No valid data found in file');
      return;
    }
    
    try {
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      updateFileProgress(fileName, 50, 'processing', lines);
      
      // Process in smaller batches to avoid request size limits
      const batchSize = 500;
      let processedCount = 0;
      let duplicateCount = 0;
      
      for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('entries')
          .insert(batch.map(line => ({
            content: line,
            type: 'credential',
            user_id: session.user.id
          })))
          .select();

        if (error) {
          if (error.code === '23505') { // Duplicate entry
            duplicateCount += batch.length;
          } else {
            throw error;
          }
        } else {
          processedCount += (data?.length || 0);
        }
        
        // Update progress
        const progress = Math.min(50 + Math.round((i + batch.length) / lines.length * 50), 99);
        updateFileProgress(fileName, progress, 'processing', lines);
      }
      
      updateFileProgress(fileName, 100, 'completed', lines);
      await fetchEntries();
      await fetchAllStats();
      
      if (duplicateCount > 0) {
        toast.success(`Uploaded ${processedCount} entries (${duplicateCount} duplicates skipped)`);
      } else {
        toast.success(`Successfully uploaded ${processedCount} entries`);
      }
      
      setTimeout(clearCompletedUploads, 3000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      updateFileProgress(fileName, 100, 'error', lines);
      
      if (error.message === 'Authentication required') {
        toast.error('Please sign in to upload entries');
      } else if (error.code === '23505') {
        toast.error('Duplicate entries found');
      } else if (error.code === '42501') {
        toast.error('Permission denied. Please check your access rights.');
      } else {
        toast.error(error.message || 'Failed to upload entries');
      }
    }
  };

  const togglePreview = (fileName: string) => {
    setUploadProgress(prev =>
      prev.map(p =>
        p.fileName === fileName
          ? { ...p, showPreview: !p.showPreview }
          : p
      )
    );
  };

  const updateFileProgress = (fileName: string, progress: number, status: UploadProgress['status'], content?: string[], stats?: UploadProgress['stats']) => {
    setUploadProgress(prev => 
      prev.map(p => 
        p.fileName === fileName 
          ? { ...p, progress, status, ...(content && { content }), ...(stats && { stats }) }
          : p
      )
    );
  };

  const clearCompletedUploads = () => {
    setUploadProgress(prev => prev.filter(p => p.status !== 'completed'));
  };

  const handleOpenFooter = () => {
    const footerButton = document.querySelector('footer button');
    if (footerButton) {
      footerButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Toaster position="top-right" />
      
      {/* Gradient Background */}
      <AnimatePresence>
        {showGradientBackground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{
                scale: isDrawerOpen ? 1.2 : 1,
                y: isDrawerOpen ? '-25%' : '0%'
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        session={session}
        onSignOut={handleSignOut}
        onShowAuthModal={() => setShowAuthModal(true)}
      />

      <Navigation
        activeTab={!session ? 'stats' : activeTab}
        onTabChange={setActiveTab}
        isAuthenticated={!!session}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isSignUp={isSignUp}
        onToggleMode={() => setIsSignUp(!isSignUp)}
        onSubmit={handleAuth}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        isLoading={authLoading}
      />

      <div className="container mx-auto px-4 pb-24">
        {!session ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === 'resources' ? (
              <ResourcesTab />
            ) : (
              <>
                <Onboarding onOpenFooter={handleOpenFooter} />
                <StatsTab
                  entryStats={null}
                  domainStats={[]}
                  userStats={null}
                  loginStats={null}
                  isAuthenticated={false}
                />
              </>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-6"
            >
              {activeTab === 'upload' && (
                <UploadTab
                  uploadProgress={uploadProgress}
                  onTogglePreview={togglePreview}
                  dragActive={dragActive}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onFileSelect={handleFileUpload}
                  onManualUpload={handleManualUpload}
                />
              )}

              {activeTab === 'search' && (
                <SearchTab
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  searchMode={searchMode}
                  onSearchModeChange={(mode) => setSearchMode(mode as SearchMode)}
                  entries={entries}
                  onDelete={handleDelete}
                />
              )}

              {activeTab === 'stats' && (
                <StatsTab
                  entryStats={entryStats}
                  domainStats={domainStats}
                  userStats={userStats}
                  loginStats={loginStats}
                  isAuthenticated={true}
                />
              )}

              {activeTab === 'chat' && (
                <ChatTab session={session} />
              )}

              {activeTab === 'configs' && <ConfigsTab />}

              {activeTab === 'resources' && <ResourcesTab />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default App;