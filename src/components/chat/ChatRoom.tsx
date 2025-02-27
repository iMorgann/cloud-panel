import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageSquare, Hash, Settings, ChevronDown, ChevronRight, User, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  user_id: string;
  username: string;
  created_at: string;
  room: string;
}

interface OnlineUser {
  id: string;
  username: string;
  last_seen: string;
}

interface ChatRoomProps {
  session: Session | null;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const rooms = [
    { id: 'general', name: 'General', description: 'General discussion' },
    { id: 'configs', name: 'Configs', description: 'Config sharing and help' },
    { id: 'support', name: 'Support', description: 'Technical support' },
    { id: 'marketplace', name: 'Marketplace', description: 'Buy, sell, and trade' }
  ];

  useEffect(() => {
    if (!session?.user) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room=eq.${currentRoom}`
      }, payload => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    // Subscribe to presence updates
    const presenceSubscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Update online users list
        const presenceState = presenceSubscription.presenceState();
        const users = Object.values(presenceState).flat() as OnlineUser[];
        setOnlineUsers(users);
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await presenceSubscription.track({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'Anonymous',
            last_seen: new Date().toISOString()
          });
        }
      });

    // Fetch existing messages
    fetchMessages();

    return () => {
      messageSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [session, currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room', currentRoom)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage,
          user_id: session.user.id,
          username: session.user.email?.split('@')[0] || 'Anonymous',
          room: currentRoom
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Broadcast stopped typing
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900/50 border-r border-gray-700/50 flex flex-col">
        {/* Rooms List */}
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center space-x-2">
            <Hash size={18} />
            <span>Rooms</span>
          </h3>
          <div className="space-y-2">
            {rooms.map(room => (
              <motion.button
                key={room.id}
                whileHover={{ x: 4 }}
                onClick={() => setCurrentRoom(room.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentRoom === room.id
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'hover:bg-gray-800/50 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Hash size={16} />
                  <span>{room.name}</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">{room.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 p-4 overflow-auto">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4"
          >
            {showUserList ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Users size={18} />
            <span>Online Users ({onlineUsers.length})</span>
          </button>

          <AnimatePresence>
            {showUserList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {onlineUsers.map(user => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-800/30"
                  >
                    <Circle className="text-green-400" size={8} />
                    <span className="text-gray-300 text-sm">{user.username}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash size={24} className="text-gray-400" />
              <div>
                <h2 className="text-lg font-medium text-gray-200">
                  {rooms.find(r => r.id === currentRoom)?.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {rooms.find(r => r.id === currentRoom)?.description}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-3 ${
                message.user_id === session?.user?.id ? 'justify-end' : ''
              }`}
            >
              {message.user_id !== session?.user?.id && (
                <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
              )}
              <div className={`max-w-[70%] ${
                message.user_id === session?.user?.id ? 'items-end' : 'items-start'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-400">{message.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className={`rounded-lg p-3 ${
                  message.user_id === session?.user?.id
                    ? 'bg-blue-600/20 text-blue-100'
                    : 'bg-gray-700/50 text-gray-200'
                }`}>
                  {message.content}
                </div>
              </div>
              {message.user_id === session?.user?.id && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <User size={16} className="text-blue-400" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700/50 bg-gray-900/30">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};