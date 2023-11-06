import { Leaderboard } from "@/types/leaderboard";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<Leaderboard>([]);

    useEffect(() => {
        (async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_ADDRESS}/leaderboard`
            );

            setLeaderboard(response.data);
        })();
    }, []);

    return (
        <table className="rounded-md overflow-hidden block border border-gray-300 bg-indigo-500">
            <thead className="text-sm text-white">
                <tr>
                    <th className="px-4 py-1 font-semibold">User</th>
                    <th className="px-4 py-1 font-semibold">Games</th>
                    <th className="px-4 py-1 font-semibold">Wins</th>
                    <th className="px-4 py-1 font-semibold">Draws</th>
                    <th className="px-4 py-1 font-semibold">Losses</th>
                    <th className="px-4 py-1 font-semibold">Win %</th>
                </tr>
            </thead>
            <tbody>
                {leaderboard.map((row) => {
                    const games = row.Wins + row.Draws + row.Losses;

                    return (
                        <tr
                            className="bg-white rounded-md border-t border-gray-100 text-sm"
                            key={row.User}
                        >
                            <td className="py-1 px-2 font-semibold">
                                {row.User}
                            </td>
                            <td className="py-1">{games}</td>
                            <td className="py-1">{row.Wins}</td>
                            <td className="py-1">{row.Draws}</td>
                            <td className="py-1">{row.Losses}</td>
                            <td className="py-1">
                                {Math.round((row.Wins / games) * 100)}%
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
