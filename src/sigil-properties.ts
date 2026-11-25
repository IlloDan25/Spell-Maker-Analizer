export type SigilEffectStatus = "confirmed" | "partially-confirmed" | "unofficial" | "unknown";

export interface SigilProperty {
    domain: string;
    effect: string;
    status: SigilEffectStatus;
    placement: string;
}

const sigilProperties: Record<string, SigilProperty> = {
    Aeriforms: { domain: "Wind and air", effect: "creates and manipulates air", status: "partially-confirmed", placement: "Typically placed inside or near the center of the seal" },
    "Bird A": { domain: "Decorative shape", effect: "shapes a light spell as a bird", status: "confirmed", placement: "Decorative sigils take significant space inside the ring" },
    "Bird B": { domain: "Decorative shape", effect: "shapes a spell as a bird or bird-like form", status: "partially-confirmed", placement: "Decorative sigils take significant space inside the ring" },
    Bridging: { domain: "Construction", effect: "turns a target object into a bridge with a walkable platform", status: "confirmed", placement: "Can be placed wherever the target geometry is specified" },
    Calling: { domain: "Echo and recall", effect: "repeatedly echoes or calls out recorded words", status: "confirmed", placement: "Place near the symbols that identify the target" },
    Crystalize: { domain: "Crystal and ice", effect: "turns nearby specified material into crystal or ice", status: "unofficial", placement: "Place as the central effect or material-type sigil" },
    Doorways: { domain: "Location", effect: "selects or connects locations for a doorway-like spell", status: "partially-confirmed", placement: "Place in or near the section that identifies the destination" },
    Dragon: { domain: "Decorative shape", effect: "sculpts the spell as a dragon or dragon-like form", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Earth: { domain: "Solid matter", effect: "manipulates solid substances such as stone, sand and soil", status: "confirmed", placement: "Traditionally placed in the center, but position does not alter its base behavior" },
    Fire: { domain: "Fire and heat", effect: "creates and manipulates flame or heat", status: "confirmed", placement: "Traditionally placed in the center and affected by sign placement and balance" },
    "Fish A": { domain: "Decorative shape", effect: "shapes or identifies fish and aquatic creatures", status: "partially-confirmed", placement: "Decorative sigils take significant space inside the ring" },
    "Fish B": { domain: "Decorative shape", effect: "shapes or identifies fish and aquatic creatures", status: "partially-confirmed", placement: "Decorative sigils take significant space inside the ring" },
    "Flickering Light": { domain: "Light", effect: "may only reproduce a quick, unstable flicker", status: "unknown", placement: "Placement is not established by the wiki" },
    "Flower (Clean)": { domain: "Decorative shape", effect: "depicts a flower and uses modifiers to determine variety", status: "confirmed", placement: "Surround with the small modifiers that specify the flower" },
    Flower: { domain: "Decorative shape", effect: "depicts a flower and uses modifiers to determine variety", status: "confirmed", placement: "Surround with five or more matching modifier symbols when documented" },
    Frillram: { domain: "Decorative shape", effect: "shapes or identifies a frillram creature", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Guidance: { domain: "Attraction", effect: "attracts objects matching parameters set by nearby symbols", status: "confirmed", placement: "Place near the symbols that define the target or object class" },
    Horse: { domain: "Decorative shape", effect: "shapes or identifies a horse", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Light: { domain: "Light", effect: "creates and manipulates light within the fire domain", status: "confirmed", placement: "Traditionally centered and dependent on sign balance for manifestation" },
    Lightning: { domain: "Electricity", effect: "likely creates and manipulates electricity", status: "unofficial", placement: "Placement is not established for this unofficial sigil" },
    Liongoat: { domain: "Decorative shape", effect: "shapes or identifies a liongoat creature", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Ondulation: { domain: "Waves", effect: "may manipulate material into a wave-like form", status: "partially-confirmed", placement: "Place in the region that defines the wave source" },
    "Owlcat Head": { domain: "Decorative shape", effect: "depicts an owlcat's head and targets the owlcat illusion", status: "confirmed", placement: "Decorative sigils take significant space inside the ring" },
    Owlcat: { domain: "Decorative shape", effect: "depicts an owlcat creature", status: "confirmed", placement: "Decorative sigils take significant space inside the ring" },
    Purification: { domain: "Water", effect: "cleans and purifies water", status: "confirmed", placement: "Place centrally or in the area that processes water" },
    Repetition: { domain: "Time", effect: "restores an affected object toward its state at spell activation", status: "confirmed", placement: "Can be placed centrally or in nested structures depending on the seal" },
    Sand: { domain: "Sand", effect: "manipulates existing sand, but does not generate it", status: "confirmed", placement: "Place near signs that shape its boundaries or movement" },
    Scalewolf: { domain: "Decorative shape", effect: "depicts a scalewolf creature", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Smoke: { domain: "Smoke", effect: "creates smoke", status: "unofficial", placement: "Place centrally as the effect-type sigil" },
    Stop: { domain: "Immobility", effect: "holds or stops the effect of the construction", status: "unofficial", placement: "Place near the signs that define the held target" },
    Sword: { domain: "Sword", effect: "its exact confirmed function is unknown", status: "unknown", placement: "The wiki has not established a required placement" },
    Torchstag: { domain: "Decorative shape", effect: "depicts a torchstag creature", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    "Unburning Flames": { domain: "Fire", effect: "may create or retain flame-like heat without burning as normal", status: "unknown", placement: "Placement is not established" },
    "Valance Leech": { domain: "Decorative shape", effect: "depicts a valance leech creature", status: "confirmed", placement: "Decorative sigils take substantial center space" },
    Water: { domain: "Water", effect: "manipulates, collects or creates water", status: "confirmed", placement: "Traditionally centered and affected by signs for form and direction" },
    "Whorling Winds": { domain: "Wind", effect: "manipulates rotating air or creates vortical motion", status: "partially-confirmed", placement: "Place centrally or with signs that shape rotation" },
    "Wind (Clean)": { domain: "Wind", effect: "moves and manipulates existing air", status: "confirmed", placement: "Traditionally centered and governed by sign balance" },
    "Wind Underfoot": { domain: "Flight support", effect: "supports solid objects suspended in air", status: "partially-confirmed", placement: "Used centrally in flight and contraption seals" },
    Wind: { domain: "Wind", effect: "moves and manipulates existing air", status: "confirmed", placement: "Traditionally centered and governed by sign balance" },
};

export function getSigilProperty(name: string): SigilProperty {
    const baseName = name.replace(/^sigil_/, "");
    return sigilProperties[baseName] ?? {
        domain: "Unknown",
        effect: "the wiki does not provide enough confirmed information for this sigil",
        status: "unknown",
        placement: "No required placement is established",
    };
}
