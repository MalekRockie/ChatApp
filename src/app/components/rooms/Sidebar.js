'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../lib/supabase';

export default function Sidebar() {
    const [rooms, setRooms] = useState([]);
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('user_id', user.id)
                    .single();
                
                setUser({
                    ...user,
                    username: profile?.username || 'Anonymous'
                });
            }
        };

        fetchUser();

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
        <div className='h-full flex flex-col'>
            <div className='p-4'>
                <h2 className='text-lg font-thin text-gray-300'>Rooms</h2>
            </div>

            <div className='flex-1 overflow-y-auto p-2'>
                {rooms?.map((room) => (
                    <Link
                        key={room.id}
                        href={`/rooms/${room.id}`}
                        className="block p-3 mb-2 cursor-pointer rounded-lg hover:bg-slate-800 transition-colors border-transparent hover:border-blue-900"
                    >
                        {/* Room Name */}
                        <div className='text-gray-300 mb-1'>
                            {room.name}
                        </div>
                        
                        {/* Last Message Preview */}
                        {room.lastMessage ? (
                            <div className='text-sm text-gray-400'>
                                <span className='font-medium text-gray-400'>
                                    {room.lastMessage.profiles?.username || 'Anonymous'}
                                </span>
                                <span className='text-gray-500'>: </span>
                                <span className='inline-block max-w-[180px]'>
                                    {room.lastMessage.text}
                                </span>
                            </div>
                        ) : (
                            <div className='text-sm text-gray-400 italic'>
                                No messages yet
                            </div>
                        )}
                    </Link>
                ))}

                {rooms.length === 0 && (
                    <div className='p-4 text-center text-gray-500'>
                        <p>No rooms available</p>
                    </div>
                )}
            </div>

            <div className='p-4 relative'>
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className='w-full flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors'
                >
                    <div className='flex items-center space-x-2'>
                        <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm'>
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <span className='font-medium text-gray-300'>
                            {user?.username || 'Anonymous'}
                        </span>
                    </div>
                    <svg 
                        className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showUserMenu && (
                    <div className='absolute bottom-full left-4 right-4 text-sm bg-zinc-800 hover:bg-zinc-700  rounded-lg shadow-lg py-1'>
                        <button 
                            onClick={handleLogout}
                            className='w-full text-left px-4 py-2 text-white-600 transition-colors cursor-pointer'
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}