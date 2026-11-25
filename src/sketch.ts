import p5 from "p5";
import type { Sign as SignType, WitchHatAtelierSpellMaker as SpellType } from "../types/spell";
import type { SymbolsImages } from "../types/symbols";
import { jsonEditor } from "./form";
import { getRadialSignIndices } from "./layout";

import symbols from "./data/symbols.json";
import schema from "./schemas/spell.json";

interface DragTarget {
    sealIndex: number;
    type: "sigil" | "sign";
    symbolIndex: number;
    positionIndex: number;
    radialIndex?: number;
    x: number;
    y: number;
    size: number;
}

interface DragState {
    target: DragTarget;
    previousMouseX: number;
    previousMouseY: number;
}

const dragTargets: DragTarget[] = [];
let dragState: DragState | null = null;


// Stores the symbols images
const symbolsImages: SymbolsImages = {
    customs: {},
    sigils: {},
    signs: {},
    forbiddens: {},
    shapes: {},
    tohs: {},
};

// Stores the information about which element to highlight
export const highlightInfo: { seal: number | null, type: string | null, index: number | null } = { seal: null, type: null, index: null };



const sketch = (p: p5) => {
    // Drawing defaults, for fallback purposes
    const defaults: any = {};

    let brushBuddy: p5.Image;

    let centerX = 500;
    let centerY = 500;



    // #region SETUP
    p.setup = async () => {
        const canvas = p.createCanvas(1000, 1000);
        canvas.id("spell-canvas");

        const sealContainer = document.getElementById("spell-container");
        if (sealContainer) canvas.parent(sealContainer);


        brushBuddy = await p.loadImage("images/brushbuddy.webp");

        // Loading image data
        if (typeof symbols == "object" && symbols.sigils && symbols.signs) {
            for (const sigil_name in symbols.sigils) {
                symbolsImages.sigils["sigil_" + sigil_name] = await p.loadImage(symbols.sigils[sigil_name as keyof typeof symbols.sigils]);
            }
            for (const sign_name in symbols.signs) {
                symbolsImages.signs["sign_" + sign_name] = await p.loadImage(symbols.signs[sign_name as keyof typeof symbols.signs]);
            }
            for (const shape_name in symbols.shapes) {
                symbolsImages.shapes["shape_" + shape_name] = await p.loadImage(symbols.shapes[shape_name as keyof typeof symbols.shapes]);
            }
            for (const forbidden_name in symbols.forbiddens) {
                symbolsImages.forbiddens["forbidden_" + forbidden_name] = await p.loadImage(symbols.forbiddens[forbidden_name as keyof typeof symbols.forbiddens]);
            }
            for (const toh_name in symbols.tohs) {
                symbolsImages.tohs["toh_" + toh_name] = await p.loadImage(symbols.tohs[toh_name as keyof typeof symbols.tohs]);
            }
        }

        // Loading default values from schema
        if (typeof schema == "object") {
            // Typically angle 0 is right, now it's up
            defaults.globalRingOffsetAngle = 270;

            defaults.spell = {
                background: schema.properties.background.default,
                backgroundColor: schema.properties.backgroundColor.default,
                color: schema.definitions.color.default,
                weight: schema.definitions.weight.default,
                highlightColor: schema.properties.highlightColor.default
            };

            defaults.seal = {
                visible: schema.definitions.visible.default,
                color: schema.definitions.color.default,
                angle: schema.definitions.angle.default,
                scale: schema.definitions.scale.default,
                weight: schema.definitions.weight.default,
                offsetX: schema.definitions.offset.default,
                offsetY: schema.definitions.offset.default
            };

            defaults.ring = {
                visible: schema.definitions.visible.default,
                color: schema.definitions.color.default,
                filled: schema.properties.seals.items.properties.rings.items.properties.filled.default,
                fillColor: schema.properties.seals.items.properties.rings.items.properties.fillColor.default,
                radius: schema.definitions.radius.default,
                weight: schema.definitions.weight.default,
                openingSize: schema.definitions.angle.default,
                openingAngle: schema.definitions.angle.default,
                offsetX: schema.definitions.offset.default,
                offsetY: schema.definitions.offset.default
            };

            defaults.sigil = {
                visible: schema.definitions.visible.default,
                tinted: schema.properties.seals.items.properties.sigils.items.properties.tinted.default,
                color: schema.definitions.color.default,
                size: schema.properties.seals.items.properties.sigils.items.properties.size.default,
                angle: schema.definitions.angle.default,
                offsetX: schema.definitions.offset.default,
                offsetY: schema.definitions.offset.default,

                // These aren't actually present in sigils,
                // but we loop them together so we need these
                amount: 1,
                amountSkip: 0,
                rotation: 0,
                radius: 0,
                offsetStrafe: 0
            };

            defaults.sign = {
                visible: schema.definitions.visible.default,
                tinted: schema.properties.seals.items.properties.signs.items.properties.tinted.default,
                color: schema.definitions.color.default,
                size: schema.properties.seals.items.properties.signs.items.properties.size.default,
                angle: schema.definitions.angle.default,
                offsetX: schema.definitions.offset.default,
                offsetY: schema.definitions.offset.default,
                offsetStrafe: schema.definitions.offset.default,
                amount: schema.properties.seals.items.properties.signs.items.properties.amount.default,
                amountSkip: schema.properties.seals.items.properties.signs.items.properties.amountSkip.default,
                rotation: schema.definitions.angle.default,
                radius: schema.properties.seals.items.properties.signs.items.properties.radius.default
            };

            defaults.line = {
                visible: schema.definitions.visible.default,
                color: schema.definitions.color.default,
                weight: schema.definitions.weight.default,
                x: schema.definitions.offset.default,
                y: schema.definitions.offset.default
            }
        }

        centerX = p.width / 2;
        centerY = p.height / 2;

        p.imageMode(p.CENTER);

        p.ellipseMode(p.CENTER);
        p.ellipseMode(p.RADIUS);
        p.angleMode(p.DEGREES);
        p.rectMode(p.CENTER);

        p.colorMode(p.RGB);
        p.strokeCap(p.ROUND);
        p.strokeJoin(p.ROUND);

        p.noFill();

        p.noLoop();

        const canvasElement = canvas.elt as HTMLCanvasElement;
        const canvasPoint = (event: MouseEvent) => {
            const rect = canvasElement.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * p.width / rect.width,
                y: (event.clientY - rect.top) * p.height / rect.height,
            };
        };

        canvasElement.addEventListener("mousedown", event => {
            if (!jsonEditor) return;

            const point = canvasPoint(event);
            let closest: DragTarget | null = null;
            let closestDistance = Number.POSITIVE_INFINITY;
            for (const target of dragTargets) {
                const dx = point.x - target.x;
                const dy = point.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= target.size / 2 && distance < closestDistance) {
                    closest = target;
                    closestDistance = distance;
                }
            }

            if (closest) {
                dragState = {
                    target: closest,
                    previousMouseX: point.x,
                    previousMouseY: point.y,
                };
                canvasElement.style.cursor = "grabbing";
                event.preventDefault();
            }
        });

        canvasElement.addEventListener("mousemove", event => {
            if (!dragState || !jsonEditor) {
                const point = canvasPoint(event);
                const hovering = dragTargets.some(target => {
                    const dx = point.x - target.x;
                    const dy = point.y - target.y;
                    return Math.sqrt(dx * dx + dy * dy) <= target.size / 2;
                });
                canvasElement.style.cursor = hovering ? "grab" : "default";
                return;
            }

            const point = canvasPoint(event);
            const { target, previousMouseX, previousMouseY } = dragState;
            const spell = jsonEditor.getValue() as SpellType;
            const seal = spell.seals?.[target.sealIndex];
            if (!seal) return;

            const sealAngle = (seal.angle ?? defaults.seal.angle) * Math.PI / 180;
            const sealScale = (seal.scale ?? defaults.seal.scale) / 100;
            const worldDx = point.x - previousMouseX;
            const worldDy = point.y - previousMouseY;
            const localDx = (Math.cos(sealAngle) * worldDx + Math.sin(sealAngle) * worldDy) / sealScale;
            const localDy = (-Math.sin(sealAngle) * worldDx + Math.cos(sealAngle) * worldDy) / sealScale;

            const symbol = target.type === "sigil"
                ? seal.sigils?.[target.symbolIndex]
                : seal.signs?.[target.symbolIndex];
            if (!symbol) return;

            const symbolWithPositions = symbol as typeof symbol & { positions?: Array<{ x?: number; y?: number; angle?: number; size?: number }> };

            if (!symbolWithPositions.positions?.length) {
                if (target.type === "sigil") {
                    symbolWithPositions.positions = [{
                        x: symbol.offsetX ?? defaults.sigil.offsetX,
                        y: symbol.offsetY ?? defaults.sigil.offsetY,
                        angle: symbol.angle ?? defaults.sigil.angle,
                        size: symbol.size ?? defaults.sigil.size,
                    }];
                } else {
                    const sign = symbol as typeof symbol & { amount?: number; amountSkip?: number; radius?: number; rotation?: number; offsetX?: number; offsetY?: number; offsetStrafe?: number };
                    const amount = sign.amount ?? defaults.sign.amount;
                    const indices = getRadialSignIndices(amount, sign.amountSkip ?? defaults.sign.amountSkip);
                    const radialRotation = sign.rotation ?? defaults.sign.rotation;
                    const signRadius = sign.radius ?? defaults.sign.radius;
                    const strafe = sign.offsetStrafe ?? defaults.sign.offsetStrafe;
                    const offsetX = sign.offsetX ?? defaults.sign.offsetX;
                    const offsetY = sign.offsetY ?? defaults.sign.offsetY;
                    const signAngle = sign.angle ?? defaults.sign.angle;

                    symbolWithPositions.positions = indices.map(radialIndex => {
                        const positionAngle = radialRotation + radialIndex * 360 / amount;
                        const radians = positionAngle * Math.PI / 180;
                        return {
                            x: offsetX + Math.cos(radians) * strafe + Math.sin(radians) * signRadius,
                            y: offsetY + Math.sin(radians) * strafe - Math.cos(radians) * signRadius,
                            angle: positionAngle + signAngle,
                            size: sign.size ?? defaults.sign.size,
                        };
                    });
                }
            }

            const position = symbolWithPositions.positions[target.positionIndex];
            if (position) {
                position.x = (position.x ?? 0) + localDx;
                position.y = (position.y ?? 0) + localDy;
                jsonEditor.setValue(spell);
                p.redraw();
            }

            dragState.previousMouseX = point.x;
            dragState.previousMouseY = point.y;
        });

        canvasElement.addEventListener("mouseup", () => {
            dragState = null;
            canvasElement.style.cursor = "default";
        });
    };
    // #endregion SETUP



    // #region DRAW
    p.draw = () => {
        dragTargets.length = 0;
        // Editor not loaded yet
        if (!jsonEditor) {
            console.warn("Editor not loaded yet. Drawing skipped");
            p.clear();
            p.image(brushBuddy, centerX, centerY, 1000, 1000);
            return;
        };

        let spell: SpellType;
        try {
            spell = jsonEditor.getValue();
            if (!spell || typeof spell !== "object") throw new Error("Spell is not valid");
        } catch (e) {
            console.error(e);
            p.clear();
            p.image(brushBuddy, centerX, centerY, 1000, 1000);
            return;
        }



        if (spell.background ?? defaults.spell.background) {
            p.background(spell.backgroundColor ?? defaults.spell.backgroundColor);
        } else {
            // Clears the canvas (makes it transparent)
            p.clear();
        }



        // Drawing the optional grid with a opposite color as the background
        const backgroundColor = (spell.grid ?? defaults.spell.grid) ? p.color(spell.backgroundColor ?? defaults.spell.backgroundColor) : p.color(defaults.spell.backgroundColor);
        const oppositeColor = p.color(255 - p.red(backgroundColor), 255 - p.green(backgroundColor), 255 - p.blue(backgroundColor));
        if (spell.grid ?? defaults.spell.grid) {
            p.stroke(oppositeColor);
            for (let i = 50; i < p.width; i += 50) {
                if (i % 100) p.strokeWeight(0.25);
                else p.strokeWeight(1);
                p.line(0, i, p.height, i);
                p.line(i, 0, i, p.width);
            }
        }



        // Drawing the seals
        // #region SEALS
        for (let sealIndex = 0; sealIndex < (spell.seals ?? []).length; sealIndex++) {
            const seal = spell.seals![sealIndex];

            if (!(seal.visible ?? defaults.seal.visible))
                continue;

            const sealOffsetX = seal.offsetX ?? defaults.seal.offsetX;
            const sealOffsetY = seal.offsetY ?? defaults.seal.offsetY;
            const sealAngle = seal.angle ?? defaults.seal.angle;
            const sealScale = (seal.scale ?? defaults.seal.scale) / 100;

            p.push(); // SEAL

            p.translate(centerX + sealOffsetX, centerY + sealOffsetY);
            p.scale(sealScale);
            p.rotate(sealAngle);



            // Drawing the rings fills
            // #region RINGS (FILL)
            for (const ring of seal.rings ?? []) {
                const ringDefaults = defaults.ring;
                if (!(typeof ring.visible === "undefined" ? ringDefaults.visible : ring.visible))
                    continue;
                if (!(typeof ring.filled === "undefined" ? ringDefaults.filled : ring.filled))
                    continue;

                const ringOffsetX = ring.offsetX ?? ringDefaults.offsetX;
                const ringOffsetY = ring.offsetY ?? ringDefaults.offsetY;
                const ringRadius = ring.radius ?? ringDefaults.radius;
                const ringFillColor = ring.fillColor ?? ringDefaults.fillColor;

                p.push(); // RING

                p.translate(ringOffsetX, ringOffsetY);

                p.noStroke();
                p.fill(ringFillColor);
                p.circle(0, 0, ringRadius);

                p.pop(); // RING
            }
            // #endregion RINGS (FILL)



            // #region SIGILS & SIGNS
            const allSymbols: SignType[] = [
                ...(seal.sigils ?? []).map((s: object) => Object.assign(structuredClone(s), { type: "sigil" })),
                ...(seal.signs ?? []).map((s: object) => Object.assign(structuredClone(s), { type: "sign" }))
            ];

            // Drawing the sigils and signs (collectively referred as symbols)
            for (let symbolIndex = 0; symbolIndex < allSymbols.length; symbolIndex++) {
                const symbol = allSymbols[symbolIndex];

                const symbolName = symbol.name ?? "";
                const symbolDrawType = (symbol.type as string);
                const symbolImageType = symbolName.split("_")[0] + "s";
                const symbolDefaults = defaults[symbolDrawType];

                if (!(symbol.visible ?? symbolDefaults.visible))
                    continue;

                const symbolTinted = symbol.tinted ?? symbolDefaults.tinted;
                const symbolColor = symbol.color ?? symbolDefaults.color;
                const symbolSize = symbol.size ?? symbolDefaults.size;
                const symbolAngle = symbol.angle ?? symbolDefaults.angle;

                const symbolOffsetStrafe = symbol.offsetStrafe
                    ?? (symbolDrawType === "sign" ? symbolDefaults.offsetStrafe : symbolDefaults.offsetX);
                const symbolOffsetX = symbol.offsetX ?? symbolDefaults.offsetX;
                const symbolOffsetY = symbol.offsetY ?? symbolDefaults.offsetY;

                const symbolAmount = symbol.amount ?? symbolDefaults.amount;
                const symbolAmountDrawIndices = symbolDrawType === "sign"
                    ? getRadialSignIndices(symbolAmount, symbol.amountSkip ?? symbolDefaults.amountSkip)
                    : Array.from({ length: symbolAmount }, (_, index) => index);



                // Preventing invalid images from causing problems
                let symbolImage: p5.Image;
                if (symbolsImages[symbolImageType] && symbolsImages[symbolImageType][symbolName]) {
                    symbolImage = symbolsImages[symbolImageType][symbolName];
                } else {
                    continue;
                };



                // Because sigils and signs get combined will need to separate the indices
                const localIndex = symbolIndex - (symbolDrawType === "sign" ? (seal.sigils?.length ?? 0) : 0);
                const symbolHighlighted = spell.highlight && highlightInfo.seal === sealIndex && highlightInfo.type === symbolDrawType && highlightInfo.index === localIndex;
                const tintColor = symbolHighlighted ? (spell.highlightColor ?? defaults.spell.highlightColor) : symbolColor;



                let tintedImage = null;
                if (symbolTinted || symbolHighlighted) {
                    // Creating a image that has a solid color
                    // to mask with the symbol image alpha channel
                    // and that can be reused in the loop below
                    tintedImage = p.createImage(1, 1);

                    // symbolColor: "#rrggbb"
                    const r = parseInt((tintColor as string).substring(1, 3), 16);
                    const g = parseInt((tintColor as string).substring(3, 5), 16);
                    const b = parseInt((tintColor as string).substring(5, 7), 16);
                    tintedImage.set(0, 0, [r, g, b, 255]);

                    // colorImage.set(0, 0, p.color(symbolColor));
                    // Doesn't work because of the error:
                    // An error with message "p5 is not defined" occurred inside the p5js library when set was called.
                    // Potentially caused by https://github.com/processing/p5.js/issues/8302

                    tintedImage.updatePixels();
                    tintedImage.resize(symbolImage.width, symbolImage.height);

                    // Masking the color image with the alpha channel of the symbol image
                    tintedImage.mask(symbolImage);
                }



                // Drawing each of the sigils/signs in the circle
                const configuredPositions = (symbol as SignType & { positions?: Array<{ x?: number, y?: number, angle?: number, size?: number }> }).positions;
                const manualPositions = configuredPositions && configuredPositions.length > 0 ? configuredPositions : null;

                const positionsToDraw = manualPositions && manualPositions.length > 0
                    ? manualPositions.map(position => ({
                        i: 0,
                        x: position.x ?? 0,
                        y: position.y ?? 0,
                        angle: position.angle ?? symbolAngle,
                        size: position.size ?? symbolSize,
                    }))
                    : symbolAmountDrawIndices.map(i => ({ i, x: symbolOffsetX, y: symbolOffsetY, angle: symbolAngle, size: symbolSize }));

                for (const position of positionsToDraw) {
                    p.push(); // SIGILS & SIGNS

                    // Manual positions override the crown and retain exact local placement.
                    p.translate(manualPositions ? position.x : symbolOffsetX, manualPositions ? position.y : symbolOffsetY);

                    // The best way imagine these transformation is to imagine them
                    // happening in the opposite way they are defined in the code
                    if (symbolDrawType === "sign" && !manualPositions) {
                        // Rotate around center of the sign circle with an
                        // offset based on the index of the current sign
                        p.rotate(
                            (symbol.rotation ?? symbolDefaults.rotation) +
                            position.i * 360 / symbolAmount
                        );

                        // Translate to the upper part of the sign circle
                        p.translate(0, - (symbol.radius ?? symbolDefaults.radius));

                        // Translate the sigil/sign side-to-side relative
                        // to the sign circle individual sign position
                        p.translate(symbolOffsetStrafe, 0);
                    }

                    // Rotate around the sigil/sign center
                    p.rotate(position.angle);

                    if (tintedImage) {
                        p.image(tintedImage, 0, 0, position.size, position.size);
                    } else {
                        p.image(symbolImage, 0, 0, position.size, position.size);
                    }

                    // Draw borders around the symbols
                    if (spell.symbolBorder) {
                        p.strokeWeight(2);
                        p.noFill();
                        p.strokeWeight(1 / sealScale);
                        p.stroke(tintColor);
                        p.rect(0, 0, position.size, position.size);
                    }

                    const positionIndex = positionsToDraw.indexOf(position);
                    let localTargetX = position.x;
                    let localTargetY = position.y;

                    if (!manualPositions && symbolDrawType === "sign") {
                        const radialRotation = (symbol.rotation ?? symbolDefaults.rotation) + position.i * 360 / symbolAmount;
                        const radians = radialRotation * Math.PI / 180;
                        localTargetX = symbolOffsetX + Math.cos(radians) * symbolOffsetStrafe + Math.sin(radians) * (symbol.radius ?? symbolDefaults.radius);
                        localTargetY = symbolOffsetY + Math.sin(radians) * symbolOffsetStrafe - Math.cos(radians) * (symbol.radius ?? symbolDefaults.radius);
                    } else if (!manualPositions) {
                        localTargetX = symbolOffsetX;
                        localTargetY = symbolOffsetY;
                    }

                    const sealAngleRadians = sealAngle * Math.PI / 180;
                    const worldX = centerX + sealOffsetX + sealScale * (Math.cos(sealAngleRadians) * localTargetX - Math.sin(sealAngleRadians) * localTargetY);
                    const worldY = centerY + sealOffsetY + sealScale * (Math.sin(sealAngleRadians) * localTargetX + Math.cos(sealAngleRadians) * localTargetY);

                    dragTargets.push({
                        sealIndex,
                        type: symbolDrawType as "sigil" | "sign",
                        symbolIndex: localIndex,
                        positionIndex,
                        radialIndex: !manualPositions && symbolDrawType === "sign" ? position.i : undefined,
                        x: worldX,
                        y: worldY,
                        size: position.size * sealScale,
                    });

                    p.pop(); // SIGILS & SIGNS
                }

            }
            // #endregion SIGILS & SIGNS



            // Drawing the lines
            // #region LINES
            for (let lineIndex = 0; lineIndex < (seal.lines ?? []).length; lineIndex++) {
                const line = seal.lines![lineIndex];

                const lineHighlighted = spell.highlight && highlightInfo.seal === sealIndex && highlightInfo.type === "line" && highlightInfo.index === lineIndex;

                const lineDefaults = defaults.line;
                if (!(typeof line.visible === "undefined" ? lineDefaults.visible : line.visible))
                    continue;

                p.stroke(lineHighlighted ? spell.highlightColor ?? defaults.spell.highlightColor : line.color ?? defaults.spell.color);
                p.strokeWeight(line.weight ?? defaults.spell.weight);

                // Creating a continuum of one or more line segments
                p.beginShape();
                for (const point of line.points ?? []) {
                    p.vertex(point.x ?? defaults.line.x, point.y ?? defaults.line.y);
                }
                p.endShape();
            }
            // #endregion LINES



            // Drawing the rings strokes
            // #region RINGS (STROKE)
            for (let ringIndex = 0; ringIndex < (seal.rings ?? []).length; ringIndex++) {
                const ring = seal.rings![ringIndex];

                const ringDefaults = defaults.ring;
                if (!(typeof ring.visible === "undefined" ? ringDefaults.visible : ring.visible))
                    continue;

                const ringOffsetX = ring.offsetX ?? ringDefaults.offsetX;
                const ringOffsetY = ring.offsetY ?? ringDefaults.offsetY;
                const ringRadius = ring.radius ?? ringDefaults.radius;
                const ringOpeningSize = p.map(ring.openingSize ?? ringDefaults.openingSize, 0, 360, 0, 360, true);
                const ringOpeningAngle = p.map((defaults.globalRingOffsetAngle + (ring.openingAngle ?? ringDefaults.openingAngle)) % 360, 0, 360, 0, 360, true);

                const ringHighlighted = spell.highlight && highlightInfo.seal === sealIndex && highlightInfo.type === "ring" && highlightInfo.index === ringIndex;

                p.push(); // RING

                p.translate(ringOffsetX, ringOffsetY);

                p.stroke(ringHighlighted ? spell.highlightColor ?? defaults.spell.highlightColor : ring.color ?? defaults.spell.color);
                p.strokeWeight(ring.weight ?? defaults.spell.weight);

                // Fix artifact if ringOpeningSize == 360
                if (ringOpeningSize < 360) {
                    p.arc(
                        0, 0,
                        ringRadius, ringRadius,
                        (ringOpeningAngle + ringOpeningSize / 2) % 360,
                        (ringOpeningAngle - ringOpeningSize / 2) % 360 + 360
                    );
                }

                p.pop(); // RING
            }
            // #endregion RINGS (STROKE)

            p.pop(); // SEAL
        }
        // #endregion SEALS
    };
    // #endregion DRAW
};



const myp5 = new p5(sketch, document.body);

window.myp5 = myp5;

export { myp5, symbolsImages };
