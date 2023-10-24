import { Player } from "@/types/player";

export default function PlayerList({
    players,
    self,
    onInvite,
    onAccept,
    invitedBy,
    sentInvites,
}: {
    players: Player[];
    self: Player | null;
    onInvite: (username: string) => void;
    onAccept: (username: string) => void;
    invitedBy: { [username: string]: boolean };
    sentInvites: { [username: string]: boolean };
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
                        {self && (
                            <>
                                {self.username != player.username && (
                                    <>
                                        {invitedBy[player.username] ? (
                                            <button
                                                onClick={() =>
                                                    onAccept(player.username)
                                                }
                                                className="px-3 py-1 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                                            >
                                                Accept Invite
                                            </button>
                                        ) : sentInvites[player.username] ? (
                                            <p className="text-indigo-500 font-semibold text-sm">
                                                Invite Sent
                                            </p>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    onInvite(player.username)
                                                }
                                                className="px-3 py-1 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                                            >
                                                Invite
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
        </div>
    );
}
