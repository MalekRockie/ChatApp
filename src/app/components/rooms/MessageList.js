'use client'

import {useEffect, useState, useTransition} from 'react';
import supabase from "@/lib/supabase";

export default function MessageList({messages, roomId, onNewMessages}){
    // const [messages, setMessages] = useState(initialMessages);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const channel = supabase
            .channel(`messages:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`
                },
                async (payload) => {
                    console.log('New message recieved', payload);
                    // onNewMessages(payload.new);
                    const {data: profile } = await supabase
                        .from('profiles')
                        .select('username, user_id, avatar_url')
                        .eq('user_id', payload.new.user_id)
                        .single()

                    const messageWithProfile = {
                        ...payload.new,
                        profiles: profile
                    };
                    onNewMessages(messageWithProfile)
                }
            )
            .subscribe();

            return()=> {
                supabase.removeChannel(channel);
            };
    }, [roomId, onNewMessages]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('Current user here:', user);
            setUser(user);
        };
        
        fetchUser();
    }, []);

    console.log('Current messages state', messages);

    return(
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 flex flex-col-reverse">
            {messages?.slice().reverse().map((message) => {
                const isCurrentUser = message.profiles?.user_id === user?.id;
                
                return (
                    <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                            {!isCurrentUser && (
                                <p className="text-xs text-gray-500 mb-1 px-3">
                                    {message.profiles?.username || 'Anonymous'}
                                </p>
                            )}
                            
                            <div className={`
                                px-4 py-2 rounded-2xl shadow-sm
                                ${isCurrentUser 
                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }
                            `}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}