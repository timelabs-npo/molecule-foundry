# Science and simulation boundary

Molecule Foundry is a chemistry-inspired management game. It does not predict synthesis feasibility, human efficacy, toxicity, metabolism, or medicine interactions. Its costs, clinical profiles, thresholds, patient events, and rewards are invented game parameters. No real trial participants or patient data are used.

## What is grounded

- The starting reference is isobutylbenzene, not “isobutyl gasoline”: PubChem CID 10870, formula C10H14, SMILES `CC(C)CC1=CC=CC=C1`.
- The unmodified completed reference graph is ibuprofen: PubChem CID 3672, formula C13H18O2, SMILES `CC(C)CC1=CC=C(C=C1)C(C)C(=O)O`.
- EPA describes the BHC ibuprofen process as a three-catalytic-step manufacturing route. The game uses a curated conceptual progression from an aromatic scaffold through a ketone and alcohol to an acid. It omits conditions, reagents, catalysts, quantities, equipment requirements, stereochemical control, competing pathways, separation specifics, and scale-up hazards. It is not an executable production recipe.
- Molecular drawings encode atoms and bonds rather than decorative hexagons. The reference graphs have consistent valences and formulae. Hydrogens on carbon are implicit; terminal heteroatom labels specify OH or NH₂.
- Proportion intervals use the two-sided nominal 95% Wilson score method. Zero observed events do not imply zero underlying risk.
- Treatment and control cohorts are separate, with explicit counts and denominators. A background event is not automatically an event caused by the candidate.

## What is fictional

All six clinical endpoint probabilities, their changes with the game purification card, the candidate names MF-D7/MF-G2/MF-H4, costs, process yields, project budgets, management limits, cohort size requirements, recall rules, and progression rewards are authored fiction. Even the ibuprofen-shaped reference candidate does **not** use clinical ibuprofen efficacy or adverse-event data.

The polar-handle card is a fictional route abstraction with a curated product graph. The amide-tip card represents a functional-group change at a conceptual level; the engine does not establish that its one-card transformation is practically feasible on the depicted substrate. The drawings do not prove synthesizability, stability, bioavailability, or medicinal value. Stereochemistry is not modeled in this demo.

Adding an aromatic ring does not have a general additive fatigue coefficient in real pharmacology. Candidate profiles are authored as whole candidate-and-mixture profiles. The game does not calculate real drug effects from fragments, SMILES, docking, language models, or claimed pharmacological rules. A route cannot spontaneously turn into an unrelated named medicine. Unsupported transformations return prerequisite errors.

## Trial model

`sampleSize` is the **total** new enrollment, split equally between treated and control arms. Allowed trial increments are even totals from 40 to 2,000. The current demo caps cumulative enrollment for one route at 4,000. Exposure is fixed at seven fictional days.

Each endpoint is generated with independent Bernoulli draws under the authored probability. Counts for the co-medication endpoint come from a predefined subgroup containing one quarter of each new arm, rounded down. Its denominator is therefore smaller, and its uncertainty wider. Endpoints are independent in the code; real symptoms and organ findings are not generally independent.

Reports show counts, rates, Wilson intervals, treated-minus-control differences, and a Newcombe-style difference interval assembled from the two Wilson intervals. These are frequentist confidence intervals, **not Bayesian credible intervals** and not a posterior probability that the true rate lies within an interval. No multiplicity adjustment, sequential-testing correction, dropout, adherence, site effect, real patient covariate, or real causal-effect estimation is implemented. The intervals are descriptive teaching aids. Repeated inspection can affect nominal coverage, so these reports must not be presented as a confirmatory regulatory analysis.

Subsequent trials for exactly the same route add their counts to the retained evidence; the player cannot erase an adverse report by returning to the editor. Returning to a previously studied route restores its accumulated report after a fresh batch. Changing the route invalidates its active batch and clinical clearance. Evidence remains archived within the project.

The random generator is seeded. The same initial seed and command log yield the same reports. Save data preserves the seed, cumulative evidence, budgets, and upgrades. It is an offline persistence format, not an anti-cheat or cryptographic trust boundary.

## Management and launch

Management gates enforce the published unit-cost cap, minimum total cohort, minimum observed response difference, and maximum observed adverse-event rates. Wider intervals generate warnings even when point estimates pass. This intentionally leaves a decision under uncertainty; it is not real clinical, ethical, or regulatory authorization.

At finalization, the game reveals the underlying authored probabilities in a “20,000-person population” narrative. **The current final reveal is a model profile, not 20,000 separately simulated participant records.** It is not new empirical evidence. The outcome compares the latent profile with the contract limits. A visible unresolved purification warning plus a high mixture-related severe-event probability can trigger a fictional recall. Financial penalties are capped by current laboratory credits.

An upgrade can reduce recruitment costs or process costs. Sample-size uncertainty is never arbitrarily multiplied down by an upgrade. The structural-preview upgrade allows the UI to expose detailed per-step previews; the pure engine always provides that data so accessible interfaces can render it consistently.

## Verified references

References checked on 2026-11-21. These support the limited factual and statistical claims above, not the invented clinical model.

1. US EPA. *Presidential Green Chemistry Challenge: 1997 Greener Synthetic Pathways Award — BHC Company Ibuprofen Process.* https://www.epa.gov/greenchemistry/presidential-green-chemistry-challenge-1997-greener-synthetic-pathways-award
2. PubChem. *Isobutylbenzene, CID 10870.* https://pubchem.ncbi.nlm.nih.gov/compound/10870
3. PubChem. *Ibuprofen, CID 3672.* https://pubchem.ncbi.nlm.nih.gov/compound/3672
4. NIST/SEMATECH. *e-Handbook of Statistical Methods, 7.2.4.1. Confidence intervals.* https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm
5. FDA. *E10 Choice of Control Group and Related Issues in Clinical Trials.* https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e10-choice-control-group-and-related-issues-clinical-trials
6. Newcombe RG. *Interval estimation for the difference between independent proportions: comparison of eleven methods.* Statistics in Medicine. 1998;17:873–890. PMID 9595617. https://pubmed.ncbi.nlm.nih.gov/9595617/

## Production backlog

Before educational or scientific claims expand: independent medicinal-chemistry review of every reference route and atom mapping; a versioned provenance record per card; separation of fictional and sourced learning modes; validation of all localized chemistry labels; an explicit stereochemistry design; accessibility checks for bond/atom highlights; balanced cohort scenarios with correlation and subgroup effects; and real player comprehension testing. No generated content becomes a scientifically labeled production card without that review.
