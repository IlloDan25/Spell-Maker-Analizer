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
    let normalized = effect.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ");

    const intentAliases: Array<[RegExp, string]> = [
        [/\b(?:unbreakable|indestructible|invulnerable|invencible|irrompible|resistant|resistente|ineditable)\b/, "strength"],
        [/\b(?:rain|lluvia|llover|llueve|llueva)\b/, "rain"],
        [/\b(?:break|crush|pulverize|romper|crushar|pulverizar|desintegrar)\b/, "break"],
        [/\b(?:restore|repair|recomponer|reconstruir|restaurar|rearmar)\b/, "restore"],
        [/\b(?:shrink|reduce|reducir|encoger|empequecer|miniaturizar)\b/, "reduce"],
        [/\b(?:expand|enlarge|grow|agrandar|expandir|crecer|aumentar)\b/, "expand"],
        [/\b(?:fly|flight|levitate|float|volar|vuelo|levitar|flotar)\b/, "flight"],
        [/\b(?:fire|flame|burn|heat|fuego|llama|calor)\b/, "fire"],
        [/\b(?:water|agua|ice|hielo|cold|frio)\b/, "water"],
        [/\b(?:earth|stone|rock|sand|soil|tierra|roca|arena|piedra)\b/, "earth"],
        [/\b(?:wind|air|viento|aire)\b/, "wind"],
        [/\b(?:light|glow|luz|brillar|iluminar)\b/, "light"],
        [/\b(?:hide|conceal|shadow|ocultar|esconder|sombra)\b/, "conceal"],
        [/\b(?:move|motion|mover|movimiento)\b/, "movement"],
        [/\b(?:clean|purify|limpiar|purificar)\b/, "purify"],
    ];

    const intents = intentAliases
        .filter(([pattern]) => pattern.test(normalized))
        .map(([, intent]) => intent);

    normalized = [...new Set(intents)].join(" ");
    return normalized || effect.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

function hashText(text: string): number {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function uniqueNames(names: string[]): string[] {
    return [...new Set(names)].slice(0, 6);
}

const availableSigils = new Set(Object.keys(symbols.sigils).map(name => `sigil_${name}`));
const availableSigns = new Set(Object.keys(symbols.signs).map(name => `sign_${name}`));

function filterAvailable(names: string[], available: Set<string>): string[] {
    return uniqueNames(names.filter(name => available.has(name)));
}

const creativeTemplates: Record<string, { sigil: string; signs: string[]; ringCount: number }> = {
    strength: { sigil: "sigil_Earth", signs: ["sign_Empower", "sign_Stability", "sign_Solidify"], ringCount: 2 },
    fire: { sigil: "sigil_Fire", signs: ["sign_Launch", "sign_Dispersion"], ringCount: 1 },
    water: { sigil: "sigil_Water", signs: ["sign_Column", "sign_Holding"], ringCount: 1 },
    earth: { sigil: "sigil_Earth", signs: ["sign_Solidify", "sign_Stability"], ringCount: 1 },
    wind: { sigil: "sigil_Wind", signs: ["sign_Dispersion", "sign_Levitation"], ringCount: 1 },
    light: { sigil: "sigil_Light", signs: ["sign_Launch", "sign_Dispersion"], ringCount: 1 },
    flight: { sigil: "sigil_Wind Underfoot", signs: ["sign_Levitation", "sign_Stability"], ringCount: 2 },
    rain: { sigil: "sigil_Water", signs: ["sign_Rain", "sign_Dispersion"], ringCount: 1 },
    break: { sigil: "sigil_Earth", signs: ["sign_Crush", "sign_Column"], ringCount: 1 },
    restore: { sigil: "sigil_Earth", signs: ["sign_Crush", "sign_Convergence"], ringCount: 2 },
    reduce: { sigil: "sigil_Repetition", signs: ["sign_Enlarge (Inverted)", "sign_Diamond"], ringCount: 2 },
    expand: { sigil: "sigil_Repetition", signs: ["sign_Enlarge", "sign_Diamond"], ringCount: 2 },
    conceal: { sigil: "sigil_Wind", signs: ["sign_Conceal", "sign_Envelop"], ringCount: 1 },
    movement: { sigil: "sigil_Wind", signs: ["sign_Puppet", "sign_Focus"], ringCount: 1 },
    purify: { sigil: "sigil_Purification", signs: ["sign_Purify", "sign_Refuse"], ringCount: 1 },
};

function findCreativeRecipe(effect: string, seedOverride?: number, variation = 0): SpellRecipe {
    const normalized = normalizeEffect(effect);
    const seed = seedOverride ?? hashText(normalized);

    const intent = normalized.split(" ").find(token => creativeTemplates[token]) ?? "earth";
    const template = creativeTemplates[intent];

    const sigils = filterAvailable([template.sigil], availableSigils);
    const signs = filterAvailable(template.signs, availableSigns);

    if (sigils.length === 0) sigils.push("sigil_Repetition");
    if (signs.length === 0) signs.push("sign_Convergence");

    const primarySigil = sigils[0];
    const selectedSigns = uniqueNames(signs).slice(0, 2);
    const ringCount = template.ringCount;
    const ringRadii = ringCount === 1 ? [400] : [400, 300];
    const rings = ringRadii.map((radius, index) => ({
        name: ringCount === 1 ? "Main Ring" : `Ring ${index + 1}`,
        radius,
    }));

    const sigilObjects = [
        { name: primarySigil, size: 180, angle: 0, offsetX: 0, offsetY: 0 },
    ];

    const stableAmounts = [6, 8];
    const stableRadii = [240, 310];
    const signObjects = selectedSigns.slice(0, 2).map((name, index) => ({
        name,
        size: 120,
        offsetX: 0,
        offsetY: 0,
        offsetStrafe: 0,
        amount: stableAmounts[index],
        amountSkip: 0,
        radius: stableRadii[index],
        angle: 0,
        rotation: index === 0 ? 0 : 22.5,
    }));

    const requestLabel = effect.replace(/variant=.*/, "").split(/\s+/).slice(0, 4).join(" ").trim() || "Experimental";
    const seedLabel = (seed & 0xffff).toString(16).padStart(4, "0").toUpperCase();
    const sealName = `Experimental ${requestLabel} Seal-${seedLabel}-v${variation + 1}`;

    return {
        name: sealName,
        kind: "creative",
        match: /.*/,
        evidence: `Canonical ${intent} template uses 1 centered sigil, ${selectedSigns.length} symmetric sign crown(s), and ${ringCount} bounded ring(s).`,
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

    const seed = hashText(normalized);
    const recipe = findCreativeRecipe(normalized, seed, 0);
    recipe.evidence = "Canonical intent template: one type sigil, symmetric sign crowns, and bounded concentric rings.";
    return recipe;
}

function signSemantics(name: string): string {
    const semanticMap: Record<string, string> = {
        "Enlarge": "enlarges an affected object",
        "Enlarge (Inverted)": "shrinks an affected object",
        "Crush": "pulverizes solid material",
        "Convergence": "concentrates and packs the spell's effect",
        "Column": "directs the effect along a column",
        "Levitation": "lifts and balances a target",
        "Stability": "holds an object on a stable plane",
        "Solidify": "makes material hard or rigid",
        "Empower": "strengthens the affected magic or object",
        "Envelop": "surrounds the target with the effect",
        "Dispersion": "spreads the effect outward",
        "Rain": "summons a rain-like manifestation",
        "Diamond": "defines or isolates the affected area",
        "Holding": "holds the target while still allowing movement",
        "Puppet": "allows directed movement",
        "Focus": "aims the spell at a chosen target",
        "Purify": "separates waste or contamination",
        "Refuse": "collects unwanted material",
        "Conceal": "hides the target",
        "Envelop": "envelops or coats the target",
    };
    const baseName = name.replace(/^sign_/, "");
    return semanticMap[baseName] ?? `applies the documented ${baseName} modifier`;
}

function sigilSemantics(name: string): string {
    const baseName = name.replace(/^sigil_/, "");
    const semanticMap: Record<string, string> = {
        Earth: "controls solid material such as stone, sand or soil",
        Fire: "creates or manipulates flame and heat",
        Water: "creates, collects or manipulates water",
        Wind: "moves and manipulates air",
        "Wind Underfoot": "supports a solid object or contraption in flight",
        Repetition: "continually restores an object toward its prior state",
        Light: "creates or manipulates light",
        Purification: "purifies water or separates waste",
    };
    return semanticMap[baseName] ?? `uses the ${baseName} sigil as the effect type`;
}

export function explainSpellComposition(spell: SpellType): string {
    const seals = spell.seals ?? [];
    if (seals.length === 0) return "No seal exists: add at least one outer ring.";

    const explanations = seals.map((seal, sealIndex) => {
        const rings = seal.rings ?? [];
        const sigils = seal.sigils ?? [];
        const signs = seal.signs ?? [];

        if (rings.length === 0) {
            return `Seal ${sealIndex + 1}: incomplete. A ring must contain or connect the sigils and signs; without it the seal cannot activate.`;
        }

        const ringText = rings.map(ring => {
            const radius = ring.radius ?? 400;
            const gap = ring.openingSize && ring.openingSize > 0
                ? ` with an opening of ${ring.openingSize} degrees`
                : " closed";
            return `R${radius}${gap}`;
        }).join(" + ");

        const signText = signs.map(sign => {
            const name = sign.name ?? "unnamed sign";
            const amount = sign.amount ?? 1;
            const radius = sign.radius ?? 0;
            const angle = sign.angle ?? 0;
            const rotation = sign.rotation ?? 0;
            const inverted = /(?:Inverted|inverted)/.test(name);
            const direction = inverted
                ? "inverted; it produces the opposite documented behavior"
                : angle === 180
                    ? "rotated 180 degrees"
                    : "normally oriented";

            return `SIGN(${name.replace(/^sign_/, "")}, count=${amount}, radius=${radius}, rotation=${rotation}): ${direction}; ${signSemantics(name)}.`;
        }).join(" ");

        const effectText = sigils.length
            ? `${sigilSemantics(sigils[0].name ?? "")}`
            : "No sigil is present; the result depends mainly on the signs and ring.";

        const balanceText = signs.length
            ? "Signs are balanced only if their counts and radii are symmetric; unequal crowns can change direction or destabilize the spell."
            : "No signs are present; a ring alone may cause a rapid discharge of energy.";

        const grammar = `SEAL{${ringText} | ${sigils.map(sigil => `SIGIL(${sigil.name?.replace(/^sigil_/, "") ?? "?"})`).join(" + ")} | ${signs.map(sign => `SIGN(${sign.name?.replace(/^sign_/, "") ?? "?"}, ${sign.amount ?? 1}@${sign.radius ?? 0})`).join(" + ")}}`;

        return `Seal ${sealIndex + 1}: ${effectText} ${signText ? `The sign grammar is ${signText}` : "No signs modify the sigil."} ${balanceText}\nSyntax: ${grammar}`;
    });

    return explanations.join("\n\n");
}

export const supportedSpellEffects = [
    "rain or summon rain",
    "pulverize a wall, stone or solid material",
    "restore pulverized material",
    "reduce an object",
    "expand and levitate an object",
    "fly with sylph shoes",
] as const;
