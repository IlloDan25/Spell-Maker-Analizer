import test from "node:test";
import assert from "node:assert/strict";
import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell.ts";

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

    assert.notEqual(english.name, spanish.name);
});

test("creative layouts use stable concentric positions", () => {
    const recipe = generateSpellRecipe("make blue flowers dance gently in the air");

    assert.ok(recipe);
    const seal = recipe.seals[0];
    assert.ok(seal.rings && seal.rings.length >= 1);

    for (const sign of seal.signs ?? []) {
        assert.equal(sign.size ?? 0, 150);
        assert.ok((sign.amount ?? 0) >= 4);
        assert.equal(sign.amountSkip ?? 0, 0);
        assert.equal(sign.angle ?? 0, 0);
        const outerRingRadius = seal.rings?.[0]?.radius ?? 400;
        assert.ok((sign.radius ?? 0) + (sign.size ?? 150) / 2 <= outerRingRadius);
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

    assert.match(explanation, /Main Ring/);
    assert.match(explanation, /Water/);
    assert.match(explanation, /Levitation/);
    assert.match(explanation, /radial symmetry of 4 positions/);
    assert.match(explanation, /rotation 45 degrees/);
});
