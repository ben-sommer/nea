import { ReactNode } from "react";

export default function Container({
    children,
    ...props
}: {
    children: ReactNode;
    [x: string]: any;
}) {
    return (
        <div
            {...props}
            className={`max-w-6xl w-full mx-auto ${props.className || ""}`}
        >
            {children}
        </div>
    );
}
