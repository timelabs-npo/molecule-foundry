# Contributing

Start with an issue or a shared work-queue item describing the player outcome, acceptance evidence, owner, and relevant constraints. Claim one bounded task and use a feature branch.

Engine work must preserve replay determinism, independent research/manufacturing budgets, candidate-specific cumulative evidence, and visible release limits. Include a test for the behavior at risk. Do not put unsupported chemistry or real-medication effect claims into game data.

UI work should preserve keyboard and VoiceOver labels, readable contrast, reduced-motion support, and persistent access to primary controls. Test on an iPhone-sized surface. Native work also needs the simulator UI gate and a physical-device check before public beta.

Shared configuration changes create immutable drafts. Review their rationale, then update the versioned game content in a pull request. A draft in the developer panel is not a deployed gameplay update.

Only the protected release workflow can produce the signed delivery receipt. Never claim TestFlight availability from a green build or upload alone; verify Apple processing and tester/build association.

Never commit credentials. Report security issues privately to the project owner through the repository's supported private reporting channel when available.
