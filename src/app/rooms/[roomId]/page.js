import supabase from "@/lib/supabase";
import ChatView from '../../components/rooms/ChatView'

export default async function RoomPage({ params }) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*, profiles!fk_user (username, user_id, avatar_url)')
      .eq('room_id', params.roomId)
      .order('created_at', { ascending: true });
    return <ChatView initialMessages={messages} roomId={params.roomId} />;
  }