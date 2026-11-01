import {type RefObject, useEffect, useRef} from "react";
import "./FittingTextArea.css";

interface Properties {
    initialValue: string
    onLeave: (val: string) => void
    className: string
    ref?: RefObject<HTMLTextAreaElement | null>
    onFocus?: () => void
}

export const FittingTextArea = ({initialValue, className, onLeave, ref, onFocus}: Properties) => {
    const elem = ref == undefined  ? useRef<HTMLTextAreaElement>(null) : ref;

    const resize = () => {
        if (elem.current == null) {
            return;
        }
        elem.current.style.height = "1px";
        elem.current.style.height = `calc(${elem.current.scrollHeight + "px"} - 1.5rem)`;
    }

    useEffect(() => {
        if (elem.current) {
            elem.current.defaultValue = initialValue;
        }
    }, [initialValue]);

    resize();

    return (
        <textarea
            className={className}
            defaultValue={initialValue}
            onChange={resize}
            ref={elem}
            onFocus={onFocus}
            onBlur={e => onLeave(e.target.value)}
        >
        </textarea>
    );
}

export default FittingTextArea