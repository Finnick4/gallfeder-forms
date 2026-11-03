import {type RefObject, useCallback, useEffect, useRef} from "react";
import "./FittingTextArea.css";

interface Properties {
    initialValue: string
    onLeave: (val: string) => void
    className: string
    ref?: RefObject<HTMLTextAreaElement | null>
    onFocus?: () => void
    placeholder?: string
}

export const FittingTextArea = ({initialValue, className, onLeave, ref, onFocus, placeholder}: Properties) => {
    const elemRef = useRef<HTMLTextAreaElement>(null);
    const elem = ref == undefined ? elemRef : ref;

    const resize = useCallback(() => {
        if (elem.current == null) {
            return;
        }
        elem.current.style.height = "1px";
        elem.current.style.height = `calc(${elem.current.scrollHeight + "px"} - 1.5rem)`;
    }, [elem])

    useEffect(() => {
        if (elem.current) {
            elem.current.defaultValue = initialValue.replaceAll("\\n", "\n");
        }
        resize();
    }, [elem, initialValue, resize]);

    return (
        <textarea
            className={className}
            defaultValue={initialValue.replaceAll("\\n", "\n")}
            onChange={resize}
            ref={elem}
            onFocus={onFocus}
            placeholder={placeholder ?? ""}
            onBlur={e => onLeave(e.target.value)}
        >
        </textarea>
    );
}
