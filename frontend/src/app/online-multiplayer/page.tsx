import Container from "@/components/Container";
import OnlineMultiplayer from "./OnlineMultiplayer";

export default function Page() {
    return (
        <Container className="text-center pt-8">
            <p className="text-2xl font-semibold text-center mb-4">
                Online Multiplayer
            </p>
            <OnlineMultiplayer />
        </Container>
    );
}
