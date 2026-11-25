export type SignCategory = "directional" | "semi-directional" | "non-directional" | "asymmetric" | "unknown";
export type SignInversion = "supported" | "not-supported" | "unknown";

export interface SignProperty {
    category: SignCategory;
    inversion: SignInversion;
    behavior: string;
    balance: string;
    compatibleWith: string[];
}

const signPropertyEntries: Record<string, SignProperty> = {
    Column: { category: "directional", inversion: "supported", behavior: "directs the effect in a column or chosen direction", balance: "Equal signs of equal length balance a straight manifestation", compatibleWith: ["Earth", "Water", "Fire", "Wind", "Levitation", "Piercing"] },
    Dispersion: { category: "semi-directional", inversion: "supported", behavior: "lets the magic spread or disperse outward", balance: "A symmetric crown averages the outward pressure", compatibleWith: ["Fire", "Water", "Light", "Wind", "Rain"] },
    Levitation: { category: "directional", inversion: "unknown", behavior: "floats an affected object and can shape it into a balanced form", balance: "All levitation signs should agree in size and radial distribution", compatibleWith: ["Wind Underfoot", "Stability", "Column", "Light"] },
    Convergence: { category: "semi-directional", inversion: "unknown", behavior: "packs or focuses the effect toward a point", balance: "Convergence points toward the center for concentrated results", compatibleWith: ["Earth", "Sand", "Water", "Repetition"] },
    "Dancing Puppets": { category: "semi-directional", inversion: "not-supported", behavior: "allows a target object to be consciously controlled over distance", balance: "Keep paired puppets visually balanced", compatibleWith: ["Wind", "Decorative Sigils", "Sights Set"] },
    Crush: { category: "semi-directional", inversion: "supported", behavior: "crushes solid targets into smaller pieces; inversion can reassemble pulverized material", balance: "Symmetric crushing signs keep pressure evenly distributed", compatibleWith: ["Earth", "Convergence", "Column", "Bind"] },
    Repetition: { category: "semi-directional", inversion: "unknown", behavior: "continually returns an object toward its previous state", balance: "Use repeated, evenly sized signs to maintain stable restoration", compatibleWith: ["Earth", "Diamond", "Enlarge", "Stability"] },
    Pulling: { category: "directional", inversion: "supported", behavior: "pulls a target toward the seal or pushes it away when inverted", balance: "A tilted placement can create both pulling and twisting", compatibleWith: ["Guidance", "Wind", "Regions", "Fire"] },
    Stretch: { category: "non-directional", inversion: "not-supported", behavior: "turns solid targets into flexible ribbons", balance: "Surround the central sigil with evenly spaced signs", compatibleWith: ["Earth", "Bridge", "Decorative Sigils"] },
    Coil: { category: "non-directional", inversion: "not-supported", behavior: "softens physical matter and lets it coil or bend", balance: "Coil signs work best without opposite directional pressure", compatibleWith: ["Earth", "Sand", "Stretch"] },
    Conceal: { category: "unknown", inversion: "unknown", behavior: "hides a target in shadow or concealment", balance: "Pair with balanced covering signs", compatibleWith: ["Wind", "Reflection", "Envelopment"] },
    Reflection: { category: "directional", inversion: "unknown", behavior: "targets a reflection or reflected image", balance: "Point toward the intended reflected subject", compatibleWith: ["Light", "Concealment", "Projection"] },
    Regions: { category: "directional", inversion: "unknown", behavior: "sets where the spell manifests in relation to the ring", balance: "Arrows inward, outward or opposing define the active region", compatibleWith: ["Column", "Dispersion", "Diamond", "Partition"] },
    Windows: { category: "directional", inversion: "unknown", behavior: "links spaces and creates a doorway-like connection", balance: "Place windows consistently along the connected boundary", compatibleWith: ["Doorways", "Link", "Regions"] },
    Cooling: { category: "semi-directional", inversion: "unknown", behavior: "cools the affected material", balance: "Distribute cooling evenly to avoid uneven freezing", compatibleWith: ["Water", "Ice", "Holding", "Stability"] },
    Gathering: { category: "directional", inversion: "unknown", behavior: "draws nearby material into the spell for passive or active construction", balance: "Use an opening toward the material source", compatibleWith: ["Collection", "Refuse", "Wind", "Water"] },
    Gather: { category: "directional", inversion: "unknown", behavior: "draws nearby material into the spell for passive or active construction", balance: "Use an opening toward the material source", compatibleWith: ["Collection", "Refuse", "Wind", "Water"] },
    Stability: { category: "non-directional", inversion: "not-supported", behavior: "holds an object on a balanced plane while allowing limited movement", balance: "At least bilateral distribution is recommended", compatibleWith: ["Levitation", "Column", "Earth", "Wind Underfoot"] },
    Wind: { category: "asymmetric", inversion: "unknown", behavior: "moves or spirals air", balance: "Place curved wind signs in a coherent rotational pattern", compatibleWith: ["Wind", "Whorling Winds", "Levitation", "Dispersion"] },
    "Aeriforms Defined": { category: "semi-directional", inversion: "not-supported", behavior: "modifies the creation or definition of air", balance: "Keep the air signs distributed evenly", compatibleWith: ["Wind", "Aeriforms", "Levitation"] },
    Empower: { category: "semi-directional", inversion: "unknown", behavior: "strengthens, reinforces or empowers the affected magic or object", balance: "Equal reinforcing signs prevent localized overload", compatibleWith: ["Earth", "Solidify", "Bind", "Stability"] },
    Solidify: { category: "unknown", inversion: "unknown", behavior: "hardens or solidifies the target material", balance: "Solidification should reinforce rather than oppose movement signs", compatibleWith: ["Earth", "Bind", "Empower", "Stability"] },
    "Sights Set": { category: "directional", inversion: "not-supported", behavior: "aims the spell toward a specific point or target", balance: "Aim directions must agree for a controlled shot", compatibleWith: ["Piercing", "Dancing Puppets", "Column", "Regions"] },
    Envelop: { category: "unknown", inversion: "unknown", behavior: "surrounds or coats the target with the effect", balance: "Ring-like distribution is useful for complete coverage", compatibleWith: ["Conceal", "Protection", "Stability", "Earth"] },
    Immobility: { category: "semi-directional", inversion: "not-supported", behavior: "makes a target immovable while remaining movable as a whole in relation to the seal", balance: "Keep opposing movement signs balanced", compatibleWith: ["Earth", "Bind", "Stability"] },
    Holding: { category: "non-directional", inversion: "unknown", behavior: "holds a target shape while allowing movement", balance: "Use several evenly spaced holding signs", compatibleWith: ["Water", "Wind", "Levitation", "Solidify"] },
    Pointing: { category: "non-directional", inversion: "unknown", behavior: "creates a conical manifestation that another sign can direct", balance: "Pointing gains control from directional signs", compatibleWith: ["Column", "Piercing", "Regions"] },
    Piercing: { category: "non-directional", inversion: "unknown", behavior: "turns an effect into offensive projectiles or spear-like attacks", balance: "The number of signs influences the number of projectiles", compatibleWith: ["Column", "Sights Set", "Water", "Fire"] },
    Bind: { category: "unknown", inversion: "unknown", behavior: "binds material together or stops separate parts from moving", balance: "Binding signs should surround or close around the target", compatibleWith: ["Earth", "Solidify", "Immobility", "Crush"] },
    Entwining: { category: "semi-directional", inversion: "not-supported", behavior: "makes an object wrap or entwine itself around targets", balance: "Use paired curved signs for a controlled wrap", compatibleWith: ["Stretch", "Bind", "Sights Set"] },
    Entwine: { category: "semi-directional", inversion: "not-supported", behavior: "makes an object wrap or entwine around another object", balance: "Use paired curved signs for controlled wrapping", compatibleWith: ["Stretch", "Bind", "Sights Set"] },
    Detection: { category: "unknown", inversion: "unknown", behavior: "helps detect a condition that activates or assists the spell", balance: "Detection is highly geometry-sensitive", compatibleWith: ["Stability", "Regions", "Light"] },
    Partition: { category: "directional", inversion: "unknown", behavior: "defines the borders of an affected area", balance: "Elongated partition signs shape the boundary", compatibleWith: ["Regions", "Diamond", "Water", "Earth"] },
    Refuse: { category: "directional", inversion: "unknown", behavior: "collects unwanted material toward the direction it points", balance: "All refuse signs should agree on the waste outlet", compatibleWith: ["Purify", "Collection", "Water"] },
    Purify: { category: "asymmetric", inversion: "unknown", behavior: "separates contamination or waste from water", balance: "Place purification before refuse signs in the explanation", compatibleWith: ["Purification", "Refuse", "Water"] },
    Enlarge: { category: "semi-directional", inversion: "supported", behavior: "grows a target when corners face outward and shrinks it when facing inward", balance: "Use the same inversion and facing across the entire group", compatibleWith: ["Repetition", "Diamond", "Stability", "Levitation"] },
    Diamond: { category: "unknown", inversion: "unknown", behavior: "may isolate or contain the object affected by the seal", balance: "Diamonds should enclose or frame the target consistently", compatibleWith: ["Enlarge", "Repetition", "Partition", "Selection"] },
    Selection: { category: "non-directional", inversion: "not-supported", behavior: "limits the spell to the object or target on which the seal is drawn", balance: "Selection is placed as the central targeting element", compatibleWith: ["Enlarge", "Repetition", "Diamond", "Earth"] },
    Rain: { category: "semi-directional", inversion: "supported", behavior: "summons a target substance as rain or pushes it away when inverted", balance: "For rain, a radial ring of signs is conventional", compatibleWith: ["Water", "Dispersion", "Collection"] },
    Collection: { category: "directional", inversion: "not-supported", behavior: "collects material around the seal for use by the spell", balance: "Open sides should face the material source", compatibleWith: ["Gathering", "Refuse", "Rain", "Sand"] },
    Mimicry: { category: "semi-directional", inversion: "unknown", behavior: "imitates the movement of a decorative sigil or target", balance: "Place mimicry near the decorative shape it should imitate", compatibleWith: ["Dancing Puppets", "Decorative Sigils", "Sights Set"] },
    Glaives: { category: "semi-directional", inversion: "not-supported", behavior: "controls how firmly magic embeds into flesh; glaives are a distinct claw technique", balance: "Glaives may be outside the ring if connected", compatibleWith: ["Obliviation", "Crush", "Envelop"] },
    Launch: { category: "directional", inversion: "unknown", behavior: "creates a strong but short-lived burst in the sign's direction", balance: "Use opposed signs carefully to prevent uneven launch force", compatibleWith: ["Piercing", "Column", "Fire", "Light"] },
    Projection: { category: "directional", inversion: "unknown", behavior: "projects an image or a given effect outward", balance: "Place projection signs toward the surface or target", compatibleWith: ["Light", "Reflection", "Conceal", "Regions"] },
    Stillness: { category: "unknown", inversion: "unknown", behavior: "holds magic static in one location", balance: "Keep static signs evenly spaced around the held region", compatibleWith: ["Stability", "Immobility", "Regions"] },
    Link: { category: "semi-directional", inversion: "unknown", behavior: "links two objects made from or broken off the same source", balance: "One linked sign must correspond to each connected endpoint", compatibleWith: ["Windows", "Doorways", "Regions"] },

    Billow: { category: "unknown", inversion: "unknown", behavior: "turns available material into a soft, buoyant cloud", balance: "Keep the billow signs evenly distributed around the material source", compatibleWith: ["Water", "Earth", "Aeriforms", "Wind"] },
    Bolt: { category: "non-directional", inversion: "unknown", behavior: "creates spear-like offensive projectiles", balance: "The number of bolt signs affects the number of projectiles", compatibleWith: ["Piercing", "Column", "Water", "Fire"] },
    Cool: { category: "semi-directional", inversion: "unknown", behavior: "cools the affected material", balance: "Distribute cooling signs evenly to avoid uneven freezing", compatibleWith: ["Water", "Crystalize", "Holding", "Stability"] },
    Crosshair: { category: "directional", inversion: "unknown", behavior: "targets whatever the short ends of the sign point toward", balance: "All crosshair signs should agree on the selected target", compatibleWith: ["Sights Set", "Guidance", "Regions", "Light"] },
    Eye: { category: "unknown", inversion: "unknown", behavior: "the current wiki data does not give a confirmed independent effect", balance: "Keep its role and position consistent until verified", compatibleWith: [] },
    Float: { category: "non-directional", inversion: "not-supported", behavior: "holds an object on a stable plane in air", balance: "Use balanced radial or bilateral distribution", compatibleWith: ["Levitation", "Stability", "Wind Underfoot"] },
    Focus: { category: "directional", inversion: "not-supported", behavior: "aims the spell toward a selected point or target", balance: "Point all focus signs toward the same intended target", compatibleWith: ["Sights Set", "Regions", "Crosshair", "Guidance"] },
    Orb: { category: "non-directional", inversion: "not-supported", behavior: "creates a spherical region in which controlled material collects", balance: "Keep the orb arrangement symmetric around the target region", compatibleWith: ["Water", "Collection", "Holding", "Partition"] },
    Project: { category: "directional", inversion: "unknown", behavior: "projects a specified image or effect outward", balance: "Point projection signs toward the intended surface", compatibleWith: ["Reflection", "Light", "Conceal", "Regions"] },
    Pull: { category: "directional", inversion: "supported", behavior: "pulls a target toward the seal and can push it away when inverted", balance: "Tilted pulling signs can produce both pull and twist", compatibleWith: ["Pulling", "Guidance", "Wind", "Regions"] },
    Puppet: { category: "semi-directional", inversion: "not-supported", behavior: "allows a target object to be controlled through distant manipulation", balance: "Keep puppet signs balanced around the controlled object", compatibleWith: ["Wind", "Sights Set", "Mimicry"] },
    Radial: { category: "directional", inversion: "unknown", behavior: "a radial structural modifier whose precise confirmed effect depends on the source sign", balance: "Preserve radial or bilateral symmetry", compatibleWith: ["Regions", "Dispersion", "Levitation"] },
    Reflect: { category: "directional", inversion: "unknown", behavior: "targets or projects a reflected image", balance: "Point reflection signs toward the reflected subject", compatibleWith: ["Reflection", "Light", "Projection", "Conceal"] },
    Region: { category: "directional", inversion: "unknown", behavior: "determines where magic manifests in relation to the seal", balance: "Use inward, outward or opposing regions consistently", compatibleWith: ["Regions", "Partition", "Column", "Dispersion"] },
    "Sign of Wind": { category: "asymmetric", inversion: "unknown", behavior: "relates to wind movement or spiraling air", balance: "Arrange spiraling wind signs coherently", compatibleWith: ["Wind", "Whorling Winds", "Levitation"] },
    Vision: { category: "unknown", inversion: "unknown", behavior: "its independent effect is not confirmed by the wiki and must not be inferred from the symbol name", balance: "Keep the role, facing and position conservative until verified", compatibleWith: [] },
    Window: { category: "directional", inversion: "unknown", behavior: "connects separated spaces as a window or doorway-like link", balance: "Place window signs consistently along the connection boundary", compatibleWith: ["Windows", "Doorways", "Link"] },
    Windowway: { category: "directional", inversion: "unknown", behavior: "creates or defines a windowway connection", balance: "Keep linked windowway signs aligned across endpoints", compatibleWith: ["Windows", "Doorways", "Link"] },
};

export function getSignProperty(name: string): SignProperty {
    const baseName = name.replace(/^sign_/, "").replace(/ \(Inverted\)$/i, "");
    return signPropertyEntries[baseName] ?? {
        category: "unknown",
        inversion: "unknown",
        behavior: "the wiki does not provide enough confirmed meaning for this sign",
        balance: "Keep it balanced until its directional behavior is verified",
        compatibleWith: [],
    };
}

export function isSignCompatible(name: string, sigilName: string): boolean {
    const property = getSignProperty(name);
    const sigilBase = sigilName.replace(/^sigil_/, "");
    return property.compatibleWith.length === 0 || property.compatibleWith.some(value => sigilBase === value || sigilBase.includes(value) || value.includes(sigilBase));
}
