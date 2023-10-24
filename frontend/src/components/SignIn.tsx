import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function SignIn({
    onSuccess,
    signInError,
}: {
    onSuccess: (token: string) => void;
    signInError: string;
}) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [isRegistering, setIsRegistering] = useState(false);

    const [cookies, setCookie] = useCookies(["token"]);

    const submit = async () => {
        if (isRegistering) {
            if (!firstName) {
                setError("Please enter your first name");
                return;
            }

            if (!lastName) {
                setError("Please enter your last name");
                return;
            }
        }

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
                `${process.env.NEXT_PUBLIC_API_ADDRESS}/${
                    isRegistering ? "register" : "signin"
                }`,
                {
                    username,
                    password,
                    ...(isRegistering
                        ? {
                              firstName,
                              lastName,
                          }
                        : {}),
                }
            );

            const { token } = response.data;

            setCookie("token", token);

            setError("");

            onSuccess(token);
        } catch (e: any) {
            console.log(e);
            setError(
                isRegistering
                    ? "Please choose another username"
                    : signInError || e.response.data || ""
            );
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full max-w-[16rem]">
            {isRegistering && (
                <>
                    <div className="flex flex-col gap-1 items-start">
                        <label
                            className="block text-sm font-semibold"
                            htmlFor="username"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key == "Enter") {
                                    submit();
                                }
                            }}
                            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm outline-none focus:ring-2 ring-indigo-500 w-full"
                            placeholder="John"
                        />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                        <label
                            className="block text-sm font-semibold"
                            htmlFor="lastName"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key == "Enter") {
                                    submit();
                                }
                            }}
                            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm outline-none focus:ring-2 ring-indigo-500 w-full"
                            placeholder="Doe"
                        />
                    </div>
                </>
            )}
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
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm outline-none focus:ring-2 ring-indigo-500 w-full"
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
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm outline-none focus:ring-2 ring-indigo-500 w-full"
                    placeholder="********"
                />
            </div>

            <div>
                <button
                    onClick={submit}
                    className="px-4 py-2 rounded-md text-white bg-indigo-500 shadow-md text-sm font-medium outline-none cursor-pointer w-full mt-2 focus:ring ring-indigo-700"
                >
                    {isRegistering ? "Register" : "Sign In"}
                </button>
            </div>

            <div>
                {isRegistering ? (
                    <p className="text-sm text-left">
                        Already have an account?{" "}
                        <span
                            onClick={() => setIsRegistering(false)}
                            className="text-indigo-500 font-medium cursor-pointer"
                        >
                            Sign In
                        </span>
                    </p>
                ) : (
                    <p className="text-sm text-left">
                        No account?{" "}
                        <span
                            onClick={() => setIsRegistering(true)}
                            className="text-indigo-500 font-medium cursor-pointer"
                        >
                            Register
                        </span>
                    </p>
                )}
            </div>

            {error && (
                <p className="text-red-500 font-medium text-left text-sm mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}
