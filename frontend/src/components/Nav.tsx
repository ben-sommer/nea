export default function Nav() {
    return (
        <div className="h-16 px-8 bg-indigo-500 text-white font-medium w-full flex items-center justify-center">
            <div className="flex items-center justify-between max-w-6xl w-full">
                <p className="font-semibold text-xl flex items-center gap-2">
                    <img src="/logo.png" className="h-7" alt="" /> Reversi
                </p>
                <div className="flex items-center gap-4">
                    <p>Online Multiplayer</p>
                    <p>Local Multiplayer</p>
                    <p>Player vs AI</p>
                </div>
            </div>
        </div>
    );
}
