import supabase from "@/lib/supabase";
import ChatView from '../../components/rooms/ChatView'

export default async function RoomPage({ params }) {
    // const { roomId } = params.roomsId;

    const { data: messages } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('room_id', params.roomId)
      .order('created_at', { ascending: true });
    console.log('Inintial messages fetch: ', messages);
    console.log("Room ID o:", params.roomId);
    const { data: { user } } = await supabase.auth.getUser();
    console.log("user: ", user);
    // console.log('Fetch error: ', error);
    return <ChatView initialMessages={messages} roomId={params.roomId} />;
  }