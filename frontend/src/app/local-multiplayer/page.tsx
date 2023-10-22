import Board from "@/components/Board";
import Container from "@/components/Container";
import LocalMultiplayer from "./LocalMultiplayer";

export default function Page() {
    return (
        <Container className="text-center pt-8">
            <LocalMultiplayer />
        </Container>
    );
}
