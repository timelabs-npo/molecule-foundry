/** Molecule Foundry's deterministic, offline simulation. All clinical values are fiction. */
export const ENGINE_VERSION = '0.1.0';
export const SAVE_VERSION = 1;
export const SCIENCE_NOTICE = 'Chemistry-inspired game. Clinical results and costs are fictional simulation values, not medical evidence or manufacturing instructions.';

export type ActionId = 'aromatic-core' | 'carbonyl-arm' | 'reduce-link' | 'acid-anchor' | 'polar-tail' | 'amide-gate' | 'purify' | 'recycle';
export type ContractId = 'first-relief' | 'clear-head' | 'gentle-touch';
export type CandidateId = 'reference-ibuprofen' | 'mf-daylight' | 'mf-gentle' | 'mf-hybrid';
export type UpgradeId = 'spectrometer' | 'recruitment-network' | 'process-recovery';
export type EndpointKey = 'response' | 'fatigue' | 'liver' | 'kidney' | 'interaction' | 'serious';
export type Phase = 'formulate' | 'batch' | 'trial' | 'complete';

export interface Atom { id: number; element: 'C' | 'O' | 'N'; x: number; y: number; label?: string }
export interface Bond { from: number; to: number; order: 1 | 2 }
export interface Molecule {
  id: string; name: string; formula: string; smiles: string;
  atoms: Atom[]; bonds: Bond[]; changedAtomIds: number[];
  referenceUrl?: string; representation: 'reference-structure' | 'curated-game-structure';
}
export interface ActionDefinition {
  id: ActionId; title: string; shortTitle: string; term: string; description: string;
  prerequisite: string; unitCostCents: number; color: string;
}
export interface Contract {
  id: ContractId; number: number; title: string; subtitle: string; description: string;
  budget: number; maxUnitCost: number; minEffect: number; minSubjects: number;
  maxRates: Record<Exclude<EndpointKey, 'response'>, number>;
  reward: number; recommendedRoute: ActionId[];
}
export interface Candidate {
  id: CandidateId; name: string; code: string; description: string; molecule: Molecule;
}
export interface Upgrade { id: UpgradeId; name: string; description: string; cost: number }
export interface RouteIssue { index: number; actionId?: ActionId; code: string; message: string }
export interface RouteStep { index: number; action: ActionDefinition; valid: boolean; molecule: Molecule | null; explanation: string }
export interface RoutePreview {
  valid: boolean; complete: boolean; issues: RouteIssue[]; steps: RouteStep[];
  unitCost: number; unitCostCents: number; yield: number; purity: number;
  batchCost: number; candidate: Candidate | null; molecule: Molecule | null;
  signature: string; warnings: string[];
}
export interface Proportion { n: number; count: number; rate: number; ci: [number, number] }
export interface EndpointReport {
  key: EndpointKey; label: string; treated: Proportion; control: Proportion;
  difference: number; differenceCI: [number, number]; subgroup?: string;
}
export interface BatchReport {
  id: number; success: boolean; signature: string; candidate: Candidate | null;
  molecule: Molecule | null; cost: number; unitCost: number; purity: number;
  message: string; issues: RouteIssue[];
}
export interface TrialReport {
  id: number; signature: string; candidateId: CandidateId; sampleSize: number;
  addedSampleSize: number; treatedN: number; controlN: number; exposureDays: 7;
  cost: number; totalCost: number; endpoints: EndpointReport[];
  simulation: true; protocol: 'sim-rct-7d-v1'; summary: string;
}
export interface GateCheck { key: string; label: string; pass: boolean; actual: number; target: number; message: string }
export interface LaunchReadiness { allowed: boolean; checks: GateCheck[]; reasons: string[]; warnings: string[] }
export interface LaunchOutcome {
  status: 'success' | 'failure' | 'recall'; title: string; summary: string;
  score: number; reward: number; penalty: number; populationSize: number;
  profile: Record<EndpointKey, number>; controlProfile: Record<EndpointKey, number>;
  failures: string[]; negligence: boolean; simulation: true;
}
export interface HistoryEntry { id: number; type: string; message: string; budgetDelta: number; project: number }
export interface EvidenceRecord { signature: string; report: TrialReport }
export interface GameState {
  version: 1; engineVersion: string; seed: number; revision: number; project: number;
  contractId: ContractId; phase: Phase; route: ActionId[]; budget: number; labCredits: number;
  upgrades: UpgradeId[]; batch: BatchReport | null; trial: TrialReport | null;
  outcome: LaunchOutcome | null; history: HistoryEntry[]; evidence: EvidenceRecord[];
  completedContracts: ContractId[]; message: string;
}
export type GameCommand =
  | { type: 'set-route'; route: ActionId[] }
  | { type: 'add-action'; actionId: ActionId }
  | { type: 'remove-action'; index: number }
  | { type: 'batch' }
  | { type: 'trial'; sampleSize: number }
  | { type: 'launch' }
  | { type: 'buy-upgrade'; upgradeId: UpgradeId }
  | { type: 'new-project'; contractId: ContractId }
  | { type: 'load-example' };

export const ACTIONS: ActionDefinition[] = [
  { id: 'aromatic-core', title: 'Choose an aromatic core', shortTitle: 'Aromatic core', term: 'Starting scaffold', description: 'Start with a six-carbon aromatic ring and its branched side chain. The ring is already present in this starting material.', prerequisite: 'Must be the first step.', unitCostCents: 4, color: '#72E5BF' },
  { id: 'carbonyl-arm', title: 'Add a carbonyl arm', shortTitle: 'Carbonyl arm', term: 'Acylation — curated transformation', description: 'Attach a two-carbon arm with an oxygen double bond at the highlighted ring position.', prerequisite: 'Needs the starting aromatic scaffold.', unitCostCents: 6, color: '#F4CE74' },
  { id: 'reduce-link', title: 'Turn the carbonyl into an alcohol', shortTitle: 'Alcohol bridge', term: 'Reduction — curated transformation', description: 'Change the arm’s C=O into C–OH. The oxygen stays; the bond and hydrogen count change.', prerequisite: 'Needs the carbonyl arm.', unitCostCents: 4, color: '#8EBBFA' },
  { id: 'acid-anchor', title: 'Build an acid anchor', shortTitle: 'Acid anchor', term: 'Carbonylation — curated transformation', description: 'Replace the arm’s alcohol end with a one-carbon carboxylic acid group in this supported route.', prerequisite: 'Needs the alcohol bridge.', unitCostCents: 8, color: '#BEACF7' },
  { id: 'polar-tail', title: 'Add a polar handle', shortTitle: 'Polar handle', term: 'Fictional route card', description: 'Replace a hydrogen on the branched tail with OH. This supports a new game candidate; its biological effects remain unknown until studied.', prerequisite: 'Needs a completed acid or amide candidate; only once.', unitCostCents: 5, color: '#8BD9EC' },
  { id: 'amide-gate', title: 'Change the acid tip to an amide', shortTitle: 'Amide tip', term: 'Amidation — abstract game card', description: 'Exchange the acid OH for NH₂. A new functional group does not guarantee better real-world safety or efficacy.', prerequisite: 'Needs an acid anchor; only once.', unitCostCents: 7, color: '#F7A7C8' },
  { id: 'purify', title: 'Separate the desired product', shortTitle: 'Purify', term: 'Purification — process operation', description: 'Improve the simulated batch purity. This changes the mixture quality, not the target molecule’s bonds.', prerequisite: 'Needs a completed candidate. Any later structural edit invalidates this purification.', unitCostCents: 3, color: '#BFE5AA' },
  { id: 'recycle', title: 'Recover process materials', shortTitle: 'Recover', term: 'Recovery — process operation', description: 'Recover reusable materials and reduce waste and unit cost in the game.', prerequisite: 'Needs a completed candidate; only once.', unitCostCents: -2, color: '#C9D1DD' },
];
const BASIC: ActionId[] = ['aromatic-core', 'carbonyl-arm', 'reduce-link', 'acid-anchor'];
export const CONTRACTS: Contract[] = [
  { id: 'first-relief', number: 1, title: 'First relief', subtitle: 'A small molecule. A difficult decision.', description: 'Develop an affordable pain-relief candidate and learn what a small trial can—and cannot—tell you.', budget: 5600, maxUnitCost: 0.30, minEffect: 0.25, minSubjects: 120, maxRates: { fatigue: 0.18, liver: 0.11, kidney: 0.11, interaction: 0.20, serious: 0.025 }, reward: 1600, recommendedRoute: [...BASIC, 'purify'] },
  { id: 'clear-head', number: 2, title: 'Keep a clear head', subtitle: 'Relief that leaves the day intact.', description: 'Management wants a daytime candidate: maintain response while reducing fatigue and the simulated co-medication interaction signal.', budget: 7800, maxUnitCost: 0.37, minEffect: 0.24, minSubjects: 200, maxRates: { fatigue: 0.085, liver: 0.10, kidney: 0.10, interaction: 0.09, serious: 0.025 }, reward: 2000, recommendedRoute: [...BASIC, 'polar-tail', 'purify'] },
  { id: 'gentle-touch', number: 3, title: 'A gentler footprint', subtitle: 'Every improvement has a trade-off.', description: 'Keep a useful response while lowering the fictional liver and kidney signals. The cheapest process may hide an expensive mistake.', budget: 8800, maxUnitCost: 0.43, minEffect: 0.20, minSubjects: 240, maxRates: { fatigue: 0.14, liver: 0.065, kidney: 0.065, interaction: 0.12, serious: 0.025 }, reward: 2400, recommendedRoute: [...BASIC, 'amide-gate', 'purify'] },
];
export const UPGRADES: Upgrade[] = [
  { id: 'spectrometer', name: 'Structural preview', description: 'Unlock detailed per-step structural overlays before paying for a batch.', cost: 900 },
  { id: 'recruitment-network', name: 'Recruitment network', description: 'Reduce the cost per simulated participant from 7 to 5 credits. Precision still comes from sample size.', cost: 1200 },
  { id: 'process-recovery', name: 'Process recovery', description: 'Reduce manufacturing unit cost by 8%. The target molecule and its intrinsic game profile stay the same.', cost: 1400 },
];

const rounded = (x: number, digits = 6) => Number(x.toFixed(digits));
const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const actionById = (id: string) => ACTIONS.find(a => a.id === id);
export const getContract = (id: string): Contract => CONTRACTS.find(c => c.id === id) ?? CONTRACTS[0];

/** Curated coordinates for exact atom/bond topology; this is not a structure predictor. */
function moleculeFor(stage: number, polar = false, amide = false): Molecule {
  const atoms: Atom[] = [
    { id: 0, element: 'C', x: 105, y: 70 }, { id: 1, element: 'C', x: 140, y: 50 },
    { id: 2, element: 'C', x: 175, y: 70 }, { id: 3, element: 'C', x: 175, y: 110 },
    { id: 4, element: 'C', x: 140, y: 130 }, { id: 5, element: 'C', x: 105, y: 110 },
    { id: 6, element: 'C', x: 70, y: 50 }, { id: 7, element: 'C', x: 35, y: 70 },
    { id: 8, element: 'C', x: 4, y: 50 }, { id: 9, element: 'C', x: 35, y: 110 },
  ];
  const bonds: Bond[] = [
    { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
    { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
    { from: 0, to: 6, order: 1 }, { from: 6, to: 7, order: 1 },
    { from: 7, to: 8, order: 1 }, { from: 7, to: 9, order: 1 },
  ];
  let smiles = 'CC(C)CC1=CC=CC=C1', formula = 'C10H14', name = 'Isobutylbenzene reference';
  let changedAtomIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (stage >= 2) {
    atoms.push({ id: 10, element: 'C', x: 210, y: 130 }, { id: 11, element: 'C', x: 210, y: 170 });
    bonds.push({ from: 3, to: 10, order: 1 }, { from: 10, to: 11, order: 1 });
    if (stage === 2 || stage === 3) {
      atoms.push({ id: 12, element: 'O', x: 245, y: 110, label: stage === 2 ? 'O' : 'OH' });
      bonds.push({ from: 10, to: 12, order: stage === 2 ? 2 : 1 });
      smiles = stage === 2 ? 'CC(C)CC1=CC=C(C=C1)C(C)=O' : 'CC(C)CC1=CC=C(C=C1)C(C)O';
      formula = stage === 2 ? 'C12H16O' : 'C12H18O';
      name = stage === 2 ? 'Aryl ketone intermediate' : 'Benzylic alcohol intermediate';
      changedAtomIds = stage === 2 ? [10, 11, 12] : [10, 12];
    } else {
      atoms.push({ id: 12, element: 'C', x: 245, y: 110 }, { id: 13, element: 'O', x: 245, y: 70, label: 'O' }, { id: 14, element: amide ? 'N' : 'O', x: 280, y: 130, label: amide ? 'NH₂' : 'OH' });
      bonds.push({ from: 10, to: 12, order: 1 }, { from: 12, to: 13, order: 2 }, { from: 12, to: 14, order: 1 });
      smiles = `CC(C)${polar ? '(O)' : ''}CC1=CC=C(C=C1)C(C)C(=O)${amide ? 'N' : 'O'}`;
      formula = amide ? (polar ? 'C13H19NO2' : 'C13H19NO') : (polar ? 'C13H18O3' : 'C13H18O2');
      name = polar && amide ? 'MF-H4 game candidate' : amide ? 'MF-G2 game candidate' : polar ? 'MF-D7 game candidate' : 'Ibuprofen reference structure';
      changedAtomIds = amide ? [14] : [10, 12, 13, 14];
    }
  }
  if (polar) {
    atoms.push({ id: 15, element: 'O', x: 35, y: 25, label: 'OH' });
    bonds.push({ from: 7, to: 15, order: 1 });
    changedAtomIds = [7, 15];
  }
  return {
    id: `mol-${stage}-${Number(polar)}-${Number(amide)}`, name, formula, smiles, atoms, bonds, changedAtomIds,
    representation: !polar && !amide && (stage === 1 || stage === 4) ? 'reference-structure' : 'curated-game-structure',
    ...(!polar && !amide && stage === 1 ? { referenceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/10870' } : {}),
    ...(!polar && !amide && stage === 4 ? { referenceUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/3672' } : {}),
  };
}
export const CANDIDATES: Candidate[] = [
  { id: 'reference-ibuprofen', name: 'Reference 01', code: 'MF-R1', description: 'An ibuprofen reference structure with entirely fictional gameplay outcomes.', molecule: moleculeFor(4) },
  { id: 'mf-daylight', name: 'Daylight', code: 'MF-D7', description: 'A curated polar-handle game candidate. Its effects are authored fiction.', molecule: moleculeFor(4, true) },
  { id: 'mf-gentle', name: 'Gentle', code: 'MF-G2', description: 'A curated amide game candidate. Its effects are authored fiction.', molecule: moleculeFor(4, false, true) },
  { id: 'mf-hybrid', name: 'Crosscurrent', code: 'MF-H4', description: 'Combines the polar handle and amide. Added complexity does not guarantee a better project.', molecule: moleculeFor(4, true, true) },
];

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function createGame(contractId: ContractId = 'first-relief', seed = 42): GameState {
  const contract = getContract(contractId);
  return { version: 1, engineVersion: ENGINE_VERSION, seed: seed >>> 0, revision: 0, project: 1, contractId: contract.id, phase: 'formulate', route: [], budget: contract.budget, labCredits: 0, upgrades: [], batch: null, trial: null, outcome: null, history: [], evidence: [], completedContracts: [], message: 'Choose a starting scaffold. Every decision leaves a trace.' };
}

export function previewRoute(state: Pick<GameState, 'route' | 'upgrades'>): RoutePreview {
  let stage = 0, polar = false, amide = false, purified = false, recovered = false, costCents = 0;
  let molecule: Molecule | null = null;
  const issues: RouteIssue[] = [], steps: RouteStep[] = [];
  if (!state.route.length) issues.push({ index: 0, code: 'empty', message: 'Start with an aromatic core.' });
  if (state.route.length > 8) issues.push({ index: 8, code: 'too-long', message: 'This demo supports at most eight process steps.' });
  state.route.forEach((actionId, index) => {
    const action = actionById(actionId);
    if (!action) { issues.push({ index, code: 'unknown-action', message: `Unknown action at step ${index + 1}.` }); return; }
    let error = '';
    switch (actionId) {
      case 'aromatic-core': if (index !== 0 || stage !== 0) error = 'The starting scaffold must be the first and only core.'; else stage = 1; break;
      case 'carbonyl-arm': if (stage !== 1) error = 'A carbonyl arm needs an unmodified starting aromatic core.'; else stage = 2; break;
      case 'reduce-link': if (stage !== 2) error = 'This reduction needs a carbonyl arm (C=O).'; else stage = 3; break;
      case 'acid-anchor': if (stage !== 3) error = 'The acid-anchor card needs the alcohol intermediate (C–OH).'; else stage = 4; break;
      case 'polar-tail': if (stage !== 4 || polar) error = 'A polar handle needs a completed candidate without an existing polar handle.'; else { polar = true; purified = false; } break;
      case 'amide-gate': if (stage !== 4 || amide) error = 'The amide card needs an acid anchor that has not already been converted.'; else { amide = true; purified = false; } break;
      case 'purify': if (stage !== 4 || purified) error = 'Purify a completed candidate once after the final structural change.'; else purified = true; break;
      case 'recycle': if (stage !== 4 || recovered) error = 'Recovery needs a completed candidate and can only be used once.'; else recovered = true; break;
    }
    costCents += action.unitCostCents;
    if (error) issues.push({ index, actionId, code: 'prerequisite', message: error });
    if (stage) molecule = moleculeFor(stage, polar, amide);
    steps.push({ index, action, valid: !error, molecule, explanation: error || action.description });
  });
  const complete = stage === 4 && !issues.length;
  const candidate = complete ? CANDIDATES.find(c => c.id === (polar && amide ? 'mf-hybrid' : polar ? 'mf-daylight' : amide ? 'mf-gentle' : 'reference-ibuprofen'))! : null;
  const processYield = recovered ? 0.94 : 0.91;
  const unitCostCents = Math.max(0, Math.round(costCents / processYield * (state.upgrades.includes('process-recovery') ? 0.92 : 1)));
  const warnings: string[] = [];
  if (stage === 4 && !purified) warnings.push('This process has no final purification: the fictional mixture has more impurity-related adverse signals.');
  if (stage > 0 && stage < 4) warnings.push('This is an intermediate. Complete the supported route before a trial.');
  return { valid: !issues.length, complete, issues, steps, unitCost: unitCostCents / 100, unitCostCents, yield: processYield, purity: purified ? 0.99 : 0.88, batchCost: 120 + state.route.length * 45, candidate, molecule, signature: `${ENGINE_VERSION}:${state.route.join('>')}`, warnings };
}
export const validateRoute = previewRoute;
export function getAvailableActions(state: GameState): Array<ActionDefinition & { available: boolean; reason: string }> {
  return ACTIONS.map(action => {
    const preview = previewRoute({ ...state, route: [...state.route, action.id] });
    const issue = preview.issues.find(i => i.index === state.route.length);
    return { ...action, available: !issue && state.route.length < 8 && state.phase !== 'complete', reason: issue?.message ?? (state.route.length >= 8 ? 'The route is full.' : '') };
  });
}

/** Wilson score interval, two-sided nominal 95%; not a Bayesian credible interval. */
export function wilsonInterval(count: number, n: number): [number, number] {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(count) || count < 0 || count > n) throw new RangeError('A proportion needs integer 0 ≤ count ≤ n and n ≥ 1.');
  const z = 1.959963984540054, z2 = z * z, p = count / n;
  const center = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / (1 + z2 / n);
  return [clamp(center - half), clamp(center + half)];
}
function proportion(count: number, n: number): Proportion { return { count, n, rate: count / n, ci: wilsonInterval(count, n) }; }
function endpoint(key: EndpointKey, label: string, treated: Proportion, control: Proportion): EndpointReport {
  const difference = treated.rate - control.rate;
  // Newcombe-style difference interval using Wilson limits, without a continuity correction.
  const lower = difference - Math.sqrt((treated.rate - treated.ci[0]) ** 2 + (control.ci[1] - control.rate) ** 2);
  const upper = difference + Math.sqrt((treated.ci[1] - treated.rate) ** 2 + (control.rate - control.ci[0]) ** 2);
  return { key, label, treated, control, difference, differenceCI: [clamp(lower, -1, 1), clamp(upper, -1, 1)], ...(key === 'interaction' ? { subgroup: 'Predefined simulated co-medication subgroup; approximately one quarter of each arm.' } : {}) };
}
const ENDPOINTS: Array<{ key: EndpointKey; label: string }> = [
  { key: 'response', label: 'Symptom response' }, { key: 'fatigue', label: 'Fatigue reported' },
  { key: 'liver', label: 'Liver signal' }, { key: 'kidney', label: 'Kidney signal' },
  { key: 'interaction', label: 'Co-medication signal' }, { key: 'serious', label: 'Serious event' },
];
const CONTROL_PROFILE: Record<EndpointKey, number> = { response: 0.28, fatigue: 0.035, liver: 0.012, kidney: 0.009, interaction: 0.008, serious: 0.0004 };
const PROFILES: Record<CandidateId, Record<EndpointKey, number>> = {
  'reference-ibuprofen': { response: 0.76, fatigue: 0.09, liver: 0.035, kidney: 0.04, interaction: 0.10, serious: 0.001 },
  'mf-daylight': { response: 0.72, fatigue: 0.024, liver: 0.04, kidney: 0.036, interaction: 0.02, serious: 0.001 },
  'mf-gentle': { response: 0.65, fatigue: 0.06, liver: 0.012, kidney: 0.013, interaction: 0.04, serious: 0.0008 },
  'mf-hybrid': { response: 0.58, fatigue: 0.025, liver: 0.015, kidney: 0.016, interaction: 0.015, serious: 0.0008 },
};
function profileFor(preview: RoutePreview): Record<EndpointKey, number> {
  const profile = { ...PROFILES[preview.candidate!.id] };
  if (preview.purity < 0.95) {
    profile.response -= 0.08; profile.fatigue += 0.055; profile.liver += 0.065;
    profile.kidney += 0.06; profile.interaction += 0.035; profile.serious += 0.018;
  }
  return profile;
}
export function trialCost(state: Pick<GameState, 'upgrades'>, sampleSize: number): number {
  return 300 + sampleSize * (state.upgrades.includes('recruitment-network') ? 5 : 7);
}
function addHistory(state: GameState, type: string, message: string, budgetDelta = 0): GameState {
  const revision = state.revision + 1;
  return { ...state, revision, message, history: [...state.history, { id: revision, type, message, budgetDelta, project: state.project }] };
}
function reject(state: GameState, message: string): GameState { return { ...state, message }; }
function setRoute(state: GameState, route: ActionId[]): GameState {
  if (state.phase === 'complete') return reject(state, 'Start a new project before changing this completed route.');
  if (!Array.isArray(route) || route.length > 8 || route.some(id => !actionById(id))) return reject(state, 'Choose up to eight supported action cards.');
  if (JSON.stringify(route) === JSON.stringify(state.route)) return state;
  return addHistory({ ...state, route: [...route], phase: 'formulate', batch: null, trial: null, outcome: null }, 'route', 'Route updated. A new batch is needed; earlier evidence remains in the project archive.');
}

export function runBatch(state: GameState): GameState {
  if (state.phase === 'complete') return reject(state, 'This project is complete.');
  const preview = previewRoute(state);
  if (!state.route.length) return reject(state, 'Choose a starting scaffold before commissioning a batch.');
  if (state.batch?.signature === preview.signature && state.batch.success) return reject(state, 'This route already has a verified simulated batch. Continue to a trial.');
  if (state.budget < preview.batchCost) return reject(state, `This batch needs ${preview.batchCost} project credits.`);
  const success = preview.valid && preview.complete;
  const message = success ? `${preview.candidate!.code} revealed. ${Math.round(preview.purity * 100)}% simulated purity. The molecule is ready for a controlled trial.` : preview.issues[0]?.message ?? 'The batch contains an intermediate. Complete the route before a trial.';
  const batch: BatchReport = { id: state.revision + 1, success, signature: preview.signature, candidate: preview.candidate, molecule: preview.molecule, cost: preview.batchCost, unitCost: preview.unitCost, purity: preview.purity, message, issues: preview.issues };
  const prior = state.evidence.find(e => e.signature === preview.signature)?.report ?? null;
  return addHistory({ ...state, budget: state.budget - preview.batchCost, batch, trial: success ? prior : null, phase: success ? (prior ? 'trial' : 'batch') : 'formulate' }, 'batch', message, -preview.batchCost);
}

export function runTrial(state: GameState, sampleSize: number): GameState {
  if (state.phase === 'complete') return reject(state, 'This project is complete.');
  const preview = previewRoute(state);
  if (!state.batch?.success || state.batch.signature !== preview.signature || !preview.candidate) return reject(state, 'A verified batch of this exact route is required before a trial.');
  if (!Number.isInteger(sampleSize) || sampleSize < 40 || sampleSize > 2000 || sampleSize % 2 !== 0) return reject(state, 'Choose an even total sample size from 40 to 2,000 participants.');
  const cost = trialCost(state, sampleSize);
  if (cost > state.budget) return reject(state, `This controlled trial needs ${cost} credits; ${state.budget} remain.`);
  const prior = state.evidence.find(e => e.signature === preview.signature)?.report ?? null;
  if ((prior?.sampleSize ?? 0) + sampleSize > 4000) return reject(state, 'This demo supports at most 4,000 cumulative participants for one route.');
  const profile = profileFor(preview), n = sampleSize / 2;
  const random = seededRandom(hashString(`${state.seed}:${state.project}:${preview.signature}:${prior?.sampleSize ?? 0}:${sampleSize}`));
  const reports = ENDPOINTS.map(({ key, label }) => {
    const size = key === 'interaction' ? Math.max(1, Math.floor(n / 4)) : n;
    let treatedCount = 0, controlCount = 0;
    for (let i = 0; i < size; i++) { if (random() < profile[key]) treatedCount++; if (random() < CONTROL_PROFILE[key]) controlCount++; }
    const old = prior?.endpoints.find(e => e.key === key);
    return endpoint(key, label, proportion(treatedCount + (old?.treated.count ?? 0), size + (old?.treated.n ?? 0)), proportion(controlCount + (old?.control.count ?? 0), size + (old?.control.n ?? 0)));
  });
  const totalN = (prior?.sampleSize ?? 0) + sampleSize;
  const summary = `${totalN} simulated participants, split equally between candidate and control. ${prior ? 'Earlier observations are retained.' : 'Intervals show sampling uncertainty.'}`;
  const trial: TrialReport = { id: state.revision + 1, signature: preview.signature, candidateId: preview.candidate.id, sampleSize: totalN, addedSampleSize: sampleSize, treatedN: totalN / 2, controlN: totalN / 2, exposureDays: 7, cost, totalCost: (prior?.totalCost ?? 0) + cost, endpoints: reports, simulation: true, protocol: 'sim-rct-7d-v1', summary };
  const evidence = [...state.evidence.filter(e => e.signature !== preview.signature), { signature: preview.signature, report: trial }];
  return addHistory({ ...state, trial, evidence, phase: 'trial', budget: state.budget - cost }, 'trial', summary, -cost);
}

export function getLaunchReadiness(state: GameState): LaunchReadiness {
  const contract = getContract(state.contractId), preview = previewRoute(state);
  const reasons: string[] = [], warnings: string[] = [], checks: GateCheck[] = [];
  if (state.phase === 'complete') reasons.push('This project has already been finalized.');
  if (!preview.complete || !state.batch?.success || state.batch.signature !== preview.signature) reasons.push('A verified batch of the current route is required.');
  if (!state.trial || state.trial.signature !== preview.signature) reasons.push('A controlled trial of the current route is required.');
  const check = (key: string, label: string, actual: number, target: number, pass: boolean, message: string) => { checks.push({ key, label, actual, target, pass, message }); if (!pass) reasons.push(message); };
  check('unit-cost', 'Unit manufacturing cost', preview.unitCost, contract.maxUnitCost, preview.unitCost <= contract.maxUnitCost, `Unit cost must be at most $${contract.maxUnitCost.toFixed(2)}.`);
  if (state.trial?.signature === preview.signature) {
    check('sample', 'Cumulative participants', state.trial.sampleSize, contract.minSubjects, state.trial.sampleSize >= contract.minSubjects, `At least ${contract.minSubjects} total participants are required.`);
    const response = state.trial.endpoints.find(e => e.key === 'response')!;
    check('response', 'Observed response above control', response.difference, contract.minEffect, response.difference >= contract.minEffect, `Observed response must exceed control by at least ${Math.round(contract.minEffect * 100)} percentage points.`);
    if (response.differenceCI[0] < contract.minEffect) warnings.push('The response interval still includes effects below the management target.');
    for (const e of state.trial.endpoints) {
      if (e.key === 'response') continue;
      const threshold = contract.maxRates[e.key];
      check(e.key, e.label, e.treated.rate, threshold, e.treated.rate <= threshold, `${e.label} exceeds the management limit of ${rounded(threshold * 100, 1)}%.`);
      if (e.treated.ci[1] > threshold) warnings.push(`${e.label}: the upper 95% interval exceeds the management limit.`);
    }
  }
  warnings.push(...preview.warnings);
  return { allowed: reasons.length === 0, checks, reasons, warnings };
}

export function launch(state: GameState): GameState {
  const readiness = getLaunchReadiness(state);
  if (!readiness.allowed) return reject(state, readiness.reasons[0] ?? 'This project cannot be finalized yet.');
  const preview = previewRoute(state), contract = getContract(state.contractId), profile = profileFor(preview);
  const failures: string[] = [];
  const effect = profile.response - CONTROL_PROFILE.response;
  if (effect < contract.minEffect) failures.push('The underlying simulated response misses the project target.');
  for (const e of ENDPOINTS) if (e.key !== 'response' && profile[e.key] > contract.maxRates[e.key]) failures.push(`${e.label} exceeds the target in the revealed game model.`);
  // Purity was a visible process warning, unlike an unobservable lucky/unlucky cohort.
  const negligence = preview.purity < 0.95 && (profile.serious > 0.01 || failures.length > 0);
  const status = negligence ? 'recall' : failures.length ? 'failure' : 'success';
  const costMargin = clamp((contract.maxUnitCost - preview.unitCost) / contract.maxUnitCost);
  const effectMargin = clamp((effect - contract.minEffect) / 0.35);
  const score = Math.round(clamp(0.55 + costMargin * 0.20 + effectMargin * 0.25) * 100);
  const reward = status === 'success' ? Math.round(contract.reward * (0.75 + score / 200)) : 0;
  const penalty = status === 'recall' ? Math.min(state.labCredits, 400) : 0;
  const title = status === 'success' ? 'A useful molecule. An earned result.' : status === 'recall' ? 'Production recalled' : 'Project target missed';
  const summary = status === 'success' ? `Your candidate meets the underlying fictional targets. ${reward} laboratory credits earned.` : status === 'recall' ? 'The small trial missed a mixture-related risk. The visible purification warning was left unresolved; production is recalled.' : 'The larger-population model reveals a target violation that the sample did not resolve. The project closes without a funding reward.';
  const outcome: LaunchOutcome = { status, title, summary, score, reward, penalty, populationSize: 20000, profile, controlProfile: { ...CONTROL_PROFILE }, failures, negligence, simulation: true };
  return addHistory({ ...state, phase: 'complete', outcome, labCredits: state.labCredits + reward - penalty, completedContracts: status === 'success' ? [...new Set([...state.completedContracts, state.contractId])] : [...state.completedContracts] }, 'launch', summary);
}

export function reduceGame(state: GameState, command: GameCommand): GameState {
  switch (command.type) {
    case 'set-route': return setRoute(state, command.route);
    case 'add-action': return setRoute(state, [...state.route, command.actionId]);
    case 'remove-action': return Number.isInteger(command.index) && command.index >= 0 && command.index < state.route.length ? setRoute(state, state.route.filter((_, i) => i !== command.index)) : reject(state, 'Choose an existing step to remove.');
    case 'load-example': return setRoute(state, getContract(state.contractId).recommendedRoute);
    case 'batch': return runBatch(state);
    case 'trial': return runTrial(state, command.sampleSize);
    case 'launch': return launch(state);
    case 'buy-upgrade': {
      const upgrade = UPGRADES.find(u => u.id === command.upgradeId);
      if (!upgrade) return reject(state, 'Unknown upgrade.');
      if (state.upgrades.includes(upgrade.id)) return reject(state, 'This upgrade is already installed.');
      if (state.labCredits < upgrade.cost) return reject(state, `This upgrade needs ${upgrade.cost} laboratory credits.`);
      return addHistory({ ...state, labCredits: state.labCredits - upgrade.cost, upgrades: [...state.upgrades, upgrade.id] }, 'upgrade', `${upgrade.name} installed.`);
    }
    case 'new-project': {
      if (!CONTRACTS.some(c => c.id === command.contractId)) return reject(state, 'Choose a supported contract.');
      const fresh = createGame(command.contractId, state.seed);
      return addHistory({ ...fresh, project: state.project + 1, revision: state.revision, labCredits: state.labCredits, upgrades: [...state.upgrades], completedContracts: [...state.completedContracts], history: [...state.history] }, 'project', `${getContract(command.contractId).title} is ready. Laboratory upgrades carry forward; this project has its own budget.`);
    }
    default: return reject(state, 'Unknown command.');
  }
}
export const dispatch = reduceGame;

export function exportSave(state: GameState): string { return JSON.stringify(state); }
export type SaveResult = { ok: true; state: GameState } | { ok: false; error: string };
/** Validate the offline save boundary. It is deliberately not an anti-cheat trust boundary. */
export function importSave(serialized: string): SaveResult {
  try {
    if (typeof serialized !== 'string' || serialized.length > 2_000_000) throw new Error('Save is missing or too large.');
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== 'object') throw new Error('Save must be an object.');
    const s = value as GameState;
    if (s.version !== SAVE_VERSION || s.engineVersion !== ENGINE_VERSION) throw new Error('This save uses an unsupported engine version.');
    if (!CONTRACTS.some(c => c.id === s.contractId) || !['formulate', 'batch', 'trial', 'complete'].includes(s.phase)) throw new Error('Invalid project or stage.');
    for (const [key, number] of Object.entries({ seed: s.seed, revision: s.revision, project: s.project, budget: s.budget, labCredits: s.labCredits })) if (!Number.isSafeInteger(number) || number < 0) throw new Error(`Invalid ${key}.`);
    if (!Array.isArray(s.route) || s.route.length > 8 || s.route.some(id => !actionById(id))) throw new Error('Invalid route.');
    if (!Array.isArray(s.upgrades) || s.upgrades.some(id => !UPGRADES.some(u => u.id === id)) || new Set(s.upgrades).size !== s.upgrades.length) throw new Error('Invalid upgrades.');
    if (!Array.isArray(s.completedContracts) || s.completedContracts.some(id => !CONTRACTS.some(c => c.id === id))) throw new Error('Invalid completed contracts.');
    if (!Array.isArray(s.history) || s.history.length > 20000 || !Array.isArray(s.evidence) || s.evidence.length > 1000 || typeof s.message !== 'string') throw new Error('Invalid project history.');
    for (const h of s.history) if (!h || !Number.isInteger(h.id) || !Number.isInteger(h.project) || !Number.isInteger(h.budgetDelta) || typeof h.type !== 'string' || typeof h.message !== 'string') throw new Error('Invalid history event.');
    for (const record of s.evidence) {
      const r = record.report;
      if (typeof record.signature !== 'string' || r.signature !== record.signature || r.protocol !== 'sim-rct-7d-v1' || r.simulation !== true || !Array.isArray(r.endpoints) || r.endpoints.length !== ENDPOINTS.length) throw new Error('Invalid trial evidence.');
      if (!Number.isInteger(r.sampleSize) || r.sampleSize < 40 || r.sampleSize > 4000 || !Number.isInteger(r.treatedN) || r.treatedN !== r.controlN || r.treatedN + r.controlN !== r.sampleSize || r.exposureDays !== 7) throw new Error('Invalid cohort.');
      for (const expected of ENDPOINTS) {
        const e = r.endpoints.find(item => item.key === expected.key);
        if (!e) throw new Error('Missing endpoint.');
        for (const p of [e.treated, e.control]) {
          const ci = wilsonInterval(p.count, p.n);
          if (!Number.isFinite(p.rate) || p.n > r.treatedN || (e.key !== 'interaction' && p.n !== r.treatedN) || Math.abs(p.rate - p.count / p.n) > 1e-10 || !Array.isArray(p.ci) || p.ci.length !== 2 || p.ci.some(x => !Number.isFinite(x)) || Math.abs(p.ci[0] - ci[0]) > 1e-10 || Math.abs(p.ci[1] - ci[1]) > 1e-10) throw new Error('Corrupted trial statistics.');
        }
        const expectedDifference = endpoint(e.key, e.label, e.treated, e.control);
        if (!Number.isFinite(e.difference) || Math.abs(e.difference - expectedDifference.difference) > 1e-10 || !Array.isArray(e.differenceCI) || e.differenceCI.length !== 2 || e.differenceCI.some((x, i) => !Number.isFinite(x) || Math.abs(x - expectedDifference.differenceCI[i]) > 1e-10)) throw new Error('Corrupted comparison statistics.');
      }
    }
    const preview = previewRoute(s);
    if (s.trial && (s.trial.signature !== preview.signature || !s.evidence.some(e => JSON.stringify(e.report) === JSON.stringify(s.trial)))) throw new Error('Trial does not match the current evidence.');
    if (s.batch && (s.batch.signature !== preview.signature || typeof s.batch.success !== 'boolean' || (s.batch.success && (!preview.complete || s.batch.candidate?.id !== preview.candidate?.id)))) throw new Error('Batch does not match the current route.');
    if (s.phase === 'batch' && !s.batch?.success) throw new Error('Batch stage has no accepted batch.');
    if (s.phase === 'trial' && (!s.trial || !s.batch?.success)) throw new Error('Trial stage is missing its batch or evidence.');
    if (s.phase === 'complete' && !s.outcome) throw new Error('Completed project has no outcome.');
    if (s.outcome) {
      if (!['success', 'failure', 'recall'].includes(s.outcome.status) || typeof s.outcome.title !== 'string' || typeof s.outcome.summary !== 'string' || !Array.isArray(s.outcome.failures)) throw new Error('Invalid project outcome.');
      for (const number of [s.outcome.score, s.outcome.reward, s.outcome.penalty, s.outcome.populationSize]) if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid outcome values.');
      for (const p of [s.outcome.profile, s.outcome.controlProfile]) for (const e of ENDPOINTS) if (!p || !Number.isFinite(p[e.key]) || p[e.key] < 0 || p[e.key] > 1) throw new Error('Invalid revealed model.');
    }
    return { ok: true, state: s };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Invalid save.' }; }
}
