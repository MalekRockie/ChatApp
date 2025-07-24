import Sidebar from '../components/rooms/Sidebar'


export default function RoomsLayout({children}) {
    return(
        <div className="flex h-screen">
            <div className="w-70">
                <Sidebar/>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}