import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TERRAIN_DESCRIPTORS,
  TERRAIN_NAMES,
  NODE_CLASS_TERRAIN,
  descriptorFor,
  sharedRungs,
} from '../src/constants.js';
import {
  descriptorText, descriptorBadge, resultsHtml,
  scanSummaryText, bindingLabel,
} from '../src/panel.js';

// A rung is NOT unique to one terrain. This was asserted as an invariant for
// most of the table's life and defended twice by rescoping it; i:6 and i:120
// both grant Papermill +3% and were read in the same biome, which is what
// finally settled it. The list is pinned so a new duplicate is visible — that
// is still what a transcription error would look like.
test('the rungs that are shared are the ones we know about', () => {
  assert.deepEqual(sharedRungs(), [
    'Papermill +3%: i:6, i:120',
    'Papermill +2%: i:7, i:113',
    'Renderer +3%: i:9, i:65',
    'Cattle Rancher +3%: i:13, i:94',
    'Cattle Rancher +1%: i:16, i:87',
    'Target Range +1%: i:31, i:77',
    'Plate Forger +3%: i:46, i:97',
    'Military Academy +2%: i:47, i:72',
    'Farrier +3%: i:49, i:64, i:101',
    'Armourer +1%: i:51, i:81',
    'Bowyer +3%: i:52, i:116',
    'Bowyer +1%: i:54, i:103',
    'Poleturner +3%: i:55, i:68, i:90, i:119',
    'Training Ground +2%: i:56, i:109',
    'Poleturner +1%: i:57, i:63, i:105',
    'Bowyer +2%: i:89, i:107',
  ]);
});

test('a rung held once is not reported, a rung held twice is', () => {
  assert.deepEqual(sharedRungs({
    1: { name: 'A', bonus: 3, product: 'Bows', building: 'Bowyer' },
    2: { name: 'B', bonus: 1, product: 'Bows', building: 'Bowyer' },
  }), []);
  assert.deepEqual(sharedRungs({
    1: { name: 'A', bonus: 3, product: 'Bows', building: 'Bowyer' },
    2: { name: 'B', bonus: 3, product: 'Bows', building: 'Bowyer' },
  }), ['Bowyer +3%: i:1, i:2']);
});

test('two terrains can hold the same rung', () => {
  // Lichen and Alluvial Plain, both Cattle Rancher +1%.
  assert.equal(descriptorFor(87).building, descriptorFor(16).building);
  assert.equal(descriptorFor(87).bonus, descriptorFor(16).bonus);
  assert.equal(descriptorFor(87).family, undefined);
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

// Three answers now, where there were two. The client's table names all 229
// ids, so "nobody has read this" and "nothing knows this id" are different
// facts and only the second is a hole in the game's own data.
test('an unread bonus, a node class and an id off the table read differently', () => {
  // Named, never read. Every terrain the world carries has been read, so what
  // is left of this case is terrain the client names and the world does not:
  // there is nowhere to go and stand on a Cairn.
  assert.equal(descriptorFor(125).name, 'Cairn');
  assert.equal(descriptorFor(125).bonusUnread, true);
  assert.match(descriptorText({ i: 125 }), /Cairn — bonus not read yet/);

  assert.ok(NODE_CLASS_TERRAIN.has(45));
  assert.equal(descriptorFor(45).name, 'Dolmen');
  assert.match(descriptorText({ i: 45 }), /varies/);

  // A Geyser is ordinary terrain. It was in the node-class set until the
  // server's data file said otherwise — tiles carrying `npc:1` had been read
  // as if the terrain itself were an NPC class.
  assert.ok(!NODE_CLASS_TERRAIN.has(123));
  assert.doesNotMatch(descriptorText({ i: 123 }), /varies/);

  // Past the end of the client's own array: the game did not know this either.
  assert.equal(descriptorFor(300), null);
  assert.match(descriptorText({ i: 300 }), /unidentified/);
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

// One row is marked: i:71 Nunatak is the only military rung above +2 in the
// table, against eight military readings that all stop at +2. Marked rather
// than deleted — it may well be right, and a row read once is not a row that is
// wrong.
test('the disputed rows are the ones we have doubts about', () => {
  assert.deepEqual(
    Object.entries(TERRAIN_DESCRIPTORS).filter(([, d]) => d.disputed).map(([i]) => Number(i)),
    [71],
  );
  assert.match(descriptorText({ i: 71 }), /\[unconfirmed\]/);
});

// Nothing else in the table claims a military rung above +2.
test('no other military rung exceeds +2', () => {
  const military = new Set(['Training Ground', 'Target Range', 'Military Academy',
    'Jousting Yard', 'Assembly Yard']);
  const high = Object.entries(TERRAIN_DESCRIPTORS)
    .filter(([, d]) => military.has(d.building) && d.bonus > 2)
    .map(([i]) => Number(i));
  assert.deepEqual(high, [71]);
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
  assert.equal(descriptorFor(66).name, 'Faction Hub');
  assert.equal(descriptorFor(67).name, 'Forbidden');
  assert.equal(descriptorFor(67).impassable, true);
  assert.match(descriptorText({ i: 67 }), /no sovereignty bonus/);
});

// Read off a b:2 region. Poor ground: 0 to 15 plots where most land has 25.
test('the glacial terrains are read and rate low', () => {
  assert.equal(descriptorFor(87).building, 'Cattle Rancher');   // Lichen
  assert.equal(descriptorFor(69).name, 'Glacier');
  assert.equal(descriptorFor(69).building, undefined);
});

// The same name on two IDs in two families, answering differently. The ID
// identifies a terrain; the name never does.
test('Scrubland is a Finishing School rung on land and nothing on ice', () => {
  assert.match(descriptorText({ i: 30 }), /\+1% Diplomatic Units/);
  assert.match(descriptorText({ i: 83 }), /no sovereignty bonus/);
});

// Read off the tiles as granting nothing. That is an answer, and it has to keep
// reading as one rather than lapsing back to "unidentified".
test('the ice terrains are known to grant nothing', () => {
  for (const [i, name] of [[73, 'Icefield'], [75, 'Ice cave'], [82, 'Ice Holes']]) {
    const d = descriptorFor(i);
    assert.equal(d.name, name);
    assert.equal(d.building, undefined);
    assert.match(descriptorText({ i }), /no sovereignty bonus/);
  }
});

// A node class rates differently tile to tile, which says nothing about whether
// its descriptor grants something — the two were conflated while these six were
// unread. All six have been read now, and all six grant nothing.
test('the six NPC terrains are read', () => {
  for (const i of NODE_CLASS_TERRAIN) {
    assert.equal(descriptorFor(i).bonusUnread, undefined, `i:${i} unread`);
    assert.equal(descriptorFor(i).building, undefined, `i:${i} grants something`);
  }
});

// The summary was once built inside the table branch, so a scan that found no
// site reported nothing it had learned — the tile count and the exclusion
// breakdown included. A region with no candidate site is where that costs the
// most: it is unsettled ground, so it is the least explored.
test('the summary survives a scan that found no site', () => {
  const html = resultsHtml([], 'Centre -877|-2848, zoom 2, 25 tiles, 0 candidates.');
  assert.match(html, /Centre -877\|-2848/);
  assert.match(html, /No sites met the minimum tax/);
});

test('the summary is shown above the table when there are results', () => {
  const html = resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'food', sFood: 10, uRp: 3, goldNet: 400,
  }], 'Centre 1|2.');
  assert.match(html, /Centre 1\|2\./);
  assert.ok(html.indexOf('Centre 1|2.') < html.indexOf('<table>'));
  assert.doesNotMatch(html, /No sites met/);
});

// Where the scan looked and what it found. Why the other tiles were dropped is
// deliberately not here: it is a question about the tool, not about the map.
test('the scan summary states the area covered and the count found', () => {
  assert.equal(
    scanSummaryText({ x: -877, y: -2848, zoom: 2, scanned: 25, candidates: 1 }),
    'Centred on -877|-2848, 5×5 tiles. Checked 25 tiles and found 1 candidate.',
  );
  assert.match(
    scanSummaryText({ x: 0, y: 0, zoom: 20, scanned: 1681, candidates: 0 }),
    /41×41 tiles\. Checked 1,681 tiles and found 0 candidates\./,
  );
});

test('the Limited By column names the ceiling rather than its code', () => {
  assert.equal(bindingLabel('rp'), 'Research');
  assert.equal(bindingLabel('res'), 'Resources');
  assert.equal(bindingLabel('cap'), 'Tax cap');
  // Unknown codes pass through: showing one raw beats showing nothing.
  assert.equal(bindingLabel('mystery'), 'mystery');

  const html = resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'rp', sFood: 10, uRp: 3, goldNet: 400,
  }], 'Centre 1|2.');
  assert.match(html, /<td>Research<\/td>/);
});

// Marsh holds Poleturner +3%, and so does i:55 Wooded Land. One rung, two
// terrains — reported, not rejected.
test('Marsh and Wooded Land hold one rung between them', () => {
  assert.equal(descriptorFor(90).building, descriptorFor(55).building);
  assert.equal(descriptorFor(90).bonus, descriptorFor(55).bonus);
  assert.ok(sharedRungs().includes('Poleturner +3%: i:55, i:68, i:90, i:119'));
});

test('the wetland rows are read', () => {
  assert.equal(descriptorFor(89).bonus, 2);
  assert.equal(descriptorFor(89).product, 'Bows');
  for (const i of [91, 92]) assert.equal(descriptorFor(i).building, undefined);
});

// i:89 is a Swamp that is nothing like the impassable Swamps at 22 and 23: it
// is claimable, rates 10 plots and carries a bonus. As with Scrubland, the id
// identifies a terrain and the name does not.
test('the wetland Swamp is not the impassable one', () => {
  assert.equal(descriptorFor(22).impassable, true);
  assert.equal(descriptorFor(22).building, undefined);
  assert.equal(descriptorFor(89).impassable, undefined);
  assert.match(descriptorText({ i: 89 }), /\+2% Bows per level of Bowyer/);
});

// The rainforests, read in the Jungle biome. i:120 is the row that ended the
// one-terrain-per-rung rule: it holds Papermill +3% and so does i:6, read in
// that same biome, so no scoping explains it away.
test('the rainforest rows are read, including the one that broke the rule', () => {
  assert.equal(descriptorFor(117).building, undefined);
  assert.match(descriptorText({ i: 119 }), /\+3% Spears per level of Poleturner/);
  assert.equal(descriptorFor(120).building, 'Papermill');
  assert.equal(descriptorFor(120).bonus, descriptorFor(6).bonus);
});

// Not every id above 100 is a node class: 117-119 are fixed rainforest terrain
// in the middle of that range, so the range cannot be treated as uniform.
// [V] The server data file marks exactly six terrains `npcterrain: Yes`, and
// they are contiguous. Nothing in the 100+ range is one.
test('the NPC terrain class is exactly 40-45', () => {
  assert.deepEqual([...NODE_CLASS_TERRAIN].sort((a, b) => a - b), [40, 41, 42, 43, 44, 45]);
  for (const i of [88, 117, 118, 119, 123, 139, 143]) {
    assert.ok(!NODE_CLASS_TERRAIN.has(i), `i:${i} is ordinary terrain`);
  }
});

// Four terrains hold Poleturner +3%. That was read as one-per-family for a
// while; it is just the most-shared rung in the table.
test('four terrains hold Poleturner +3%', () => {
  const holders = Object.entries(TERRAIN_DESCRIPTORS)
    .filter(([, d]) => d.building === 'Poleturner' && d.bonus === 3)
    .map(([i]) => Number(i));
  assert.deepEqual(holders.sort((a, b) => a - b), [55, 68, 90, 119]);
});

// --- the client's own table -------------------------------------------------

// TERRAIN_DESCRIPTORS still carries a name per row, purely so the table reads
// as terrain rather than as numbers. The client's table is what the tool
// actually shows, so the two have to agree or the comments describe a row the
// user never sees. Nine rows disagreed when the client table arrived.
test('every hand-written name matches the client table', () => {
  for (const [i, d] of Object.entries(TERRAIN_DESCRIPTORS)) {
    const named = TERRAIN_NAMES[i];
    assert.ok(named, `i:${i} is not in the client table`);
    assert.equal(d.name, named[0], `i:${i} name drifted from the client`);
  }
});

test('the name table is indexed by i, with 0 unused', () => {
  assert.equal(TERRAIN_NAMES.length, 230);
  assert.equal(TERRAIN_NAMES[0], null);
  assert.equal(TERRAIN_NAMES[1][0], 'Plains');
  assert.equal(TERRAIN_NAMES[229][0], 'Shipwreck');
  // The one off-by-one that matters: i:6 anchors the table against the
  // descriptors, which were read independently and long before it.
  assert.equal(TERRAIN_NAMES[6][0], 'Rich Clay Seam');
  assert.equal(descriptorFor(6).name, 'Rich Clay Seam');
});

// Four rows were named from sprite context before the client table existed,
// and all four were wrong. They are pinned because the old names are still
// scattered through this project's history and a revert would be silent.
test('the sprite-guessed names stay corrected', () => {
  assert.equal(descriptorFor(20).name, 'Volcanic Peak');
  assert.equal(descriptorFor(21).name, 'Fiery Mountain');
  assert.equal(descriptorFor(22).name, 'Canyon');
  assert.equal(descriptorFor(23).name, 'Swampland');
  // Which makes i:89 the only Swamp in the game's table.
  const swamps = TERRAIN_NAMES.filter((n) => n && n[0] === 'Swamp').length;
  assert.equal(swamps, 1);
});

// Not scored, and not read by anything — kept because nothing else records it.
test('the combat class rides along with the descriptor', () => {
  assert.equal(descriptorFor(52).combat, 'Large Forest');
  assert.equal(descriptorFor(4).combat, 'Buildings');
  // The four the payload flags `imp` are the four the client calls Impassable.
  const impassable = TERRAIN_NAMES
    .map((n, i) => (n && n[1] === 'Impassable' ? i : null)).filter((i) => i !== null);
  assert.deepEqual(impassable, [20, 21, 22, 23]);
  for (const i of impassable) assert.equal(descriptorFor(i).impassable, true);
});
