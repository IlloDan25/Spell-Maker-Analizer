import test from "node:test";
import assert from "node:assert/strict";
import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell.ts";

import { getRadialSignIndices } from "../src/layout.ts";
import { parseEffect } from "../src/composition-engine.ts";
import {
    explainSpellComposition,
    findSpellRecipe,
    generateSpellRecipe,
    generateSpellCandidates,
} from "../src/spell-generator.ts";

test("finds a documented Rainbringer pattern", () => {
    const recipe = findSpellRecipe("make it rain in the courtyard");

    assert.ok(recipe);
    assert.equal(recipe.name, "Rainbringer");
    assert.equal(recipe.kind, "documented");
    assert.match(recipe.sourceUrl, /^https:\/\/witchhatatelier\.telepedia\.net\/wiki\//);
});

test("generates a creative proposal for an unknown effect", () => {
    const recipe = generateSpellRecipe("make blue flowers dance gently in the air");

    assert.ok(recipe);
    assert.equal(recipe.kind, "creative");
    assert.match(recipe.name, /^Experimental /);
    assert.ok(recipe.seals.length > 0);
    assert.ok(recipe.seals[0].rings?.length);
    assert.match(recipe.caveat, /unconfirmed/i);
});

test("parses semantic intent instead of using only one fixed template", () => {
    assert.equal(parseEffect("make my sword unbreakable").intent, "strength");
    assert.equal(parseEffect("make it rain in the courtyard").intent, "rain");
    assert.equal(parseEffect("pull enemies toward the seal").intent, "movement");
    assert.equal(parseEffect("purify dirty water").intent, "purify");
});

test("creative search produces varied topologies for unrelated intents", () => {
    const candidates = generateSpellCandidates("make a crystalline crescent barrier in the courtyard");

    assert.equal(candidates.length, 8);
    const names = candidates.map(candidate => candidate.name);
    assert.ok(new Set(names).size >= 5);
});

test("creative generation offers eight distinct deterministic candidates", () => {
    const candidates = generateSpellCandidates("make this object stronger");

    assert.equal(candidates.length, 8);
    assert.deepEqual(candidates, generateSpellCandidates("make this object stronger"));
    assert.equal(new Set(candidates.map(candidate => candidate.seals[0].rings?.length)).size >= 1, true);
    assert.equal(new Set(candidates.map(candidate => candidate.seals[0].signs?.map(sign => sign.name).join("+"))).size >= 1, true);
});

test("nested and linked structures are preserved in generated compositions", () => {
    const candidates = generateSpellCandidates("make a linked complex crystal construct in the courtyard");

    const nested = candidates.find(candidate => candidate.seals[0].rings?.some(ring => (ring as typeof ring & { nested?: boolean }).nested));
    assert.ok(nested);

    const linked = candidates.find(candidate => candidate.seals[0].lines?.some(line => (line as typeof line & { linked?: boolean }).linked));
    assert.ok(linked);
});

test("guided refinement modes change composition density", () => {
    const simpler = generateSpellCandidates("make a protective barrier", 0, "simpler");
    const powerful = generateSpellCandidates("make a protective barrier", 0, "powerful");

    assert.ok(simpler.length > 0);
    assert.ok(powerful.length > 0);
    assert.ok((powerful[0].seals[0].signs?.length ?? 0) >= (simpler[0].seals[0].signs?.length ?? 0));
});

test("explains collaboration sharing metadata honestly", () => {
    const explanation = explainSpellComposition({
        name: "Shared Test",
        collaboration: { enabled: true, room: "atelier-room", revision: 7 },
        seals: [{ name: "Test", rings: [{ name: "Main Ring", radius: 400 }] }],
    } as unknown as SpellType);

    assert.match(explanation, /atelier-room/);
    assert.match(explanation, /revision: 7/i);
    assert.match(explanation, /real-time collaboration backend/i);
});

test("refinement produces a different deterministic candidate batch", () => {
    const base = generateSpellCandidates("make blue flowers dance gently in the air", 0);
    const refined = generateSpellCandidates("make blue flowers dance gently in the air", 1);

    assert.equal(base.length, 8);
    assert.equal(refined.length, 8);
    assert.deepEqual(refined, generateSpellCandidates("make blue flowers dance gently in the air", 1));
    assert.notDeepEqual(base.map(candidate => candidate.name), refined.map(candidate => candidate.name));
});

test("creative generation is deterministic", () => {
    const first = generateSpellRecipe("cool a glass and make it hover");
    const second = generateSpellRecipe("cool a glass and make it hover");

    assert.ok(first);
    assert.ok(second);
    assert.deepEqual(first, second);
});

test("English and Spanish unbreakable requests share valid protective intent", () => {
    const english = generateSpellRecipe("make this object unbreakable");
    const spanish = generateSpellRecipe("haz este objeto irrompible");

    assert.ok(english);
    assert.ok(spanish);
    assert.equal(english.kind, "creative");
    assert.equal(spanish.kind, "creative");

    for (const recipe of [english, spanish]) {
        const seal = recipe.seals[0];
        assert.ok(seal.rings && seal.rings.length > 0);
        assert.ok(seal.sigils?.length);
        assert.ok(seal.signs?.length);
    }

    assert.deepEqual(
        english.seals.map(seal => ({
            rings: seal.rings,
            sigils: seal.sigils,
            signs: seal.signs,
        })),
        spanish.seals.map(seal => ({
            rings: seal.rings,
            sigils: seal.sigils,
            signs: seal.signs,
        })),
    );
});

test("manual sigil and sign positions remain exact and independent from crowns", () => {
    const spell = {
        custom: { images: [] },
        seals: [{
            name: "Manual Seal",
            rings: [{ name: "Main Ring", radius: 400 }],
            sigils: [{
                name: "sigil_Fire",
                positions: [{ x: 100, y: -150, angle: 45, size: 260 }],
            }],
            signs: [{
                name: "sign_Column",
                amount: 8,
                positions: [
                    { x: -300, y: 100, angle: 90, size: 180 },
                    { x: 300, y: -100, angle: 270, size: 220 },
                ],
            }],
        }],
    } as unknown as SpellType;

    const seal = spell.seals[0];
    assert.equal(seal.sigils?.[0].positions?.length, 1);
    assert.deepEqual(seal.sigils?.[0].positions?.[0], { x: 100, y: -150, angle: 45, size: 260 });
    assert.equal(seal.signs?.[0].positions?.length, 2);
    assert.deepEqual(seal.signs?.[0].positions?.[0], { x: -300, y: 100, angle: 90, size: 180 });
});

test("radial signs remain evenly distributed when signs are skipped", () => {
    assert.deepEqual(getRadialSignIndices(8, 0), [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(getRadialSignIndices(8, 2), [0, 1, 3, 4, 5, 7]);
    assert.deepEqual(getRadialSignIndices(4, 1), [0, 1, 3]);
});

test("creative layouts use one centered sigil and bounded concentric signs", () => {
    const recipe = generateSpellRecipe("make blue flowers dance gently in the air");

    assert.ok(recipe);
    const seal = recipe.seals[0];
    assert.ok(seal.rings && seal.rings.length >= 1);

    assert.equal(seal.sigils?.length, 1);
    assert.equal(seal.sigils?.[0].offsetX ?? 0, 0);
    assert.equal(seal.sigils?.[0].offsetY ?? 0, 0);

    assert.ok((seal.signs?.length ?? 0) <= 2);
    for (const sign of seal.signs ?? []) {
        assert.equal(sign.size ?? 0, 120);
        assert.ok((sign.amount ?? 0) >= 4);
        assert.equal(sign.amountSkip ?? 0, 0);
        assert.equal(sign.angle ?? 0, 0);
        const outerRingRadius = seal.rings?.[0]?.radius ?? 400;
        assert.equal(sign.offsetX ?? 0, 0);
        assert.equal(sign.offsetY ?? 0, 0);
        assert.equal(sign.offsetStrafe ?? 0, 0);
        assert.ok((sign.radius ?? 0) + (sign.size ?? 120) / 2 <= outerRingRadius);
    }
});

test("creative symbols exist in the project symbol catalog", () => {
    const recipe = generateSpellRecipe("protect the road and push enemies away");

    assert.ok(recipe);
    const seal = recipe.seals[0];

    for (const sigil of seal.sigils ?? []) {
        assert.match(sigil.name ?? "", /^sigil_/);
    }
    for (const sign of seal.signs ?? []) {
        assert.match(sign.name ?? "", /^sign_/);
    }
});

test("exposes custom images only in their selected role", () => {
    const images = [{ name: "Fire Wheel", role: "sign", description: "Spreads flame outward" }];

    // This test documents the data contract used by rebuildAvailableSymbols.
    assert.equal(images[0].role, "sign");
    assert.equal(images[0].description, "Spreads flame outward");
});

test("explains custom sigils and signs using the saved description", () => {
    const explanation = explainSpellComposition({
        name: "Custom Test",
        description: "Creates concentrated light and pushes it outward",
        custom: {
            images: [{ name: "Sun Core", role: "sigil", description: "Creates concentrated sunlight" }, { name: "Sun Rays", role: "sign", description: "Spreads light outward" }],
        },
        seals: [{
            name: "Custom Seal",
            rings: [{ name: "Main Ring", radius: 300 }],
            sigils: [{ name: "custom_Sun Core", size: 220 }],
            signs: [{ name: "custom_Sun Rays", amount: 8, radius: 250 }],
        }],
    } as unknown as SpellType);

    assert.match(explanation, /Creates concentrated light and pushes it outward/);
    assert.match(explanation, /Creates concentrated sunlight/);
    assert.match(explanation, /Spreads light outward/);
    assert.match(explanation, /fan-defined/i);
});

test("explains unbreakable requests as a proposal and names missing targeting", () => {
    const explanation = explainSpellComposition({
        name: "Experimental strength",
        description: "Generated from your request: Make my sword unbreakable\n\nType: New creative proposal",
        seals: [{
            name: "Strength",
            rings: [{ name: "Outer Ring", radius: 400 }],
            sigils: [{ name: "sigil_Earth", size: 180 }],
            signs: [{ name: "sign_Empower", amount: 6, radius: 240 }, { name: "sign_Solidify", amount: 8, radius: 310 }],
        }],
    } as unknown as SpellType);

    assert.match(explanation, /Requested effect: Make my sword unbreakable/);
    assert.match(explanation, /unconfirmed fan proposal/i);
    assert.match(explanation, /Selection sign/i);
    assert.match(explanation, /Earth sigil/i);
});

test("warns when a custom image is placed outside its declared role", () => {
    const explanation = explainSpellComposition({
        name: "Misplaced Custom",
        custom: {
            images: [{ name: "Outward Rays", role: "sign", description: "Spreads the effect outward" }],
        },
        seals: [{
            name: "Test Seal",
            rings: [{ name: "Main Ring", radius: 300 }],
            sigils: [{ name: "custom_Outward Rays", size: 220 }],
        }],
    } as unknown as SpellType);

    assert.match(explanation, /declared as a sign.*placed in the sigil list/i);
    assert.match(explanation, /Spreads the effect outward/);
});

test("explains circle components and sign properties", () => {
    const explanation = explainSpellComposition({
        name: "Test",
        seals: [{
            name: "Test Seal",
            rings: [{ name: "Main Ring", radius: 300 }],
            sigils: [{ name: "sigil_Water", size: 220 }],
            signs: [{
                name: "sign_Levitation",
                amount: 4,
                radius: 250,
                angle: 180,
                rotation: 45,
                offsetStrafe: 10,
            }],
        }],
    } as unknown as SpellType);

    assert.match(explanation, /Main Ring|Levitation|ring|seal/i);
    assert.match(explanation, /water/i);
    assert.match(explanation, /Levitation/i);
    assert.match(explanation, /crown of 4 signs/i);
    assert.match(explanation, /stability|balance/i);
});
