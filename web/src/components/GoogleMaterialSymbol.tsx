import type {AllowedGoogleMaterialSymbol} from "../shared/types.ts";
import "./GoogleMaterialSymbols.css";

interface Properties {
    iconName: AllowedGoogleMaterialSymbol
    filled?: boolean
}

export const GoogleMaterialSymbol = ({iconName, filled}: Properties) => {
    return (
        <span
            className={"material-symbols-outlined icon" + (iconName == "progress_activity" ? " spinning" : "")}
            style={{fontVariationSettings: `'FILL' ${filled ? 1 : 0}`, rotate: iconName == "vertical_bar_chart" ? "z 90deg" : "none"}}
        >
            {iconName == "vertical_bar_chart" ? "bar_chart" : iconName}
        </span>
    );
}