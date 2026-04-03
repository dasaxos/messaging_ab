# Messaging A/B Predictor — Project Specification

## Project overview

A self-serve web tool where B2B SaaS PMMs submit two competing positioning messages and get a prediction of which one will resonate better, powered by MiroFish's multi-agent swarm simulation. Users fill out a form, receive an email when results are ready (~20 min), and view an interactive comparison dashboard.

**Tech stack:**
- Frontend: Next.js 14+ (App Router), Tailwind CSS, Recharts for data viz
- Backend/orchestration: Node.js worker with BullMQ (Redis-backed job queue)
- Simulation engine: MiroFish (self-hosted Flask backend on port 5001)
- Database: SQLite (via Drizzle ORM) for job tracking and results storage
- Email: Resend (free tier, 100 emails/day)
- Hosting: Railway (backend + MiroFish + Redis) + Vercel (frontend)

**Repo structure:**
```
messaging-ab-predictor/
├── README.md
├── .env.example
├── docker-compose.yml          # MiroFish + Redis + worker
├── packages/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing + form
│   │   │   ├── status/[jobId]/page.tsx     # Polling status page
│   │   │   ├── results/[jobId]/page.tsx    # Results dashboard
│   │   │   └── api/
│   │   │       ├── submit/route.ts         # Form submission endpoint
│   │   │       └── status/[jobId]/route.ts # Job status polling
│   │   ├── components/
│   │   │   ├── InputForm.tsx
│   │   │   ├── StatusTracker.tsx
│   │   │   └── results/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── AdoptionChart.tsx
│   │   │       ├── ObjectionHeatmap.tsx
│   │   │       ├── AgentQuotes.tsx
│   │   │       └── SentimentComparison.tsx
│   │   └── lib/
│   │       ├── db.ts                       # Drizzle + SQLite
│   │       ├── schema.ts                   # DB schema
│   │       └── seed-doc-template.ts        # Seed doc generator
│   ├── worker/                 # BullMQ job processor
│   │   ├── index.ts
│   │   ├── mirofish-client.ts              # HTTP client for MiroFish API
│   │   ├── orchestrator.ts                 # Full A/B pipeline
│   │   ├── report-parser.ts               # Extract metrics from reports
│   │   └── email.ts                        # Resend notifications
│   └── shared/                 # Shared types
│       └── types.ts
└── mirofish/                   # Git submodule or clone
    └── (MiroFish repo)
```

---

## Input form specification

### Page: `/` (landing page with embedded form)

The page has a brief hero section explaining what the tool does, then the form. No signup required. Email is collected for results delivery only.

### Form layout

The form has three visual zones:

1. **Shared product context** (full-width card, top) — filled once,
   applies to both simulations
2. **A/B message split** (two cards side by side) — left = Message A
   (blue accent border), right = Message B (pink accent border).
   Same fields on each side, only content differs.
3. **Your info** (full-width card, bottom) — email + name

On mobile (<768px), the A/B split stacks vertically (A on top, B below).

### Form fields

```typescript
interface FormInput {
  // === SECTION 1: Your product (full-width, shared) ===
  productName: string;          // required, max 100 chars
                                // label: "Product name"
                                // placeholder: "e.g., Gong, Notion, Loom"

  productDescription: string;   // required, max 500 chars, textarea
                                // label: "What does your product do?"
                                // placeholder: "Describe your product in 2-3 sentences.
                                //   What problem does it solve? Who is it for?"
                                // helper: "Be specific — 'AI-powered sales call
                                //   analytics for B2B sales teams' is better than
                                //   'a tool for sales'"

  productCategory: string;      // required, single select dropdown
                                // label: "Product category"
                                // options:
                                //   "Sales & Revenue Intelligence"
                                //   "Marketing Automation & Analytics"
                                //   "Product Management"
                                //   "Customer Success & Support"
                                //   "Developer Tools & DevOps"
                                //   "Security & Compliance"
                                //   "HR & People Ops"
                                //   "Data & Analytics"
                                //   "Collaboration & Productivity"
                                //   "Finance & Billing"
                                //   "Other"

  targetAudience: string;       // required, max 300 chars, textarea
                                // label: "Who buys this product?"
                                // placeholder: "e.g., VP of Sales at mid-market SaaS
                                //   companies (200-2000 employees), frustrated with
                                //   manual call reviews"

  companySize: string;          // required, single select
                                // label: "Target company size"
                                // options:
                                //   "Startup (1-50)"
                                //   "SMB (51-200)"
                                //   "Mid-market (201-1000)"
                                //   "Enterprise (1001-5000)"
                                //   "Large Enterprise (5000+)"
                                //   "Multiple segments"

  competitors: string;          // required, max 300 chars
                                // label: "Top 2-3 competitors"
                                // placeholder: "e.g., Chorus.ai, Clari, manual
                                //   spreadsheet tracking"
                                // helper: "Include both direct competitors and
                                //   the status quo (manual process)"

  pricingModel: string;         // optional, max 150 chars
                                // label: "Pricing model (optional)"
                                // placeholder: "e.g., $100/user/month, freemium
                                //   with enterprise tier"

  // === SECTION 2: A/B split (two side-by-side panels) ===
  // Each panel has identical field structure. The left panel
  // (Message A) has a blue accent border, the right panel
  // (Message B) has a pink accent border.
  //
  // Three valid testing modes emerge naturally:
  //   - Different headlines + same supporting copy = test the hook
  //   - Different headlines + different supporting copy = test full positioning
  //   - Same headline + different supporting copy = test the argument depth

  // --- Message A (left panel) ---
  headlineA: string;            // required, max 100 chars
                                // label: "Headline / tagline"
                                // placeholder: "The line that stops the scroll"
                                // helper: "e.g., 'Ship launches that actually
                                //   drive pipeline, not just awareness'"

  supportingCopyA: string;      // optional, max 500 chars, textarea
                                // label: "Supporting copy"
                                // placeholder: "The paragraph below your headline —
                                //   the fuller value prop or elevator pitch. If left
                                //   blank, agents react to the headline alone."
                                // helper: "e.g., 'Stop guessing which features to
                                //   lead with. Our AI analyzes 10,000+ buyer
                                //   conversations to surface the messaging that
                                //   actually converts.'"

  approachLabelA: string;       // optional, max 50 chars
                                // label: "Approach label"
                                // placeholder: "e.g., Value-led, Outcome-focused"
                                // default: "Message A"
                                // helper: "A short tag to identify this approach
                                //   in results"

  // --- Message B (right panel) ---
  headlineB: string;            // required, max 100 chars
                                // label: "Headline / tagline"
                                // placeholder: "Your alternative — make it
                                //   meaningfully different from A"
                                // helper: "e.g., 'AI-powered competitive intelligence
                                //   with real-time battlecard updates'"

  supportingCopyB: string;      // optional, max 500 chars, textarea
                                // label: "Supporting copy"
                                // placeholder: "The paragraph below your headline —
                                //   the fuller value prop or elevator pitch. If left
                                //   blank, agents react to the headline alone."
                                // helper: "e.g., 'Integrates with Salesforce, Gong,
                                //   and 40+ tools. Set up in 5 minutes. See
                                //   competitor moves before your next sales call.'"

  approachLabelB: string;       // optional, max 50 chars
                                // label: "Approach label"
                                // placeholder: "e.g., Feature-led, Tech-focused"
                                // default: "Message B"
                                // helper: "A short tag to identify this approach
                                //   in results"

  // === SECTION 3: Your info (full-width, bottom) ===
  email: string;                // required, valid email
                                // label: "Email for results"
                                // placeholder: "you@company.com"
                                // helper: "We'll email you when your simulation
                                //   is complete (~20 minutes). No spam, ever."

  name: string;                 // optional, max 100 chars
                                // label: "Your name (optional)"
                                // placeholder: "For the report header"
}
```

### Form validation rules

```typescript
const validationRules = {
  // Shared product fields
  productName:        { required: true, maxLength: 100 },
  productDescription: { required: true, maxLength: 500, minLength: 20 },
  productCategory:    { required: true, enum: CATEGORY_OPTIONS },
  targetAudience:     { required: true, maxLength: 300, minLength: 20 },
  companySize:        { required: true, enum: COMPANY_SIZE_OPTIONS },
  competitors:        { required: true, maxLength: 300, minLength: 5 },
  pricingModel:       { required: false, maxLength: 150 },
  // Message A fields
  headlineA:          { required: true, maxLength: 100, minLength: 5 },
  supportingCopyA:    { required: false, maxLength: 500 },
  approachLabelA:     { required: false, maxLength: 50 },
  // Message B fields
  headlineB:          { required: true, maxLength: 100, minLength: 5 },
  supportingCopyB:    { required: false, maxLength: 500 },
  approachLabelB:     { required: false, maxLength: 50 },
  // User info
  email:              { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  name:               { required: false, maxLength: 100 },
};
```

### Form UX requirements

- 3-zone layout:
  1. "Your product" — full-width card with shared fields
  2. "Messages to test" — two side-by-side cards (A left, B right)
     with colored accent borders (blue for A, pink for B) and
     matching badge labels at the top of each card
  3. "Your info" — full-width card with email + name
- A/B panels have identical field structure; only content differs
- Client-side validation with inline error messages below each field
- Submit button text: "Run simulation" → changes to "Submitting..." with spinner on click
- On successful submit, redirect to `/status/[jobId]`
- On error, show toast notification at top
- Mobile-responsive: A/B split stacks vertically below 768px breakpoint
- Character count indicator on textarea fields (shown as "23/500" in bottom-right)
- Autosave form state to localStorage so users don't lose progress on page refresh
- If user fills supportingCopyA but leaves supportingCopyB empty (or vice versa),
  show a subtle hint: "Tip: leave supporting copy the same on both sides to
  isolate the headline difference" — not a validation error, just guidance

---

## Seed document generator

The orchestrator converts form inputs into a structured markdown
document that MiroFish ingests as seed material.

### Agent population design philosophy

MiroFish auto-generates agent personas from the seed document's
named personas and entities. The quality and realism of the
simulation depends entirely on how well the seed doc represents
a realistic market.

**The core problem:** LLM agents exhibit stronger herd behavior
than real humans (documented in the OASIS research paper). With
a small agent population where everyone is a plausible buyer,
you get unrealistically high adoption rates (80%+ positive
signals) that destroy credibility. Real B2B SaaS campaigns see
~10-15% engagement rates and 2-5% trial rates.

**The solution:** Seed the document with a realistic distribution
of persona types that mirrors actual market composition:

| Persona tier | % of agents | Count (of 25) | Behavior |
|---|---|---|---|
| Non-responders | 36% | 9 | Too busy, not in-market, ignore everything |
| Skeptics | 20% | 5 | Cynical, burned before, need heavy proof |
| Passive observers | 16% | 4 | Lurk, read, don't engage publicly |
| Mild interest | 12% | 3 | Curious but cautious, might click through |
| Active evaluators | 8% | 2 | In-market, comparing options right now |
| Champions | 8% | 2 | Early adopters, eager to try new tools |

This produces realistic signal levels: even the best positioning
will only "break through" to 20-30% of the simulated population,
with maybe 8-16% taking positive action. The A/B comparison
remains valid because both messages face the same skeptical
market.

```typescript
// packages/web/lib/seed-doc-template.ts

export function generateSeedDocument(input: FormInput): string {
  return `# ${input.productName} — Market Simulation Brief

## Executive Summary

${input.productName} is a ${input.productCategory.toLowerCase()} product.
${input.productDescription}

Target buyer: ${input.targetAudience}
${input.pricingModel ? `Pricing: ${input.pricingModel}` : ''}

## The Problem Space

The primary buyers — ${input.targetAudience} — face challenges
in their daily workflow that ${input.productName} aims to solve.
These include inefficiency in existing processes, lack of
visibility into key metrics, and reliance on manual workarounds
or legacy tools.

Current alternatives include: ${input.competitors}. Many teams
resort to manual processes using spreadsheets, documents, and
ad-hoc communication channels as workarounds.

## IMPORTANT: Market Composition & Agent Behavior

This simulation must reflect realistic market dynamics. The
agent population below mirrors real B2B SaaS audience
composition. Each persona describes a DISPOSITION — a starting
point and set of tendencies — NOT a script. Agents should
behave consistently with their persona but can deviate when
the stimulus (the product positioning) is compelling enough
to override their default behavior. The simulation's value
comes from discovering WHICH messages break through default
indifference, not from confirming that busy people stay busy.

In real markets:
- Most people ignore most marketing most of the time
- A great message doesn't convince everyone — it cracks
  through to a few people who would otherwise have scrolled
- The difference between a good headline and a great headline
  is often 2-3 extra people out of 100 who stop and read
- Even "non-responders" occasionally respond to something
  that hits their exact pain at the exact right moment

## Target User Segments & Agent Personas

### --- TIER 1: LOW ENGAGEMENT BASELINE (9 of 25 agents) ---
### Default behavior: ignore. But each has a specific trigger
### that COULD break through if the positioning hits it.

### Persona: Dana Mitchell
Operations director at a large enterprise. Drowning in
priorities — just came out of a brutal quarter and is behind
on three major initiatives. Scrolls past 95% of vendor
content without reading it. Has not evaluated a new
${input.productCategory.toLowerCase()} tool in over a year.
HOWEVER: she has been privately frustrated about
${input.productCategory.toLowerCase()} inefficiencies for
months and recently vented to a colleague about it. If a
headline directly names the specific problem she's losing
sleep over — not a generic category pain but her EXACT
frustration — she might pause for 2 seconds. That's the
window. Most messages won't get it.

### Persona: Lee Takahashi
Senior manager who just finished a painful 6-month
implementation of ${input.competitors.split(',')[0]?.trim() || 'a competitor'}.
Exhausted by the process and deeply resistant to any new tool
conversations. His default response to any vendor outreach is
visceral rejection. BUT: the implementation exposed serious
gaps in the competitor's product that he's now stuck with.
If a headline acknowledges the specific pain of being locked
into an imperfect tool — rather than just pitching a
replacement — his guard might drop enough to click through.
He won't trial anything, but he might read and bookmark.

### Persona: Priya Sharma
VP at a startup that is currently too small for enterprise
${input.productCategory.toLowerCase()} tools. Uses free
alternatives and manual processes. Doesn't have budget this
year. Her default is "not for us." BUT: she's ambitious and
thinks about where the company will be in 18 months. If the
positioning signals a product that grows with you — with a
credible free tier or startup program — she might investigate
for future reference. She won't convert now, but she might
remember the brand.

### Persona: Marcus Johnson
CTO who has delegated all ${input.productCategory.toLowerCase()}
decisions to his team. Doesn't personally evaluate tools in
this category. His default is to scroll past. BUT: he reads
LinkedIn during his commute and occasionally forwards
interesting posts to his team with a one-line note. If the
headline is sharp enough to make him think "my team should
see this," he becomes an unexpected internal referral channel.
The message needs to be CTO-legible — outcome-focused, not
feature-focused.

### Persona: Kenji Watanabe
Individual contributor who uses whatever tools his manager
assigns. Doesn't follow industry content or attend webinars.
His default is complete unawareness. BUT: he's active in a
niche Slack community where peers occasionally share tools
that save them time. If the product gets mentioned there by
someone he trusts, he might look at it. He's unreachable via
positioning alone — but if other agents in the simulation
mention the product, he might pick it up secondhand.

### Persona: Aisha Okonkwo
Director-level buyer who is deeply loyal to
${input.competitors.split(',')[0]?.trim() || 'the incumbent solution'}.
Has a strong personal relationship with their account manager.
Her default is to dismiss alternatives. BUT: she's not blind
— she recently heard from a peer that a newer tool solved a
problem her incumbent can't. She's not switching, but she's
slightly less certain than she was 6 months ago. If the
positioning articulates a capability gap she's noticed in
her current tool, she might grudgingly acknowledge "okay,
that's a real point" even without taking action.

### Persona: Tom Brennan
Retired-in-place senior manager who has avoided learning new
tools for years. Delegates everything digital. His default
is complete disengagement. BUT: his team has been complaining
about the current workflow and he knows he'll have to approve
a new tool purchase eventually. If the positioning is simple
enough for a non-technical person to grasp — a clear
before/after, no jargon — he might actually understand the
value prop for the first time. Most B2B messaging is too
technical for buyers like Tom, which is itself a positioning
insight.

### Persona: Sofia Alvarez
HR leader whose LinkedIn feed occasionally surfaces
${input.productCategory.toLowerCase()} content due to
algorithm noise. This is not her domain. Her default is
immediate scroll-past. BUT: she recently had a conversation
with the VP of Marketing about cross-functional collaboration
tools. If the positioning touches on a cross-functional
pain point (not just a category-specific one), she might
pause because it connects to a conversation she was
already having.

### Persona: Dev Patel
Engineer who is technically adjacent but not a buyer or user
of ${input.productCategory.toLowerCase()} tools. His default
is "not my department." BUT: he's opinionated about tools
and frequently weighs in on purchase decisions when asked.
If the positioning includes a technical credibility signal
(API quality, integration architecture, data model) that
appeals to his engineering sensibility, he might share it
with the team as "this one seems legit from a technical
standpoint." Engineers-as-influencers is a real channel.

### --- TIER 2: SKEPTICS (5 of 25 agents) ---
### Default behavior: notice and push back. But specific
### approaches can earn grudging respect or deeper engagement.

### Persona: Rachel Torres
VP of Marketing who has been burned by 3 overpromising SaaS
tools in the last 2 years. Deeply cynical about AI claims
specifically — she's heard "AI-powered" on every product
pitch and it's lost all meaning. Her default response to
vendor positioning is to look for the catch, the exaggeration,
the gap between the headline and reality. BUT: she respects
positioning that is honest about limitations, leads with
specific numbers rather than vague claims, and acknowledges
that no tool is perfect. Self-aware messaging earns her
attention. She has budget and authority — she's just been
hurt and is protecting herself.

### Persona: James Liu
Head of Revenue Operations, very data-driven. His default
response to any positioning is "show me the numbers." He
dismisses vision-led messaging and looks immediately for
pricing transparency, case studies with specific metrics, and
integration documentation. BUT: when he finds positioning
that leads with concrete, falsifiable claims ("saves 4.2
hours per week per rep" vs "saves time"), he actually gets
excited. He wants to believe — he's just been conditioned
to distrust. Specificity is his love language.

### Persona: Natasha Volkov
Director of Product Marketing at a competitor. She will see
${input.productName}'s positioning with professional interest,
evaluating it for competitive intelligence. She's looking for
weaknesses to exploit, angles to counter, and differentiation
claims to undermine. BUT: she's also secretly impressed by
genuinely good positioning — it makes her own job harder but
she recognizes craft when she sees it. She won't adopt, but
her reaction is a proxy for how the competitive market will
respond. If she's worried, the positioning is working.

### Persona: Carlos Mendez
Consultant who advises ${input.companySize.toLowerCase()}
companies on tool selection. Has evaluated hundreds of tools
and is extremely hard to impress. His default is "I've seen
this before." BUT: he makes his living by recommending
great tools to clients. If the positioning genuinely
differentiates in a way he hasn't seen before — a new
angle on an old problem, an unusually honest take, a
framework he can steal for his own presentations — he
becomes an amplifier. Consultants are low-volume but
high-influence recommenders.

### Persona: Emma O'Brien
Finance leader who reviews all SaaS purchases. Her default
lens is cost, contract terms, and measurable ROI. She
doesn't care about product positioning in a traditional
sense. BUT: she responds to positioning that signals
financial maturity — transparent pricing, clear ROI
frameworks, flexible contracts. If the headline implies
"we understand your CFO" rather than just "we're a cool
tool," she moves from blocker to enabler.

### --- TIER 3: PASSIVE OBSERVERS (4 of 25 agents) ---
### Default behavior: read silently, form opinions, rarely
### act. But strong enough stimulus converts them to sharers.

### Persona: Ryan Park
Mid-level marketing manager who follows industry content
religiously but never engages publicly — no likes, no
comments, no shares. He's a lurker with strong opinions.
He reads every vendor's positioning and has mental rankings.
His default is silent consumption. BUT: about twice a year,
he forwards something to his team lead that's genuinely
impressive. If the positioning is not just good but
share-worthy — the kind of thing that makes him think "I
wish I'd written this" — he breaks his silence.

### Persona: Zara Ahmed
Operations analyst who follows industry content but has no
purchasing authority. She reads positioning, forms opinions,
and keeps them to herself unless directly asked. Her default
is silent observation. BUT: she's in a weekly team meeting
where her VP asks "anyone seeing anything interesting in the
market?" If she's seen positioning that week that was
genuinely clever or useful, she'll mention it — and her VP
trusts her judgment. She's an invisible bridge between
marketing reach and purchase decisions.

### Persona: Michael Chen
Product manager at a ${input.companySize.toLowerCase()} company
who is loosely adjacent to the ${input.productCategory.toLowerCase()}
space. His default is "interesting but not for me." BUT: he
thinks in terms of product principles and is drawn to
positioning that reveals an interesting product philosophy.
If the headline or supporting copy implies a genuinely novel
approach to the problem (not just a feature improvement but
a new way of thinking about the category), he might mention
it to the marketing team as "have you seen this?"

### Persona: Lisa Johansson
VP at a company already using a competitor. Casually monitors
the competitive landscape but is not actively looking to
switch. Her default is "I'll keep an eye on it." BUT: she's
been noticing gaps in her current tool and is starting to
wonder if she made the right choice. If the positioning
directly addresses a pain she's experiencing with her
incumbent — not generically but specifically — it shifts
from "keep an eye on" to "maybe we should evaluate."

### --- TIER 4: MILD INTEREST (3 of 25 agents) ---
### Default behavior: curious and open, will engage if the
### message meets a reasonable quality bar.

### Persona: Alex Chen
VP-level buyer at a ${input.companySize.toLowerCase()} company.
Has been loosely evaluating solutions in the
${input.productCategory.toLowerCase()} space for 3 months.
Currently using a combination of
${input.competitors.split(',')[0]?.trim() || 'manual processes'}
and spreadsheets. Budget-conscious but willing to pay for
proven ROI. Reports to the CRO/CMO. He's in the market but
not urgently — more "keeping options open" than "need to
decide this week." A headline that specifically names his
pain will get a click-through. A generic category headline
will get a mental note at best. Needs to justify any
purchase to finance, so ROI framing matters more than
excitement.

### Persona: Jordan Rivera
Director-level practitioner who would be the primary daily
user. Technically savvy, reads product reviews obsessively,
and participates in 3 Slack communities where practitioners
share tool recommendations. She's open to new tools but has
high standards — she's tried and rejected 4 tools in the
last year. Will investigate further if the message feels
authentic and specific. Generic "AI-powered" claims trigger
eye-rolls. Concrete, demonstrable capability claims earn
her attention. She can champion or kill a deal single-handedly
based on hands-on evaluation.

### Persona: Taylor Washington
IT/Security reviewer who occasionally evaluates new vendors
proactively rather than waiting for a team request. He cares
about SSO/SAML, SOC2, data residency, and API quality. Most
positioning is irrelevant to him. BUT: he notices when
positioning signals engineering maturity — mentions of
security certifications, API-first architecture, or
enterprise-grade infrastructure. If the overall positioning
suggests a mature, well-built product, he might proactively
add it to the approved vendor shortlist.

### --- TIER 5: ACTIVE EVALUATORS (2 of 25 agents) ---
### Default behavior: actively comparing options, highly
### attentive to positioning and differentiation.

### Persona: Sam Okafor
Senior Manager actively running an evaluation cycle for
${input.productCategory.toLowerCase()} tools. Has a shortlist
of 3-4 vendors including ${input.competitors}. Has budget
approved and needs to make a decision within 6 weeks. Will
pay close attention to how ${input.productName} positions
itself against alternatives. The headline and supporting
copy directly influence whether ${input.productName} makes
the shortlist or gets cut. He's reading every competitor's
homepage this week. Strong differentiation moves you up the
list. Generic claims get you eliminated because they signal
"nothing special here."

### Persona: Morgan Kim
Industry analyst / content creator who covers the
${input.productCategory.toLowerCase()} space. Has 15K
LinkedIn followers. Will evaluate ${input.productName}'s
positioning professionally — is it differentiated? Is it
honest? Is it interesting enough to write about? She would
share a strong take publicly (positive or negative). Her
public endorsement can drive 50+ qualified leads. Her
public critique can poison a launch. She's not neutral —
she's high-leverage.

### --- TIER 6: CHAMPIONS (2 of 25 agents) ---
### Default behavior: eager to adopt, but still need the
### message to be credible and specific.

### Persona: Chris Park
Director of Growth at a fast-moving startup. Loves being
first to discover promising products and has built a personal
brand around sharing tool discoveries. Will trial
${input.productName} quickly if the headline speaks to a
pain he has. BUT: he's also publicly critical — if the
product doesn't match the positioning's promises, he'll
post about the disappointment. He's a high-upside,
high-risk persona: the best kind of early champion if
the product delivers, and a vocal detractor if it doesn't.
His engagement is almost guaranteed — the question is
whether the positioning sets accurate expectations.

### Persona: Nadia Hassan
Head of PMM at a ${input.companySize.toLowerCase()} company
who has been actively looking for exactly this type of
solution. She's complained about the gap in team meetings
and has been tracking the space. She will almost certainly
engage with ${input.productName}'s positioning. The question
is whether the message makes her want to share it with 3
colleagues (creating internal momentum) or just bookmark it
for her own reference. The difference is often whether the
positioning gives her language she can use to pitch it
internally — "we need this because [exact phrase from the
headline]."

## Competitive Landscape

Direct competitors: ${input.competitors}

Each competitor has established positioning and an existing
customer base. Switching costs include data migration, team
retraining, and workflow disruption. The status quo (manual
processes) remains the biggest "competitor" — inertia is the
hardest objection to overcome.

Key competitive dynamics:
- Price competition is intensifying in the
  ${input.productCategory.toLowerCase()} space
- AI features are becoming table stakes, not differentiators
- Integration ecosystem depth matters more than feature count
- Customer success and onboarding quality drive retention

## Product Overview

${input.productName}: ${input.productDescription}
${input.pricingModel ? `Pricing: ${input.pricingModel}` : ''}

Core value: solving the specific pain points described above
with a modern, well-designed product experience.

## Key Industry Debates

1. Is AI genuinely transforming ${input.productCategory.toLowerCase()},
   or is it mostly marketing hype?
2. Should companies invest in best-of-breed point solutions or
   consolidated platforms?
3. How should ${input.productCategory.toLowerCase()} tools prove
   ROI when attribution is inherently difficult?
4. Are smaller, agile vendors better than established incumbents
   for innovation?

## SIMULATION CALIBRATION NOTE

The personas above describe DISPOSITIONS, not scripts. Each
agent should behave consistently with their persona but CAN
deviate when the positioning is compelling enough. The
simulation's value comes from discovering which messages
break through default indifference.

Expected realistic outcome ranges:
- 5-8 agents show NO engagement at all (true non-responders)
- 4-6 agents notice but don't act (passive observers + some
  low-engagement personas who weren't triggered)
- 5-8 agents engage meaningfully (skeptics who push back,
  mild-interest who click through, observers who share)
- 2-4 agents show strong positive intent (evaluators +
  champions + any low-tier personas whose specific trigger
  was hit by the positioning)

The A/B comparison's power lies in the SWING personas — the
agents in tiers 1-3 whose default is indifference but who
have a specific trigger. If Message A activates 2 swing
personas that Message B doesn't, that's the insight.
`;
}
```

### Simulation prompts (separate from seed doc)

```typescript
// packages/worker/orchestrator.ts

export function generateSimulationPrompt(
  input: FormInput,
  headline: string,
  supportingCopy: string | undefined,
  approachLabel: string
): string {
  const copySection = supportingCopy
    ? `\n\nBelow the headline, the supporting copy reads:\n"${supportingCopy}"`
    : `\n\nThere is no additional supporting copy — the headline stands alone.`;

  return `${input.productName} has just launched publicly.

Their homepage hero headline reads:
"${headline}"
${copySection}

The positioning approach is: ${approachLabel}.

This headline appears in their homepage, ads, LinkedIn posts,
and sales outreach. It is the first thing any buyer encounters.
${supportingCopy
  ? 'The supporting copy is what buyers see if they read further or click through.'
  : 'Buyers must decide whether to engage based on the headline alone.'}

How do the different buyer segments react over the first 30 days?

Specifically:
- Which personas try the product immediately, and what about the
  headline ${supportingCopy ? 'and supporting message ' : ''}convinces them?
- Which personas hesitate or dismiss it, and what are their
  specific objections to the positioning?
- Does the headline stop the scroll — do people pause and read
  further, or does it feel generic and forgettable?
- What does the conversation look like on social media and in
  professional communities?
- How do ${input.companySize.toLowerCase()} buyers respond
  differently from other segments?
- What is the dominant narrative about ${input.productName} after
  30 days — is it the intended message or did the market reframe it?
- How do competitors likely respond to this positioning?
- What would need to be true for ${input.productName} to achieve
  100 trial signups in the first 2 weeks with this positioning?`;
}
```

---

## Database schema

```typescript
// packages/web/lib/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const jobs = sqliteTable('jobs', {
  id:                text('id').primaryKey(),        // nanoid
  status:            text('status').notNull(),        // enum below
  createdAt:         integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:         integer('updated_at', { mode: 'timestamp' }).notNull(),
  completedAt:       integer('completed_at', { mode: 'timestamp' }),

  // User info
  email:             text('email').notNull(),
  name:              text('name'),

  // Form inputs (stored as JSON)
  formInput:         text('form_input', { mode: 'json' }).notNull(),

  // MiroFish tracking
  projectId:         text('project_id'),              // MiroFish project UUID
  graphId:           text('graph_id'),                // Zep graph UUID
  simulationIdA:     text('simulation_id_a'),         // Run A
  simulationIdB:     text('simulation_id_b'),         // Run B
  reportIdA:         text('report_id_a'),
  reportIdB:         text('report_id_b'),

  // Current pipeline stage
  currentStage:      text('current_stage'),           // enum below

  // Results (stored as JSON after parsing)
  resultsA:          text('results_a', { mode: 'json' }),
  resultsB:          text('results_b', { mode: 'json' }),
  comparison:        text('comparison', { mode: 'json' }),

  // Error tracking
  errorMessage:      text('error_message'),
  errorStage:        text('error_stage'),
});

// Status enum
type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

// Stage enum (for progress tracking)
type PipelineStage =
  | 'seed_doc_generation'
  | 'graph_building'
  | 'env_setup_a'
  | 'simulation_a'
  | 'report_a'
  | 'env_setup_b'
  | 'simulation_b'
  | 'report_b'
  | 'parsing_results'
  | 'complete';
```

---

## Job orchestration pipeline

```typescript
// packages/worker/orchestrator.ts — pseudocode for the full pipeline

async function processJob(jobId: string): Promise<void> {
  const job = await db.getJob(jobId);
  const input = job.formInput as FormInput;

  try {
    // Stage 1: Generate seed document
    await updateStage(jobId, 'seed_doc_generation');
    const seedDoc = generateSeedDocument(input);
    const seedFilePath = writeTempFile(seedDoc, `${jobId}.md`);

    // Stage 2: Create MiroFish project + build graph
    await updateStage(jobId, 'graph_building');
    const { projectId } = await mirofish.createProject(seedFilePath);
    await db.update(jobId, { projectId });
    const graphId = await mirofish.waitForGraphBuild(projectId);
    // ^^ polls GET /api/graph/status/{projectId} until complete
    await db.update(jobId, { graphId });

    // Stage 3: Run simulation A
    const promptA = generateSimulationPrompt(
      input,
      input.headlineA,
      input.supportingCopyA || undefined,
      input.approachLabelA || 'Message A'
    );

    await updateStage(jobId, 'env_setup_a');
    const simIdA = await mirofish.createSimulation(projectId, promptA);
    await db.update(jobId, { simulationIdA: simIdA });
    await mirofish.waitForEnvSetup(projectId, simIdA);

    await updateStage(jobId, 'simulation_a');
    await mirofish.startSimulation(projectId, simIdA);
    await mirofish.waitForSimulationComplete(projectId, simIdA);
    // ^^ polls run_state.json until done

    await updateStage(jobId, 'report_a');
    const reportIdA = await mirofish.generateReport(projectId, simIdA);
    await db.update(jobId, { reportIdA });
    await mirofish.waitForReportComplete(reportIdA);

    // Stage 4: Run simulation B (reuses same graph!)
    const promptB = generateSimulationPrompt(
      input,
      input.headlineB,
      input.supportingCopyB || undefined,
      input.approachLabelB || 'Message B'
    );

    await updateStage(jobId, 'env_setup_b');
    const simIdB = await mirofish.createSimulation(projectId, promptB);
    await db.update(jobId, { simulationIdB: simIdB });
    await mirofish.waitForEnvSetup(projectId, simIdB);

    await updateStage(jobId, 'simulation_b');
    await mirofish.startSimulation(projectId, simIdB);
    await mirofish.waitForSimulationComplete(projectId, simIdB);

    await updateStage(jobId, 'report_b');
    const reportIdB = await mirofish.generateReport(projectId, simIdB);
    await db.update(jobId, { reportIdB });
    await mirofish.waitForReportComplete(reportIdB);

    // Stage 5: Parse and compare results
    await updateStage(jobId, 'parsing_results');
    const reportA = await mirofish.getFullReport(reportIdA);
    const reportB = await mirofish.getFullReport(reportIdB);
    const actionsA = await mirofish.getActions(projectId, simIdA);
    const actionsB = await mirofish.getActions(projectId, simIdB);

    const resultsA = parseReport(reportA, actionsA);
    const resultsB = parseReport(reportB, actionsB);
    const comparison = generateComparison(resultsA, resultsB, input);

    await db.update(jobId, {
      resultsA,
      resultsB,
      comparison,
      status: 'completed',
      currentStage: 'complete',
      completedAt: new Date(),
    });

    // Stage 6: Send email
    await sendResultsEmail(job.email, jobId, comparison.winner);

  } catch (error) {
    await db.update(jobId, {
      status: 'failed',
      errorMessage: error.message,
      errorStage: job.currentStage,
    });
    await sendErrorEmail(job.email, jobId);
  }
}
```

---

## MiroFish API client

```typescript
// packages/worker/mirofish-client.ts

const MIROFISH_BASE = process.env.MIROFISH_URL || 'http://localhost:5001';

export const mirofish = {
  // Create project and upload seed document
  async createProject(seedFilePath: string): Promise<{ projectId: string }> {
    const form = new FormData();
    form.append('file', fs.createReadStream(seedFilePath));
    const res = await fetch(`${MIROFISH_BASE}/api/graph/create`, {
      method: 'POST',
      body: form,
    });
    return res.json();
  },

  // Poll graph build status until complete
  async waitForGraphBuild(
    projectId: string,
    timeoutMs = 900_000   // 15 min max
  ): Promise<string> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(
        `${MIROFISH_BASE}/api/graph/status/${projectId}`
      );
      const data = await res.json();
      if (data.status === 'completed') return data.graphId;
      if (data.status === 'failed') throw new Error(
        `Graph build failed: ${data.error}`
      );
      await sleep(5000); // poll every 5s
    }
    throw new Error('Graph build timed out');
  },

  // Create a new simulation on an existing project
  async createSimulation(
    projectId: string,
    requirement: string,
    config?: {
      numAgents?: number;       // default 44, use 20-25 for speed
      numRounds?: number;       // default 10, use 5-8 for speed
      platforms?: string[];     // ['twitter', 'reddit'] or ['twitter']
    }
  ): Promise<string> {
    const res = await fetch(
      `${MIROFISH_BASE}/api/simulation/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          requirement,
          num_agents: config?.numAgents ?? 25,
          num_rounds: config?.numRounds ?? 8,
          platforms: config?.platforms ?? ['twitter'],
        }),
      }
    );
    return (await res.json()).simulation_id;
  },

  // Wait for environment setup (persona generation)
  async waitForEnvSetup(
    projectId: string,
    simulationId: string,
    timeoutMs = 300_000
  ): Promise<void> {
    // Poll state.json
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(
        `${MIROFISH_BASE}/api/simulation/status/${projectId}/${simulationId}`
      );
      const data = await res.json();
      if (data.preparation_status === 'completed') return;
      if (data.preparation_status === 'failed') throw new Error(
        `Env setup failed: ${data.error}`
      );
      await sleep(3000);
    }
    throw new Error('Env setup timed out');
  },

  // Start simulation execution
  async startSimulation(
    projectId: string,
    simulationId: string
  ): Promise<void> {
    await fetch(
      `${MIROFISH_BASE}/api/simulation/start`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          simulation_id: simulationId,
        }),
      }
    );
  },

  // Wait for simulation to finish
  async waitForSimulationComplete(
    projectId: string,
    simulationId: string,
    timeoutMs = 600_000
  ): Promise<void> {
    // Poll run_state.json
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(
        `${MIROFISH_BASE}/api/simulation/run-status/${projectId}/${simulationId}`
      );
      const data = await res.json();
      if (data.status === 'completed') return;
      if (data.status === 'failed') throw new Error(
        `Simulation failed: ${data.error}`
      );
      await sleep(5000);
    }
    throw new Error('Simulation timed out');
  },

  // Generate report
  async generateReport(
    projectId: string,
    simulationId: string
  ): Promise<string> {
    const res = await fetch(
      `${MIROFISH_BASE}/api/report/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          simulation_id: simulationId,
        }),
      }
    );
    return (await res.json()).report_id;
  },

  // Wait for report generation
  async waitForReportComplete(
    reportId: string,
    timeoutMs = 300_000
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(
        `${MIROFISH_BASE}/api/report/status/${reportId}`
      );
      const data = await res.json();
      if (data.status === 'completed') return;
      if (data.status === 'failed') throw new Error(
        `Report generation failed: ${data.error}`
      );
      await sleep(3000);
    }
    throw new Error('Report generation timed out');
  },

  // Get full report markdown
  async getFullReport(reportId: string): Promise<string> {
    const res = await fetch(
      `${MIROFISH_BASE}/api/report/${reportId}/full`
    );
    return (await res.json()).report;
  },

  // Get action log from simulation
  async getActions(
    projectId: string,
    simulationId: string
  ): Promise<string> {
    const res = await fetch(
      `${MIROFISH_BASE}/api/simulation/actions/${projectId}/${simulationId}`
    );
    return (await res.json()).actions;
  },

  // Interview a specific agent
  async interviewAgent(
    reportId: string,
    agentId: string,
    question: string
  ): Promise<string> {
    const res = await fetch(
      `${MIROFISH_BASE}/api/report/interview`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          agent_ids: [agentId],
          question,
        }),
      }
    );
    return (await res.json()).response;
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Report parsing and comparison

```typescript
// packages/worker/report-parser.ts

export interface ParsedResults {
  // Extracted from full_report.md via LLM or regex
  adoptionSignals: {
    persona: string;           // which persona
    intent: 'strong' | 'moderate' | 'weak' | 'none';
    firstMentionRound: number; // when they first showed interest
    reasoning: string;         // why they did or didn't adopt
  }[];

  objections: {
    category: string;          // 'pricing' | 'trust' | 'switching_cost'
                               //   | 'relevance' | 'competition'
    description: string;
    frequency: number;         // how many agents raised this
    severity: 'blocking' | 'concern' | 'minor';
  }[];

  sentimentOverTime: {
    round: number;
    positive: number;          // count of positive actions
    neutral: number;
    negative: number;
  }[];

  wordOfMouth: {
    shares: number;            // reposts/quotes in simulation
    recommendations: number;   // explicit "try this" actions
    warnings: number;          // "avoid this" actions
  };

  dominantNarrative: string;   // 1-2 sentence summary
  agentQuotes: {
    agentName: string;
    agentRole: string;
    quote: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface ComparisonResult {
  winner: 'A' | 'B' | 'tie';
  winnerLabel: string;
  confidence: 'high' | 'medium' | 'low';

  summary: string;             // 2-3 sentence executive summary

  // Relative metrics — multipliers and counts, never percentages
  metrics: {
    metric: string;            // e.g., "Trial intent signals"
    countA: number;            // raw count from simulation A
    countB: number;            // raw count from simulation B
    multiplier: number;        // countA / countB (or inverse)
    winner: 'A' | 'B' | 'tie';
    label: string;             // e.g., "2.3x more positive signals"
  }[];

  // Per-tier breakdown showing realistic engagement distribution
  tierBreakdown: {
    tier: string;              // 'Non-responders' | 'Skeptics' | etc.
    totalAgents: number;       // how many agents in this tier
    engagedA: number;          // how many engaged under message A
    engagedB: number;          // how many engaged under message B
  }[];

  keyInsight: string;          // the single most surprising finding
  recommendation: string;      // what the PMM should do next
}
```

### How to parse reports

MiroFish reports are markdown. To extract structured data, use a
secondary LLM call (GPT-4o-mini) with the report as context:

```typescript
async function parseReport(
  reportMarkdown: string,
  actionsJsonl: string
): Promise<ParsedResults> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a data extraction assistant. Given a
MiroFish simulation report about a product launch, extract
structured data. Respond ONLY with valid JSON matching the
ParsedResults schema. No markdown, no explanation.

IMPORTANT CONTEXT: The simulation used 25 agents with a
realistic distribution: 9 non-responders, 5 skeptics, 4
passive observers, 3 mild-interest, 2 active evaluators,
2 champions. When categorizing agent responses, map each
agent to their tier based on their persona name and behavior.
Most agents SHOULD show no engagement — this is realistic,
not a failure of the simulation.`
      },
      {
        role: 'user',
        content: `Extract structured results from this simulation
report.\n\nREPORT:\n${reportMarkdown}\n\nACTION LOG (first 200
lines):\n${actionsJsonl.split('\n').slice(0, 200).join('\n')}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## Status page specification

### Page: `/status/[jobId]`

Polled every 3 seconds via `GET /api/status/[jobId]`.

```typescript
interface StatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  currentStage: PipelineStage | null;
  createdAt: string;           // ISO timestamp
  estimatedCompletion: string;  // ISO timestamp (~20 min from creation)
  stageProgress: {
    stage: PipelineStage;
    label: string;             // human-readable
    status: 'pending' | 'active' | 'completed' | 'failed';
    duration?: number;          // seconds elapsed
  }[];
}
```

Stage labels for UI:

```typescript
const STAGE_LABELS: Record<PipelineStage, string> = {
  seed_doc_generation: 'Preparing market context',
  graph_building:      'Building knowledge graph',
  env_setup_a:         'Creating buyer personas (A)',
  simulation_a:        'Simulating market reaction (A)',
  report_a:            'Analyzing results (A)',
  env_setup_b:         'Creating buyer personas (B)',
  simulation_b:        'Simulating market reaction (B)',
  report_b:            'Analyzing results (B)',
  parsing_results:     'Comparing A vs B',
  complete:            'Done!',
};
```

### Status page UX

- Vertical stepper/timeline showing all 10 stages
- Active stage has a pulsing dot and elapsed timer
- Completed stages show green check + duration
- Pending stages are grayed out
- Below the stepper: "We'll email you at [email] when results
  are ready. You can close this tab."
- When status becomes 'completed', auto-redirect to
  `/results/[jobId]` after 2 seconds

---

## Results dashboard specification

### Page: `/results/[jobId]`

Fetches results from `GET /api/results/[jobId]`. This page is
the portfolio showcase piece — it needs to be visually impressive.

### Dashboard sections (top to bottom)

**Important: all results must use RELATIVE framing, not absolute
percentages.** Never show "78% adoption rate" — show "2.3x more
positive signals" or "Message A broke through to 5 more buyer
personas than Message B." The simulation predicts which message
performs better, not the exact conversion rate. Absolute numbers
from a 25-agent simulation are not statistically meaningful.

**0. Credibility disclaimer (top of page, subtle)**
- Small muted text banner: "These results show relative
  performance between your two messages based on 25 simulated
  buyer personas. They predict which message resonates better,
  not exact conversion rates. Think of it as a high-fidelity
  focus group, not a market forecast."

**1. Hero / winner announcement**
- Full-width card with winner message
- "Message A resonated more strongly" or "Too close to call"
  (never "outperformed" with implied precision)
- Confidence level badge (high/medium/low)
- The 2-3 sentence executive summary
- The two messages displayed side by side in styled cards
  with their labels
- The winning card has a subtle glow or "Stronger signal" badge

**2. Adoption velocity chart (Recharts)**
- Line chart, x-axis = simulation round (1-8), y-axis =
  "cumulative positive signals" (NOT "adoption rate")
- Two lines: Message A (blue) and Message B (pink/coral)
- Hover tooltip showing exact values per round
- Visual annotation on the round where the lines diverge most
- Y-axis label: "Positive buyer signals" not "Adoption %"

**3. Persona breakdown table**
- A table or visual grid showing each persona tier:
  Non-responders, Skeptics, Passive observers, Mild interest,
  Active evaluators, Champions
- For each tier: how many agents engaged under A vs B
- This grounds the results in reality — the user can SEE that
  most of the simulated market didn't respond, and the
  comparison is about which message cracked through to the
  reachable segment
- This is the key credibility element of the dashboard

**4. Objection breakdown (horizontal bar chart or heatmap)**
- Categories on y-axis: pricing, trust, switching cost,
  relevance, competition
- Two grouped bars per category: A and B
- Color-coded by severity (blocking = red, concern = amber,
  minor = gray)

**5. Word of mouth comparison**
- Three metric cards side by side: shares, recommendations,
  warnings
- Each card shows A count vs B count with a relative delta
  indicator (e.g., "2.3x more" or "1.5x fewer")
- Do NOT show percentages — show multipliers or raw counts
  with relative comparison
- Icon for each metric type

**6. Agent quotes carousel**
- Horizontal scrollable cards, each showing:
  - Agent name + role + persona tier (e.g., "Skeptic")
  - Quote text (2-3 sentences)
  - Sentiment indicator (positive/negative/neutral badge)
  - Which message they were reacting to (A or B label)
- Include quotes from skeptics and non-responders too — these
  are often the most insightful ("I scrolled right past this
  — nothing about it seemed relevant to my situation")
- 3-4 quotes per message, deliberately including negative ones

**7. Dominant narrative comparison**
- Two cards side by side (A and B)
- Each shows the dominant narrative summary
- Visual indicator showing whether the narrative matches
  the intended positioning or was reframed by the market

**8. Key insight callout**
- Single card with the most surprising/actionable finding
- Recommendation for next steps

**9. Footer**
- "Built by Hayk Kocharyan" with link to LinkedIn
- "Powered by MiroFish" with GitHub link
- "Run another test" button → links back to form
- Share button (copies results URL)

---

## Environment variables

```env
# .env.example

# MiroFish connection
MIROFISH_URL=http://localhost:5001

# Redis (for BullMQ job queue)
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=results@yourdomain.com

# LLM for report parsing (GPT-4o-mini)
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_PATH=./data/db.sqlite
```

---

## MiroFish configuration

MiroFish's own `.env` (inside the mirofish/ directory):

```env
# Use hybrid LLM routing for cost efficiency
LLM_API_KEY=sk-proj-xxxxxxxxxxxx           # OpenAI key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4o-mini

# Secondary LLM for high-volume agent calls
LLM_SECONDARY_API_KEY=AIza...              # Gemini key
LLM_SECONDARY_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_SECONDARY_MODEL_NAME=gemini-2.0-flash

# Zep Cloud for GraphRAG
ZEP_API_KEY=z_xxxxxxxxxxxx
```

---

## Docker Compose (development)

```yaml
# docker-compose.yml

version: '3.8'

services:
  mirofish:
    build:
      context: ./mirofish
      dockerfile: Dockerfile
    ports:
      - "5001:5001"
    env_file:
      - ./mirofish/.env
    volumes:
      - mirofish-data:/app/projects
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: packages/worker/Dockerfile
    env_file:
      - .env
    depends_on:
      - redis
      - mirofish
    restart: unless-stopped

volumes:
  mirofish-data:
```

---

## Design reference files

UI designs are created in Google Stitch (stitch.withgoogle.com)
and exported as .zip archives. Each zip contains HTML, CSS, and
image assets for one screen.

Expected directory structure after unzipping:

```
design-reference/
├── messaging_a_b_predictor/                    # Landing page + input form
│   ├── code.html
│   └── screen.png
├── simulation_status_messaging_a_b_predictor/  # Simulation progress page
│   ├── code.html
│   └── screen.png
├── simulation_results_messaging_a_b_predictor/ # A/B comparison dashboard
│   ├── code.html
│   └── screen.png
└── obsidian_graphite/                          # Design system / theme
    └── DESIGN.md
```

Each folder contains a `code.html` (the HTML+CSS source) and a
`screen.png` (a screenshot of the rendered design). Claude Code
should read the `code.html` files to extract exact colors,
spacing, typography, and Tailwind classes. Use `screen.png` as
a visual reference when the HTML alone is ambiguous.

The `DESIGN.md` file in `obsidian_graphite/` contains the design
system tokens (colors, fonts, spacing) that Stitch used — Claude
Code should read this file first to understand the theme before
implementing any components.

These files are the **visual design target** — Claude Code
should match colors, spacing, typography, and layout from these
files. The functional behavior (form validation, API calls,
polling, state management) comes from this spec.

When the two conflict, the spec wins for behavior and the design
reference wins for appearance.

---

## Implementation order for Claude Code

Build in this exact order. Each step is independently testable.

### Phase 1: Foundation (Day 1)
1. Initialize monorepo with `packages/web`, `packages/worker`,
   `packages/shared`
2. Set up Next.js in `packages/web` with Tailwind
3. Create shared types in `packages/shared/types.ts`
4. Set up SQLite + Drizzle schema in `packages/web/lib/`
5. Implement the seed document generator function
   `packages/web/lib/seed-doc-template.ts`

### Phase 2: Form + submission (Day 1-2)
6. Build `InputForm.tsx` with all fields and validation —
   match visual design from
   `design-reference/messaging_a_b_predictor/code.html`
7. Build the landing page (`app/page.tsx`) with hero + form
8. Implement `POST /api/submit` route (creates job in DB,
   enqueues to Redis)
9. Build status page (`app/status/[jobId]/page.tsx`) with
   polling and stepper UI — match visual design from
   `design-reference/simulation_status_messaging_a_b_predictor/code.html`
10. Implement `GET /api/status/[jobId]` route

### Phase 3: Worker + MiroFish integration (Day 2-3)
11. Implement `mirofish-client.ts` with all API methods
12. Implement `orchestrator.ts` pipeline
13. Implement `report-parser.ts` with LLM extraction
14. Set up BullMQ worker in `packages/worker/index.ts`
15. Test end-to-end with a real MiroFish instance

### Phase 4: Results dashboard (Day 3-4)
16. Build `Dashboard.tsx` with all sub-components — match
    visual design from
    `design-reference/simulation_results_messaging_a_b_predictor/code.html`
17. Build `AdoptionChart.tsx` (Recharts line chart)
18. Build `ObjectionHeatmap.tsx`
19. Build `AgentQuotes.tsx` carousel
20. Build `SentimentComparison.tsx`
21. Implement `GET /api/results/[jobId]` route
22. Wire up results page (`app/results/[jobId]/page.tsx`)

### Phase 5: Email + polish (Day 4)
23. Implement Resend email templates (results ready, error)
24. Add localStorage autosave to form
25. Add meta tags, OG images for sharing results pages
26. Mobile responsive pass on all pages
27. Error boundary and fallback states

---

## Important implementation notes for Claude Code

### API endpoint discovery
The MiroFish API endpoint names and request/response shapes
documented above are based on the DeepWiki documentation and
source code analysis. However, **the actual endpoint paths may
differ slightly from what's documented**. Before building the
mirofish-client.ts, have Claude Code inspect the actual Flask
route registrations:

```bash
# Inside the MiroFish repo, find all route definitions
grep -r "@.*\.route\|@.*\.add_url_rule" backend/ --include="*.py"
```

This will reveal the exact endpoint paths, methods, and
parameter names.

### Simulation configuration
MiroFish's default is 44 agents × 10 rounds. For self-serve
use, reduce to **25 agents × 8 rounds** for faster results
(~12-15 min total for an A/B test instead of ~25 min). The
tradeoff is less emergent complexity, but for messaging
comparison the directional signals are still strong.

If running on a constrained VPS, further reduce to 15 agents ×
5 rounds (~8 min total). The key behavioral patterns still
emerge.

### Concurrency
Run one simulation at a time (BullMQ concurrency = 1). Multiple
simultaneous MiroFish simulations on a single VPS will fight
for RAM and API rate limits. Users' jobs queue sequentially.
Show queue position on the status page.

### Graph reuse
The A/B architecture relies on running two simulations on the
same knowledge graph. Verify that MiroFish supports creating
multiple simulations under one project. If not, create two
separate projects with the same seed doc — the GraphRAG build
will run twice (~7 min penalty) but the results are equivalent.

### Error recovery
MiroFish stages can fail (Zep timeouts, LLM rate limits, OOM).
The orchestrator should:
- Retry each stage up to 2 times with exponential backoff
- On persistent failure, save partial results if available
- Send error email with diagnostic info
- Allow manual re-trigger via admin endpoint

### CORS
MiroFish's Flask backend may not have CORS configured for your
frontend domain. The worker (running on the same host as
MiroFish) calls the API server-side, so CORS doesn't apply to
the simulation pipeline. Only direct browser calls would need
CORS — and there shouldn't be any.  