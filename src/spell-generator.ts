import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell";
import symbols from "./data/symbols.json";

export interface SpellRecipe {
    name: string;
    kind: "documented" | "creative";
    match: RegExp;
    evidence: string;
    sourceUrl: string;
    caveat: string;
    seals: SpellType["seals"];
}

const spellRecipes: SpellRecipe[] = [
    {
        name: "Rainbringer",
        kind: "documented",
        match: /(?:rain|lluvia|llover|llueva|llueve|make it (?:rain|pour)|summon rain)/,
        evidence: "Water sigil surrounded by the Rain sign, as documented for the Rainbringer Seal.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Rainbringer_Seal",
        caveat: "The wiki shows that ring quality and drawing variations affect the exact manifestation; this is an editable sketch, not a proof of casting performance.",
        seals: [{ name: "Rainbringer", rings: [{ name: "Main Ring" }], sigils: [{ name: "sigil_Water", size: 220 }], signs: [{ name: "sign_Rain", amount: 8, radius: 300 }] }],
    },
    {
        name: "Integration",
        kind: "documented",
        match: /(?:integrat|recompon|reconstru|restaur|rearm|reunir.*particulas|restore.*(?:dust|powder|pulverized|material)|reassembl.*(?:dust|powder|material)|put.*(?:dust|powder).*back)/,
        evidence: "Earth sigil surrounded by several inward-pointing, inverted Crushing signs.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Integration",
        caveat: "The effect temporarily reassembles already-pulverized material and only resembles the source object's shape. It does not restore arbitrary damage.",
        seals: [{ name: "Integration", rings: [{ name: "Main Ring" }], sigils: [{ name: "sigil_Earth", size: 220 }], signs: [{ name: "sign_Crush", amount: 4, angle: 180, radius: 290 }] }],
    },
    {
        name: "Wall Breaker",
        kind: "documented",
        match: /(?:wall breaker|romp.*(?:pared|muro|roca)|pulveriz.*(?:pared|muro|roca|solido|material)|break.*(?:wall|stone|rock|solid|material)|crush.*(?:wall|stone|rock)|desintegr)/,
        evidence: "Earth sigil, two Columns beside it, and Crushing signs at 90-degree angles from the Columns.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Wall_Breaker_Seal",
        caveat: "This is the documented material-destroying pattern, but the object must be drawn on and the spell quality depends on size and precision.",
        seals: [{ name: "Wall Breaker", rings: [{ name: "Main Ring" }], sigils: [{ name: "sigil_Earth", size: 220 }], signs: [{ name: "sign_Crush", amount: 2, angle: 90, radius: 250 }, { name: "sign_Column", amount: 2, angle: 0, radius: 320 }] }],
    },
    {
        name: "Spell of Reduction",
        kind: "documented",
        match: /(?:spell of reduction|reduc(?:e|ir|cion|t)|encog|empequen|pequen|disminu|miniatur|shrink|smaller)/,
        evidence: "The casting seal uses a Repetition sigil, inward-pointing Enlarge signs, and four Diamond signs.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Spell_of_Reduction",
        caveat: "The exact sigil is bisected and the range or target size is not established by a text request. The published pattern shrinks an affected object and can be undone.",
        seals: [{ name: "Spell of Reduction", rings: [{ name: "Outer Ring" }, { name: "Inner Ring" }], sigils: [{ name: "sigil_Repetition", size: 210 }], signs: [{ name: "sign_Enlarge", amount: 1, angle: 180, radius: 260 }, { name: "sign_Diamond", amount: 4, radius: 330 }] }],
    },
    {
        name: "Seal of Expansion and Levitation",
        kind: "documented",
        match: /(?:seal of expansion|agrand.*levit|expand.*levit|enlarge.*levit|grow.*levit|aument.*(?:tamano|volumen).*(?:levit|flot)|make.*(?:bigger|larger).*(?:float|levitat))/,
        evidence: "Selection sign at the center, surrounded by an Enlarge sign, four Level Planes signs, and eight Column signs.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Seal_of_Expansion_and_Levitation",
        caveat: "The wiki describes this as probably two spells drawn together. Selection is not yet available as a symbol in this editor, so this sketch represents the rest of the documented composition and must be completed manually.",
        seals: [{ name: "Seal of Expansion and Levitation", rings: [{ name: "Main Ring" }], signs: [{ name: "sign_Enlarge", amount: 1, radius: 220 }, { name: "sign_Float", amount: 4, radius: 300 }, { name: "sign_Column", amount: 8, radius: 370 }] }],
    },
    {
        name: "Sylph Shoes",
        kind: "documented",
        match: /(?:sylph|flight|fly|volar|vuela|vuele|flying shoes|zapatos.*(?:volar|vuelo))/,
        evidence: "Wind Underfoot sigil surrounded by alternating Convergence and Levitation signs.",
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Sylph_Shoes_Seal",
        caveat: "The casting seal is split between both soles and activates when the halves meet. It is a contraption sketch, not a directly wearable casting seal as currently modeled.",
        seals: [{ name: "Wind Underfoot", rings: [{ name: "Main Ring" }], sigils: [{ name: "sigil_Wind Underfoot", size: 260 }], signs: [{ name: "sign_Convergence", amount: 4, radius: 300 }, { name: "sign_Levitation", amount: 4, radius: 370 }] }],
    },
];

function normalizeEffect(effect: string): string {
    const normalized = effect.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ");

    if (/\b(?:unbreakable|indestructible|invulnerable|invencible|irrompible|resistant|resistente|ineditable)\b/.test(normalized)) {
        return "unbreakable";
    }

    return normalized;
}

interface CompositionCandidate {
    score: number;
    variation: number;
    recipe: SpellRecipe;
}

const creativeSigilRules: Array<{ keywords: RegExp; symbols: string[] }> = [
    { keywords: /fire|flame|burn|heat|calor|fuego|llama/, symbols: ["sigil_Fire", "sigil_Light", "sigil_Unburning Flames"] },
    { keywords: /water|rain|ice|cold|agua|lluvia|hielo|frio/, symbols: ["sigil_Water", "sigil_Crystalize", "sigil_Purification"] },
    { keywords: /earth|stone|rock|sand|soil|tierra|roca|arena|piedra|unbreakable|indestructible|invulnerable|invencible|resistan/, symbols: ["sigil_Earth", "sigil_Sand", "sigil_Bridging"] },
    { keywords: /wind|air|fly|flight|levitat|float|viento|aire|volar|flotar/, symbols: ["sigil_Wind", "sigil_Aeriforms", "sigil_Wind Underfoot", "sigil_Whorling Winds"] },
    { keywords: /light|glow|luz|brillar|illum/, symbols: ["sigil_Light", "sigil_Flickering Light"] },
    { keywords: /time|stop|freeze|repet|tempo|tiempo/, symbols: ["sigil_Repetition", "sigil_Stop"] },
    { keywords: /sword|weapon|espada/, symbols: ["sigil_Sword"] },
    { keywords: /call|echo|sound|llamar|voz|voice/, symbols: ["sigil_Calling"] },
    { keywords: /guid|direct|aim|guide|guia/, symbols: ["sigil_Guidance"] },
];

const creativeSignRules: Array<{ keywords: RegExp; symbols: string[] }> = [
    { keywords: /grow|expand|enlarg|agrand|crec|aument/, symbols: ["sign_Enlarge", "sign_Column"] },
    { keywords: /reduc|shrink|encog|pequen|miniatur/, symbols: ["sign_Enlarge (Inverted)", "sign_Diamond"] },
    { keywords: /levitat|float|fly|flotar|volar|levit/, symbols: ["sign_Levitation", "sign_Float", "sign_Stability"] },
    { keywords: /pull|grasp|atraer|tirar/, symbols: ["sign_Pull", "sign_Convergence"] },
    { keywords: /push|expel|push away|empuj/, symbols: ["sign_Region", "sign_Dispersion"] },
    { keywords: /break|crush|pulver|destr|romper|desintegr/, symbols: ["sign_Crush", "sign_Column", "sign_Launch"] },
    { keywords: /reassembl|restore|recompon|reunir|repair/, symbols: ["sign_Enlarge (Inverted)", "sign_Crush", "sign_Convergence"] },
    { keywords: /cold|cool|freeze|frio|hielo|enfri/, symbols: ["sign_Cool", "sign_Solidify", "sign_Stillness"] },
    { keywords: /hide|conceal|shadow|cloak|escon|ocult/, symbols: ["sign_Conceal", "sign_Envelop", "sign_Reflect"] },
    { keywords: /protect|shield|strength|fortal|reforz|unbreakable|indestructible|invulnerable|invencible|resistan/, symbols: ["sign_Empower", "sign_Stability", "sign_Solidify", "sign_Envelop"] },
    { keywords: /bind|hold|entwine|atar|sujetar|inmobil/, symbols: ["sign_Bind", "sign_Entwine", "sign_Immobility"] },
    { keywords: /rain|lluvia|summon|conj/, symbols: ["sign_Rain", "sign_Gather", "sign_Orb"] },
    { keywords: /light|bright|glow|luz|brillar/, symbols: ["sign_Launch", "sign_Column", "sign_Dispersion"] },
    { keywords: /move|dart|motion|mover|movimiento/, symbols: ["sign_Puppet", "sign_Focus", "sign_Region"] },
    { keywords: /clean|purif|limpi/, symbols: ["sign_Purify", "sign_Refuse", "sign_Collection"] },
    { keywords: /portal|window|door|puerta|ventana/, symbols: ["sign_Window", "sign_Windowway", "sign_Region"] },
    { keywords: /water|wave|wash|aguas|olas/, symbols: ["sign_Column", "sign_Partition", "sign_Holding"] },
];

function hashText(text: string): number {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function mixedIndex(seed: number, index: number, length: number): number {
    if (length <= 1) return 0;
    const value = Math.imul(seed ^ (index + 1) * 0x9e3779b9, 0x85ebca6b);
    return (value >>> 0) % length;
}

function uniqueNames(names: string[]): string[] {
    return [...new Set(names)].slice(0, 6);
}

const availableSigils = new Set(Object.keys(symbols.sigils).map(name => `sigil_${name}`));
const availableSigns = new Set(Object.keys(symbols.signs).map(name => `sign_${name}`));

function filterAvailable(names: string[], available: Set<string>): string[] {
    return uniqueNames(names.filter(name => available.has(name)));
}

function findCreativeRecipe(effect: string, seedOverride?: number, variation = 0): SpellRecipe {
    const normalized = normalizeEffect(effect);
    const seed = seedOverride ?? hashText(normalized);

    const sigilMatches = creativeSigilRules
        .filter(rule => rule.keywords.test(normalized))
        .flatMap(rule => rule.symbols);
    const signMatches = creativeSignRules
        .filter(rule => rule.keywords.test(normalized))
        .flatMap(rule => rule.symbols);

    const sigils = filterAvailable(sigilMatches.length
        ? sigilMatches
        : ["sigil_Repetition", "sigil_Wind", "sigil_Water", "sigil_Fire", "sigil_Earth"], availableSigils);
    const signs = filterAvailable(signMatches.length
        ? signMatches
        : ["sign_Convergence", "sign_Region", "sign_Stability", "sign_Holding"], availableSigns);

    if (sigils.length === 0) sigils.push("sigil_Repetition");
    if (signs.length === 0) signs.push("sign_Convergence");

    const sigilIndex = mixedIndex(seed, 0, sigils.length);
    const primarySigil = sigils[sigilIndex];
    const otherSigils = sigils.filter((_, index) => index !== sigilIndex).slice(0, 1);

    const selectedSigns = uniqueNames(signs.slice(0, 4));
    const ringCount = 1 + (mixedIndex(seed, 2, 2));
    const ringRadii = ringCount === 1 ? [400] : [400, 300];
    const rings = ringRadii.map((radius, index) => ({
        name: ringCount === 1 ? "Main Ring" : `Ring ${index + 1}`,
        radius,
    }));

    const sigilObjects = [
        { name: primarySigil, size: 210, angle: 0 },
        ...otherSigils.map((name, index) => ({
            name,
            size: 120,
            angle: 0,
            offsetX: index % 2 === 0 ? 170 : -170,
            offsetY: 0,
        })),
    ];

    const stableAmounts = [4, 6, 8];
    const stableRadii = [155, 220, 285];
    const signObjects = selectedSigns.slice(0, 3).map((name, index) => ({
        name,
        size: 150,
        amount: stableAmounts[index],
        amountSkip: 0,
        radius: stableRadii[index],
        angle: 0,
        rotation: index * 45,
    }));

    const requestLabel = effect.replace(/variant=.*/, "").split(/\s+/).slice(0, 4).join(" ").trim() || "Experimental";
    const seedLabel = (seed & 0xffff).toString(16).padStart(4, "0").toUpperCase();
    const sealName = `Experimental ${requestLabel} Seal-${seedLabel}-v${variation + 1}`;

    return {
        name: sealName,
        kind: "creative",
        match: /.*/,
        evidence: `Deterministic composition search matched ${sigils.length} candidate sigil(s) and ${signs.length} candidate sign(s) for the requested effect.`,
        sourceUrl: "https://witchhatatelier.telepedia.net/wiki/Magic",
        caveat: "This is a new, unconfirmed fan composition. It is not documented by the wiki and may not produce the requested effect. Keywords guide, not prove, the result.",
        seals: [{
            name: sealName,
            rings,
            sigils: sigilObjects,
            signs: signObjects,
        }],
    };
}

export function findSpellRecipe(effect: string): SpellRecipe | null {
    const normalized = normalizeEffect(effect);
    if (!normalized) return null;

    const matches = spellRecipes.filter(recipe => recipe.match.test(normalized));
    if (matches.length !== 1) return null;

    const documented = matches[0];
    return documented;
}

export function generateSpellRecipe(effect: string): SpellRecipe | null {
    const documented = findSpellRecipe(effect);
    if (documented) return documented;

    const normalized = normalizeEffect(effect);
    if (!normalized) return null;

    const candidates: CompositionCandidate[] = [];
    for (let variation = 0; variation < 8; variation++) {
        const seed = hashText(`${normalized}|variant=${variation}`);
        const recipe = findCreativeRecipe(normalized, seed, variation);
        let score = 0;

        const seal = recipe.seals?.[0];
        const sigils = seal?.sigils ?? [];
        const signs = seal?.signs ?? [];

        const matchingSigils = creativeSigilRules
            .filter(rule => rule.keywords.test(normalized))
            .flatMap(rule => rule.symbols);
        const matchingSigns = creativeSignRules
            .filter(rule => rule.keywords.test(normalized))
            .flatMap(rule => rule.symbols);

        for (const sigil of sigils) {
            if (matchingSigils.includes(sigil.name as string)) score += 5;
            else score += 1;
        }
        for (const sign of signs) {
            if (matchingSigns.includes(sign.name as string)) score += 4;
            else score += 1;

            const amount = sign.amount ?? 1;
            if (amount >= 2 && amount <= 8) score += 2;
            if (amount > 1 && 360 % amount === 0) score += 2;
        }

        const ringCount = seal?.rings?.length ?? 0;
        if (ringCount >= 1 && ringCount <= 3) score += 2;
        if (sigils.length >= 1 && sigils.length <= 2) score += 2;
        if (signs.length >= 2 && signs.length <= 4) score += 2;

        candidates.push({ score, variation, recipe });
    }

    candidates.sort((a, b) => b.score - a.score || a.variation - b.variation);
    const selected = candidates[0];
    if (selected) {
        selected.recipe.evidence = `Ranked 8 deterministic variants; selected variation ${selected.variation + 1} with a semantic score of ${selected.score}.`;
    }
    return selected?.recipe ?? null;
}

export function explainSpellComposition(spell: SpellType): string {
    const seals = spell.seals ?? [];
    if (seals.length === 0) return "The circle has no seals yet.";

    const parts = seals.map((seal, sealIndex) => {
        const ringCount = seal.rings?.length ?? 0;
        const ringNames = (seal.rings ?? []).map(ring => ring.name ?? "unnamed ring");
        const sigils = (seal.sigils ?? []).map(sigil => sigil.name?.replace(/^sigil_/, "") ?? "unnamed sigil");
        const signs = (seal.signs ?? []).map(sign => {
            const rawName = sign.name?.replace(/^sign_/, "") ?? "unnamed sign";
            const amount = sign.amount ?? 1;
            const angle = sign.angle ?? 0;
            const rotation = sign.rotation ?? 0;
            const strafe = sign.offsetStrafe ?? 0;
            const radius = sign.radius ?? 0;
            const isInverted = /(?:Inverted|inverted)/.test(rawName);
            const orientation = isInverted ? "inverted (opposite effect)" : angle === 180 ? "rotated 180 degrees" : "normal orientation";
            const symmetry = amount > 1 && 360 % amount === 0
                ? `radial symmetry of ${amount} positions`
                : `asymmetric placement (${amount} position)`;

            return `${amount} ${rawName}: ${orientation}; ${symmetry}; circle radius ${radius}; rotation ${rotation} degrees; strafe ${strafe}`;
        });

        const details = [`Seal ${sealIndex + 1}${seal.name ? ` (${seal.name})` : ""}`];
        details.push(`${ringCount} ring${ringCount === 1 ? "" : "s"}${ringNames.length ? ` (${ringNames.join(", ")})` : ""}`);
        if (sigils.length) details.push(`sigils: ${sigils.join(", ")}`);
        if (signs.length) details.push(`signs: ${signs.join(", ")}`);
        if (!sigils.length && !signs.length) details.push("no symbols, only rings/lines");

        return details.join("; ");
    });

    return parts.join(" | ");
}

export const supportedSpellEffects = [
    "rain or summon rain",
    "pulverize a wall, stone or solid material",
    "restore pulverized material",
    "reduce an object",
    "expand and levitate an object",
    "fly with sylph shoes",
] as const;
