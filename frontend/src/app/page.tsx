import Container from "@/components/Container";
import {
    IoGlobeOutline,
    IoPeopleOutline,
    IoPersonOutline,
} from "react-icons/io5";

export default function Home() {
    return (
        <Container>
            <div className="mt-40 mb-4 flex gap-4 font-medium justify-center items-stretch">
                <div className="text-center">
                    <p>Compete online</p>
                    <div className="flex gap-2 justify-stretch text-indigo-600 mt-2 select-none">
                        <div className="w-48 py-6 justify-center rounded-lg border-2 flex items-center flex-col gap-1 border-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                            <IoGlobeOutline className="text-2xl" />
                            <p>Player vs Player</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <p className="mt-6 select-none">or</p>
                </div>
                <div className="text-center">
                    <p>Practice offline</p>
                    <div className="flex gap-2 justify-stretch text-indigo-600 mt-2 select-none">
                        <div className="w-48 py-6 justify-center rounded-lg border-2 flex items-center flex-col gap-1 border-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                            <IoPeopleOutline className="text-2xl" />
                            <p>Player vs Player</p>
                        </div>
                        <div className="w-48 py-6 justify-center rounded-lg border-2 flex items-center flex-col gap-1 border-indigo-500 hover:bg-indigo-500 hover:text-white cursor-pointer">
                            <IoPersonOutline className="text-2xl" />
                            <p>Player vs AI</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
