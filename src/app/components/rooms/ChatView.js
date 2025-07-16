'use client'

import { useState } from "react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"

export default function ChatView({ initialMessages, roomId }) {
    const [messages, setMessages] = useState(initialMessages || []);
  
    
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">Room Chat</h1>
        </div>
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
    );
  }