import React from 'react';
import { Session } from '@supabase/supabase-js';
import { ChatRoom } from './ChatRoom';

interface ChatTabProps {
  session: Session | null;
}

export const ChatTab: React.FC<ChatTabProps> = ({ session }) => {
  return (
    <div className="h-full">
      <ChatRoom session={session} />
    </div>
  );
};