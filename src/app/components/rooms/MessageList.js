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
                (payload) => {
                    console.log('New message recieved', payload);
                    onNewMessages(payload.new);
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
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages?.map((message) => (
                <div key={message.id} className={`p-2 border-b ${message.profiles?.user_id === user?.id ? ' flex flex-col items-end' : 'bg-black-100'}`}>
                    <p className="font-medium">{message.profiles?.username || 'Anonymous'}</p>
                    <p>{message.text}</p>
                </div>
            ))}
        </div>
    )
}