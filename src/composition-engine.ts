import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell";

export type EffectIntent = "strength" | "fire" | "water" | "earth" | "wind" | "light" | "flight" | "rain" | "break" | "restore" | "reduce" | "expand" | "conceal" | "movement" | "purify" | "summon" | "unknown";
export type RefinementMode = "balanced" | "simpler" | "symmetric" | "compact" | "powerful";

export interface ParsedEffect {
    intent: EffectIntent;
    target: "self" | "object" | "area" | "unknown";
    direction: "none" | "inward" | "outward" | "upward" | "downward";
    polarity: "normal" | "inverted";
    quantity: "small" | "medium" | "large";
    label: string;
}

export interface CompositionCandidate {
    name: string;
    evidence: string;
    caveat: string;
    seals: SpellType["seals"];
    score: number;
}

const intentRules: Array<[EffectIntent, RegExp]> = [
    ["strength", /\b(?:strong|stronger|strength|durable|unbreakable|indestructible|invulnerable|resist|harden|fortify|fortaleza|irrompible|resistente|indestructible|protege[r]?|fuerte)\b/],
    ["fire", /\b(?:fire|flame|burn|heat|ignite|fuego|llama|calor|quemar)\b/],
    ["water", /\b(?:water|agua|wet|moist|hielo|ice|cold)\b/],
    ["earth", /\b(?:earth|ground|stone|rock|sand|soil|tierra|roca|arena|piedra|s[oó]lido)\b/],
    ["wind", /\b(?:wind|air|breeze|viento|aire)\b/],
    ["light", /\b(?:light|glow|shine|luz|brillo|brillar|iluminar)\b/],
    ["flight", /\b(?:fly|flight|levitate|levitation|float|hover|volar|vuelo|levitar|flotar)\b/],
    ["rain", /\b(?:rain|raining|lluvia|llover|llueva|llueve)\b/],
    ["break", /\b(?:break|crush|pulverize|desintegr|destroy|romper|pulverizar|aplasta[r]?|destrozar)\b/],
    ["restore", /\b(?:restore|repair|reassemble|restaurar|recomponer|reconstruir|rearmar)\b/],
    ["reduce", /\b(?:shrink|reduce|miniature|encog|reducir|peque(?:n|ñ)o|disminuir)\b/],
    ["expand", /\b(?:expand|enlarge|grow|bigger|larger|agrandar|expandir|crecer|aumentar)\b/],
    ["conceal", /\b(?:conceal|hide|shadow|cloak|ocultar|esconder|sombra|camuflar)\b/],
    ["movement", /\b(?:move|motion|puppet|pull|toward|mover|movimiento|controlar|dirigir|atraer|jalar)\b/],
    ["purify", /\b(?:purify|clean|wash|purificar|limpiar|basura|desperdicio)\b/],
    ["summon", /\b(?:summon|create|generate|summon|invocar|crear|generar|aparecer)\b/],
];

function normalizeText(text: string): string {
    return text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

export function parseEffect(effect: string): ParsedEffect {
    const normalized = normalizeText(effect);

    let priorityIntent: EffectIntent | null = null;
    if (/\b(?:purify|clean|wash|purificar|limpiar|desperdicio)\b/.test(normalized)) priorityIntent = "purify";
    else if (/\b(?:restore|repair|reassemble|restaurar|recomponer|reconstruir)\b/.test(normalized)) priorityIntent = "restore";
    else if (/\b(?:shrink|reduce|miniature|encoger|reducir|pequeno)\b/.test(normalized)) priorityIntent = "reduce";
    else if (/\b(?:expand|enlarge|grow|agrandar|expandir|crecer|aumentar)\b/.test(normalized)) priorityIntent = "expand";
    else if (/\b(?:fly|flight|levitate|float|hover|volar|vuelo|levitar|flotar)\b/.test(normalized)) priorityIntent = "flight";
    else if (/\b(?:rain|lluvia|llover|llueva|llueve)\b/.test(normalized)) priorityIntent = "rain";
    else if (/\b(?:break|crush|pulverize|destroy|romper|pulverizar|destrozar)\b/.test(normalized)) priorityIntent = "break";

    const first = priorityIntent
        ? ([priorityIntent, /(?:)/] as [EffectIntent, RegExp])
        : intentRules.find(([, pattern]) => pattern.test(normalized));

    let target: ParsedEffect["target"] = "unknown";
    if (/\b(?:it|this|that|me|my|sword|shield|armor|object|weapon|espada|escudo|armadura|objeto|mi)\b/.test(normalized)) target = /\b(?:it|this|that|object|weapon|sword|shield|armor|objeto|espada|escudo|armadura|mi)\b/.test(normalized) ? "object" : "self";
    if (/\b(?:area|zone|room|field|around|zona|campo|alrededor)\b/.test(normalized)) target = "area";

    let direction: ParsedEffect["direction"] = "none";
    if (/\b(?:inward|inside|pull|into|hacia dentro|interior)\b/.test(normalized)) direction = "inward";
    else if (/\b(?:outward|outside|push|away|hacia fuera|exterior)\b/.test(normalized)) direction = "outward";
    else if (/\b(?:up|upward|above|rise|arriba|eleva)\b/.test(normalized)) direction = "upward";
    else if (/\b(?:down|downward|below|drop|abajo)\b/.test(normalized)) direction = "downward";

    const polarity: ParsedEffect["polarity"] = /\b(?:opposite|invert|inverted|cancel|negat|contrario|invertido)\b/.test(normalized) ? "inverted" : "normal";
    const quantity: ParsedEffect["quantity"] = /\b(?:many|several|massive|huge|lot|muchos|grande|masivo)\b/.test(normalized)
        ? "large"
        : /\b(?:few|small|tiny|little|pocos|pequeno)\b/.test(normalized)
            ? "small"
            : "medium";

    return {
        intent: first?.[0] ?? "unknown",
        target,
        direction,
        polarity,
        quantity,
        label: effect.trim().slice(0, 48) || "Experimental spell",
    };
}

interface IntentProfile {
    sigils: string[];
    signs: string[];
    layoutBias: Array<"radial" | "bilateral" | "nested" | "manual" | "linked">;
}

const profiles: Record<EffectIntent, IntentProfile> = {
    strength: { sigils: ["sigil_Earth", "sigil_Repetition"], signs: ["sign_Empower", "sign_Solidify", "sign_Stability", "sign_Bind"], layoutBias: ["radial", "bilateral", "nested"] },
    fire: { sigils: ["sigil_Fire", "sigil_Light"], signs: ["sign_Launch", "sign_Dispersion", "sign_Column", "sign_Heat"], layoutBias: ["directional" as never, "radial", "bilateral"] },
    water: { sigils: ["sigil_Water", "sigil_Undulation"], signs: ["sign_Column", "sign_Holding", "sign_Orb", "sign_Dispersion"], layoutBias: ["radial", "bilateral", "nested"] },
    earth: { sigils: ["sigil_Earth", "sigil_Sand", "sigil_Bridging"], signs: ["sign_Solidify", "sign_Stability", "sign_Immobility", "sign_Crush"], layoutBias: ["radial", "bilateral", "manual"] },
    wind: { sigils: ["sigil_Wind", "sigil_Whorling Winds", "sigil_Aeriforms"], signs: ["sign_Dispersion", "sign_Launch", "sign_Wind", "sign_Levitation"], layoutBias: ["radial", "directional" as never, "manual"] },
    light: { sigils: ["sigil_Light", "sigil_Flickering Light"], signs: ["sign_Launch", "sign_Dispersion", "sign_Projection", "sign_Focus"], layoutBias: ["radial", "bilateral", "linked"] },
    flight: { sigils: ["sigil_Wind Underfoot", "sigil_Wind"], signs: ["sign_Levitation", "sign_Stability", "sign_Column"], layoutBias: ["bilateral", "radial", "linked"] },
    rain: { sigils: ["sigil_Water"], signs: ["sign_Rain", "sign_Dispersion", "sign_Column"], layoutBias: ["radial", "bilateral", "nested"] },
    break: { sigils: ["sigil_Earth", "sigil_Sword"], signs: ["sign_Crush", "sign_Column", "sign_Piercing"], layoutBias: ["bilateral", "directional" as never, "radial"] },
    restore: { sigils: ["sigil_Earth", "sigil_Repetition"], signs: ["sign_Crush", "sign_Convergence", "sign_Bind"], layoutBias: ["nested", "radial", "bilateral"] },
    reduce: { sigils: ["sigil_Repetition"], signs: ["sign_Enlarge (Inverted)", "sign_Diamond", "sign_Partition"], layoutBias: ["nested", "radial", "bilateral"] },
    expand: { sigils: ["sigil_Repetition"], signs: ["sign_Enlarge", "sign_Diamond", "sign_Partition"], layoutBias: ["nested", "radial", "manual"] },
    conceal: { sigils: ["sigil_Wind"], signs: ["sign_Conceal", "sign_Envelop", "sign_Reflection"], layoutBias: ["radial", "nested", "bilateral"] },
    movement: { sigils: ["sigil_Wind", "sigil_Guidance"], signs: ["sign_Puppet", "sign_Focus", "sign_Pulling", "sign_Region"], layoutBias: ["linked", "bilateral", "manual"] },
    purify: { sigils: ["sigil_Purification", "sigil_Water"], signs: ["sign_Purify", "sign_Refuse", "sign_Collection"], layoutBias: ["nested", "radial", "linked"] },
    summon: { sigils: ["sigil_Calling", "sigil_Guidance", "sigil_Fire", "sigil_Water"], signs: ["sign_Rain", "sign_Collection", "sign_Region", "sign_Launch"], layoutBias: ["radial", "linked", "bilateral"] },
    unknown: { sigils: ["sigil_Repetition", "sigil_Wind", "sigil_Earth", "sigil_Water"], signs: ["sign_Focus", "sign_Convergence", "sign_Stability", "sign_Region"], layoutBias: ["radial", "manual", "bilateral", "linked", "nested"] },
};

function hashText(text: string): number {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return hash >>> 0;
}

function seeded(seed: number, index: number): number {
    let value = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return value >>> 0;
}

function pick<T>(items: T[], seed: number, index: number): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = seeded(seed, i + index * 31) % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function radialPositions(count: number, radius: number, startAngle = 0): Array<{ x: number; y: number; angle: number; size: number }> {
    return Array.from({ length: count }, (_, index) => {
        const angle = startAngle + index * 360 / count;
        const radians = angle * Math.PI / 180;
        return { x: Math.round(Math.cos(radians) * radius), y: Math.round(Math.sin(radians) * radius), angle: Math.round(angle + 180), size: 120 };
    });
}

function scoreCandidate(parsed: ParsedEffect, sigils: string[], signs: string[], layout: string): number {
    const profile = profiles[parsed.intent];
    let score = 100;
    score += sigils.filter(name => profile.sigils.includes(name)).length * 18;
    score += signs.filter(name => profile.signs.includes(name)).length * 12;
    if (profile.layoutBias.includes(layout as never)) score += 24;
    if (parsed.target === "object") score += signs.includes("sign_Region") || sigils.includes("sigil_Repetition") ? 8 : 0;
    if (parsed.direction !== "none") score += signs.some(name => /Column|Pull|Region|Launch/.test(name)) ? 18 : 4;
    if (parsed.polarity === "inverted") score += signs.some(name => /Enlarge|Crush|Rain/.test(name)) ? 14 : 0;
    return score;
}

export function generateCompositionCandidates(effect: string, availableSigils: Set<string>, availableSigns: Set<string>, variationCount = 8, refinement = 0, mode: RefinementMode = "balanced"): CompositionCandidate[] {
    const parsed = parseEffect(effect);
    const profile = profiles[parsed.intent];
    const seed = hashText(normalizeText(effect) + `|refinement=${refinement}`);
    const layouts = ["radial", "bilateral", "nested", "manual", "linked"] as const;

    const sigilPool = profile.sigils.filter(name => availableSigils.has(name));
    const signPool = profile.signs.filter(name => availableSigns.has(name));

    const candidates: CompositionCandidate[] = [];

    for (let variation = 0; variation < variationCount; variation++) {
        const layout = mode === "symmetric"
            ? "bilateral"
            : mode === "compact"
                ? "nested"
                : mode === "powerful"
                    ? (variation % 2 === 0 ? "linked" : "nested")
                    : mode === "simpler"
                        ? "radial"
                        : layouts[(variation + (seed % layouts.length)) % layouts.length];
        const sigils = pick(sigilPool.length ? sigilPool : ["sigil_Repetition"], seed, variation).slice(0, mode === "simpler" ? 1 : parsed.quantity === "large" || mode === "powerful" ? 2 : 1);
        const signs = pick(signPool.length ? signPool : ["sign_Convergence"], seed, variation + 7).slice(0, mode === "simpler" ? 1 : parsed.quantity === "large" || mode === "powerful" ? 3 : variation % 3 === 0 ? 1 : 2);

        const invertedIndex = parsed.polarity === "inverted"
            ? signs.findIndex(name => /Enlarge|Crush|Rain|Column/.test(name))
            : -1;

        const rings = layout === "nested" || parsed.intent === "restore" || parsed.intent === "reduce" || parsed.intent === "expand" || mode === "compact"
            ? [{ name: "Outer Ring", radius: 400, nested: false, activatesWithOuter: true }, { name: "Inner Ring", radius: 300, nested: true, activatesWithOuter: true }]
            : [{ name: "Main Ring", radius: 400, nested: false, activatesWithOuter: true }];

        const sigilObjects: any[] = sigils.map((name, index) => {
            if (layout === "bilateral" || layout === "manual") {
                const side = sigils.length === 1 ? 0 : index % 2 === 0 ? -130 : 130;
                return { name, size: parsed.quantity === "small" ? 150 : parsed.quantity === "large" ? 220 : 180, angle: 0, offsetX: side, offsetY: 0, positions: [{ x: side, y: 0, angle: 0, size: parsed.quantity === "small" ? 150 : parsed.quantity === "large" ? 220 : 180 }] };
            }
            return { name, size: parsed.quantity === "small" ? 150 : parsed.quantity === "large" ? 220 : 180, angle: 0, offsetX: 0, offsetY: 0 };
        });

        const signObjects: any[] = [];
        signs.forEach((name, signIndex) => {
            const ringRadius = layout === "manual" ? 280 : 230 + signIndex * 75 + (variation % 3) * 20;
            const count = parsed.quantity === "small" ? 4 : parsed.quantity === "large" ? 10 : 6 + signIndex * 2;

            if (layout === "manual") {
                signObjects.push({
                    name,
                    size: 120,
                    angle: invertedIndex === signIndex ? 180 : 0,
                    amount: count,
                    amountSkip: 0,
                    radius: ringRadius,
                    offsetX: 0,
                    offsetY: 0,
                    offsetStrafe: 0,
                    rotation: variation * 15,
                    positions: radialPositions(count, ringRadius, variation * 22.5 + signIndex * 90),
                });
            } else if (layout === "bilateral") {
                signObjects.push({
                    name,
                    size: 120,
                    angle: invertedIndex === signIndex ? 180 : parsed.direction === "upward" ? 0 : parsed.direction === "downward" ? 180 : 0,
                    amount: count,
                    amountSkip: 0,
                    radius: ringRadius,
                    offsetX: 0,
                    offsetY: 0,
                    offsetStrafe: 0,
                    rotation: signIndex % 2 === 0 ? 0 : 180,
                    positions: [
                        { x: -ringRadius, y: 0, angle: 270, size: 120 },
                        { x: ringRadius, y: 0, angle: 90, size: 120 },
                    ],
                });
            } else {
                signObjects.push({
                    name,
                    size: 120,
                    angle: invertedIndex === signIndex || parsed.direction === "inward" || parsed.direction === "downward" ? 180 : 0,
                    amount: count,
                    amountSkip: 0,
                    radius: ringRadius,
                    offsetX: 0,
                    offsetY: 0,
                    offsetStrafe: 0,
                    rotation: variation * 11.25 + signIndex * 45,
                });
            }
        });

        const score = scoreCandidate(parsed, sigils, signs, layout);
        candidates.push({
            name: `Experimental ${parsed.label} - ${layout} ${variation + 1}`,
            evidence: `Intent=${parsed.intent}; target=${parsed.target}; variation=${layout}; geometry and quantity were changed, while the effect family and core sigils/signs remain constrained by wiki-known roles.`,
            caveat: "This is a generated experimental composition, not a confirmed documented WHA spell. Refinement changes intensity, quantity and geometry; it does not create a new magical effect.",
            score,
            seals: [{
                name: `Experimental ${layout} seal`,
                angle: 0,
                scale: 100,
                offsetX: 0,
                offsetY: 0,
                rings,
                sigils: sigilObjects,
                signs: signObjects,
                lines: layout === "linked" ? [{ name: "Linked Seal", color: "#000000", weight: 6, linked: true, startSeal: 0, endSeal: 1, points: [{ x: 400, y: 0 }, { x: 520, y: 0 }] }] : [],
            }],
        });
    }

    return candidates
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, variationCount)
        .map((candidate, index) => ({ ...candidate, name: `${candidate.name} [${index + 1}]` }));
}
