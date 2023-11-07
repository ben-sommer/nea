import Container from "@/components/Container";
import LocalMultiplayer from "./LocalMultiplayer";

export default function Page() {
    return (
        <Container className="text-center pt-8">
            <p className="text-2xl font-semibold text-center mb-4">
                Local Multiplayer
            </p>
            <LocalMultiplayer />
        </Container>
    );
}
