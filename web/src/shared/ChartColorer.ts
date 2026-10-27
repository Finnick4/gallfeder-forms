

const DEFINED_COLORS = 8;

export class ChartColorer {
    private index: number;

    constructor() {
        this.index = 0;
    }

    public getColor(): string {
        return `var(--chart-color-${this.index++ % DEFINED_COLORS})`;
    }
}