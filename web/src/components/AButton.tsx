import {useNavigate} from "react-router-dom";
import type {ReactNode} from "react";

interface Properties {
    href: string
    children: ReactNode | ReactNode[]
    className?: string
}

export const AButton = ({href, children, className}: Properties) => {
    const nav = useNavigate()
    return (
        <a
            className={className ? className + " button" : "button"}
            onClick={e => {
                e.preventDefault();
                nav(href);
            }}
            href={href}
        >
            {children}
        </a>
    );
}