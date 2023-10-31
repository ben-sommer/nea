import { useState } from "react";

export default function Rules() {
    const [shown, setShown] = useState(false);

    return (
        <div className="my-2">
            <span
                onClick={() => setShown(!shown)}
                className="px-4 py-2 rounded-md text-white bg-indigo-500 shadow-md text-sm font-medium outline-none cursor-pointer select-none"
            >
                {shown ? "Hide" : "Show"} Rules
            </span>
            {shown && (
                <ol className="max-w-3xl list-decimal text-left px-8 select-none mt-4">
                    <li className="mb-1">
                        Each turn, you must place one counter of your colour
                        onto the board.
                    </li>
                    <li className="mb-1">
                        You must place this adjacent (or diagonal) to one of
                        your opponent&apos;s counters so that a line of their
                        colour is bounded on both ends by an existing counter of
                        your colour and the one you are placing.
                    </li>
                    <li className="mb-1">
                        These trapped counters in between are flipped to your
                        colour. Multiple rows of counters can be flipped on a
                        single turn.
                    </li>
                    <li className="mb-1">
                        If you cannot go, play goes to your opponent. If they
                        cannot go either the game is over.
                    </li>
                    <li className="mb-1">
                        The winner is the player with the most counters of their
                        colour on the board by the end of the game.
                    </li>
                </ol>
            )}
        </div>
    );
}
