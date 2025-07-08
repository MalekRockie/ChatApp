// 'use client';
import Link from "next/link";

export default function RoomList({ rooms }){

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
                <Link
                    key={rooms.id}
                    href={`/rooms/${room.id}`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h2 className="font-semibold">{room.name}</h2>
                    <p className="text-sm text-gray-500">
                        last active
                        {/* Last active: {new Date(room.created_at).toLocalString()} */}
                    </p>
                </Link>
            ))}
        </div>
    );
}