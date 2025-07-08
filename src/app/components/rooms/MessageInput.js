'use client';
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

export default function MessageInput({ roomId }) {

  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('messages')
      .insert({
        text: message,
        room_id: roomId,
        user_id: user.id
      })
      .select('*, profiles(*)');
      console.log("userId: ", user.id);
  
    if (error) alert(error.message);
    else setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded"
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
}