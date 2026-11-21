import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, CONTRACTS, CANDIDATES, createGame, reduceGame, previewRoute, runBatch, runTrial, launch, getLaunchReadiness, wilsonInterval, exportSave, importSave, trialCost, type GameState, type ActionId } from '../src/index.ts';

function prepared(contractId = CONTRACTS[0].id, seed = 42): GameState {
  let s = createGame(contractId, seed);
  s = reduceGame(s, { type: 'load-example' });
  return runBatch(s);
}

test('curated routes have valid prerequisites and incompatible order is explained locally', () => {
  const s = prepared();
  assert.equal(s.batch?.success, true);
  assert.equal(previewRoute(s).candidate?.id, 'reference-ibuprofen');
  const invalid = reduceGame(createGame(), { type: 'set-route', route: ['aromatic-core', 'reduce-link', 'acid-anchor'] });
  const p = previewRoute(invalid);
  assert.equal(p.valid, false);
  assert.match(p.issues[0].message, /carbonyl/);
  assert.equal(p.issues[0].index, 1);
});

test('all three contracts can be completed through the actual reducer', () => {
  let s = createGame();
  for (const contract of CONTRACTS) {
    if (s.contractId !== contract.id) s = reduceGame(s, { type: 'new-project', contractId: contract.id });
    s = reduceGame(s, { type: 'load-example' });
    s = reduceGame(s, { type: 'batch' });
    s = reduceGame(s, { type: 'trial', sampleSize: 480 });
    assert.equal(getLaunchReadiness(s).allowed, true, `${contract.id}: ${getLaunchReadiness(s).reasons.join('; ')}`);
    s = reduceGame(s, { type: 'launch' });
    assert.equal(s.outcome?.status, 'success', contract.id);
    assert.equal(s.phase, 'complete');
  }
  assert.equal(s.completedContracts.length, 3);
  assert.ok(s.labCredits > 0);
});

test('same seed and commands replay exactly; no input mutation occurs', () => {
  const initial = createGame();
  const before = JSON.stringify(initial);
  const a = runTrial(prepared(), 240), b = runTrial(prepared(), 240);
  assert.deepEqual(a, b);
  reduceGame(initial, { type: 'load-example' });
  assert.equal(JSON.stringify(initial), before);
});

test('duplicate batch, malformed trial and insufficient funds do not charge', () => {
  const s = prepared();
  assert.equal(runBatch(s).budget, s.budget);
  for (const n of [0, 41, -20, Number.NaN, 2002, 100.5]) assert.equal(runTrial(s, n).budget, s.budget);
  const broke = { ...s, budget: 10 };
  assert.equal(runTrial(broke, 240).budget, 10);
  assert.equal(runTrial(broke, 240).trial, null);
});

test('route edits invalidate clearance but restore cumulative evidence when route is restored', () => {
  const old = runTrial(prepared(), 120);
  const route = [...old.route];
  const changed = reduceGame(old, { type: 'remove-action', index: 4 });
  assert.equal(changed.batch, null);
  assert.equal(changed.trial, null);
  assert.equal(getLaunchReadiness(changed).allowed, false);
  assert.equal(changed.evidence.length, 1);
  const restored = runBatch(reduceGame(changed, { type: 'set-route', route }));
  assert.equal(restored.trial?.sampleSize, 120);
  const extra = runTrial(restored, 120);
  assert.equal(extra.trial?.sampleSize, 240);
  for (const e of old.trial!.endpoints) assert.ok(extra.trial!.endpoints.find(x => x.key === e.key)!.treated.count >= e.treated.count);
});

test('zero observed events retains nonzero uncertainty; larger samples narrow intervals', () => {
  const zero = wilsonInterval(0, 60);
  assert.ok(zero[0] >= 0 && zero[0] < 1e-12);
  assert.ok(zero[1] > 0.05 && zero[1] < 0.07);
  const small = wilsonInterval(5, 50), large = wilsonInterval(50, 500);
  assert.ok(large[1] - large[0] < small[1] - small[0]);
  assert.throws(() => wilsonInterval(2, 1), RangeError);
});

test('control arms and interaction subgroup denominators remain explicit and bounded', () => {
  const s = runTrial(prepared(), 240);
  assert.equal(s.trial!.treatedN, 120);
  assert.equal(s.trial!.controlN, 120);
  assert.equal(s.trial!.endpoints.find(e => e.key === 'interaction')!.treated.n, 30);
  for (const e of s.trial!.endpoints) for (const p of [e.treated, e.control]) {
    assert.ok(p.count >= 0 && p.count <= p.n);
    assert.equal(p.rate, p.count / p.n);
    assert.ok(p.ci[0] >= 0 && p.ci[1] <= 1);
  }
});

test('launch gates block insufficient cohorts; rewards are issued once', () => {
  const small = runTrial(prepared(), 40);
  assert.equal(getLaunchReadiness(small).allowed, false);
  assert.equal(launch(small).outcome, null);
  const s = launch(runTrial(prepared(), 480));
  assert.equal(s.outcome?.status, 'success');
  const again = launch(s);
  assert.equal(again.labCredits, s.labCredits);
  assert.equal(again.revision, s.revision);
});

test('persistent upgrades charge once and have mechanically accurate effects', () => {
  const won = launch(runTrial(prepared(), 480));
  const upgraded = reduceGame(won, { type: 'buy-upgrade', upgradeId: 'recruitment-network' });
  assert.equal(upgraded.labCredits, won.labCredits - 1200);
  assert.equal(trialCost(upgraded, 120), 900);
  assert.equal(reduceGame(upgraded, { type: 'buy-upgrade', upgradeId: 'recruitment-network' }).labCredits, upgraded.labCredits);
  const next = reduceGame(upgraded, { type: 'new-project', contractId: 'clear-head' });
  assert.deepEqual(next.upgrades, ['recruitment-network']);
  assert.equal(next.labCredits, upgraded.labCredits);
  assert.equal(next.budget, CONTRACTS[1].budget);
});

test('structural change after purification invalidates mixture purity', () => {
  const s = prepared();
  assert.equal(previewRoute(s).purity, 0.99);
  const modified = reduceGame(s, { type: 'add-action', actionId: 'polar-tail' });
  assert.equal(previewRoute(modified).purity, 0.88);
  assert.match(previewRoute(modified).warnings[0], /purification/);
});

test('atom graphs have sound supported valences and exact reference atom counts', () => {
  for (const c of CANDIDATES) {
    const atoms = new Map(c.molecule.atoms.map(a => [a.id, a]));
    for (const atom of atoms.values()) {
      const valence = c.molecule.bonds.filter(b => b.from === atom.id || b.to === atom.id).reduce((sum, b) => sum + b.order, 0);
      assert.ok(valence <= ({ C: 4, O: 2, N: 3 }[atom.element]), `${c.id} atom ${atom.id}`);
    }
  }
  const ref = CANDIDATES[0].molecule;
  assert.equal(ref.atoms.filter(a => a.element === 'C').length, 13);
  assert.equal(ref.atoms.filter(a => a.element === 'O').length, 2);
  assert.equal(ref.formula, 'C13H18O2');
});

test('save roundtrip preserves replay and corrupted statistics are rejected', () => {
  const s = runTrial(prepared(), 120);
  const loaded = importSave(exportSave(s));
  assert.equal(loaded.ok, true);
  if (loaded.ok) assert.deepEqual(runTrial(loaded.state, 120), runTrial(s, 120));
  assert.equal(importSave('{').ok, false);
  assert.equal(importSave(JSON.stringify({ ...s, version: 99 })).ok, false);
  assert.equal(importSave(JSON.stringify({ ...s, budget: -1 })).ok, false);
  const corrupted = JSON.parse(exportSave(s));
  corrupted.evidence[0].report.endpoints[0].treated.rate = -4;
  assert.equal(importSave(JSON.stringify(corrupted)).ok, false);
  assert.equal(importSave(JSON.stringify({ ...s, phase: 'trial', trial: null })).ok, false);
  const invalidOutcome = { ...s, phase: 'complete', outcome: {} };
  assert.equal(importSave(JSON.stringify(invalidOutcome)).ok, false);
});

test('all offered cards use the exported action catalogue', () => {
  const ids = new Set(ACTIONS.map(a => a.id));
  for (const c of CONTRACTS) for (const step of c.recommendedRoute) assert.ok(ids.has(step));
  const unknown = reduceGame(createGame(), { type: 'set-route', route: ['not-real'] as unknown as ActionId[] });
  assert.equal(unknown.route.length, 0);
});
