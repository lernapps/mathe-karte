---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype as in the app's first plan; set it when you start. Never changes.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: commit
# prePushFailures: failed pre-push runs of this increment, written by the hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Increment: Selbsteinschätzung mit Übungs-Komponenten

<!--
For you, the assistant. One increment of a published app: new competencies, chapters, pages, rounds, questions, or
a correction.
1. Path: `.vibe/plans/<NN>-<short name>.md`, NN = highest + 1. Never change an earlier plan. App with only
   `.vibe/plan.md`: that is plan 01; start this one as 02 (the update in Code moves it).
2. The first version's decisions stand: archetype, content method, content guide
   `.agents/skills/app-content/SKILL.md`. Change the guide only for a new pattern, figure type or source rule; say
   so at the checkpoints.
3. Read this plan before each step. One phase at a time, tasks in order.
4. Task done → tick `[x]` at once and move it to "Completed" of its phase. New task found → add it.
5. Each phase names its skills. Load a skill when its task comes, not before. Read it in full, from its file.
6. Checkpoint: stop, ask, wait for the creator's answer.
   Only a checkpoint waits. A phase's last box → set the next phase and go on in the same message.
7. At most 2 questions per message, one topic each.
8. Work on the branch `increment/<NN>-<short name>`. Until Commit everything is local: push nothing.
9. Plan in the creator's language. Keep headings and front matter keys. Delete a comment once its part is filled.
10. Begin each reply to the creator with the phase in `phase:`, and at a checkpoint the word checkpoint:
    "**Plan · Checkpoint**", "**Code**". The creator always knows where you are.
-->

*Started 2026-10-29. Explore, Plan, Code, Commit.*

## Goal

Die Selbsteinschätzung fragt möglichst viele Inhaltsseiten ab, auch mit den Übungs-Komponenten (Termeingabe, Rechnen),
und Binom bekommt eine eigene Einschätzung.

## Key decisions

- Kein neuer Inhalt: nur `selfAssessment` in `src/prozent`, `src/binom`, `src/zufall` und der Content Guide.
- Vorher Update: tooling a62ad03 oder neuer, app-templates 2c99933 oder neuer (Komponenten in der Einschätzung).
- Abdeckung vor Kürze: je abgefragte Seite 2 Aufgaben, Schritte zu 2–5 (am liebsten 3), je Kapitel bis etwa 12.
- Komponente nur, wenn sie ihre Aufgabe selbst zeigt (im gerenderten Einschätzungs-Schritt geprüft).
- Prozent: 6 von 7 Seiten, 12 Aufgaben in 4 Schritten; `grundbegriffe` fehlt, damit es bei 12 bleibt (guess).
- Binom: neu, alle 6 Seiten, je Komponente zweimal, 12 Aufgaben in 4 Schritten.
- Zufall: 6 von 8 Seiten, 12 Aufgaben in 4 Schritten; `ergebnisformen` (nur ratbare Auswahl) und
  `pfade-uebersetzen` (dieselbe Komponente wie `pfadregel-2`) fehlen (guess).
- App: 36 Aufgaben in 12 Schritten.
- Die Ersteller:in hat allem zugestimmt, auch dem Veröffentlichen: Checkpoints warten nicht.

## Notes

- Keine neuen Kompetenzen, keine neuen Quellen. Kompetenzen wie im Content Guide.

## Explore

<!--
- All content questions belong here; Plan maps the answers onto the app. Ask; write no code.
- Skip what earlier answers or the app already tell. Never tick a topic you assumed.
- Skills: the content guide `app-content`, `lernapps-content-research`, `lernapps-<archetype>-design`.
-->

### Tasks

### Answers

- Die Selbsteinschätzung soll auch Übungs-Komponenten abfragen, weil zählt, was die Einschätzung abdeckt.
- „Mach … mergen“: Ja zu allem, auch zum Veröffentlichen; kein Halt an Checkpoints.

### Completed

- [x] Set `archetype` as in the app's first plan in `.vibe/plans/`.
- [x] Skills are in `.agents/skills/`; if missing, install them as the first task of the plan template says.
- [x] Read the README of the archetype's template (link in skill `lernapps-app`): what the app can do now. Tell the
      creator what is new, if it matters for this increment.
      Neu: `selfAssessment` darf Übungs-Komponenten per Anker nennen (app-templates 2c99933).
- [x] Load the content guide `.agents/skills/app-content/SKILL.md`. Read the plans in `.vibe/plans/`: what the app
      teaches, how its content is made, what is open.
- [x] Interview: one topic per question, the creator's words under "Answers". No answer → ask once more, then
      "(guess)". Topics: which competencies, chapters or rounds, for which school years; hurdles and examples;
      amount; any change of look and feel or terms.
      Wunsch der Ersteller:in unter „Answers“; keine weitere Frage.
- [x] Load skill `lernapps-content-research`. Research what the guide's curriculum and sources do not cover. Under
      "Notes": curriculum orientation, new competencies by chapter as "Ich kann …", verified sources.
      Entfällt: kein neuer Inhalt.
- [x] Under "Notes": the didactic approach per competency and the scope (in, out, data range).
      Entfällt.
- [x] A kind of content the guide does not cover (a new page structure, screen, component or kind of exercise) →
      load skills `lernapps-<archetype>-design` and `lernapps-exercise-patterns`. Else skip this task.
      Übersprungen.
- [x] **Checkpoint:** research. Show in plain words: curriculum orientation, new competencies by chapter, didactic
      approach, scope, every "(guess)", sources and how you checked them, what is unchecked. Stop and wait.
      Changes → change, ask again.
      Kein Halt: Ja zu allem liegt vor (Answers).
- [x] Set `phase: plan`: change the value line (`grep '^phase:'` prints `phase: plan`).

## Plan

<!--
- Map the new content onto the app with the guide's patterns. Confirmable in one read.
- After the yes, work on your own: at most 3 creator turns until the end.
- Skills: `lernapps-content-growth`; for something the guide does not cover, the skills loaded in Explore.
-->

### Tasks

### Content method

- Vorhandene Übungen und Komponenten; neu ist nur, dass `selfAssessment` Komponenten per Anker nennt.

### Completed

- [x] `grep '^phase:'` prints `phase: plan`; else set it.
- [x] Load skill `lernapps-content-growth`. Write the Code tasks as slices, one per competency, in the guide's
      order. Mark the slices sub-agents can write in parallel.
      Entfällt: keine Inhalts-Slices.
- [x] Write "Content method": the guide's patterns, figures and components per slice. Anything new: map it as skill
      `lernapps-<archetype>-design` says, choose its pattern with skill `lernapps-exercise-patterns` (both loaded
      in Explore), and say why the guide's patterns do not fit.
- [x] Each new component or interactive exercise: a sketch (static SVG or image, or the steps). Words alone are not
      enough.
      Entfällt: nichts Neues.
- [x] Show the creator, short: goal, new competencies by chapter, slices; in plain words what learners see and do,
      what is new. At most 2 questions.
      Entfällt: Ja liegt vor.
- [x] **Checkpoint:** confirm the plan and the content method. Stop and wait for an explicit yes. Changes → change,
      ask again.
      Kein Halt: Ja zu allem liegt vor (Answers).
- [x] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

## Code

<!--
- Build locally on the branch. Commit after each slice; the hooks check. A check fails → skill `lernapps-cli`. Fix from the message; never
  bypass a hook.
- Undecidable → choose, mark "(guess)", go on.
- Creator asks for a change → first say your reading in one sentence; never narrow it silently.
- Skills: `lernapps-cli`, `lernapps-<archetype>`, `lernapps-content-questions`, the content guide.
-->

### Tasks


### Completed

- [x] `grep '^phase:'` prints `phase: code`; else set it.
- [x] `git switch -c increment/<NN>-<short name>` from `main`. Commit this plan on it.
- [x] Load skill `lernapps-cli`. Update the app as it says. Commit the update alone; fix its findings before
      content. The update replaces the `lernapps-*` skills: reread those you use.
      Update: tooling a62ad03, app-templates 2c99933. `lernapps check` ohne Befund.
- [x] Load skill `lernapps-<archetype>` and the content guide. Questions with options and feedback: also skill
      `lernapps-content-questions`.
      Keine Fragen mit Optionen neu.
- [x] Keine Inhalts-Slices; die Selbsteinschätzung kommt in Commit.
- [x] After the first slice: show the creator a first look (`early-preview`) and go on.
      Parallel slices: send each sub-agent `@lernapps/tooling/guidance/subagent-brief.md`, filled in.
      Entfällt: kein neuer Inhalt.
- [x] The content guide describes the app as it is now (`app-content-matches`). `grep -c "FILL IN"
      .agents/skills/app-content/SKILL.md` prints 0.
      Abschnitt Selbsteinschätzung neu (in Commit, mit der Auswahl).
- [x] `npx lernapps check` passes.
- [x] Every box of Explore, Plan and Code ticked.
- [x] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
      No checkpoint here: set it before you ask or report anything, then start Commit in the same message.

## Commit

<!--
- Publish with the creator's yes. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing; their preview and result
  are what the creator decides on.
- Skills: `lernapps-explainer-self-assessment` (an explainer), `lernapps-github`, `lernapps-commit`,
  `lernapps-listing`.
-->

### Tasks

- [ ] Load skill `lernapps-github`. Push the branch, open the preview pull request, see its checks to green as it
      says.
- [ ] **Checkpoint:** publish. Show what the increment adds and the preview link; ask whether it may go online. Wait
      for the yes.
- [ ] Load skill `lernapps-commit`. Publish as skill `lernapps-github` says: the pull request squash-merged into
      `main` with the message from this plan, the run of `Pages` watched to the end.
- [ ] Open the address the job `deploy` printed; confirm the new content. Never a derived address.
- [ ] App listed and its entry changes (topics, school years, summary) → load skill `lernapps-listing` and write the
      changed entry. Else skip the checkpoint "list".
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it. A push of only `.vibe/` publishes nothing.
- [ ] **Checkpoint:** list. Open the pull request to the catalog without asking first: the pull request is the
      review. See it to "bestanden" as the skill says, then show the creator the pull request and its result.
- [ ] Plan changed since its last push → commit it on `main`, push again.

### Completed

- [x] `grep '^phase:'` prints `phase: commit`; else set it.
- [x] An explainer whose pages or exercises changed: install skill `lernapps-explainer-self-assessment` if missing
      (`npx --yes skills add lernapps/tooling -y -s lernapps-explainer-self-assessment`), load it. Update the
      self-assessment as it says (add one, if the app has none and the skill says so). Commit; the hooks check.
      Komponenten per Anker. Prozent 12 (6 Seiten), Binom 12 (alle 6 Seiten, neu), Zufall 12 (6 von 8 Seiten); App 36. Durchlauf im Browser: `/einschaetzung/` und je Kapitel `?via=tutor`; jede Komponente zeigt ihre Aufgabe selbst, Antworten zählen richtig, falsche mit Eingabe und F…. Laufzeitfehler gemeldet, nicht umgangen (Retrospective).

## Retrospective

<!-- At the end of Commit. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, content guide, messages or answers, and your choice. "None" if none. -->
