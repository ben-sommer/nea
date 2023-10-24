import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function SignIn({ onSuccess }: { onSuccess: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [cookies, setCookie] = useCookies(["token"]);

    const submit = async () => {
        if (!username) {
            setError("Please enter your username");
            return;
        }

        if (!password) {
            setError("Please enter your password");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_ADDRESS}/signin`,
                {
                    username,
                    password,
                }
            );

            const { token } = response.data;

            setCookie("token", token);

            setError("");

            onSuccess();
        } catch (e) {
            setError("Please check your login information");
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full max-w-[16rem]">
            <div className="flex flex-col gap-1 items-start">
                <label
                    className="block text-sm font-semibold"
                    htmlFor="username"
                >
                    Username
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            submit();
                        }
                    }}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500 w-full"
                    placeholder="john.doe"
                />
            </div>

            <div className="flex flex-col gap-1 items-start">
                <label
                    className="block text-sm font-semibold"
                    htmlFor="password"
                >
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            submit();
                        }
                    }}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500 w-full"
                    placeholder="********"
                />
            </div>

            <div>
                <button
                    onClick={submit}
                    className="px-4 py-2 rounded-md text-white bg-indigo-500 shadow-md text-sm font-medium outline-none cursor-pointer w-full mt-2 focus:ring ring-indigo-700"
                >
                    Sign In
                </button>
            </div>

            {error && (
                <p className="text-red-500 font-medium text-left text-sm mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}
