# VERSIONING

The authoritative versioning rule for the research decision record. This document lives in the record
repository and governs how living documents are versioned, how decisions are versioned by their supersede
chain, how the record as a whole is counted, and how every one of these is declared, verified, ordered,
and made permanent. It is written to be exhaustive on purpose: every rule states what it requires and why
it requires it, so that a person or a machine classifying a change has a defined answer and no room for
doubt. Where a genuine judgment remains, this document says so explicitly and routes it to a defined
process rather than leaving it unstated.

This document is modeled on the rigor of Semantic Versioning 2.0.0 and PEP 440 and deliberately diverges
from them where a prose research record differs from a software package. Section 26 states the
relationship and every divergence with its reason. The scheme here is not SemVer; it is a four-segment
document-versioning scheme designed for this record, and it must not be assumed to behave like SemVer
merely because it shares three of its segment names.

Status: normative. Changes to this document are themselves governed changes (Section 25).

---

## 1. Scope and purpose

### 1.1 What this document governs

This document governs three distinct things, which are related but must never be conflated:

1. The version of a living document, a four-segment number defined in Sections 4 through 19.
2. The versioning of a decision, which carries no version number and is versioned only by its supersede
   chain, defined in Section 20.
3. The record revision, a single monotonic count of accepted changes to the whole record, defined in
   Section 21.

It also governs what is deliberately not versioned, notes and library entries, in Section 22, and why.

### 1.2 Why versioning exists here

The record exists to fight recency bias and to be durable proof of work. Versioning serves both. A version
number on a living document lets a reader see, at a glance, whether the document changed in a way that
would make an old understanding wrong, merely added something, only clarified, or did not change meaning
at all. A decision's supersede chain lets a reader see how a settled conclusion was later overturned. The
record revision lets a reader cite the exact depth of the record they are looking at. Without these, the
record would show only a current state and would hide the shape of its own history, which is the one thing
it is built to reveal.

### 1.3 The reader this is written for

Two readers. A human classifying a change while writing a proposal, who needs a defined test for which
segment to increment. And the automated validate check, which needs rules precise enough to enforce
mechanically. Every rule below is written to serve both, and Section 13 draws the exact line between what
the machine decides and what a human must decide.

> Summary: This document governs living-document versions, decision supersede chains, and the record
> revision, and states what is not versioned and why. Versioning exists to make the shape of the record's
> history legible. Every rule is written for both a human classifier and the automated validate check, with
> the boundary between machine and human judgment drawn explicitly.

---

## 2. Normative language

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and
OPTIONAL in this document are to be interpreted as described in RFC 2119. A rule stated with MUST is a hard
requirement that the validate check enforces or that a reviewer MUST reject a proposal for violating. A
rule stated with SHOULD is a strong default that MAY be departed from only with a recorded reason. A rule
stated with MAY is a genuine option with no default preference.

> Summary: MUST is enforced and non-negotiable, SHOULD is a default departed from only with a recorded
> reason, and MAY is a free option, per RFC 2119.

---

## 3. What is versioned, at a glance

```
subject            versioned by                      number?    resets?   Section
living document    four-segment version              yes        yes       4-19
decision           supersede chain (links)           no         n/a       20
record (whole)     record revision (monotonic count) yes        never     21
note               nothing                            no         n/a       22
library entry      nothing                            no         n/a       22
```

The reason a decision carries no number while a document does is in Section 20.2. The reason notes and
library entries carry nothing is in Section 22.2.

> Summary: Only living documents carry the four-segment version, and only the whole record carries the
> monotonic revision count. Decisions are versioned by their supersede chain and carry no number. Notes and
> library entries are not versioned at all, for reasons given where each is defined.

---

## 4. The living-document version: form

### 4.1 The form

4.1.1 A living-document version MUST take the form `MAJOR.MINOR.PATCH.EDITORIAL`, four non-negative
integers separated by three dots.

4.1.2 Each of the four segments MUST NOT contain leading zeroes. `1.0.0.0` is valid; `1.00.0.0` and
`01.0.0.0` are not. The reason is the same as SemVer's: a version segment is a number, not a fixed-width
field, and leading zeroes invite the misreading that it is padded or that `1.02` sorts near `1.20`.

4.1.3 Version segments MUST NOT be confused with decision ids. A decision id such as `0007` is a
zero-padded, fixed-width identifier used for sorting and stable reference, and is not a number that
increments arithmetically. A version segment is a plain integer that increments arithmetically and is
never zero-padded. The two look superficially similar and are governed by opposite rules; do not apply one
document's rule to the other.

4.1.4 Each segment MUST increase by exactly one when it is the segment being incremented, and MUST reset to
zero when a higher segment is incremented (Section 6). No segment ever increases by more than one in a
single accepted change, and no segment is ever set to an arbitrary value.

### 4.2 What the four segments mean, in one line each

- MAJOR: a change after which a reader of the previous version would now be wrong about something
  load-bearing.
- MINOR: a change that adds something genuinely new without making anything already present wrong.
- PATCH: a change that corrects, clarifies, or tightens existing content without adding a new mechanic and
  without making anything wrong.
- EDITORIAL: a change that does not alter meaning at all.

Each is defined normatively, with its test and its reason, in Section 5.

> Summary: A document version is four non-negative integers, MAJOR.MINOR.PATCH.EDITORIAL, no leading
> zeroes, each incrementing by exactly one and resetting on a higher bump. Version segments are arithmetic
> numbers and MUST NOT be confused with zero-padded decision ids.

---

## 5. The four segments, defined normatively

Each subsection gives the normative rule, the decisive test to apply, the reason the segment exists, and
worked examples drawn from this project's real subject so the boundaries are concrete.

### 5.1 MAJOR

5.1.1 Rule. The MAJOR segment MUST be incremented when a change replaces, removes, or contradicts content
that the document previously asserted, or when it changes the document's frame, a defined contract, or a
stated invariant.

5.1.2 Test. Ask: would a person who had read and relied on the previous version now be wrong about
something load-bearing? If yes, it is MAJOR. The emphasis is on load-bearing: the change must invalidate
something a reader could have acted on, not merely alter a detail.

5.1.3 Reason. MAJOR is the record's strongest signal. It exists so that a reader scanning version history
can find, without reading every diff, the exact points where the team's committed understanding changed
out from under whatever came before. Because that signal is precious, it MUST NOT be spent on additions or
clarifications that break nothing.

5.1.4 Consequence. A MAJOR change MUST trigger a cross-impact review: the proposal MUST name, by id, every
decision or document that depended on the content being replaced or contradicted, so the team can see what
else may now need revisiting. This is required because a load-bearing change that silently orphans its
dependents is the precise failure the record exists to prevent.

5.1.5 Examples. Replacing a scripted predator with a coevolved one, which contradicts the previous design's
central claim, is MAJOR. Removing an entire section whose conclusion the document previously asserted is
MAJOR. Redefining what counts as the fitness signal, a defined contract, is MAJOR.

### 5.2 MINOR

5.2.1 Rule. The MINOR segment MUST be incremented when a change adds genuinely new content and nothing
already present in the document becomes wrong, contradicted, or removed.

5.2.2 Test. Ask: is there something in the document now that was not there before, and is everything that
was there before still true and still present? If both, it is MINOR.

5.2.3 Reason. MINOR marks growth that a reader can absorb without unlearning anything. It is safe to skip
for a reader who only cares that nothing they relied on changed, which is exactly the guarantee a reader
wants from a version whose MAJOR did not move.

5.2.4 Examples. Adding a health system alongside the existing energy system, where energy is unchanged, is
MINOR. Adding a new considered option to a document that previously listed three, without changing the
verdicts on the original three, is MINOR.

### 5.3 PATCH

5.3.1 Rule. The PATCH segment MUST be incremented when a change corrects, clarifies, or tightens existing
content, introduces no new mechanic, and makes nothing previously true become false.

5.3.2 Test. Ask: is the meaning of the document more correct or more precise than before, while nothing new
was added and nothing that was true became false? If so, it is PATCH.

5.3.3 Reason. PATCH marks improvement in fidelity without change in substance or scope. It is separated
from EDITORIAL because a change to precision, even a small one, can matter to a careful reader, whereas a
change that does not touch meaning at all cannot; conflating the two would hide real corrections inside
cosmetic noise.

5.3.4 The PATCH-versus-MAJOR boundary. The dividing question is whether the correction changes what a
reader would now believe. Tightening a loose sentence so it says more precisely what the document already
meant is PATCH. Correcting a sentence so it now says something different from what a reader would have
concluded is MAJOR, because the old reader is now wrong. When in doubt between the two, apply Section 8 and
Section 13.2.

5.3.5 Examples. Refining the reward description so it says food fuels health only and never enters fitness,
which sharpens what the document already intended without adding a mechanic, is PATCH; this is the
canonical PATCH precedent recorded in Section 24. Correcting a mis-stated perception rule so it matches the
intended behavior, without introducing a new behavior, is PATCH.

### 5.4 EDITORIAL

5.4.1 Rule. The EDITORIAL segment MUST be incremented when, and only when, the change does not alter the
meaning of the document in any way.

5.4.2 Test. Ask: is the document's meaning identical before and after, such that any two careful readers
would agree nothing they could act on has changed? If so, it is EDITORIAL. If precision shifts at all, it
is at least PATCH.

5.4.3 Reason. EDITORIAL exists so that necessary prose hygiene, fixing a typo, repairing a broken link,
reformatting, neutral rewording, does not inflate the PATCH count and does not masquerade as a substantive
correction. Without a segment reserved for meaning-preserving change, every typo fix would look like a
correction, and the PATCH signal would lose its meaning. This is the single most important reason the
scheme has four segments rather than three, and it is stated in full in Section 26.2.

5.4.4 Examples. Fixing a spelling error, repairing a dead citation link that still points to the same
source, reflowing a paragraph, or replacing a word with an exact synonym is EDITORIAL. Rewording a sentence
so it reads more clearly but also more precisely is not EDITORIAL; it is PATCH, because precision moved.

> Summary: MAJOR is a change that makes an old reader wrong about something load-bearing and forces a
> cross-impact review; MINOR adds something new while breaking nothing; PATCH corrects, clarifies, or
> tightens without adding a mechanic or breaking anything; EDITORIAL changes no meaning at all and exists so
> prose hygiene does not pollute the PATCH signal. Each has a decisive test and a stated reason.

---

## 6. Increment and reset rules

6.1 When a segment is incremented, every segment to its right MUST be reset to zero in the same change.
Specifically: incrementing MAJOR resets MINOR, PATCH, and EDITORIAL to zero; incrementing MINOR resets
PATCH and EDITORIAL to zero; incrementing PATCH resets EDITORIAL to zero; incrementing EDITORIAL resets
nothing.

6.2 The reason is identical to SemVer's reason for resetting: a lower segment counts changes within the
scope defined by the segments above it, so when a higher scope changes, the lower counters start over. A
PATCH count of 7 under MINOR 2 means seven clarifications since the second addition; if a MAJOR change then
lands, those seven clarifications belong to a superseded understanding and their count MUST NOT carry
forward, or the number would imply continuity that no longer exists.

6.3 Worked reset examples:

```
before        change kind   after
1.4.2.3       EDITORIAL     1.4.2.4
1.4.2.3       PATCH         1.4.3.0
1.4.2.3       MINOR         1.5.0.0
1.4.2.3       MAJOR         2.0.0.0
```

6.4 A single accepted change MUST increment exactly one segment, the highest that the change qualifies for
(Section 8), and MUST perform the resets required by 6.1. A change MUST NOT increment two segments at once,
and MUST NOT skip a value.

> Summary: Incrementing a segment resets every segment to its right to zero, because a lower segment counts
> changes within the scope of the segments above it and that count is meaningless once the higher scope
> changes. Each accepted change bumps exactly one segment, the highest it qualifies for, and applies the
> resets.

---

## 7. Initialization

7.1 The first accepted version of a living document MUST be `1.0.0.0`. The document does not exist in the
record until its creating proposal merges, and its first merged state is version one. A creating proposal
sets the version to `1.0.0.0` directly and declares no `version_impact`, because impact classifies a change
to existing content and there is no prior content to change; the four impact levels apply only from the
second accepted version onward. Creating a living document is a distinct proposal type from editing one, and
the authoring flow MUST offer it; a record that can only edit documents it cannot create is incomplete, and
this requirement is called out here so the surrounding product spec provides the create path.

7.2 There is no `0.x.y.z` development phase. SemVer reserves `0.x` for an unstable pre-public phase, but a
living document has no pre-public phase in this record: it does not appear at all until it is accepted
through the gate, and once accepted it is part of the record and real. Reserving a zero major would create
a state, "present but not yet real," that the record does not have. This is a deliberate divergence from
SemVer, recorded in Section 26.3.

7.3 An imported document (Section 23) MUST also enter at `1.0.0.0`, marked as imported, because
reconstructing a synthetic internal version history for content that predates the record would be
invention, and the record never presents invented values.

> Summary: A living document's first accepted version is 1.0.0.0, there is no 0.x development phase because
> a document is not in the record until accepted, and imported documents also enter at 1.0.0.0 rather than
> carrying an invented prior history.

---

## 8. The highest-qualifying-segment rule

8.1 A change frequently satisfies the description of more than one segment at once, for example a change
that both adds a new section and corrects an existing one. When this happens, the change MUST be classified
at the highest segment any part of it qualifies for, and that segment alone is incremented.

8.2 The order of height, from highest to lowest, is MAJOR, then MINOR, then PATCH, then EDITORIAL. A change
that contradicts old content and also fixes a typo is MAJOR. A change that adds a new section and also
tightens an old sentence is MINOR. A change that tightens a sentence and also fixes a typo is PATCH.

8.3 The reason is that the version number communicates the strongest thing that happened, because that is
what a reader most needs to know. A reader who is told only that a change was MINOR has been correctly
assured that nothing they relied on broke, even if the same change also fixed a typo; telling them
EDITORIAL as well would either require two bumps, which 6.4 forbids, or would understate the change.

8.4 A corollary: because only the highest segment moves, a single accepted change never records its
lower-segment contents in the version number. If it is important that a MINOR change also corrected
something, that belongs in the change note (Section 12), not in the version number, which carries only the
headline.

> Summary: A change that qualifies for several segments is classified at the highest, and only that segment
> increments, because the version must communicate the strongest thing that happened. Anything lower that
> the same change also did is recorded in the change note, not the number.

---

## 9. Precedence and ordering

9.1 To order two document versions, compare MAJOR, then MINOR, then PATCH, then EDITORIAL, each as an
integer, left to right, stopping at the first segment that differs. The version with the larger value at
that segment is the later version.

9.2 Examples, ascending:

```
1.0.0.0 < 1.0.0.1 < 1.0.1.0 < 1.0.2.0 < 1.1.0.0 < 2.0.0.0 < 2.0.0.1 < 10.0.0.0
```

9.3 Segments are compared numerically, never lexically. `1.0.10.0` is later than `1.0.9.0`, because ten is
greater than nine, even though the string "10" sorts before "9" alphabetically. This is why leading zeroes
are forbidden (4.1.2) and why history views MUST sort by numeric comparison of segments, not by string
comparison of the version.

9.4 There are no pre-release or build-metadata suffixes to complicate precedence (Section 26.4), so
document-version ordering is total and unambiguous: any two distinct versions of the same document have a
definite order. Two versions are equal only when all four segments are equal; because versions are monotonic
and never repeat within a document (Section 10.2), two distinct accepted versions of the same document are
never equal, and equality across different documents is not meaningful because each document versions
independently.

> Summary: Versions order by left-to-right numeric comparison of the four segments, stopping at the first
> difference, always numerically and never lexically, which is why leading zeroes are banned. With no
> suffixes, ordering is total and unambiguous.

---

## 10. Immutability and monotonicity

10.1 Immutability. Once a proposal that sets a document to a given version has merged, that version's
content MUST NOT be modified. Any later change, however small, MUST be a new accepted change that produces a
new, higher version. This mirrors SemVer's rule that a released version's contents are frozen, and it
exists so that a citation of a version always refers to exactly one fixed state.

10.2 Monotonicity. A document's version MUST only ever increase in the ordering of Section 9. A later
accepted change MUST produce a version strictly greater than the document's current version. A version MUST
NOT decrease, MUST NOT repeat a value the document has held before, and MUST NOT be skipped or set by hand
to an arbitrary value.

10.3 The reason for monotonicity is that the version doubles as a timeline: because it only ever rises,
the ordering of versions is the chronological order of accepted changes to that document, and a reader can
trust that a higher number is always later. A revert (Section 17) does not violate this: reverting to old
content is itself a forward change that produces a new, higher version, not a return to an old number.

> Summary: A merged version's content is frozen, and any later change is a new higher version. Versions only
> ever increase, never repeat, decrease, or skip, so the version ordering is also the chronological order of
> the document's accepted changes. Even a revert moves forward to a new higher version.

---

## 11. Pinning to a commit

11.1 Every accepted version of a document MUST be pinned to the commit that merged it, identified by its
full commit SHA. The displayed version stamp links to that commit, so a version is never just a number; it
is a number bound to an exact, immutable point in git history.

11.2 The reason is that the SHA is the ground truth and the version is a human-readable label for it. If the
label and the content ever appeared to disagree, the SHA settles it, because the SHA cannot be edited after
the fact without rewriting history, which the protected branch forbids. This is also why the scheme needs no
build-metadata suffix (Section 26.4): the SHA already provides an immutable, exact pin.

> Summary: Each version is pinned to its merge commit SHA, so a version is a human label bound to an exact
> immutable point in git history, and the SHA is the tie-breaking ground truth that removes any need for a
> build-metadata suffix.

---

## 12. Declaring impact in the proposal

12.1 A proposal that changes an existing living document MUST declare, in its `version_impact` field,
exactly one of `major`, `minor`, `patch`, or `editorial`, and MUST set the document's new `version`
frontmatter to the value that declaration implies under Sections 6 and 8 relative to the document's current
version. Three cases modify this. A proposal that creates a document declares no impact and sets `1.0.0.0`
(Section 7.1). A proposal that changes only a document's metadata, such as its tags, without altering the
meaning of its body is EDITORIAL, because nothing a reader relies on changed, yet it is still an accepted
change that MUST produce a new version under Section 10.1. A proposal that changes more than one document
declares a separate impact per document (Section 16.2). In every case, the document's own `version` and
`updated` frontmatter fields are the mechanical record of the bump and are never themselves the subject of
classification; a change is classified by its effect on the body and the meaningful metadata, not by the
fact that the version and date lines moved.

12.2 The declaration and the new version MUST agree with each other. Declaring `patch` while setting a
version that reflects a minor bump is a contradiction the validate check rejects (Section 14).

12.3 The proposal SHOULD, in its change note, briefly justify the declared impact by naming what the change
did in the terms of Section 5, for example "patch: tightens the reward description, adds no mechanic,
breaks nothing." This justification is what a reviewer checks the declaration against (Section 13).

12.4 The version bump is authored by the proposal, as part of the same diff a reviewer sees, and is never
written by the application after merge. The reason is that a number written by software after the fact would
be an unreviewed change to the record, which the record's whole model forbids; the bump must be visible in
the diff and approved like everything else.

> Summary: A document-changing proposal declares one impact level and sets the new version to match it, the
> two must agree or CI rejects the proposal, and the change note justifies the level in Section 5's terms.
> The bump is part of the reviewed diff and is never written by the app after merge.

---

## 13. The two levels of verification

Classification is verified at two levels, and this document is precise about which level is a machine's job
and which is a human's, so that neither is assumed to cover the other.

13.1 Mechanical verification, done by the validate check. The check verifies arithmetic and form, not
judgment. For each document changed by the proposal, it confirms that the new version is well-formed
(Section 4) and is a legal successor of that document's current base version, meaning exactly one segment
has increased by one, every higher segment is unchanged, every lower segment is reset to zero, and the
result is strictly greater than the base (Sections 6, 9, and 10.2). Where the proposal declares a single
`version_impact` for a single changed document, the check also confirms that the segment that actually
moved is the one named by the declaration (Section 12.2). For a proposal that creates a document, the check
confirms the version is exactly `1.0.0.0` (Section 7.1) and expects no impact declaration. If any of these
fails, the check fails the proposal. The machine does not and cannot judge whether the declared level is the
correct description of the change; it only confirms the number is a legal, consistent successor.

13.2 Judgment verification, done by the human reviewers. The reviewers judge whether the declared level
truthfully describes the change, using the tests in Section 5 against the visible diff and the change note.
A reviewer who believes a change declared `patch` actually contradicts old content, and is therefore MAJOR,
MUST request changes. This judgment is exactly the part a machine cannot make, and it is why decisions and
documents require human approval at all.

13.3 The boundary, stated once so it is never blurred: the machine guarantees the number is arithmetically
consistent with the declaration; the humans guarantee the declaration is true. A proposal passes only when
both hold. Neither substitutes for the other, and a green check is never evidence that the classification
was correct, only that it was consistent.

> Summary: The validate check mechanically confirms the new version is well-formed, strictly greater, and
> arithmetically consistent with the declared impact, but it cannot judge whether the declared level is
> true; the human reviewers judge truth against Section 5. Both must hold, and a green check proves
> consistency, never correctness.

---

## 14. Enforcement by the validate check

14.1 For any proposal that changes a file under `documents/`, the validate check MUST perform the mechanical
verification of Section 13.1 and MUST fail the proposal if any part of it fails. This makes the arithmetic
rules of this document non-optional: a malformed, non-monotonic, or inconsistent version cannot merge.

14.2 The check computes the document's current version from the base of the proposal, that is, from the
document as it exists on the default branch at the point the proposal branched or was last synced, not from
whatever the proposal's author assumed. This is what makes concurrent edits safe (Section 15).

14.3 The check is a required status check on the protected branch, and administrator bypass is disabled
(see CLAUDE.md Section 10), so its verdict is binding and cannot be pushed past.

> Summary: The validate check mechanically enforces the version rules for any change under documents/,
> computing the true current version from the proposal's base, and because it is a required check with no
> admin bypass, an inconsistent version cannot merge.

---

## 15. Concurrent edits to the same document

15.1 Two proposals open against the same document at the same time each compute their new version from the
same base, so both may propose, for example, `1.3.0.0` from a base of `1.2.0.0`. This is a race, and the
record resolves it deterministically rather than hoping it does not happen.

15.2 Primary resolution, at the validate check with an up-to-date base. The record repository MUST enable
"require branches to be up to date before merging" on the protected branch. This forces the second proposal
to rebase onto the first once the first has merged, and on that rebase the validate check (14.2) recomputes
the document's current version from the now-updated base, `1.3.0.0`, against which the second proposal's
still-`1.3.0.0` version is no longer a legal successor, so the check fails until the author recomputes to
`1.4.0.0`. This is the reliable resolution, and it is why the up-to-date setting is mandatory: without it,
both proposals could pass against the stale `1.2.0.0` base and both merge `1.3.0.0`, duplicating a version
in the time-of-check-to-time-of-merge window.

15.3 Secondary resolution, the frontmatter conflict, which is real but only partial. If the two proposals
set the version line to different values, git raises a conflict on that line and the author must resolve it.
But if both proposals set the identical next value, which is the common case when both classify the change
the same way, git merges the identical line cleanly with no conflict, so the frontmatter conflict MUST NOT
be relied on as the safeguard. The up-to-date base plus recomputation in 15.2 is the safeguard; the conflict
is an occasional early warning, not the mechanism.

15.4 The interface SHOULD warn an author who opens a second proposal against a document that already has an
open proposal, so the race is avoided by choice where possible rather than caught after the fact.

> Summary: Concurrent edits are resolved reliably by requiring branches to be up to date before merging, so
> the second proposal rebases and the validate check recomputes against the true updated base and rejects a
> stale or duplicate version. The shared-line git conflict is only a partial early warning, because identical
> version edits merge cleanly, so it is never the safeguard. The interface also warns before a second
> concurrent proposal is opened.

---

## 16. Proposals that change more than one document

16.1 A single proposal SHOULD change at most one living document, so that its `version_impact` declaration
is unambiguous.

16.2 If a proposal must change more than one document at once, it MUST declare a separate impact and set a
separate correct version for each document it touches, and the validate check MUST verify each independently
against that document's own base. One proposal can therefore carry a MAJOR bump to one document and a PATCH
bump to another, each justified separately in the change note.

16.3 The record revision (Section 21) still increments by exactly one for the whole proposal, because it
counts accepted changes, not documents touched. A single proposal is one accepted change no matter how many
documents it versions.

> Summary: A proposal should touch one document, but if it touches several it declares and sets a correct
> version for each, verified independently, while the record revision still counts the whole proposal as one
> accepted change.

---

## 17. Reverts

17.1 A revert is a new proposal that changes a document's current content back toward an earlier state. It
is a forward change and MUST produce a new, higher version; it MUST NOT restore an old version number
(Section 10.2).

17.2 A revert's impact MUST be classified by what the revert does to the current content, using Section 5,
not by the impact of the change it undoes. Reverting a change that had contradicted old content, thereby
restoring the old content, itself contradicts the current content and is therefore MAJOR. Reverting a
clarification is typically PATCH. The classifier looks forward at the effect on the present document, never
backward at the label of the undone change.

17.3 The reason a revert cannot reuse the old number is monotonicity (Section 10): the version is a
timeline, and undoing a change is an event on that timeline, not a rewinding of it. The history therefore
shows that the document held content, changed, and changed back, each as a distinct version, which is the
truth.

> Summary: A revert is a forward change to a new higher version, never a return to an old number, and its
> impact is classified by its effect on the current content, not by the change it undoes, because the
> version is a timeline of events and undoing is itself an event.

---

## 18. Retirement and deletion of a document

18.1 A living document is rarely removed, because the record prefers superseding to deleting. When a document
is genuinely retired, the change that removes or empties its asserted content MUST be classified MAJOR,
because a reader who relied on that content is now without it, which is the load-bearing invalidation MAJOR
exists to mark.

18.2 A retired document SHOULD be marked retired in its frontmatter and kept in place rather than deleted
from git, so its history and its final version remain inspectable and citable. Git retains the content
regardless, but keeping the file present keeps it reachable in the interface.

> Summary: Retiring a document is a MAJOR change because it removes content a reader relied on, and the
> document should be marked retired and kept in place rather than deleted so its history stays reachable.

---

## 19. Renames and slug changes

19.1 A document's `slug` is its stable identity and SHOULD NOT change. If a rename is unavoidable, the change
MUST preserve the version history across the rename, which in git means moving the file rather than deleting
and recreating it, so that blame and history follow the content.

19.2 A rename that only changes the slug or title, with no change to the body's meaning, is EDITORIAL. A
rename that accompanies a substantive change is classified by the substantive change under Section 8.

19.3 The reason slugs should be stable is that decisions and other documents cite documents by identity, and
a changed identity risks breaking those citations; the referential-integrity check (CLAUDE.md 9.4) guards
against leaving a dangling reference, but the cheaper safeguard is not to move identities without cause.

> Summary: A document's slug should be stable; an unavoidable rename must move the file so history follows,
> is EDITORIAL if meaning is unchanged, and is classified by the substantive change otherwise. Stable slugs
> protect the citations that point at the document.

---

## 20. Decisions: versioning by supersede chain

20.1 A decision carries no version number. It is versioned entirely by its supersede chain: the ordered
sequence of decisions in which each supersedes the one before, recorded in the `supersedes` and
`superseded_by` frontmatter links.

20.2 The reason a decision has no number, while a document does, is that a decision is atomic and immutable,
whereas a document is continuous and edited. A decision is a single settled conclusion that is never revised
in place; when the team's conclusion changes, they do not edit the old decision, they write a new decision
that supersedes it. So a decision has no internal sequence of versions to number; its entire history is the
chain of separate decisions that replaced it. Numbering it would imply an in-place revision history that,
by design, does not exist.

20.3 A decision id, once assigned, is permanent and MUST NOT be reused, even if the decision is later
superseded or recorded as rejected. The reason is that citations and supersede links point at ids, and
reusing an id would silently redirect every reference that pointed at the old one. Ids are drawn from a
single global sequence shared by all decisions: imported decisions (Section 23) occupy the earliest ids in
their reconstructed chronological order, and decisions created live continue the same sequence after them.
There is never a separate numbering for imported and live decisions, because a supersede link may cross from
an imported decision to a live one, and a single sequence keeps every id globally unique and ordered. Ids
are allocated in strictly increasing order: a newly assigned id MUST exceed every id already in use and MUST
NOT collide with or rewind onto an existing one. They are unique and never recycled, but the sequence need
not be contiguous, and gaps are permitted, for example when a proposed id is abandoned along with its
proposal. Monotonicity and uniqueness, not gaplessness, are what keep every reference stable, which is why
the validate check enforces exceeds-all-existing and no-reuse rather than contiguity. An id and every
reference to one (`supersedes`, `superseded_by`, and each `relates_to` entry) MUST be written as a quoted
string in YAML, for example `id: "0007"`, because an unquoted `0007` is parsed as a number and loses its
zero-padding.

20.4 The sole mutation permitted to an accepted decision is that a superseding proposal sets its `status` to
superseded and its `superseded_by` to the new decision's id (see CLAUDE.md 4.2 and SPEC 4.2). This is not a
new version of the decision; it is the recording of the supersede link, and it is the one exception to a
decision's immutability, permitted only so the chain stays consistent in both directions.

20.5 Reading a decision's history means walking the chain: from any decision, `supersedes` points to its
predecessor and `superseded_by` to its successor, and following these to their ends gives the full lineage,
which is exactly what the provenance rail renders (SPEC 2.9). The chain, not a number, is the decision's
version history.

> Summary: A decision carries no number because it is atomic and immutable and has no in-place revision
> history; its history is the chain of separate decisions that superseded it. Ids are permanent and never
> reused, the sole permitted mutation is recording the supersede link on the old decision, and a decision's
> lineage is read by walking that chain.

---

## 21. The record revision

21.1 The record as a whole carries a single record revision: a non-negative integer that counts accepted
changes to the record. The epoch, revision 0, is the scaffolded but content-empty record: the initial commit
that creates the repository with its templates, this VERSIONING.md, and the validate workflow, none of which
arrives through a proposal. From that epoch, every merged proposal increments the revision by exactly one,
so the first accepted change, which is the import (Section 23), takes the record to revision 1.

21.2 The record revision MUST be monotonic: it only ever increases, by exactly one per merged proposal, and
it MUST NOT decrease, reset, or skip. A revert increments it like any other accepted change (a revert is an
accepted change), so the count reflects total accepted changes, not net changes.

21.3 The record revision counts merged proposals, not files, not commits of internal work, and not
documents. One merged proposal is one increment regardless of how many files it touched or how many document
versions it set (Section 16.3). The reason the unit is the proposal is that a proposal is the atomic unit of
an accepted change in this record: one reviewed, approved, gated decision to alter the record.

21.4 The record revision is computed, not stored. It is not written into any file, because a stored counter
would require the application to write to the record after a merge, which the model forbids (Section 12.4 and
CLAUDE.md). To make the count both exact and cheap, squash merging MUST be the only merge method enabled on
the record repository, so that one merged proposal corresponds to exactly one commit on the default branch.
The record revision is then the number of commits on the default branch after the epoch commit (Section
21.1), a single cheap count, and each accepted change is pinned to exactly one commit SHA. Squash merging
also preserves authentic authorship, because the squashed commit is attributed to the proposal's author, so
the proof-of-work guarantee is unaffected. This squash-only requirement is a record-repository setting that
the surrounding process documents MUST also reflect, so it is not silently assumed only here.

21.5 The record revision is deliberately not a four-segment version. An earlier design gave the whole record
a four-segment number computed by combining every document's impacts, which was fragile to compute and
carried no coherent meaning across independent documents. The record revision replaces it with a single
honest count, which is cheap, exact, and unambiguous: it says how many accepted changes deep the record is,
and nothing more, which is all a record-wide number can truthfully say.

> Summary: The record revision is a single monotonic integer counting merged proposals, starting at 0 and
> rising by exactly one per accepted change including reverts, never resetting or skipping. It is computed by
> counting merges rather than stored, squash merging keeps the count exact and each change pinned to one SHA,
> and it deliberately replaces the fragile old global four-segment version with an honest count.

---

## 22. Notes and library entries are not versioned

22.1 Notes and library entries carry no version and no supersede chain. A note may record `graduated_to` when
it becomes a decision, and a library entry is effectively immutable metadata, but neither is versioned.

22.2 The reason is that versioning communicates the nature of a change to content that readers rely on, and
neither of these is that kind of content. A note is an explicitly provisional, unreviewed-in-depth thought
that asserts nothing the record stands behind, so there is nothing to version; when a note's content matters
enough to version, it graduates into a decision, which then carries the supersede chain. A library entry is
a citation record whose truth lives in the external source, not in the entry; correcting a mistyped author is
a fix to metadata, not a change to a claim the record makes, so it needs no version. Every accepted change to
a note or a library entry still increments the record revision (Section 21), because it is still an accepted
change to the record; it simply carries no version of its own.

> Summary: Notes and library entries are not versioned because neither is content the record asserts and
> relies on: a note is provisional and graduates into a versioned decision when it matters, and a library
> entry is external-source metadata. Both still count toward the record revision as accepted changes.

---

## 23. Backfill and imported content

23.1 Content that predates the record enters through a one-time import (CLAUDE.md 9.5 and SPEC 9.5). Imported
decisions are marked `origin: imported`, assigned their place in decision order at import, and given
best-estimate dates and correct supersede and citation links. Imported living documents enter at version
`1.0.0.0` marked imported (Section 7.3).

23.2 Imported content MUST NOT be given an invented prior version history or invented supersede chain. Where
the real prior sequence of a set of imported decisions is known, it MUST be reconstructed faithfully in their
supersede links; where it is not known, the decisions are recorded as independent rather than linked by a
guessed chain. The record never presents a value it cannot stand behind, and a fabricated lineage would be
exactly that.

23.3 The entire import lands as a single proposal that goes through the gate once (CLAUDE.md 10.5), so the
imported baseline is reviewed before it becomes immutable history. That single import proposal increments the
record revision by one, like any accepted change.

> Summary: Imported content enters marked as imported, documents at 1.0.0.0 and decisions in reconstructed
> order, with no invented version history or guessed lineage; unknown prior sequence is recorded as
> independent rather than fabricated. The whole import is one reviewed proposal and one record-revision
> increment.

---

## 24. Precedents registry

This registry records classification rulings that were genuinely ambiguous and were decided once, so the same
question is never re-litigated. It is the record's case law. New precedents are added by the governed process
of Section 25. Each entry states the case, the ruling, and the reason.

24.1 Wood versus food, ruled PATCH. Case: a change refined the design so that the foraging target resource
(wood) is what enters fitness, while food fuels health only and never enters fitness. Ruling: PATCH. Reason:
the change tightened what the document already intended, the separation of the fitness signal from the energy
source, without adding a new mechanic and without making any prior statement false; a reader of the old
version is not wrong, only less precise. This is the canonical PATCH precedent and the reference example for
distinguishing a tightening (PATCH) from a contradiction (MAJOR).

> Summary: The precedents registry is the record's case law: ambiguous classifications decided once, each
> with case, ruling, and reason, added only through the governed process. The founding entry rules the
> wood-versus-food refinement a PATCH because it tightened existing intent without adding a mechanic or
> making anything false.

---

## 25. Governing this document

25.1 This document is itself part of the record, and any change to its rules is a governed change: it is
proposed, reviewed, and approved through the same gate as a decision, needing both other members (CLAUDE.md
Section 10). A versioning rule MUST NOT be changed by a single person or outside the gate.

25.2 A change to the versioning rules SHOULD state its own impact on existing versions: whether it is
purely forward-looking, or whether it reinterprets versions already assigned. A rule change that would
retroactively reclassify past versions MUST say so explicitly and MUST NOT silently rewrite the meaning of
numbers already in the record.

25.3 New precedents (Section 24) are added through this same governed process, which is what makes the
registry authoritative rather than one person's opinion.

25.4 This document, the templates, and the validate workflow are governed root files of the record, not
living documents under `documents/`, and so they are deliberately not versioned by the four-segment scheme.
Their history is their git history, their changes are governed by this section, and each such change
increments the record revision like any accepted change. The reason they are not four-segment versioned is
that the four-segment scheme classifies changes to the research content a reader relies on, whereas these
files are the machinery that governs that content; versioning the ruler with the same ruler it defines would
be circular. If the team later wants a human-readable version on this document specifically, that is itself
a governed change proposed under 25.1, not an assumption made here.

> Summary: Changing the versioning rules or adding a precedent is a gated change needing both other members,
> never a solo edit, and a rule change must declare whether it is forward-looking or reinterprets existing
> versions, never silently rewriting the meaning of numbers already assigned.

---

## 26. Relationship to and divergence from Semantic Versioning

This scheme is modeled on Semantic Versioning 2.0.0 and borrows its discipline: numbered normative rules,
RFC 2119 language, meaning-carrying segments, reset-on-higher-bump, immutability of released versions, and
numeric left-to-right precedence. It diverges deliberately in the following ways, each with its reason, so
that no one assumes SemVer behavior where this scheme differs.

26.1 It versions prose documents, not a software API. SemVer's segments are defined by API compatibility;
ours are defined by what a reader would now be wrong about, would newly learn, would see clarified, or would
find unchanged in meaning. The tests in Section 5 are the analogue of SemVer's compatibility tests, adapted
to a research record.

26.2 It has four segments, not three. The fourth, EDITORIAL, is the deliberate addition. It exists so that
meaning-preserving prose hygiene does not inflate the PATCH count. In SemVer every change that ships is at
least a PATCH, because software has no notion of a change that provably alters nothing; a prose document
does, and separating it keeps the PATCH signal meaningful (Section 5.4.3). This is the single largest
divergence and the reason the scheme is not simply SemVer.

26.3 It has no `0.x` phase. A document is not in the record until accepted, so there is no unstable
pre-public phase to mark, and reserving a zero major would invent a state the record does not have (Section
7.2).

26.4 It has no pre-release and no build-metadata suffixes. There is no pre-release because a proposed change
is not a lower-precedence version of the document; it is simply not yet accepted, and the proposal shows the
proposed next version without that version existing until merge. There is no build metadata because the merge
commit SHA already provides the immutable, exact pin those suffixes would carry (Section 11.2). Removing both
keeps precedence total and simple (Section 9.4).

26.5 The record-wide number is a count, not a semver. SemVer applies to a single versioned unit; the record
is many units, and a single four-segment number across them was fragile and meaningless, so the record uses a
monotonic count instead (Section 21.5).

> Summary: The scheme borrows SemVer's discipline but versions prose not APIs, adds an EDITORIAL fourth
> segment so meaning-preserving changes do not pollute PATCH, drops the 0.x phase because a document is real
> once accepted, drops pre-release and build metadata because acceptance and the commit SHA already cover
> them, and uses a monotonic count rather than a semver for the record as a whole. Each divergence is
> deliberate and reasoned.

---

## 27. Worked example: the life of a document

The following traces a living document through a realistic sequence, showing the version at each step and why.

```
event                                                        impact      version    record rev
create the design plan (first accepted, no impact level)     (creation)  1.0.0.0    +1
fix two typos in the plan                                    EDITORIAL   1.0.0.1    +1
tighten the reward description (wood vs food, Sec 24.1)      PATCH       1.0.1.0    +1
add a health system alongside energy, energy unchanged      MINOR       1.1.0.0    +1
correct a mis-stated perception rule, no new behavior       PATCH       1.1.1.0    +1
fix a broken citation link, same source                     EDITORIAL   1.1.1.1    +1
replace the scripted predator with a coevolved one          MAJOR       2.0.0.0    +1
   (also triggers cross-impact review of dependents)
revert the coevolved predator back to scripted              MAJOR       3.0.0.0    +1
   (forward change, contradicts current content; not 2.x)
```

Reading the version history top to bottom tells the whole story without opening a single diff: two MAJOR
events bracket a period of growth and clarification, and the record revision, meanwhile, has advanced by
eight because there were eight accepted changes.

> Summary: The worked example shows each impact level in sequence, including the reset behavior, the MAJOR
> cross-impact trigger, and a revert that moves forward to 3.0.0.0 rather than back to an old number, with
> the record revision advancing once per accepted change.

---

## 28. FAQ

28.1 Why four segments instead of three? So that meaning-preserving prose hygiene (EDITORIAL) does not
inflate the count of real corrections (PATCH). See Sections 5.4.3 and 26.2.

28.2 Why do decisions have no version? Because a decision is atomic and immutable and has no in-place
revision history; its history is the chain of decisions that superseded it. See Section 20.2.

28.3 What if I declare the wrong impact? The validate check catches an arithmetic inconsistency between your
declaration and your version, but it cannot catch a wrong-but-consistent classification; a reviewer catches
that and requests changes, and you correct the declaration and the version. See Section 13.

28.4 Two of us edited the same document at once. Whose version wins? Neither silently: you conflict on the
version frontmatter line and the validate check recomputes the true base, so the second to merge must rebase
and recompute. See Section 15.

28.5 Is an editorial-only change worth a version bump at all? Yes. Even a meaning-preserving change is an
accepted change to the record, and recording it as an EDITORIAL bump keeps the history complete and pinned to
a commit, without pretending anything substantive changed. See Section 5.4.

28.6 Why not use the git SHA as the version and skip the number entirely? Because a SHA is exact but not
legible: it cannot tell a reader whether a change broke something, added something, or fixed a typo. The
number carries that meaning and links to the SHA for exactness. See Section 11.

28.7 Does the record revision ever reset? No. It only ever increases, by one per merged proposal, forever.
See Section 21.2.

28.8 What happens to a document's version when it is renamed? A rename that changes only identity is
EDITORIAL and preserves history by moving the file; a rename alongside a substantive change is classified by
that change. See Section 19.

28.9 Why is there no 0.x phase, and no pre-release version? Because a document is not in the record until it
is accepted, so there is no unstable pre-public phase to mark, and a proposed change is not a lower version,
it is simply not yet accepted. See Sections 7.2 and 26.4.

> Summary: The FAQ answers the recurring doubts, four segments for the EDITORIAL separation, no decision
> versions because of immutability, wrong impacts caught by reviewers not just CI, concurrent edits resolved
> by conflict and recomputation, editorial bumps still worth recording, the number over the SHA for
> legibility, the revision never resetting, renames as EDITORIAL, and no 0.x or pre-release because a
> document is real only once accepted, each pointing to its governing section.

---

## Appendix A: formal grammar

The document version, in ABNF (RFC 5234):

```
document-version = major "." minor "." patch "." editorial
major            = number
minor            = number
patch            = number
editorial        = number
number           = "0" / positive-digit *digit
positive-digit   = %x31-39                 ; 1-9
digit            = %x30-39                 ; 0-9
```

A `number` is either a single zero or a non-zero digit followed by any digits, which forbids leading zeroes
(4.1.2). The record revision is a single `number` with the same lexical rule. Decision ids are not covered by
this grammar; they are zero-padded fixed-width identifiers, not version numbers (4.1.3).

> Summary: The grammar fixes the version as four dot-separated numbers, each a zero or a non-zero-led digit
> string so leading zeroes are impossible, with the record revision following the same number rule and
> decision ids explicitly outside this grammar.

---

## Appendix B: quick classification reference

```
did the change make an old reader wrong about something load-bearing,
  or change the frame, a contract, or an invariant?                     -> MAJOR
did it add something genuinely new while breaking nothing?              -> MINOR
did it correct, clarify, or tighten existing content,
  adding no mechanic and making nothing false?                         -> PATCH
did it change no meaning at all (typo, format, link, exact synonym)?    -> EDITORIAL
qualifies for more than one? take the highest.                         (Section 8)
is it a decision, not a document?    no version; supersede chain.       (Section 20)
is it a note or library entry?       no version; still counts to rev.   (Section 22)
```

> Summary: A one-screen decision tree from the load-bearing-wrongness test for MAJOR down through MINOR,
> PATCH, and EDITORIAL, with the highest-qualifying rule and the pointers for decisions, notes, and library
> entries, so a classifier can resolve almost any case at a glance and follow the section reference for the
> rest.
