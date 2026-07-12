# Oracle record template

This is the template a new Oracle group record repository is generated from (GitHub generate-from-template).
A group is a GitHub repository holding a research decision record: decisions, notes, living documents, and a
library, reviewed through a governed pull-request gate.

## What is here

- templates/ and template.md: the authored templates for a decision, document, note, library entry, and
  proposal, plus their annotated documentation.
- VERSIONING.md: the versioning rule for living documents and the record revision.
- .oracle/governance.yml: the group approval rule (change it through a governed proposal, not directly).
- decisions/, notes/, documents/, library/: empty content directories a new group fills in.

## Pending (added by the platform, not yet in this template)

- .github/workflows/validate.yml: the approval-gate check. In the multi-tenant design this is a thin caller
  of a centrally versioned, SHA-pinned validator action that reads .oracle/governance.yml from the base
  branch and enforces the differential, spoof-resistant approval count. It ships with the validator build.
  Until then this template carries NO gate, so do not rely on the approval gate for a group generated now.
- Branch protection (the required check, no admin bypass, squash-only) and the oracle-record topic are set
  by the provisioning flow when a group is created, not stored in the template.

Generated groups are provisioned by the Oracle app; this repository is the source they are cloned from.
