
interface Properties {
    iconName: "arrow_back" | "bar_chart" | "how_to_vote" | "question_mark" | "table"
    filled?: boolean
}

export const GoogleMaterialSymbol = ({iconName, filled}: Properties) => {
    return (
        <span
            className="material-symbols-outlined"
            style={{fontVariationSettings: `FILL ${filled ? 1 : 0}`}}
        >
            {iconName}
        </span>
    );
}