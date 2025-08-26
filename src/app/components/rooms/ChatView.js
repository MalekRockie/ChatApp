'use client'

import { useEffect, useState } from "react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import supabase from "@/lib/supabase";

export default function ChatView({ initialMessages, roomId }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [user, setUser] = useState(null);

    const handleNewMessages = (newMessages) => {
      console.log(newMessages);
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if(messageExists) {
          return prev;
        }
        return [...prev, newMessages]
      });
    };

    const HandleLoadMoreMessages = (olderMessages) => {
      setMessages(prev => [...prev, ...olderMessages]);
    };

    const hanldleSendSuccess = (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    };

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
            setMessages={setMessages} 
            roomId={roomId} 
            onNewMessages={handleNewMessages}
            onLoadMoreMessages={HandleLoadMoreMessages}
            user={user}
            />
            <div className="p-4 border-t">
            <MessageInput 
                roomId={roomId} 
                onSendSuccess={hanldleSendSuccess} 
            />
            </div>
        </div>
      </div>
    );
  }