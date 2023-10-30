import { ServerGame } from "@/types/game";
import { IoGameController, IoGameControllerOutline } from "react-icons/io5";

export default function GameList({
    games,
    onSpectate,
}: {
    games: ServerGame[];
    onSpectate: (game: ServerGame) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            {games
                .sort((a, b) => a.black.localeCompare(b.black))
                .map((game) => (
                    <div
                        className="flex items-center gap-2"
                        key={`${game.black} ${game.white}`}
                    >
                        <p className="h-8 w-8 rounded-full bg-indigo-500 font-semibold text-sm text-white flex items-center justify-center tracking-wider">
                            <IoGameController className="text-xl" />
                        </p>
                        <p>
                            {game.black} vs {game.white}
                        </p>
                        <button
                            onClick={() => onSpectate(game)}
                            className="px-3 py-1 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                        >
                            Spectate
                        </button>
                    </div>
                ))}
        </div>
    );
}
