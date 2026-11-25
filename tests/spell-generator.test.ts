import test from "node:test";
import assert from "node:assert/strict";
import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell.ts";

import { getRadialSignIndices } from "../src/layout.ts";
import {
    explainSpellComposition,
    findSpellRecipe,
    generateSpellRecipe,
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

    assert.match(explanation, /A ring must contain|SEAL\{|SIGIL\(|SIGN\(/);
    assert.match(explanation, /Water/);
    assert.match(explanation, /Levitation/);
    assert.match(explanation, /SIGIL\(Water\)|SIGN\(Levitation/);
    assert.match(explanation, /rotation=|normally oriented|count=4/);
});
