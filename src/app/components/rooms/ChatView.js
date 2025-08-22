'use client'

import { useEffect, useState } from "react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"

export default function ChatView({ initialMessages, roomId }) {
    const [messages, setMessages] = useState(initialMessages || []);

    const handleNewMessages = (newMessages) => {
      console.log(newMessages);
      setMessages(prev => [ ...prev ,newMessages]);
    };

    const HandleLoadMoreMessages = (olderMessages) => {
      setMessages(prev => [...prev, ...olderMessages]);
    };

    const hanldleSendSuccess = (newMessage) => {
      setMessages(prev => [newMessage, ...prev]);
    };
  
    return (
      <div className="h-full flex flex-col bg-neutral-900">
        <div className="h-full flex flex-col w-5xl m-auto">
            <MessageList 
            messages={messages} 
            setMessages={setMessages} 
            roomId={roomId} 
            onNewMessages={handleNewMessages}
            onLoadMoreMessages={HandleLoadMoreMessages}
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