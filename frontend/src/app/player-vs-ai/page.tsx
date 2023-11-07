import Container from "@/components/Container";
import PlayerVsAI from "./PlayerVsAI";

export default function Page() {
    return (
        <Container className="text-center pt-8">
            <p className="text-2xl font-semibold text-center mb-4">
                Player vs AI
            </p>
            <PlayerVsAI />
        </Container>
    );
}
