'use client'

import { useEffect, useState, useRef } from "react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import supabase from "@/lib/supabase";

export default function ChatView({ initialMessages, roomId }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [user, setUser] = useState(null);
    const optimisticMessages = useRef(new Set());

    const handleNewMessages = (newMessage) => {
      console.log('Real-time message received:', newMessage);
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if(messageExists) {
          console.log('Duplicate message detected, skipping:', newMessage.id);
          return prev;
        }
        
        if (optimisticMessages.current.has(newMessage.id)) {
          optimisticMessages.current.delete(newMessage.id);
          console.log('Real message arrived for optimistic update:', newMessage.id);
        }
        
        return [...prev, newMessage];
      });
    };

    const handleLoadMoreMessages = (olderMessages) => {
      console.log('Adding older messages:', olderMessages.length);
      setMessages(prev => {
        const existingIds = new Set(prev.map(msg => msg.id));
        const newMessages = olderMessages.filter(msg => !existingIds.has(msg.id));
        console.log('Filtered new messages:', newMessages.length);
        return [...newMessages, ...prev];
      });
    };

    const handleSendSuccess = (newMessage) => {
      console.log('Optimistic update for message:', newMessage.id);
      
      optimisticMessages.current.add(newMessage.id);
      
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          console.log('Message already exists during optimistic update:', newMessage.id);
          return prev;
        }
        return [...prev, newMessage];
      });

      setTimeout(() => {
        if (optimisticMessages.current.has(newMessage.id)) {
          console.warn('Real-time message never arrived for:', newMessage.id);
        }
      }, 5000);
    };


    useEffect(() => {
      return () => {
        optimisticMessages.current.clear();
      };
    }, []);

    useEffect(() => {
      const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('Current user here:', user);
          setUser(user);
      };
      
      fetchUser();
    }, []);
  
    if (!user) return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

    return (
      <div className="h-full flex flex-col bg-neutral-900">
        <div className="h-full flex flex-col w-5xl m-auto">
            <MessageList 
                messages={messages} 
                roomId={roomId} 
                onNewMessages={handleNewMessages}
                onLoadMoreMessages={handleLoadMoreMessages}
                user={user}
            />
            <div className="p-4 border-t">
                <MessageInput 
                    roomId={roomId} 
                    onSendSuccess={handleSendSuccess} 
                />
            </div>
        </div>
      </div>
    );
}