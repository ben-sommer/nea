import { Player } from "@/types/player";
import { Game } from "./game";

export class OnlineGame extends Game {
    sendMessage: (event: string, body?: any) => void;
    forfeitedBy: string | null;

    constructor(sendMessage: (event: string, body?: any) => void) {
        super();

        this.sendMessage = sendMessage;
        this.forfeitedBy = null;
    }

    handleSquareClick(x: number, y: number): boolean {
        this.send("game:move", {
            x,
            y,
        });

        return false;
    }

    send(event: string, body?: any) {
        this.sendMessage(JSON.stringify([event].concat([body] || [])));
    }
}
