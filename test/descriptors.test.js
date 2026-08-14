import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TERRAIN_DESCRIPTORS,
  NODE_CLASS_TERRAIN,
  descriptorFor,
  descriptorCollisions,
} from '../src/constants.js';
import { descriptorText, descriptorBadge } from '../src/panel.js';

// The invariant the table is built on: one terrain per (building, level) rung.
// Three rows broke it when the table was first assembled, which is why this is
// checked rather than assumed.
test('no two terrains grant the same building the same bonus', () => {
  assert.deepEqual(descriptorCollisions(), []);
});

test('a collision is caught, and a disputed row is exempt', () => {
  assert.equal(descriptorCollisions({
    1: { name: 'A', bonus: 3, product: 'Bows', building: 'Bowyer' },
    2: { name: 'B', bonus: 3, product: 'Bows', building: 'Bowyer' },
  }).length, 1);
  assert.deepEqual(descriptorCollisions({
    1: { name: 'A', bonus: 3, product: 'Bows', building: 'Bowyer' },
    2: { name: 'B', bonus: 3, product: 'Bows', building: 'Bowyer', disputed: 'known' },
  }), []);
});

// The glacial set repeats five rungs the temperate set already holds. That is
// the observed pattern — the two families are told apart by whether `rs` sums to
// 25 — so the invariant is scoped by family and the duplicates are not clashes.
test('a rung may be held once per family, not twice within one', () => {
  const shared = { bonus: 1, product: 'Chainmail', building: 'Armourer' };
  assert.deepEqual(descriptorCollisions({
    1: { name: 'temperate one', ...shared },
    2: { name: 'glacial one', ...shared, family: 'glacial' },
  }), []);
  assert.equal(descriptorCollisions({
    1: { name: 'glacial one', ...shared, family: 'glacial' },
    2: { name: 'glacial two', ...shared, family: 'glacial' },
  }).length, 1);
});

test('the glacial rows carry their family, the temperate rows do not', () => {
  assert.equal(descriptorFor(87).family, 'glacial');   // Lichen
  assert.equal(descriptorFor(16).family, undefined);   // Alluvial Plain
  // Both hold Cattle Rancher +1%, one per family.
  assert.equal(descriptorFor(87).building, descriptorFor(16).building);
  assert.equal(descriptorFor(87).bonus, descriptorFor(16).bonus);
});

test('the ladder is 1/2/3 — no bonus outside it', () => {
  for (const [i, d] of Object.entries(TERRAIN_DESCRIPTORS)) {
    if (!d.building) continue;
    assert.ok([1, 2, 3].includes(d.bonus), `i:${i} has bonus ${d.bonus}`);
    assert.ok(d.product, `i:${i} names a building but no product`);
  }
});

// Every building a descriptor names is a Production Structure — the crafting
// ones as much as the military ones — so a descriptor never rides on something
// the city might not have. This once read the other way round, because the
// structure table carried one generic "Crafting structure" row.
test('every descriptor names a structure the tool knows', () => {
  for (const [i, d] of Object.entries(TERRAIN_DESCRIPTORS)) {
    if (!d.building) continue;
    const got = descriptorFor(Number(i));
    assert.ok(got.sovKey, `i:${i} names ${d.building}, which SOV_STRUCTURES lacks`);
    assert.equal(got.conditional, false, `i:${i} should not be conditional`);
  }
});

test('the structure key resolves for military and crafting alike', () => {
  assert.equal(descriptorFor(56).sovKey, 'trainingGround');  // military
  assert.equal(descriptorFor(52).sovKey, 'bowyer');          // crafting
  assert.equal(descriptorFor(30).sovKey, 'finishingSchool');
  assert.equal(descriptorFor(87).sovKey, 'cattleRancher');   // glacial
});

// The flag is unused today but not dead: the table is read off the game, and a
// row naming something the structure table lacks has to be visible.
test('conditional still fires for a building the tool does not know', () => {
  const made = { i: 999, name: 'Somewhere', bonus: 2, product: 'Pies', building: 'Bakery' };
  assert.match(descriptorText({ descriptor: { ...made, conditional: true } }), /needs a Bakery/);
});

test('Poleturner is spelt one way', () => {
  const spellings = new Set(Object.values(TERRAIN_DESCRIPTORS)
    .map((d) => d.building).filter((b) => b && /pole/i.test(b)));
  assert.deepEqual([...spellings], ['Poleturner']);
});

test('no-bonus terrain is a known answer, not a gap', () => {
  const plains = descriptorFor(58);
  assert.equal(plains.name, 'Plains');
  assert.equal(plains.building, undefined);
  assert.match(descriptorText({ i: 58 }), /no sovereignty bonus/);
});

test('an unmapped id reads as unidentified, a node class as varying', () => {
  assert.equal(descriptorFor(3), null);
  assert.match(descriptorText({ i: 3 }), /unidentified/);
  assert.ok(NODE_CLASS_TERRAIN.has(44));
  assert.match(descriptorText({ i: 44 }), /varies/);
});

test('descriptorText names the bonus, its product and its structure', () => {
  assert.match(descriptorText({ i: 52 }), /Thick Forest: \+3% Bows per level of Bowyer/);
  assert.doesNotMatch(descriptorText({ i: 52 }), /needs a/);
});

// The badge is the same fact on the tile itself rather than in hover text.
test('the badge names the product, and shows nothing for plain terrain', () => {
  assert.match(descriptorBadge({ i: 52 }), /\+3% Bows/);
  assert.equal(descriptorBadge({ i: 58 }), '');   // Plains, no bonus
  assert.equal(descriptorBadge({ i: 3 }), '');    // unidentified
  assert.equal(descriptorBadge({}), '');          // no `i` at all
});

// The pairs an icon set cannot tell apart. Writing the product out is the only
// thing that separates them on the tile, so it is pinned.
test('rungs sharing a subject stay distinguishable on the tile', () => {
  assert.match(descriptorBadge({ i: 52 }), /Bows/);            // Bowyer
  assert.match(descriptorBadge({ i: 53 }), /Ranged Units/);    // Target Range
  assert.match(descriptorBadge({ i: 49 }), /Horses/);          // Farrier
  assert.match(descriptorBadge({ i: 33 }), /Cavalry Units/);   // Jousting Yard
  assert.match(descriptorBadge({ i: 48 }), /Siege Blocks/);    // Engineering Yard
  assert.match(descriptorBadge({ i: 71 }), /Siege Units/);     // Assembly Yard
});

// No art for these, so none is borrowed — a wrong icon reads as a fact.
test('no descriptor badge carries an image', () => {
  for (const i of Object.keys(TERRAIN_DESCRIPTORS)) {
    assert.doesNotMatch(descriptorBadge({ i: Number(i) }), /<img/, `i:${i}`);
  }
});

// Every inherited row that broke the rule turned out to be wrong when read off
// the tile, so nothing is marked today. The mechanism is still tested above,
// against a table built for the purpose.
test('no row is disputed', () => {
  assert.deepEqual(
    Object.entries(TERRAIN_DESCRIPTORS).filter(([, d]) => d.disputed).map(([i]) => i),
    [],
  );
});

// Rivers were recorded as carrying two innate crafting bonuses. They carry
// neither — a river is worth its food rating and nothing else.
test('rivers grant no descriptor bonus', () => {
  assert.equal(descriptorFor(59).building, undefined);
  assert.equal(descriptorFor(59).water, true);
  assert.match(descriptorText({ i: 59 }), /no sovereignty bonus/);
});

// The NPC settlement ring: nine tiles that would otherwise report as unknown on
// every scan that catches one.
test('the NPC settlement and its ring are identified', () => {
  assert.equal(descriptorFor(66).name, 'NPC settlement');
  assert.equal(descriptorFor(67).impassable, true);
  assert.match(descriptorText({ i: 67 }), /no sovereignty bonus/);
});
