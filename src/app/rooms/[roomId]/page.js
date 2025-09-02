import supabase from "@/lib/supabase";
import ChatView from '../../components/rooms/ChatView'

export default async function RoomPage({ params }) {
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*, profiles!fk_user (username, user_id, avatar_url)')
    .eq('room_id', params.roomId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  const initialMessages = recentMessages?.reverse() || [];
  
  return <ChatView initialMessages={initialMessages} roomId={params.roomId} />;
}