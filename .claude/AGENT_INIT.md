# Agent Initialization - MANDATORY CHECKLIST

**This file controls agent behavior. Follow checkpoints in order.**

---

## CHECKPOINT 1: Session Setup (DO FIRST)

**DO NOT START ANY WORK until you complete these steps:**

1. **Create/Open Session File**
   - Check: `.claude/sessions/YYYY-MM-DD-SESSION.md` (today's date)
   - If EXISTS: Read `## ACTIVE` section only
   - If MISSING: Create from template `.claude/sessions/session-template.md`
   - Move any active tasks from previous day's session
   

2. **Read Standing Context**
   - `.claude/MEMORY.md` - Check for conflicts with current task
   - `.claude/TASK_RULES.md` - Task-specific instructions

3. **Check skills directory** and load relevant skills from `.claude/skills/` based on project type
   - `karpathy-guidelines` - ALWAYS load this for code work
   - `paystack-integration` - Load if working on payment features, ignore if not
   - `frontend-design` - Load if you would be working on frontend UI
   - `social-auth-core` - Load if working on authentication through social platforms e.g Google/Linkedin/X

**YOU MUST acknowledge in your first response:**
```
Session: [created/opened] .claude/sessions/YYYY-MM-DD-SESSION.md
Memory: [read/no conflicts] or [read/found: <conflict summary>]
Skills: [loaded skill-creator, karpathy-guidelines]
```

---

## CHECKPOINT 2: During Work

**While working on tasks:**

- [ ] Update session file when starting each major task
- [ ] Update `MEMORY.md` immediately if making key decisions
- [ ] Use TodoWrite tool or similar to track multi-step tasks

**If making a decision that future agents need to know:**
1. Add to `MEMORY.md` under appropriate project section
2. Use format: `- [Decision] - [Date] - [Rationale] - Status: FINAL`

---

## CHECKPOINT 3: After Task Complete

**Before ending your response on a completed task:**

1. **Create Review Sub-Agent**
   - YOU MUST spawn a sub-agent to review your work
   - Sub-agent provides you actionable feedback and reports findings in structured format to me
   - if subagent not available, do a self and critical review yourself. Resolve any worries and report findings.

2. **Update Session File**
   - Change `- [ ] Task` → `- [x] Task`
   - Change `Status: NOT STARTED` → `Status: ACTIVE` → `Status: DONE`
   - Move completed tasks to `## COMPLETED` section
   - Sessions must include ALL TASKS & ALL subtasks to be covered under each task, not just a vague description

3. **Update MEMORY.md**
   - Add any new decisions made
   - Update documentation scores if applicable

4. **Report to Babatunde**
   - Format: `[DONE]` / `[IN PROGRESS]` / `[BLOCKED]`
   - Max 50 lines per update
   - Decisions: state + 1-2 line rationale

---

## CHECKPOINT 4: Session Close

**Close session when:**
- All ACTIVE tasks are DONE or BLOCKED
- Babatunde says "that's it for today"
- Starting new session >24 hours later

**To close:**
1. Rename: `YYYY-MM-DD-SESSION.md` → `YYYY-MM-DD-SESSION-[CLOSED].md`
2. Move remaining ACTIVE tasks to new session file

---

## CHECKPOINT 5: Reference - File Management Rules

**Docs Governance:**
- Only create ONE `.md` in `/docs` per skill you are working on, if persistent (long term value knowledge about codebase or product) or unless specifically instructed otherwise.
- edit if doc for that skill doc already exists, make sure there is a description above doc stating what it is about incase you need to pick it up for that same development work or ignore/not read through its content when working on something entirely different.
- Max 5 active docs; archive oldest when creating #6
- Archive location: `/docs/archive/YYYY-MM/`
- Every new doc must be referenced in `MEMORY.md`

**Create docs for:**
- Architecture decisions
- API contracts
- Testing procedures
- Deployment steps
- important longterm info that cannot stay in Memory

**Delete (don't create docs for):**
- Debug logs
- "X vs Y" analysis (keep decision only)
- Session-specific breakdowns
- Exploratory notes

---

## CHECKPOINT 6: Edge Cases

**If MEMORY.md >500 lines:**
- Alert: "MEMORY.md growing large, consider splitting"
- Suggest: `.claude/memory/[project-name].md`

**If unsure whether to create doc:**
- "Will Babatunde need this in 2 weeks?" → Yes = create
- "Would another agent need this context in a few weeks?" → Yes = create with header
