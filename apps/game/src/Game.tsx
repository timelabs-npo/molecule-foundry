import { useEffect, useState, type ComponentType, type PropsWithChildren } from 'react';
import { CubeIcon, BarChartIcon, ReaderIcon, PlusIcon, Cross2Icon, CheckIcon, ChevronUpIcon, ChevronDownIcon, InfoCircledIcon, MagnifyingGlassIcon, RocketIcon } from '@radix-ui/react-icons';
import { CONTRACTS, UPGRADES, ENGINE_VERSION, SCIENCE_NOTICE, createGame, reduceGame, previewRoute, getContract, getAvailableActions, getLaunchReadiness, trialCost, exportSave, importSave, type GameState, type GameCommand, type Molecule, type EndpointReport } from '../../../packages/engine/src/index';

const SAVE_KEY = 'molecule-foundry.save.v1';
type Tab = 'workshop' | 'trials' | 'notebook';
type ScrollProps = PropsWithChildren<{ className?: string }>;
const NativeScroll = ({ children, className }: ScrollProps) => <div className={className}>{children}</div>;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const credits = (n: number) => n.toLocaleString('en-US');
const money = (n: number) => `$${n.toFixed(2)}`;
function initialState(): GameState {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const result = importSave(raw); if (result.ok) return result.state; } } catch { /* Private browsers may reject storage. */ }
  return createGame('first-relief', 42);
}
function haptic(event: string) {
  const bridge = (window as unknown as { webkit?: { messageHandlers?: { foundry?: { postMessage: (value: string) => void } } } }).webkit?.messageHandlers?.foundry;
  bridge?.postMessage(event);
}

function MoleculeView({ molecule, changed }: { molecule: Molecule | null; changed: boolean }) {
  if (!molecule) return null;
  const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]));
  const xMin = Math.min(...molecule.atoms.map(a => a.x)) - 20, xMax = Math.max(...molecule.atoms.map(a => a.x)) + 25;
  const yMin = Math.min(...molecule.atoms.map(a => a.y)) - 20, yMax = Math.max(...molecule.atoms.map(a => a.y)) + 20;
  return <svg className="mf-molecule" viewBox={`${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`} role="img" aria-label={`${molecule.name}, formula ${molecule.formula}. Skeletal molecular structure.`}>
    <title>{molecule.name}</title>
    {molecule.bonds.map((bond, i) => {
      const a = atoms.get(bond.from)!, b = atoms.get(bond.to)!;
      const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
      const ax = a.x + (a.label ? dx / length * 9 : 0), ay = a.y + (a.label ? dy / length * 9 : 0);
      const bx = b.x - (b.label ? dx / length * 10 : 0), by = b.y - (b.label ? dy / length * 10 : 0);
      const highlight = changed && (molecule.changedAtomIds.includes(a.id) || molecule.changedAtomIds.includes(b.id));
      const nx = -dy / length * 2.2, ny = dx / length * 2.2;
      return <g key={i} stroke={highlight ? '#4ee7de' : '#e2eaf2'} strokeWidth="2.5" strokeLinecap="round">
        {bond.order === 2 ? <><line x1={ax + nx} y1={ay + ny} x2={bx + nx} y2={by + ny}/><line x1={ax - nx} y1={ay - ny} x2={bx - nx} y2={by - ny}/></> : <line x1={ax} y1={ay} x2={bx} y2={by}/>}
      </g>;
    })}
    {molecule.atoms.filter(a => a.label).map(a => <text key={a.id} x={a.x} y={a.y + 5} textAnchor="middle" fill={changed && molecule.changedAtomIds.includes(a.id) ? '#4ee7de' : '#f3f7fb'} fontSize="16" fontWeight="500">{a.label}</text>)}
  </svg>;
}

function Endpoint({ report }: { report: EndpointReport }) {
  return <article className="mf-endpoint">
    <div className="mf-row"><h3>{report.label}</h3><span className={report.key === 'response' ? 'mf-cyan' : ''}>{pct(report.treated.rate)}</span></div>
    <div className="mf-comparison"><span>Candidate <b>{report.treated.count}/{report.treated.n}</b></span><span>Control <b>{report.control.count}/{report.control.n}</b></span></div>
    <div className="mf-interval" aria-label={`Candidate 95 percent confidence interval ${pct(report.treated.ci[0])} to ${pct(report.treated.ci[1])}`}><span className="mf-interval-range" style={{ left: `${report.treated.ci[0] * 100}%`, width: `${Math.max(0.5, (report.treated.ci[1] - report.treated.ci[0]) * 100)}%` }}/><span className="mf-interval-point" style={{ left: `${report.treated.rate * 100}%` }}/></div>
    <p className="mf-caption">95% CI {pct(report.treated.ci[0])}–{pct(report.treated.ci[1])} · difference {report.difference >= 0 ? '+' : ''}{(report.difference * 100).toFixed(1)} pp</p>
    <details><summary>Read the uncertainty</summary><p>Control: {pct(report.control.rate)} (95% CI {pct(report.control.ci[0])}–{pct(report.control.ci[1])}). Difference interval: {(report.differenceCI[0] * 100).toFixed(1)} to {(report.differenceCI[1] * 100).toFixed(1)} percentage points. {report.subgroup ?? 'Seven days of simulated exposure.'} Observed events are not automatically caused by the candidate.</p></details>
  </article>;
}

export default function Game({ ScrollComponent = NativeScroll }: { ScrollComponent?: ComponentType<ScrollProps> }) {
  const [state, setState] = useState<GameState>(initialState);
  const [tab, setTab] = useState<Tab>('workshop');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [sample, setSample] = useState(120);
  const [saveError, setSaveError] = useState(false);
  const [notice, setNotice] = useState('');
  const contract = getContract(state.contractId), preview = previewRoute(state), readiness = getLaunchReadiness(state), available = getAvailableActions(state);
  const initialMolecule = previewRoute({ route: ['aromatic-core'], upgrades: [] }).molecule;
  const displayedMolecule = stepIndex === null ? preview.molecule ?? initialMolecule : preview.steps[stepIndex]?.molecule ?? preview.molecule;
  useEffect(() => { try { localStorage.setItem(SAVE_KEY, exportSave(state)); setSaveError(false); } catch { setSaveError(true); } }, [state]);
  function command(cmd: GameCommand) {
    setState(previous => { const next = reduceGame(previous, cmd); haptic(next.revision > previous.revision ? (cmd.type === 'launch' ? 'success' : 'selection') : 'warning'); return next; });
    setStepIndex(null); setNotice('');
  }
  function navigate(next: Tab) { setTab(next); setLibraryOpen(false); setNotice(''); haptic('selection'); }
  function moveStep(index: number, delta: number) { const route = [...state.route]; [route[index], route[index + delta]] = [route[index + delta], route[index]]; command({ type: 'set-route', route }); }
  function batch() { command({ type: 'batch' }); setLibraryOpen(false); setInspect(true); }

  return <div className="mf-app" aria-label="Molecule Foundry game">
    <ScrollComponent className="mf-scroll"><main className="mf-main">
      <header className="mf-brand"><span>MOLECULE FOUNDRY</span><span className="mf-version">DEMO · {ENGINE_VERSION}</span></header>
      <div className="mf-contract"><button className="mf-brief-link" aria-label="Read project targets" onClick={() => navigate('notebook')}><b>{String(contract.number).padStart(2, '0')}</b> / {contract.title}</button><span className="mf-caption">{credits(state.budget)} cr</span></div>
      {saveError && <p className="mf-warning">This browser cannot save progress. Keep the game open.</p>}

      {tab === 'workshop' && <>
        <h1>{state.route.length === 0 ? <>A little relief.<br/>A lot to discover.</> : state.phase === 'complete' ? <>Every molecule<br/>leaves a mark.</> : <>Follow the bonds.<br/>Find your answer.</>}</h1>
        <div className="mf-molecule-stage"><MoleculeView molecule={displayedMolecule} changed={state.route.length > 0}/><div className="mf-molecule-caption"><span>{preview.candidate?.code ?? (state.route.length ? 'INTERMEDIATE' : 'STARTING SCAFFOLD')}</span><span>{state.batch?.success || inspect ? displayedMolecule?.formula : 'The structure tells a story'}</span></div></div>
        <div className="mf-inspect-row"><button className="mf-text-button" onClick={() => setInspect(!inspect)} aria-expanded={inspect}><MagnifyingGlassIcon/> {inspect ? 'Close molecule notes' : 'Inspect molecule'}</button><span className="mf-caption">{preview.steps.length}/8 steps</span></div>
        {inspect && <section className="mf-explainer"><h3>{displayedMolecule?.name}</h3><p>{state.route.length ? preview.steps[stepIndex ?? preview.steps.length - 1]?.explanation : 'The starting material already contains an aromatic ring. Each corner and unlabelled line end is a carbon atom; most hydrogens are implicit.'}</p><p className="mf-caption">Cyan marks the most recently changed atoms and their bonds. {displayedMolecule?.representation === 'reference-structure' ? 'Sourced reference structure; clinical effects are fictional.' : 'Curated game structure; no biological prediction is implied.'}</p>{displayedMolecule?.referenceUrl && <a href={displayedMolecule.referenceUrl} target="_blank" rel="noreferrer">Open structure reference</a>}{state.upgrades.includes('spectrometer') && <code>{displayedMolecule?.smiles}</code>}</section>}
        <section className="mf-route" aria-label="Production route">
          {!state.route.length && <><button className="mf-start" aria-label="Choose aromatic core" onClick={() => command({ type: 'add-action', actionId: 'aromatic-core' })}><span className="mf-step-node active">1</span><span><strong>Choose aromatic core</strong><small>Start with a stable scaffold</small></span><PlusIcon/></button><div className="mf-route-ghost"><span className="mf-step-node">2</span><span>Shape the molecule</span></div><div className="mf-route-ghost"><span className="mf-step-node">3</span><span>Study what it does</span></div></>}
          {preview.steps.map((step, index) => <div className={`mf-route-step ${!step.valid ? 'invalid' : ''}`} key={`${step.action.id}-${index}`}><button className="mf-step-title" onClick={() => { setInspect(true); if (state.upgrades.includes('spectrometer') || state.batch) setStepIndex(index); else { setStepIndex(null); setNotice('Current structure is visible. Unlock Structural preview to inspect every earlier stage.'); } }}><span className="mf-step-node active">{index + 1}</span><span><strong>{step.action.shortTitle}</strong><small>{step.valid ? step.action.term : step.explanation}</small></span></button>{state.phase !== 'complete' && <div className="mf-step-tools"><button aria-label={`Move step ${index + 1} up`} disabled={index === 0} onClick={() => moveStep(index, -1)}><ChevronUpIcon/></button><button aria-label={`Move step ${index + 1} down`} disabled={index === state.route.length - 1} onClick={() => moveStep(index, 1)}><ChevronDownIcon/></button><button aria-label={`Remove step ${index + 1}`} onClick={() => command({ type: 'remove-action', index })}><Cross2Icon/></button></div>}</div>)}
        </section>
        {state.route.length > 0 && state.phase !== 'complete' && state.route.length < 8 && <button className="mf-add" onClick={() => setLibraryOpen(!libraryOpen)} aria-expanded={libraryOpen}><PlusIcon/> {libraryOpen ? 'Close transformation library' : 'Add a transformation'}</button>}
        {libraryOpen && <section className="mf-library" aria-label="Transformation library"><h2>What happens next?</h2><p className="mf-caption">Read the prerequisite. Predict the change.</p>{available.map(action => <div className="mf-action" key={action.id}><button disabled={!action.available} onClick={() => { command({ type: 'add-action', actionId: action.id }); setLibraryOpen(false); }}><span><strong>{action.title}</strong><small>{action.description}</small></span><span className="mf-price">{action.unitCostCents >= 0 ? '+' : '−'}{money(Math.abs(action.unitCostCents) / 100)}</span></button>{!action.available && <p className="mf-lock-reason">{action.reason}</p>}</div>)}</section>}
        {notice && <p role="status" className="mf-note">{notice}</p>}
        {preview.issues.filter(i => i.code !== 'empty').map((issue, i) => <p className="mf-warning" key={i}>Step {issue.index + 1}: {issue.message}</p>)}
        {preview.warnings.map(w => <p className="mf-note" key={w}>{w}</p>)}
        <div className="mf-cost"><strong className={preview.unitCost > contract.maxUnitCost ? 'mf-red' : ''}>{money(preview.unitCost)} <small>/ unit</small></strong><span>Limit {money(contract.maxUnitCost)}</span></div>
        {state.phase === 'complete' ? <button className="mf-primary" onClick={() => navigate('trials')}>Read the final report</button> : state.batch?.success && state.batch.signature === preview.signature ? <button className="mf-primary" onClick={() => navigate('trials')}>Plan a controlled trial</button> : <button className="mf-primary" onClick={batch} disabled={!preview.valid || !state.route.length || state.budget < preview.batchCost}>Run a test batch <span>{preview.batchCost} cr</span></button>}
        {state.batch && <section className={`mf-batch ${state.batch.success ? 'success' : ''}`} role="status"><h3>{state.batch.success ? 'Batch reveal' : 'Batch report'}</h3><p>{state.batch.message}</p>{state.batch.success && <p>Purity {(state.batch.purity * 100).toFixed(0)}% · {state.batch.molecule?.name}</p>}</section>}
        <p className="mf-tiny">A chemistry-inspired game. Simulated costs and effects.</p>
      </>}

      {tab === 'trials' && <>
        <h1>{state.outcome ? <>The result.<br/>And the responsibility.</> : <>A signal.<br/>Or just noise?</>}</h1><p className="mf-lede">{state.outcome ? 'The hidden game model is now revealed. Compare it with the evidence you had.' : 'A small study gives you clues. A larger study helps you judge how much to trust them.'}</p><span className="mf-label">FICTIONAL CLINICAL SIMULATION</span>
        {state.outcome ? <><section className={`mf-outcome ${state.outcome.status}`}><RocketIcon/><h2>{state.outcome.title}</h2><p>{state.outcome.summary}</p><div className="mf-outcome-score"><strong>{state.outcome.score}<small>/100</small></strong><span>{credits(state.outcome.reward)} lab credits</span></div></section><h2>Underlying game probabilities</h2><p className="mf-caption">Authored fiction, revealed after the decision. These are model values, not observed patients.</p><div className="mf-profile">{Object.entries(state.outcome.profile).map(([key,value]) => <div key={key}><span>{key === 'response' ? 'Symptom response' : key[0].toUpperCase() + key.slice(1)}</span><strong>{pct(value)}</strong></div>)}</div><button className="mf-primary" onClick={() => navigate('notebook')}>Return to the laboratory</button></> : !state.batch?.success ? <section className="mf-empty"><CubeIcon/><h2>A molecule comes first.</h2><p>Complete a supported route and run a successful test batch before recruiting a simulated cohort.</p><button className="mf-primary" onClick={() => navigate('workshop')}>Back to the workshop</button></section> : <>
          <section className="mf-protocol"><h2>{state.trial ? 'Extend the evidence' : 'Design your first study'}</h2><p>Two equal arms · candidate versus control · 7 days</p><div className="mf-sample-buttons" role="group" aria-label="Additional simulated participants">{[40,120,240,480].map(n => <button className={sample === n ? 'selected' : ''} aria-pressed={sample === n} key={n} onClick={() => setSample(n)}><strong>{n}</strong><small>people</small></button>)}</div><div className="mf-row"><span>Study cost</span><strong>{credits(trialCost(state,sample))} cr</strong></div><button className="mf-primary" disabled={state.budget < trialCost(state,sample)} onClick={() => command({type:'trial',sampleSize:sample})}>{state.trial ? 'Add a study cohort' : 'Run the controlled trial'}</button><p className="mf-caption">Repeated studies accumulate. Unfavorable results stay in the notebook.</p></section>
          {state.trial && <><div className="mf-report-heading"><h2>What the sample says</h2><p>{state.trial.sampleSize} total · {state.trial.treatedN} candidate / {state.trial.controlN} control</p></div>{state.trial.endpoints.map(report => <Endpoint key={report.key} report={report}/>)}<p className="mf-note">Zero observed events do not mean zero risk. Intervals describe sampling uncertainty; they do not cover every model limitation.</p><h2>Management checks</h2><div className="mf-checks">{readiness.checks.map(check => <div key={check.key}><span className={check.pass ? 'mf-cyan' : 'mf-red'}>{check.pass ? <CheckIcon/> : <Cross2Icon/>}</span><span>{check.label}</span><strong>{check.key === 'sample' ? `${check.actual} / ≥${check.target}` : check.key === 'unit-cost' ? `${money(check.actual)} / ≤${money(check.target)}` : `${pct(check.actual)} / ${check.key === 'response' ? '≥' : '≤'}${pct(check.target)}`}</strong></div>)}</div>{readiness.warnings.length > 0 && <details className="mf-warning"><summary>{readiness.warnings.length} uncertainty notes to review</summary>{readiness.warnings.map(w => <p key={w}>{w}</p>)}</details>}<button className="mf-primary" disabled={!readiness.allowed} onClick={() => command({type:'launch'})}>Finalize this project</button>{!readiness.allowed && <p className="mf-caption">{readiness.reasons[0]}</p>}<button className="mf-secondary" onClick={() => navigate('workshop')}>Return to formulation</button></>}
        </>}{state.message && <p className="mf-live-status" role="status">{state.message}</p>}
      </>}

      {tab === 'notebook' && <>
        <h1>Your lab notebook</h1><p className="mf-lede">Better questions make better experiments.</p>
        <details className="mf-explainer" open><summary>Current project: the actual targets</summary><p>{contract.description}</p><div className="mf-profile"><div><span>Cost per unit</span><strong>≤ {money(contract.maxUnitCost)}</strong></div><div><span>Total study participants</span><strong>≥ {contract.minSubjects}</strong></div><div><span>Response above control</span><strong>≥ {(contract.minEffect * 100).toFixed(0)} pp</strong></div>{Object.entries(contract.maxRates).map(([key,value]) => <div key={key}><span>{key[0].toUpperCase() + key.slice(1)} rate</span><strong>≤ {pct(value)}</strong></div>)}</div><p>Management gates use observed game rates; uncertainty can still leave a bad decision looking acceptable.</p></details>
        <div className="mf-lab-balance"><span>Laboratory funds</span><strong>{credits(state.labCredits)} <small>cr</small></strong><p>{state.completedContracts.length}/3 contracts completed · upgrades carry forward</p></div>
        <h2>Next research brief</h2><p className="mf-caption">Starting a new project closes the current attempt and starts its own budget. Lab funds and upgrades remain.</p><section className="mf-contracts">{CONTRACTS.map(c => <article key={c.id}><div className="mf-row"><h3>{c.number}. {c.title}</h3>{state.completedContracts.includes(c.id) && <CheckIcon className="mf-cyan"/>}</div><p>{c.description}</p><p className="mf-caption">Unit limit {money(c.maxUnitCost)} · {credits(c.budget)} research credits · ≥{c.minSubjects} participants</p><button className="mf-secondary" onClick={() => { command({type:'new-project',contractId:c.id}); navigate('workshop'); }}>{c.id === state.contractId ? 'Start a fresh attempt' : 'Start this project'}</button></article>)}</section>
        <h2>Upgrade the lab</h2><section className="mf-upgrades">{UPGRADES.map(upgrade => <article key={upgrade.id}><div className="mf-row"><h3>{upgrade.name}</h3><strong>{credits(upgrade.cost)} cr</strong></div><p>{upgrade.description}</p><button className="mf-secondary" disabled={state.upgrades.includes(upgrade.id) || state.labCredits < upgrade.cost} onClick={() => command({type:'buy-upgrade',upgradeId:upgrade.id})}>{state.upgrades.includes(upgrade.id) ? 'Installed' : 'Acquire upgrade'}</button></article>)}</section>
        <details className="mf-explainer"><summary>Learning the first route</summary><p>Start with an aromatic core. Add a carbonyl arm, reduce it to an alcohol, then use the supported acid-anchor transformation. Purify the final batch. The ring alone never predicts a drug effect.</p><button className="mf-secondary" disabled={state.phase === 'complete'} onClick={() => { command({type:'load-example'}); navigate('workshop'); }}>Load teaching route</button></details>
        {state.evidence.length > 0 && <><h2>Archived studies in this project</h2><p className="mf-caption">Changing the route does not erase its evidence. Each version retains its cumulative cohort.</p>{state.evidence.map(record => <details className="mf-archive" key={record.signature}><summary>{record.report.candidateId} · n={record.report.sampleSize}</summary><p className="mf-caption">Route: {record.signature.split(':').slice(1).join(':').replaceAll('>',' → ')}</p>{record.report.endpoints.map(report => <Endpoint key={report.key} report={report}/>)}</details>)}</>}
        <h2>Experiment ledger</h2>{state.history.length ? <ol className="mf-ledger">{state.history.slice(-30).reverse().map(entry => <li key={entry.id}><span className="mf-caption">Project {entry.project} · {entry.type}</span><p>{entry.message}</p>{entry.budgetDelta !== 0 && <small>{entry.budgetDelta > 0 ? '+' : ''}{entry.budgetDelta} research credits</small>}</li>)}</ol> : <p className="mf-caption">Your decisions will appear here.</p>}
        <section className="mf-science"><InfoCircledIcon/><h3>What this game knows</h3><p>{SCIENCE_NOTICE}</p><p>The demo uses a small, curated reaction graph. It does not predict arbitrary chemistry, dosing, safety or clinical success. Population outcomes reveal authored probabilities.</p><p>Progress stays on this device. No account or network connection is needed to play.</p><a href="https://github.com/timelabs-npo/molecule-foundry/blob/main/docs/SCIENCE_MODEL.md" target="_blank" rel="noreferrer">Read model notes and sources</a></section><p className="mf-live-status" role="status">{state.message}</p>
      </>}
    </main></ScrollComponent>
    <nav className="mf-tabs" aria-label="Game sections">{([{id:'workshop',label:'Workshop',Icon:CubeIcon},{id:'trials',label:'Trials',Icon:BarChartIcon},{id:'notebook',label:'Notebook',Icon:ReaderIcon}] as const).map(item => <button className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} key={item.id} onClick={() => navigate(item.id)}><item.Icon/><span>{item.label}</span></button>)}</nav>
  </div>;
}
