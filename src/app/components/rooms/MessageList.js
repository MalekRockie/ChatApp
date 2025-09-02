'use client'

import {useCallback, useEffect, useRef, useState} from 'react';
import supabase from "@/lib/supabase";

export default function MessageList({messages, roomId, onNewMessages, onLoadMoreMessages, user}){
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const scrollContainerRef = useRef(null);
    const [shouldMaintainScrollPosition, setShouldMaintainScrollPosition] = useState(false);
    const [initialScrollSet, setInitialScrollSet] = useState(false);

    const MESSAGES_PER_PAGE = 20;
    const SCROLL_THRESHOLD = 50;

    useEffect(() => {
        let channel;

        const setupSubscription = () => {
            if (channel) {
                supabase.removeChannel(channel);
            }

            channel = supabase
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
                        console.log('New message received', payload);
                        
                        const {data: profile } = await supabase
                            .from('profiles')
                            .select('username, user_id, avatar_url')
                            .eq('user_id', payload.new.user_id)
                            .single()

                        const messageWithProfile = {
                            ...payload.new,
                            profiles: {
                                user_id: payload.new.user_id,
                                username : profile?.username,
                                avatar_url: profile?.avatar_url
                            }
                        };
                        onNewMessages(messageWithProfile);
                    }
                )
                .subscribe((status) => {
                    if (status === 'CLOSED') {
                        setTimeout(setupSubscription, 1000);
                    }
                });
        };

        setupSubscription();

        return()=> {
            if (channel){
                supabase.removeChannel(channel);
            }
        };
    }, [roomId, onNewMessages]);

    const loadMoreMessages = useCallback(async () => {
        if (isLoadingMore || !hasMoreMessages || !messages.length) {
            console.log('loadMoreMessages blocked:', {isLoadingMore, hasMoreMessages, messagesLength: messages.length});
            return;
        } 

        console.log('Loading more messages...');
        setIsLoadingMore(true);
        setShouldMaintainScrollPosition(true);

        try {
            const oldestMessage = messages[0];
            console.log('Oldest message:', oldestMessage);

            const { data: olderMessages, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    text,
                    created_at,
                    user_id,
                    room_id,
                    profiles!fk_user (
                        username,
                        user_id,
                        avatar_url
                    )
                `)
                .eq('room_id', roomId)
                .lt('created_at', oldestMessage.created_at)
                .order('created_at', {ascending: false})
                .limit(MESSAGES_PER_PAGE)
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Raw older messages from DB:', olderMessages?.length);

            if (olderMessages && olderMessages.length > 0){
                const chronologicalMessages = olderMessages.reverse();
                onLoadMoreMessages(chronologicalMessages);

                if (olderMessages.length < MESSAGES_PER_PAGE) {
                    setHasMoreMessages(false);
                    console.log('No more messages to load');
                }
            } else {
                setHasMoreMessages(false);
                console.log('No older messages found');
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setIsLoadingMore(false);
            setTimeout(() => setShouldMaintainScrollPosition(false), 300);
        }
    }, [messages, roomId, isLoadingMore, hasMoreMessages, onLoadMoreMessages]);

    const handleScroll = useCallback((e) => {
        const { scrollTop } = e.target;

        if (scrollTop <= SCROLL_THRESHOLD && hasMoreMessages && !isLoadingMore) {
            console.log('Triggering load more at scroll position:', scrollTop);
            loadMoreMessages();
        }
    }, [loadMoreMessages, hasMoreMessages, isLoadingMore]);

    useEffect(() => {
        if (!initialScrollSet && messages.length > 0 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            console.log('Setting initial scroll to bottom');
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
                setInitialScrollSet(true); 
            });
        }
    }, [messages.length, initialScrollSet]);

    useEffect(() => {
        if (shouldMaintainScrollPosition && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const prevScrollHeight = container.scrollHeight;

            requestAnimationFrame(() => {
                if (container) {
                    const newScrollHeight = container.scrollHeight;
                    const heightDifference = newScrollHeight - prevScrollHeight;
                    container.scrollTop += heightDifference;
                    console.log('Maintained scroll position. Height diff:', heightDifference);
                }
            });
        }
    }, [messages, shouldMaintainScrollPosition]);

    useEffect(() => {
        if (initialScrollSet && !shouldMaintainScrollPosition && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

            console.log('New message scroll check:', { isNearBottom, scrollTop, scrollHeight, clientHeight });

            if (isNearBottom) {
                console.log('User was near bottom, auto-scrolling for new message');
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight;
                });
            } else {
                console.log('User was not near bottom, not auto-scrolling');
            }
        }
    }, [messages, shouldMaintainScrollPosition, initialScrollSet]);

    return(
        <div
            ref={scrollContainerRef} 
            className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 flex flex-col"
            onScroll={handleScroll}
        >
            {isLoadingMore && (
                <div className='flex justify-center py-2'>
                    <div className='w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
                </div>
            )}

            {messages?.map((message) => {
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