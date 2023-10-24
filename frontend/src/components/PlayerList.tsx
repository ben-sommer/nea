import { Player } from "@/types/player";

export default function PlayerList({
    players,
    self,
}: {
    players: Player[];
    self: Player | null;
}) {
    return (
        <div className="flex flex-col gap-2">
            {players
                .sort((a, b) => a.username.localeCompare(b.username))
                .map((player) => (
                    <div
                        className="flex items-center gap-2"
                        key={player.username}
                    >
                        <p className="h-8 w-8 rounded-full bg-indigo-500 font-semibold text-sm text-white flex items-center justify-center tracking-wider">
                            {player.firstName.slice(0, 1)}
                            {player.lastName.slice(0, 1)}
                        </p>
                        <p>
                            {player.firstName} {player.lastName} (
                            {player.username})
                        </p>
                        {self && self.username == player.username && (
                            // <p className="text-indigo-500 flex items-center justify-center font-semibold">
                            //     You
                            // </p>
                            <p className="bg-indigo-500 h-8 px-3 flex items-center justify-center text-white text-sm rounded-full font-semibold">
                                You
                            </p>
                        )}
                    </div>
                ))}
        </div>
    );
}
