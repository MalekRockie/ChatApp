'use client'

import { useState } from "react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"

export default function ChatView({ initialMessages, roomId }) {
    const [messages, setMessages] = useState(initialMessages || []);
  
    
    return (
      <div className="h-full flex flex-col bg-neutral-900">
        <div className="h-full flex flex-col w-5xl m-auto">
            <MessageList 
            messages={messages} 
            setMessages={setMessages} 
            roomId={roomId} 
            onNewMessages={(newMsg) => setMessages(prev=> [...prev, newMsg])}
            />
            <div className="p-4 border-t">
            <MessageInput 
                roomId={roomId} 
                onSendSuccess={(newMsg) => setMessages(prev => [...prev, newMsg])} 
            />
            </div>
        </div>
      </div>
    );
  }