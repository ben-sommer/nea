import Link from "next/link";

export default function Nav() {
    return (
        <div className="h-16 px-8 bg-indigo-500 text-white font-medium w-full flex items-center justify-center">
            <div className="flex items-center justify-between max-w-6xl w-full">
                <Link href="/">
                    <p className="font-semibold text-xl flex items-center gap-2">
                        <img src="/logo.png" className="h-7" alt="" /> Reversi
                    </p>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/online-multiplayer">
                        <p>Online Multiplayer</p>
                    </Link>
                    <Link href="/local-multiplayer">
                        <p>Local Multiplayer</p>
                    </Link>
                    <Link href="/player-vs-ai">
                        <p>Player vs AI</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
