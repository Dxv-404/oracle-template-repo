# TEMPLATES

The authoritative templates for the record, with complete documentation of every field. This file lives in
the record repository. It defines the exact shape of every artifact a person creates, the proposal that
wraps a change, the decision, the living document, the note, and the library entry, and it documents each
field so thoroughly that a person or an assistant filling one has a defined answer for every part and no
room for doubt. Where a field requires judgment, this file says so and gives the test to apply.

This file is the companion to three others and never contradicts them. The schemas here realize the data
model in SPEC.md Section 4. The version fields obey VERSIONING.md. The approval requirements follow the
differential gate in CLAUDE.md Section 10 and SPEC.md Section 5.5. Where any of those defines a rule, this
file points to it rather than restating it loosely, so the four documents stay in agreement.

Lineage. The decision template descends from a real tradition: Michael Nygard's original context-decision
-consequences record, Olaf Zimmermann's Y-statements, and the Markdown Any Decision Record (MADR) format
that combined them and made rejected options and decision drivers first-class. Our decision template is a
superset of MADR, adding fields specific to a research record, invariants respected, a falsifier, and a
fallback, each with its reason given in Section 4. Crediting the lineage matters because it means the shape
is battle-tested, not invented here.

How to use this file. Two authoring paths exist, and every template supports both. In the first, the
application renders the template as a form and the person fills fields, so what the app produces is valid by
construction. In the second, a person, or their own assistant, fills the template as markdown offline and
pastes it into the application, which parses it back into the same fields for review (Section 11). For each
template this file gives an annotated version that explains every field inline, a bare version to copy, a
field-by-field reference, and at least one fully worked example.

> Summary: This file defines and exhaustively documents every template in the record, realizing SPEC.md's
> data model, obeying VERSIONING.md, and following CLAUDE.md's gate without restating them. The decision
> template is a documented superset of the Nygard, Y-statement, and MADR tradition. Every template supports
> both the in-app form and the offline paste path, and each is given an annotated version, a bare version, a
> field reference, and a worked example.

---

## 1. How templates work here

### 1.1 Valid by construction, then verified

A template is not decoration; it is the contract for what an artifact must contain. When the application
renders a template as a form, anything it produces maps to the schema and is well-formed by construction.
When a person pastes a filled template, the application parses and validates it against the same schema
before it becomes a proposal. Beyond form, the validate check enforces the machine-checkable rules at merge,
and the human reviewers enforce the rules that require judgment (Section 9). A template guarantees the
shape; it cannot guarantee the content is true, which is why review exists.

### 1.2 How a template maps to a stored artifact

Every stored artifact is a single markdown file with two parts: a frontmatter block of structured fields
between two `---` lines at the top, and a markdown body below it. The template defines both. Frontmatter
fields are the structured, machine-read data, ids, status, versions, links, tags. The body is the
human-read prose. A field documented below as frontmatter belongs in the block; a section documented below
as body belongs beneath it. The frontmatter block is YAML and MUST parse as valid YAML: lists are written in
YAML list form, either inline as `[a, b]` or as `-` items on their own lines, as the worked examples show,
and a malformed block is a validity failure the check catches.

### 1.3 The documentation convention used in this file

Every field and every body section below is documented with the same six-part convention, so nothing is
left implicit:

- Purpose. What the field is for, in one line.
- Required. Whether it is required, optional, or required only for certain types, and under what condition.
- Format. The exact allowed form: type, allowed values, pattern.
- Validation. What makes it valid or invalid.
- Checked by. Whether the validate check enforces it mechanically, a human reviewer judges it, or both.
- Notes and common mistakes. The mistakes that actually happen, so they can be avoided.

### 1.4 The differential gate, per template

How many approvals a proposal needs depends on what it changes, per CLAUDE.md Section 10 and SPEC.md 5.5.
This table is a recap, not a new rule:

```
proposal type        creates or changes        approvals required
new-decision         a decision                 both other members (2)
supersede-decision   a decision plus the two    both other members (2)
                       fields on the old one
new-document         a living document          both other members (2)
edit-document        a living document           both other members (2)
note                 a note                      one acknowledgement (1)
library-entry        a library entry             one acknowledgement (1)
```

The reason decisions and documents need both members is that they are the content the record asserts and
stands behind; the reason notes and library entries need one is that they are provisional or external
metadata, and one look keeps the record clean without heavy ceremony.

### 1.5 The record's house style for content

Content written into the record SHOULD be plain, specific, and direct. Name things concretely, prefer a
precise claim to a vague one, define any term a reader might not share, use active voice, and cut filler.
Do not use em dashes; use commas, periods, or restructure. These are conventions for legibility and a
consistent voice across three authors, not arbitrary rules, and the anti-vagueness guidance in Section 10
expands on them.

> Summary: Templates are the contract for each artifact, valid by construction through the form and
> validated on paste, then verified at merge by machine and by humans. Each artifact is frontmatter plus a
> markdown body, every field below is documented by a fixed six-part convention, the approval count depends
> on the type per the differential gate, and record content follows a plain, specific, em-dash-free house
> style.

---

## 2. Which template for which change

Choose the template by what the change does. This tree resolves almost every case; the rest is in the field
docs.

```
recording a new settled conclusion                         -> new-decision
changing a settled conclusion (mind changed)               -> supersede-decision
starting a new living document                             -> new-document
editing an existing living document                        -> edit-document
capturing a provisional thought                            -> note
recording a paper or article as evidence                   -> library-entry
```

A decision is never edited to change its conclusion; that is always a supersede-decision (VERSIONING.md
Section 20). A living document is edited in place; that is edit-document. A note that has matured into a
settled conclusion is not edited into a decision; it graduates, which creates a new-decision proposal and
records the link back on the note (Section 6).

> Summary: Pick the template by intent: new or superseded decision, new or edited document, note, or library
> entry. Decisions are superseded not edited, documents are edited in place, and a matured note graduates
> into a new decision rather than being rewritten into one.

---

## 3. The proposal template

### 3.1 Purpose and when

The proposal is the wrapper for every change. It is the change note a reviewer reads and the record of why
a change was made. It exists so that no change to the record arrives without a stated intent, a rationale,
and the evidence behind it. The proposal becomes the body of the pull request; the content it carries
becomes the decision, document, note, or library entry on merge.

A note on the proposal's form, because it differs from the stored artifacts. The proposal is a pull request
body, which is plain markdown, not a file with a frontmatter block, so its `type`, `target`, `author`, and
`date` are written as labeled lines rather than inside a `---` block; only the stored artifacts (decision,
document, note, library entry) use frontmatter. Sections that do not apply to a given type, Version impact
for anything but edit-document, and Cross-impact for anything but a MAJOR document change or a
supersede-decision, are written as "n/a" rather than deleted, so the structure a reviewer and the parser
read stays the same across every proposal; the in-app form simply hides the sections that do not apply.

### 3.2 Annotated proposal template

```
# {title: a specific problem-and-solution phrase, not a topic}

type: {new-decision | supersede-decision | new-document | edit-document | note | library-entry}
target: {for new-decision: the next decision id, e.g. 0021
         for supersede-decision: the id being superseded, e.g. 0007
         for new-document: the new slug, e.g. reward-design
         for edit-document: the existing slug
         for note: the note id
         for library-entry: the entry id}
author: {your allowlisted GitHub username}
date: {YYYY-MM-DD}

## Summary
{One or two sentences stating plainly what this change does. Intent, not sales.}

## What is changing
{An itemised, concrete list of every change this proposal makes. One line per change.
 A reviewer checks this list against the diff; anything in the diff not listed here is
 grounds to request changes.}

## Why
{The rationale. What problem or gap this addresses, and why now.}

## Definitions
{Define every new or ambiguous term this change introduces or relies on. If none, write "none".}

## Assumptions
{The assumptions this change rests on, so a reviewer can challenge them. If none, write "none".}

## Invariants check
{Name each project invariant this change touches and state how the change stays within it.
 If it touches none, write "touches no invariants". See Section 3.3 for what an invariant is.}

## Sources
{Zero or more source objects (Section 8), each citing evidence with its bearing and weight.
 If none, write "none".}

## Scope
{One of: minor-wording | substantive | full-rewrite. The textual extent of the diff, so a
 reviewer knows what to expect. This is about size, not meaning (see 3.3 on scope vs impact).}

## Version impact
{For edit-document only: exactly one bare keyword, major | minor | patch | editorial, and nothing else in
 this section (VERSIONING.md Section 5). Put any justification in Why, not here; the validate check reads
 the first non-empty line of this section and rejects anything that is not one of those four keywords.
 For new-document: omit (the version is 1.0.0.0 by creation).
 For decisions, notes, library entries: omit (not versioned).}

## Cross-impact
{For a MAJOR document change or a supersede-decision: the ids of every decision or document
 that depended on what is being changed or contradicted, so the team can revisit them.
 Otherwise "none".}

## Pre-mortem
{The single strongest objection to this change, stated honestly, and the condition that would
 show it was wrong. One short paragraph. This is not optional theatre; it is how the record
 stays honest about risk.}

## Out of scope
{What this change deliberately does not do, to prevent scope creep and set the reviewer's frame.}

## Acceptance criteria
{What a reviewer should confirm before approving. The specific, checkable conditions for this change.}

## Content
{The actual artifact this proposal creates or changes: the decision body (Section 4), the
 document body (Section 5), the note body (Section 6), or the library entry (Section 7).
 For edit-document, this is the full new version of the document, from which the diff is computed.}

## Open questions
{Anything you want reviewers to weigh in on. If none, write "none".}
```

### 3.3 Proposal field reference

Title. Purpose: name the change as a problem and its resolution, not a topic, so the list of proposals
reads as a list of decisions. Required: always. Format: a short sentence, sentence case, for example
"Demote food to health-only fuel" rather than "Food changes". Validation: non-empty. Checked by: human.
Common mistake: a vague topic title that hides what was decided.

type. Purpose: select which artifact the proposal creates or changes, which determines the required content,
the version rules, and the approval count. Required: always. Format: exactly one of the six values.
Validation: MUST be one of the six; the content section MUST match the type. Checked by: both; the app
constrains it and the validate check confirms the changed paths match the declared type. Common mistake:
editing a decision's conclusion under edit-document instead of supersede-decision.

target. Purpose: name the exact artifact affected, so the change lands in the right place with the right id
or slug. Required: always. Format: an id, a slug, or "the next id" as appropriate to the type. Validation:
for supersede-decision and edit-document the target MUST already exist; for new-decision the id MUST exceed
every existing decision id (monotonic and unique, never reused or rewound onto; gaps are allowed), written
as a quoted string (VERSIONING.md 20.3); for new-document the slug MUST be unused.
Checked by: both. Notes: allocating a new decision id has the same concurrency race as document versions,
because two open new-decision proposals can both claim 0021. It resolves the same way: the validate check
rejects an id that collides with or does not exceed every existing id, the require-branches-up-to-date
setting forces the second proposal to rebase and pick an id above the new maximum, and the interface warns
when a second new-decision is opened. Common mistake: a new-decision id that reuses or rewinds onto a number,
or two authors racing for the same next id without rebasing; a gap left by an abandoned proposal is fine and
is not backfilled.

author. Purpose: attribute the proposal to the real person, part of the proof-of-work guarantee. Required:
always. Format: an allowlisted GitHub username. Validation: MUST be on the allowlist and MUST match the
authenticated user creating the proposal. Checked by: both. Common mistake: none in the app path, since it
is set from the session; on the paste path, a mismatched name is corrected to the real author.

Summary. Purpose: state plainly what the change does. Required: always. Format: one or two sentences.
Validation: non-empty. Checked by: human. Common mistake: selling the change ("improve the plan") instead
of stating it ("replace the energy section so food never enters fitness").

What is changing. Purpose: the itemised contract the reviewer checks against the diff. Required: always.
Format: a list, one concrete change per line. Validation: non-empty; SHOULD account for everything visible
in the diff. Checked by: human, against the diff; an unlisted change in the diff is grounds to request
changes (SPEC.md 5.7). Common mistake: listing the intent but omitting an incidental edit that then looks
like something slipped in.

Why. Purpose: the rationale, the "why this, why now". Required: always. Format: prose. Validation:
non-empty. Checked by: human. Common mistake: restating what changed instead of why.

Definitions. Purpose: remove ambiguity by defining new or contested terms. Required: always, with "none"
permitted. Format: a short glossary or "none". Validation: non-empty (may be "none"). Checked by: human.
Common mistake: leaving a load-bearing term undefined, so reviewers argue about what it meant.

Assumptions. Purpose: surface what the change depends on so it can be challenged. Required: always, with
"none" permitted. Format: a list or "none". Checked by: human. Common mistake: burying an assumption inside
the rationale where a reviewer will not challenge it.

Invariants check. Purpose: force the author to confirm the change respects the project's fixed constraints.
Required: always. Format: for each touched invariant, a line naming it and how the change stays within it,
or "touches no invariants". Checked by: human. Notes: an invariant is a fixed constraint the record has
committed to and does not casually break, for example, in the research project, that a still prey must not
be made uncatchable by rule. The canonical list of invariants is itself a recorded artifact, a decision or a
section of a living document, that this field references; if no such list exists yet, establishing it is one
of the record's first decisions, because a change cannot be checked against invariants that were never
written down. Changing an invariant at all is a MAJOR document change or a superseding decision, never a
quiet edit. Common mistake: claiming no invariants are touched when one is, or referencing invariants that
were never recorded.

Sources. Purpose: attach the evidence behind the change. Required: always, with "none" permitted. Format:
zero or more source objects (Section 8). Validation: every source `link` MUST resolve to a real library
entry (CLAUDE.md 9.4). Checked by: both; the app picks sources from the library so links resolve, and the
validate check confirms resolution. Notes: for a new-decision or supersede-decision, the authoritative
sources live in the decision's own frontmatter inside Content, and this proposal section need not duplicate
them; it may simply say "see the decision's sources". This section carries its own source objects when the
change is not a decision, for example a document edit that cites evidence but has no decision frontmatter to
hold it. Common mistake: citing a paper not yet in the library, which fails the link check; add the library
entry first.

Scope. Purpose: tell the reviewer the textual extent of the diff so a large diff is expected or a small one
is confirmed small. Required: always. Format: one of minor-wording, substantive, full-rewrite. Checked by:
human, against the visible diff; a scope that plainly contradicts the diff is flagged (SPEC.md 5.7). Notes:
scope is about size, not meaning, and is distinct from version impact, which is about meaning, not size. A
full-rewrite that only reorganizes can be EDITORIAL; a minor-wording change that flips a claim can be MAJOR.
The two axes are declared separately on purpose. Common mistake: conflating scope with impact and declaring
"minor-wording, patch" for a one-word change that actually reverses a conclusion.

Version impact. Purpose: declare the versioning classification for a document edit. Required: only for
edit-document; omitted for new-document and for non-document types. Format: exactly one of major, minor,
patch, editorial, as a bare keyword alone in the section with no other text; put any justification in Why.
The validate check reads the first non-empty line of the section and rejects anything that is not one of
those four keywords. Validation: the resulting `version` frontmatter MUST be the legal successor implied by this
level (VERSIONING.md 6, 13.1); the level and the version MUST agree. Checked by: both; the check enforces
the arithmetic, the reviewer judges whether the level is truthful. Common mistake: declaring a lower level
than the change deserves; the reviewer catches this and requests changes.

Cross-impact. Purpose: name what else may need revisiting when this change invalidates or supersedes prior
content. Required: for a MAJOR document change and for a supersede-decision; "none" otherwise. Format: a
list of decision or document ids. Checked by: human. Notes: this is the mechanism that stops a load-bearing
change from silently orphaning its dependents (VERSIONING.md 5.1.4). Common mistake: a MAJOR change that
lists no cross-impact when dependents clearly exist.

Pre-mortem. Purpose: state the strongest objection and the condition that would prove the change wrong, so
the record is honest about risk. Required: always. Format: one short paragraph. Checked by: human. Notes:
it is deliberately adversarial to the author's own proposal. Common mistake: a hollow pre-mortem that names
a weak objection to look thorough; reviewers should push back on that.

Out of scope. Purpose: bound the change and set the reviewer's frame. Required: always. Format: a short
list or statement. Checked by: human. Common mistake: leaving it blank, which invites scope creep.

Acceptance criteria. Purpose: give reviewers the specific conditions to confirm before approving. Required:
always. Format: a checkable list. Checked by: human. Common mistake: vague criteria a reviewer cannot
actually verify.

Content. Purpose: carry the actual artifact the proposal creates or changes. Required: always. Format: the
body of the declared type. For a new-decision or supersede-decision, the Content is the full new decision
(Section 4); a supersede-decision additionally edits the old decision's two supersede fields, which is listed
in What is changing and shown in the diff, not placed in Content. For an edit-document, the Content is the
full new version of the document including its frontmatter, and the new `version` number lives in that
frontmatter while the impact level is declared separately in the proposal's Version impact section; the two
must agree, and the validate check enforces it (VERSIONING.md 13.1). For a note or library entry, the Content
is that artifact. Validation: MUST match the type's schema (Sections 4 to 7). Checked by: both. Common
mistake: for edit-document, pasting only the changed passage rather than the full new version, which breaks
the diff; always provide the whole new document (SPEC.md 5.7).

Open questions. Purpose: solicit reviewer input on unresolved points. Required: always, with "none"
permitted. Format: a list or "none". Checked by: human.

### 3.4 Bare proposal template

```
# {title}

type: {new-decision | supersede-decision | new-document | edit-document | note | library-entry}
target: {id or slug}
author: {username}
date: {YYYY-MM-DD}

## Summary

## What is changing

## Why

## Definitions

## Assumptions

## Invariants check

## Sources

## Scope

## Version impact

## Cross-impact

## Pre-mortem

## Out of scope

## Acceptance criteria

## Content

## Open questions
```

### 3.5 Worked example: a supersede-decision proposal

```
# Replace the scripted predator with a coevolved predator

type: supersede-decision
target: 0007
author: Dxv-404
date: 2026-07-01

## Summary
Supersede decision 0007, which used a scripted predator, with a coevolved predator whose
perception and policy evolve alongside the prey.

## What is changing
- Add decision 0034, "Use a coevolved predator", status accepted.
- Set decision 0007 status to superseded and superseded_by to 0034.
- 0034 cites Baker 2019 as load-bearing.

## Why
A scripted predator fixes the selection pressure and cannot produce an autocurriculum, which
the emergence claim depends on. A coevolved predator removes that confound.

## Definitions
Coevolved predator: a predator agent whose network weights evolve under its own fitness, not a
hand-written policy.

## Assumptions
Coevolution stays stable on the available hardware for the pilot's generation budget.

## Invariants check
Touches the "predator is not omnipotent" invariant: the coevolved predator retains a stamina
pool, so it cannot capture without limit, preserving the invariant.

## Sources
- cite: "Baker 2019, Emergent tool use from multi-agent autocurricula"
  link: library/baker-2019.md
  type: paper
  bearing: shows competitive coevolution produces open-ended pressure, which this decision relies on
  weight: load-bearing

## Scope
substantive

## Version impact
none

## Cross-impact
0011, 0014 both assumed a scripted predator and should be revisited.

## Pre-mortem
The strongest objection is that coevolution will not stabilize on an 8GB GPU within the budget,
leaving no usable predator. This is shown wrong only if the calibration harness reaches stable
predator fitness within the pilot's generations; if it does not, fall back to the scripted predator.

## Out of scope
Does not change the prey fitness function or the resource model.

## Acceptance criteria
- 0034 is well-formed and cites Baker 2019, which exists in the library.
- 0007 is set to superseded with superseded_by 0034, and nothing else in 0007 changes.
- The cross-impact list names the dependents.

## Content
{the full body of decision 0034, per Section 4}

## Open questions
Should 0011 and 0014 be superseded now or after the calibration harness result?
```

> Summary: The proposal is the change note and rationale for every change, carrying the itemised diff
> contract, the why, definitions, assumptions, the invariants check, sources, the separate scope and version
> -impact declarations, cross-impact, a genuine pre-mortem, out-of-scope, acceptance criteria, and the
> content. Every field is documented with its purpose, requirement, format, validation, who checks it, and
> its common mistake, and a full supersede example shows them filled.

---

## 4. The decision template

### 4.1 Purpose and lineage

A decision records a single settled conclusion and the reasoning and evidence behind it. It is heavyweight,
voted through the full gate, and content-immutable once accepted: a change of mind is a new decision that
supersedes it, never an edit (VERSIONING.md Section 20). The template is a superset of MADR. It keeps
MADR's context, decision drivers, first-class considered options with verdicts, decision outcome, and
consequences, keeps a confirmation step reframed for research as a falsifier, and adds three research
-specific sections, invariants respected, out of scope, and fallback, each explained below.

### 4.2 Annotated decision template

```
---
id: {zero-padded sequential id, e.g. 0034}
title: {specific problem-and-solution phrase}
status: {proposed | accepted | superseded | rejected}
origin: {live | imported}
date: {YYYY-MM-DD accepted, or best estimate if imported}
deciders: {list of allowlisted usernames who decided}
supersedes: {decision id this replaces, or null}
superseded_by: {decision id that replaced this, or null}
relates_to: {list of related decision ids, may be empty}
tags: {list of kebab-case tags}
sources: {list of source objects, Section 8, may be empty}
---

## Decision
{The one-line outcome, the single sentence a card and the graph show. State the conclusion, not the topic.}

## Context and problem
{The situation and the problem being solved, in a few sentences or a short story. What tension forced a
 decision.}

## Decision drivers
{The criteria any acceptable option had to satisfy. These make the decision evaluable: a reader can check
 the chosen option against them.}

## Considered options
{Every option that was genuinely on the table, including the rejected ones, each with a one-line verdict.
 Rejected alternatives are first-class here; recording only the winner discards the analysis.}

## Decision outcome
{The chosen option and why it was chosen, referring to the drivers it satisfies and the forces it resolves.}

## Invariants respected
{The project invariants this decision stays within, and how. If it changes an invariant, say so explicitly,
 because that is a load-bearing change.}

## Out of scope
{What this decision deliberately does not decide, to bound it.}

## Consequences
{Good, because ... ; Cost or risk, because ... ; Follow-ups: ... . State the trade-offs honestly, including
 the costs, not only the benefits.}

## Verification or falsifier
{How the team will confirm the decision was right, or the specific observation that would show it was
 wrong. A decision that cannot be checked or falsified should say so and why.}

## Fallback
{What the team does if this decision does not work out: the retreat position. This keeps a bold decision
 safe to make.}

## References
{Links to the sources in frontmatter, related decisions, and any external material, in prose.}

## Open questions
{What this decision leaves unresolved.}
```

### 4.3 Decision frontmatter reference

id. Purpose: the permanent, unique handle every citation and supersede link points at. Required: always.
Format: a zero-padded fixed-width integer such as 0034, written as a quoted YAML string (id: "0034") so the
padding is preserved, drawn from the single global decision sequence.
Validation: MUST be unique, MUST exceed every existing decision id for a new decision (monotonic; gaps are
allowed), MUST NOT be reused or rewound onto (VERSIONING.md 20.3). Checked by: both. Notes: an id is a
padded identifier for sorting and reference, not an arithmetic version segment; do not confuse the two
(VERSIONING.md 4.1.3). Every reference to an id, in supersedes, superseded_by, and each relates_to entry,
must likewise be a quoted string. Common mistake: reusing or rewinding onto an id, or writing it unquoted so
YAML reads 0007 as the number 7.

title. Purpose: name the decision as a problem and its resolution. Required: always. Format: a short
sentence, sentence case. Checked by: human. Common mistake: a topic instead of a conclusion.

status. Purpose: where the decision sits in its lifecycle. Required: always. Format: one of accepted,
superseded, rejected as a stored value; proposed is a display state only, not a stored value (see notes).
Validation: a new decision's Content is authored with status accepted, because merging through the gate is
what accepts it and the app never edits a file after merge, so there is no legal path from a stored proposed
to accepted; superseded is set only by a superseding proposal; rejected is reached only by a deliberate merge
that records a refusal (SPEC.md 9.3). Checked by: both. Notes: while a decision exists only inside an open
proposal, a reader sees it as "in review", but that state is derived from the open pull request, not from
the file, whose status is already accepted and becomes true on merge. This reconciles the lifecycle: the
stored field is accepted, superseded, or rejected, and proposed names the transient pre-merge display, which
means SPEC.md 4.2's listing of proposed among statuses refers to that display state, not a stored file value.
Common mistake: authoring a new decision with status proposed, which can never legally become accepted, or
hand-setting superseded without the corresponding supersede link.

origin. Purpose: distinguish decisions born in the record from imported ones. Required: always. Format: live
or imported. Checked by: human. Notes: imported decisions carry best-estimate dates and reconstructed
links, never invented history (VERSIONING.md 23). Common mistake: marking an imported decision live, which
implies a real-time provenance it does not have.

date. Purpose: when the decision was accepted, or a best estimate for imported ones. Required: always.
Format: ISO date. Checked by: human. Common mistake: inventing a precise date for an imported decision
whose real date is unknown; use a clearly estimated date.

deciders. Purpose: who made the decision, part of the proof of work. Required: always. Format: a list of
allowlisted usernames. Checked by: human. Notes: a fully gated decision is made by its author and the members
who approve it, which for this three-person team is normally all three; the author lists the expected
deciders at authoring, and reviewers confirm the list reflects who actually decided. Common mistake: listing
only the author when the decision was a joint one.

supersedes. Purpose: link back to the decision this one replaced. Required: present, value may be null.
Format: a decision id or null. Validation: if set, MUST point to a real decision whose superseded_by points
back to this one (CLAUDE.md 9.4). Checked by: check. Common mistake: setting supersedes without setting the
reciprocal superseded_by on the old decision.

superseded_by. Purpose: link forward to the decision that replaced this one. Required: present, value may be
null. Format: a decision id or null. Validation: consistent both ways with the successor's supersedes.
Checked by: check. Notes: setting this field on an accepted decision is the one permitted mutation of an
otherwise immutable decision (VERSIONING.md 20.4). Common mistake: a one-directional link.

relates_to. Purpose: connect decisions that inform each other without a supersede relationship. Required:
present, may be empty. Format: a list of decision ids. Validation: each MUST resolve to a real decision.
Checked by: check. Common mistake: using relates_to for a supersede relationship, which belongs in the
supersede fields.

tags. Purpose: group decisions by theme for filtering and the graph. Required: present, may be empty.
Format: a list of kebab-case tags. Checked by: human. Common mistake: inconsistent tag spellings that
fragment a theme.

sources. Purpose: the evidence behind the decision. Required: present, may be empty. Format: a list of
source objects (Section 8). Validation: every link resolves. Checked by: both. Common mistake: an empty
sources list on a decision that clearly rested on evidence.

### 4.4 Decision body reference

Decision (the one-liner). Purpose: the single sentence shown on cards and graph nodes, the headline
conclusion. Required: always. Format: one sentence stating the conclusion. Checked by: human. Common
mistake: a one-liner that names the topic rather than the conclusion, so the card says nothing.

Context and problem. Purpose: the situation and the tension that forced a decision. Required: always.
Format: a few sentences or a short story. Checked by: human. Common mistake: describing the solution here
instead of the problem.

Decision drivers. Purpose: the criteria any option had to meet, which make the decision evaluable. Required:
always. Format: a list. Checked by: human. Notes: without drivers a reader cannot judge whether the chosen
option was actually the right one. Common mistake: omitting drivers, leaving the choice unjustifiable.

Considered options. Purpose: record the real alternatives, including the rejected ones, each with a verdict.
Required: always. Format: a list of options, each with a one-line verdict, and a fuller pros-and-cons where
the choice was close. Checked by: human. Notes: this is MADR's central contribution; recording only the
winner throws away the analysis a future reader needs. Common mistake: listing only the chosen option.

Decision outcome. Purpose: the choice and its justification against the drivers. Required: always. Format:
"Chosen: X, because ...". Checked by: human. Common mistake: a justification that does not reference the
drivers, so it reads as assertion.

Invariants respected. Purpose: confirm the decision stays within the project's fixed constraints, or flag
that it changes one. Required: always. Format: a list of invariants and how each is respected. Checked by:
human. Common mistake: silence about an invariant the decision actually strains.

Out of scope. Purpose: bound the decision. Required: always. Format: a short statement. Checked by: human.
Common mistake: leaving it blank.

Consequences. Purpose: the honest trade-offs, good and bad and the follow-ups. Required: always. Format:
"Good, because ...", "Cost or risk, because ...", "Follow-ups: ...". Checked by: human. Notes: putting cost
and benefit in the same section, as Nygard did, makes it hard to pretend a choice is free. Common mistake:
listing only benefits.

Verification or falsifier. Purpose: state how the decision is confirmed right or what would show it wrong.
Required: always. Format: a checkable confirmation or a specific falsifying observation. Checked by: human.
Notes: this is MADR's confirmation step adapted to research; a research decision especially benefits from a
named falsifier. Common mistake: an unfalsifiable decision that does not admit it is unfalsifiable.

Fallback. Purpose: the retreat position if the decision fails. Required: always, with "none, this is not
reversible" permitted where true. Format: a short statement. Checked by: human. Notes: a stated fallback is
what makes a bold decision safe to accept. Common mistake: no fallback on a risky, reversible decision.

References. Purpose: point to the sources and related decisions in readable prose. Required: always, with
"none" permitted. Format: prose with links. Checked by: human.

Open questions. Purpose: record what the decision leaves unresolved. Required: always, with "none"
permitted. Format: a list or "none". Checked by: human.

### 4.5 Bare decision template

```
---
id:
title:
status:
origin:
date:
deciders:
supersedes:
superseded_by:
relates_to:
tags:
sources:
---

## Decision

## Context and problem

## Decision drivers

## Considered options

## Decision outcome

## Invariants respected

## Out of scope

## Consequences

## Verification or falsifier

## Fallback

## References

## Open questions
```

### 4.6 Worked example: an accepted decision

```
---
id: "0007"
title: Allow eight-direction movement for the prey
status: accepted
origin: live
date: 2026-06-30
deciders: [Dxv-404, PLACEHOLDER_2, PLACEHOLDER_3]
supersedes: null
superseded_by: null
relates_to: ["0004"]
tags: [action-space, prey]
sources:
  - cite: "Baker 2019, Emergent tool use from multi-agent autocurricula"
    link: library/baker-2019.md
    type: paper
    bearing: emergence through competition supports a richer action space
    weight: load-bearing
---

## Decision
Give the prey eight-direction movement rather than four.

## Context and problem
The prey previously moved in four directions. Escape trajectories from a pursuing predator were
unnaturally constrained, which risked making evasion an artifact of the action space rather than
of learned behavior.

## Decision drivers
- The action space must not bias the emergence result by making evasion trivially easy or hard.
- Motor primitives are legitimate only if their payoff is evolved, not hardcoded.

## Considered options
- Four-direction movement. Verdict: rejected, constrains evasion unnaturally.
- Eight-direction movement. Verdict: chosen, natural evasion without hardcoding an outcome.
- Continuous heading. Verdict: rejected for the pilot, too costly on the hardware.

## Decision outcome
Chosen: eight-direction movement, because it removes an artificial constraint on evasion while
keeping the payoff of any movement evolved rather than designed, satisfying both drivers.

## Invariants respected
Respects "a still prey must not be made uncatchable by rule": adding directions changes movement,
not the capture rule, so stillness confers no hardcoded immunity.

## Out of scope
Does not change movement speed, stamina, or the capture mechanic.

## Consequences
Good, because evasion becomes a learned behavior over a fair action space.
Cost or risk, because a larger action space slightly slows learning.
Follow-ups: watch that the predator's action space stays comparable.

## Verification or falsifier
Falsified if evasion success is unchanged from the four-direction baseline, which would show the
action space was not the constraint.

## Fallback
Revert to four-direction movement if the eight-direction space destabilizes learning.

## References
Baker 2019 (library/baker-2019.md); relates to 0004 on the base movement model.

## Open questions
Whether diagonal moves should cost more energy than cardinal moves.
```

> Summary: The decision template is a documented superset of MADR, keeping context, drivers, first-class
> options with verdicts, outcome, and honest consequences, adding a research falsifier, invariants
> respected, out-of-scope, and a fallback. Every frontmatter field and body section is documented with
> purpose, requirement, format, validation, checker, and common mistake, and a full accepted decision shows
> them filled.

---

## 5. The living-document template

### 5.1 Purpose

A living document is a long-lived document edited in place through diffs, carrying its own four-segment
version, unlike a decision, which is atomic and superseded. The design plan is the archetype. The template
is deliberately light on required structure, because a document's shape is its own, but it fixes the
frontmatter and a few conventions that the version history, the diff, and the provenance rail depend on.

### 5.2 Annotated living-document template

```
---
slug: {stable kebab-case identity, e.g. reward-design}
title: {human title}
version: {four-segment version; 1.0.0.0 at creation, then set by each edit per VERSIONING.md}
updated: {YYYY-MM-DD of the last accepted change}
tags: {list of kebab-case tags}
---

# {title}

{Long-form prose, in the reading serif when rendered. Structure the body with clear ## headings,
 because the diff's section navigation and the provenance context depend on headings to locate a
 change. Keep each section coherent so a small edit shows as a small, well-located diff.}
```

### 5.3 Living-document field reference

slug. Purpose: the document's stable identity that citations point at. Required: always. Format: kebab-case,
stable. Validation: unique; SHOULD NOT change (VERSIONING.md 19). Checked by: both. Common mistake: changing
a slug casually, risking dangling citations.

title. Purpose: the human-readable name. Required: always. Format: a short phrase. Checked by: human.

version. Purpose: the four-segment version of the document. Required: always. Format: MAJOR.MINOR.PATCH
.EDITORIAL, no leading zeroes (VERSIONING.md 4). Validation: 1.0.0.0 at creation; each later edit sets the
legal successor implied by the declared impact, verified at merge (VERSIONING.md 13, 14). Checked by: both.
Common mistake: hand-setting a version that is not a legal successor of the base.

updated. Purpose: the date of the last accepted change. Required: always. Format: ISO date. Checked by:
human. Notes: this field and version are the mechanical record of a bump and never classify themselves
(VERSIONING.md 12.1). Common mistake: forgetting to advance it on an edit.

tags. Purpose: grouping and filtering. Required: present, may be empty. Format: kebab-case list. Checked by:
human.

### 5.4 Bare living-document template

```
---
slug:
title:
version: 1.0.0.0
updated:
tags:
---

# {title}

{body, structured with ## headings}
```

### 5.5 Convention for long documents

A living document SHOULD use clear, stable `##` headings, because the diff viewer builds its section
navigation from them and a reader locating a change relies on them (SPEC.md 5.7). Keeping headings stable
across edits means a change inside one section shows as a change to that section, not as a shift of
everything below it. This is a convention, not a validated rule, but it is what makes a two-thousand-line
document reviewable.

> Summary: A living document is frontmatter, slug, title, four-segment version, updated date, and tags, plus
> free prose that should be organized under stable headings so the diff and the reader can locate changes.
> The version starts at 1.0.0.0 and advances by the legal successor per VERSIONING.md, and each field is
> documented with its rules.

---

## 6. The note template

### 6.1 Purpose

A note captures a provisional thought without ceremony. It asserts nothing the record stands behind, is not
versioned, and takes the light gate of one acknowledgement. When a note matures into a settled conclusion it
graduates into a decision rather than being edited into one, and the note records the link forward.

### 6.2 Annotated note template

```
---
id: {date-prefixed slug, e.g. 2026-06-30-energy-thought}
date: {YYYY-MM-DD}
author: {allowlisted username}
tags: {list, may be empty}
graduated_to: {decision id, set only once this note becomes a decision; otherwise null}
---

{Free prose. Whatever the thought is, in whatever shape it wants. No required structure.}
```

### 6.3 Note field reference

id. Purpose: a stable, sortable handle for the note. Required: always. Format: a date-prefixed slug.
Validation: unique. Checked by: both. Common mistake: a non-date-prefixed id that does not sort
chronologically.

date. Purpose: when the thought was captured. Required: always. Format: ISO date. Checked by: human.

author. Purpose: attribution. Required: always. Format: allowlisted username matching the creator. Checked
by: both.

tags. Purpose: grouping. Required: present, may be empty. Format: kebab-case list. Checked by: human.

graduated_to. Purpose: link a note forward to the decision it became, preserving the path from thought to
decision. Required: present, value null until graduation. Format: a decision id or null. Validation: if set,
MUST resolve to a real decision. Checked by: check. Common mistake: editing a note's substance instead of
graduating it; a note that has become a conclusion graduates and gains this link.

### 6.4 Bare note template

```
---
id:
date:
author:
tags:
graduated_to: null
---

{free prose}
```

> Summary: A note is a date-prefixed id, date, author, tags, and an optional graduated_to link, over free
> prose with no required structure. It is unversioned, takes the one-acknowledgement gate, and graduates
> into a decision rather than being rewritten into one, with each field documented.

---

## 7. The library-entry template

### 7.1 Purpose

A library entry records a paper or article as evidence and links two ways to the decisions that cite it. Its
truth lives in the external source, so it is not versioned; correcting a field is metadata maintenance, not
a change to a claim the record makes. Most of its fields are fetched once at add time and then stored, so
the entry renders instantly forever after (SPEC.md 5.8).

### 7.2 Annotated library-entry template

```
---
id: {slug, e.g. baker-2019}
title: {full title}
authors: {list of author names}
year: {integer}
source: {arXiv, a journal, a site}
url: {canonical link}
doi: {DOI or null}
abstract: {the abstract if the source provided one, else null; never fabricated}
tags: {list of kebab-case tags}
added_by: {allowlisted username}
added: {YYYY-MM-DD}
---
```

A library entry is frontmatter only; it has no prose body, because it is a citation record, not a document.

### 7.3 Library-entry field reference

id. Purpose: the stable handle a source object's `link` points at. Required: always. Format: a slug,
commonly authoryear. Validation: unique. Checked by: both. Common mistake: an id that collides with another
entry by the same author and year; disambiguate with a letter.

title. Purpose: the work's title. Required: always. Format: text. Checked by: human. Common mistake: a
truncated title from a bad fetch; confirm it.

authors. Purpose: the authors. Required: always. Format: a list of names. Checked by: human.

year. Purpose: the publication year. Required: always. Format: an integer. Checked by: human.

source. Purpose: where it was published. Required: always. Format: text such as arXiv or a journal name.
Checked by: human.

url. Purpose: the canonical link to the original. Required: always. Format: an http or https URL.
Validation: a well-formed URL. Checked by: both. Common mistake: a link to a search result page rather than
the work.

doi. Purpose: the DOI where one exists. Required: present, may be null. Format: a DOI or null. Checked by:
human.

abstract. Purpose: the abstract, shown on the detail view when present. Required: present, may be null.
Format: text or null. Validation: MUST be the source's real abstract or null; never fabricated (SPEC.md
5.8). Checked by: human. Common mistake: writing a summary in place of a missing abstract; leave it null.

tags. Purpose: grouping and filtering. Required: present, may be empty. Format: kebab-case list. Checked by:
human.

added_by. Purpose: who added the entry. Required: always. Format: allowlisted username. Checked by: both.

added. Purpose: when it was added. Required: always. Format: ISO date. Checked by: human.

### 7.4 Bare library-entry template

```
---
id:
title:
authors:
year:
source:
url:
doi: null
abstract: null
tags:
added_by:
added:
---
```

### 7.5 Worked examples

A rich arXiv entry:

```
---
id: baker-2019
title: "Emergent tool use from multi-agent autocurricula"
authors: ["Bowen Baker", "Ingmar Kanitscheider", "Todd Markov", "et al."]
year: 2019
source: arXiv
url: https://arxiv.org/abs/1909.07528
doi: null
abstract: "We demonstrate that agents can develop increasingly complex tool use ..."
tags: [multi-agent, emergence, autocurriculum]
added_by: Dxv-404
added: 2026-07-01
---
```

A sparse entry from a page that exposed little:

```
---
id: smith-blog-2024
title: "Notes on predator-prey stability"
authors: ["A. Smith"]
year: 2024
source: personal blog
url: https://example.com/predator-prey-stability
doi: null
abstract: null
tags: [predator-prey]
added_by: Dxv-404
added: 2026-07-01
---
```

> Summary: A library entry is frontmatter-only citation metadata, mostly fetched once and stored, linking
> two ways to citing decisions and never versioned. Every field is documented, the abstract is the source's
> real one or null and never fabricated, and worked examples show both a rich arXiv entry and a sparse page.

---

## 8. The source object

### 8.1 Purpose

The source object is the shared unit of citation, used in a proposal's Sources and a decision's `sources`
frontmatter. It is designed so a citation carries not just a link but the bearing the evidence has on the
claim and how much weight it takes, so a reader knows why a source is cited and how much it mattered.

### 8.2 Annotated source object

```
- cite: {"Author year, title" as a readable citation}
  link: {library/<entry>.md, pointing at a real library entry}
  type: {paper | article | video | dataset | idea}
  bearing: {one sentence on how this source supports or constrains the claim}
  weight: {load-bearing | consulted | background}
```

### 8.3 Source object field reference

cite. Purpose: the human-readable citation. Required: always. Format: a short "Author year, title" string.
Checked by: human. Common mistake: a bare URL instead of a readable citation.

link. Purpose: point at the library entry that holds the full metadata. Required: always. Format: a path to
a real file under library/. Validation: MUST resolve to an existing library entry (CLAUDE.md 9.4). Checked
by: check. Common mistake: citing a paper not yet in the library; add the entry first, or the link check
fails.

type. Purpose: what kind of source it is. Required: always. Format: one of paper, article, video, dataset,
idea. Checked by: human. Notes: idea covers an uncited intellectual influence with no external artifact,
recorded honestly rather than dressed up as a paper. Common mistake: mislabeling an informal idea as a
paper.

bearing. Purpose: state in one sentence how the source supports or constrains the claim, so a citation is
not a bare name-drop. Required: always. Format: one sentence. Checked by: human. Common mistake: a bearing
that restates the title instead of stating the source's relevance to this claim.

weight. Purpose: declare how much the claim depends on this source. Required: always. Format: one of
load-bearing, consulted, background. Validation: a claim whose only support is a single source MUST mark it
load-bearing, so the dependency is visible. Checked by: human. Notes: load-bearing means the claim falls
without it; consulted means it informed the claim; background means general context. Common mistake: marking
everything load-bearing, which drains the signal.

> Summary: The source object is the shared citation unit carrying a readable cite, a link that must resolve
> to a real library entry, a type including an honest idea category, a one-sentence bearing on the claim,
> and a weight from load-bearing to background. Each field is documented so a citation states why it is cited
> and how much it matters, not just that it exists.

---

## 9. Validation and enforcement

Each template is enforced at two levels, exactly as VERSIONING.md 13 describes for versions, generalized to
all fields.

9.1 Mechanical, by the validate check. The check enforces everything decidable without judgment: required
fields are present and well-formed; ids are unique and, for new decisions, sequential; status values are in
range; every supersede, relates_to, and source link resolves and supersede links are consistent both ways;
document versions are legal successors consistent with the declared impact; and the changed paths match the
declared proposal type. A proposal that fails any of these cannot merge, because the check is required and
admin bypass is disabled (CLAUDE.md Section 10).

9.2 Judgment, by the reviewers. The reviewers enforce everything the machine cannot: that the title is a
real conclusion, that the itemised change list matches the diff, that the declared impact and scope are
truthful, that drivers justify the outcome, that consequences are honest, that the pre-mortem is real, and
that the content is correct. This is why decisions and documents require both other members.

9.3 The boundary. A green check means the artifact is well-formed and its links and version arithmetic are
consistent; it never means the content is true or the classification correct. Only human approval attests to
that. Neither level substitutes for the other.

> Summary: Templates are enforced mechanically by the validate check for presence, form, id and link
> integrity, and version arithmetic, and by human reviewers for truth, honesty, and correctness, with a
> green check attesting consistency only and human approval attesting truth.

---

## 10. Authoring guidance

These are the record's conventions for writing content that stays legible and honest across three authors.

Be specific, not vague. "Replace the energy section so food never enters fitness" beats "improve the
rewards". A reviewer can check the first and cannot check the second.

Define terms. If a word carries weight and a reader might not share its meaning, define it in the proposal's
Definitions, so review argues about substance, not vocabulary.

State the conclusion, not the topic. Titles and one-liners say what was decided, so a list of decisions
reads as a list of conclusions.

Be honest about cost and risk. Fill Consequences and the pre-mortem with the real trade-off and the real
objection. A proposal that hides its cost invites a worse surprise later.

Prefer active voice and plain verbs. Say what a change does. Cut filler.

Do not use em dashes. Use commas, periods, or restructure. This keeps a consistent voice and matches the
project's house style.

Never fabricate. No invented abstract, no invented date, no invented citation. A missing value is left null
or estimated and labelled, never filled with something that looks real (SPEC.md and VERSIONING.md 23.2).

> Summary: Write specifically and define terms, state conclusions not topics, be honest about cost and risk,
> prefer plain active voice, avoid em dashes, and never fabricate a value; a missing one is left null or
> clearly estimated.

---

## 11. The offline authoring and handoff workflow

A person may fill a template outside the application, often with the help of their own assistant, and paste
it in. This section defines that path so it stays safe.

11.1 Filling. The author copies the bare template for the artifact and fills every field per the field
reference, or instructs their assistant to. An assistant used this way MUST fill the template faithfully,
MUST NOT invent sources, dates, or abstracts, and MUST leave unknown values null or clearly estimated rather
than fabricating them. The house style of Section 10 applies to the content regardless of who typed it.

11.2 Pasting. The author pastes the filled markdown into the application, which parses it back into the same
fields and shows them for review before anything is submitted. Parsing is the checkpoint: a malformed or
incomplete paste is surfaced here, at its field, not silently accepted.

11.3 Verifying before submit. Before submitting, the author confirms that the author field is their real
username, that every cited source exists in the library or is added first, that the declared type, scope,
and version impact match what the content actually does, and that no field was filled with a fabricated
value. The application's validation catches form errors; the author catches truth errors, because only they
know what they meant.

11.4 After submit. From here the artifact is an ordinary proposal: it goes through the differential gate,
the validate check runs, and reviewers judge it. The offline path changes only how the fields were filled,
never how the change is reviewed or merged.

> Summary: A template may be filled offline, by hand or with an assistant that must fill it faithfully and
> never fabricate, then pasted into the app, which parses it to fields and surfaces errors at the field. The
> author verifies their identity, real sources, and truthful declarations before submitting, after which it
> is an ordinary gated proposal.

---

## 12. Common mistakes, consolidated

The mistakes most likely to cost a review round, gathered from the field references above:

- Editing a decision's conclusion under edit-document instead of writing a supersede-decision.
- A new-decision id that reuses or rewinds onto a number, where a gap from an abandoned proposal is fine, or
  writing an id or a reference unquoted so YAML drops its zero-padding, or setting superseded on a decision
  without the reciprocal link, all of which fail referential integrity.
- Citing a source whose library entry does not exist yet, which fails the link check; add the entry first.
- For edit-document, pasting only the changed passage instead of the full new version, which breaks the diff.
- Declaring a scope or version impact that the visible diff contradicts, for example "minor-wording, patch"
  for a one-word change that reverses a conclusion.
- A vague title or one-liner that names a topic instead of a conclusion.
- An empty sources list, or a hollow pre-mortem, on a change that clearly needed both.
- Fabricating a missing abstract, date, or citation instead of leaving it null or clearly estimated.
- A MAJOR document change or a supersede with no cross-impact when dependents plainly exist.

> Summary: The costly mistakes are editing instead of superseding, broken ids and links, citing sources not
> yet in the library, pasting partial document edits, mismatched scope or impact declarations, topic-only
> titles, hollow evidence or pre-mortems, fabricated values, and missing cross-impact on load-bearing
> changes.

---

## 13. Quick reference

Required proposal fields are always all of them, with "none" written where a field does not apply, except
that Version impact is present only for edit-document and Cross-impact is required only for a MAJOR document
change or a supersede-decision. The content section carries the artifact of the declared type.

```
type                content is        versioned?   approvals   version impact?
new-decision        a decision        no (chain)   2           no
supersede-decision  a decision +      no (chain)   2           no
                    old-decision link
new-document        a document        yes, 1.0.0.0 2           no (creation)
edit-document       a document        yes          2           yes
note                a note            no           1           no
library-entry       an entry          no           1           no
```

Per-artifact required parts: a decision needs its full frontmatter and all body sections (Section 4); a
document needs its frontmatter and a body under stable headings (Section 5); a note needs its frontmatter and
prose (Section 6); a library entry needs its full frontmatter and no body (Section 7); every citation
anywhere is a full source object (Section 8).

> Summary: A one-screen reference giving, per proposal type, what the content is, whether it is versioned,
> how many approvals it needs, and whether it declares a version impact, plus the required parts of each
> artifact and the pointer to its full field documentation.
