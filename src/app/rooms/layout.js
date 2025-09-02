import Sidebar from '../components/rooms/Sidebar'


export default function RoomsLayout({children}) {
    return(
        <div className="flex h-screen">
            <div className="w-64">
                <Sidebar/>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}