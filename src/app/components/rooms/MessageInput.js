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
    <form onSubmit={handleSubmit} className="flex gap-2 ">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded resize-none overflow-y-auto 
                  scrollbar-thin scrollbar-track-transparent 
                  scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 
                  focus:scrollbar-thumb-gray-300"
                  
        placeholder="Type your message..."
        rows="1"
        style={{
          minHeight: '2.7rem',
          maxHeight: '6rem'
        }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          
          const newHeight = Math.max(40, Math.min(e.target.scrollHeight, 96));
          e.target.style.height = newHeight + 'px';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftkey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
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