'use client';
import { useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabase';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ roomId, onSendSuccess }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        text: message,
        room_id: roomId,
        user_id: user.id
      })
      .select('*, profiles(*)')
      .single();
  
    if (error) {
      alert(error.message);
    } else {
      const messageWithProfile = {
        ...data,
        profiles: {
          user_id: data.user_id,
          username: data.profiles?.username || 'Anonymous',
          avatar_url: data.profiles?.avatar_url || null
        }
      };
      
      onSendSuccess(messageWithProfile);
      setMessage('');
    }
  };

  const onEmojiClick = (emojiObject) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBefore = message.substring(0, cursorPosition);
    const textAfter = message.substring(cursorPosition);
    const newMessage = textBefore + emojiObject.emoji + textAfter;
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = cursorPosition + emojiObject.emoji.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 relative">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 pr-10 border rounded resize-none overflow-y-auto 
                    scrollbar-thin scrollbar-track-transparent 
                    scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 
                    focus:scrollbar-thumb-gray-300 bg-neutral-800 text-white"
                    
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
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-2 top-5 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-200 text-3xl
                     w-6 h-6 flex items-center justify-center"
          title="Add emoji"
        >
          ☺
        </button>

        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="dark"
              width={300}
              height={400}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
}