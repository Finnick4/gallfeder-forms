import {type ReactNode, type RefObject, useRef} from "react";
import "./Button.css";
import {useNavigate} from "react-router-dom";

interface Properties {
    styleType: "primary" | "secondary" | "accent" | "element" | "no-styling"
    className?: string
    ref?: RefObject<HTMLButtonElement | null>
    onClick?: () => void
    onFocus?: () => void
    href?: string
    children: ReactNode | ReactNode[]
    disabled?: boolean
    title?: string
}

export const Button = ({onClick, onFocus, title, className, href, ref, children, styleType = "secondary", disabled = false}: Properties) => {
    const nav = useNavigate();

    const elemRef = useRef<HTMLButtonElement>(null);
    const elem = ref == undefined ? elemRef : ref;

    if (href) {
        return (
            <a
                className={className ? `button ${styleType} ${className}` : `button ${styleType}`}
                onClick={e => {
                    e.preventDefault();
                    nav(href);
                    if (onClick) {
                        onClick()
                    }
                }}
                title={title}
                href={href}
                onFocus={onFocus}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            className={className ? `button ${styleType} ${className}` : `button ${styleType}`}
            onClick={onClick}
            ref={elem}
            title={title}
            disabled={disabled}
            onFocus={onFocus}
        >
            {children}
        </button>
    );
}