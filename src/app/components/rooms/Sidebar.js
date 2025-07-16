'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabase';

export default function Sidebar() {

    const [rooms, setRooms] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchRooms = async () => {
          try{
            const {data: rooms, error: roomsError} = await supabase
                .from('rooms')
                .select('id, name')
                .order('created_at', {ascending: false});

            if (roomsError) throw roomsError;
            if (!rooms?.length) return;

            const {data:messages, error:messagesError} = await supabase
                .from('messages')
                .select('id, text, created_at, room_id, profiles(username)')
                .in('room_id', rooms.map(r=>r.id))
                .order('created_at', {ascending: false});

                if (messagesError) throw messagesError;

                const roomsWithLastMessage = rooms.map(room => ({
                    ...room,
                    lastMessage: messages.find(m=>m.room_id === room.id)
                }));
                console.log('processed rooms: ', roomsWithLastMessage);
                setRooms(roomsWithLastMessage);
          } catch (error) {
                console.error('Fetch error: ', error);
          }
        };
    
        fetchRooms();
    
        const channel = supabase
          .channel('rooms_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages' },
            fetchRooms
          )
          .subscribe();
    
        return () => supabase.removeChannel(channel);
      }, []);

      const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Logout error:', error);
            } else {
                router.push('/login');
            }
        } catch (err) {
            console.error('Unexpected error during logout:', err);
        }
    };

    return (
        <div className='p-4 space-y-2'>
            <h2 className='font-bold mb-4'>All Rooms</h2>
            {rooms?.map((room) => (
                <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-100 hover:text-black transition-colors"
                >
                    <div className='font-medium'>{room.name}</div>
                    {room.messages?.length > 0 && (
                        <div className='text-sm text-gray-600 truncate'>
                            <span className='font-semibold'>
                                {room.messages[0].profiles?.username || 'Anonymous'}:
                            </span>
                            {' '}{room.messages[0].text}
                        </div>
                    )}
                </Link>
            ))}

            <div className='mt-auto pt-90'>
                <button onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </div>
    )

}