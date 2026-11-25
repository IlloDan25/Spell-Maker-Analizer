export function getRadialSignIndices(amount: number, skipped = 0): number[] {
    const safeAmount = Math.max(1, Math.floor(amount));
    const safeSkipped = Math.min(safeAmount - 1, Math.max(0, Math.floor(skipped)));
    const drawnAmount = safeAmount - safeSkipped;

    if (drawnAmount === safeAmount) {
        return Array.from({ length: safeAmount }, (_, index) => index);
    }

    return Array.from({ length: drawnAmount }, (_, index) => {
        return Math.round((index * safeAmount) / drawnAmount);
    });
}
