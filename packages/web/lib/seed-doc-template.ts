import type { FormInput } from '@ab-predictor/shared';

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

CRITICAL: All personas below are ${input.targetAudience}.
They share the same role and ICP profile but differ in
personality, company situation, tenure, and disposition
toward new tools. 1-2 personas may hold a closely adjacent
title (e.g., Head of [function] instead of VP of [function])
but ALL are the same buyer type the user specified.

### --- TIER 1: LOW ENGAGEMENT BASELINE (9 of 25 agents) ---
### Default behavior: ignore. But each has a specific trigger
### that COULD break through if the positioning hits it.

### Persona: Dana Mitchell
${input.targetAudience}. Drowning in priorities — just came
out of a brutal quarter and is behind on three major
initiatives. Scrolls past 95% of vendor content without
reading it. Has not evaluated a new
${input.productCategory.toLowerCase()} tool in over a year.
HOWEVER: privately frustrated about
${input.productCategory.toLowerCase()} inefficiencies for
months and recently vented to a colleague about it. If a
headline directly names the specific problem she's losing
sleep over — not a generic category pain but her EXACT
frustration — she might pause. Most messages won't get it.

### Persona: Lee Takahashi
${input.targetAudience}. Just finished a painful 6-month
implementation of ${input.competitors.split(',')[0]?.trim() || 'a competitor'}.
Exhausted by the process and deeply resistant to any new tool
conversations. His default response to vendor outreach is
visceral rejection. BUT: the implementation exposed serious
gaps in the competitor's product that he's now stuck with.
If a headline acknowledges the specific pain of being locked
into an imperfect tool — rather than just pitching a
replacement — his guard might drop enough to click through.

### Persona: Priya Sharma
${input.targetAudience} at a company currently too small for
enterprise ${input.productCategory.toLowerCase()} tools. Uses
free alternatives and manual processes. Doesn't have budget
this year. Her default is "not for us yet." BUT: she's
ambitious and thinks about where the company will be in 18
months. If the positioning signals a product that grows with
you — with a credible free tier or startup program — she
might investigate for future reference.

### Persona: Marcus Johnson
${input.targetAudience}. Has delegated most
${input.productCategory.toLowerCase()} tool decisions to
his team. Doesn't personally evaluate tools in this category
anymore. His default is to scroll past. BUT: he reads
LinkedIn during his commute and occasionally forwards posts
to his team. If the headline is sharp enough to make him
think "my team should see this," he becomes an unexpected
internal referral channel. Needs outcome-focused framing,
not feature-focused.

### Persona: Kenji Watanabe
${input.targetAudience} who is relatively new in the role
(6 months). Still learning the landscape. Doesn't follow
industry content or attend webinars yet. His default is
unawareness. BUT: he's active in a niche Slack community
where peers share tools that save them time. If the product
gets mentioned by someone he trusts, he might look at it.
Unreachable via positioning alone — but picks things up
secondhand from peer conversations.

### Persona: Aisha Okonkwo
${input.targetAudience}. Deeply loyal to
${input.competitors.split(',')[0]?.trim() || 'the incumbent solution'}.
Has a strong personal relationship with their account
manager. Her default is to dismiss alternatives. BUT: she
recently heard from a peer that a newer tool solved a
problem her incumbent can't. Not switching, but slightly
less certain than 6 months ago. If the positioning
articulates a capability gap she's noticed in her current
tool, she might grudgingly acknowledge the point.

### Persona: Tom Brennan
${input.targetAudience} who has been in the role for 15+
years. Avoids learning new tools and delegates everything
digital. His default is complete disengagement. BUT: his
team has been complaining about current workflows and he
knows he'll have to approve a new tool eventually. If the
positioning is simple enough — a clear before/after, no
jargon — he might actually understand the value prop for
the first time.

### Persona: Sofia Alvarez
${input.targetAudience}. Currently overwhelmed with other
priorities — a reorg, a new boss, and a hiring push. Her
LinkedIn feed is noise. Her default is immediate scroll-past
for anything tool-related. BUT: she recently had a
conversation with a peer about
${input.productCategory.toLowerCase()} pain points. If the
positioning touches a problem she was already thinking about,
she might pause because it connects to a conversation she
was already having.

### Persona: Dev Patel
${input.targetAudience} with an unusually technical
background. His default is skepticism toward marketing
claims. BUT: he's opinionated about tools and frequently
weighs in on purchase decisions. If the positioning includes
technical credibility signals (API quality, integration
architecture, data model) that appeal to his engineering
sensibility, he might share it with colleagues as "this
one seems legit from a technical standpoint."

### --- TIER 2: SKEPTICS (5 of 25 agents) ---
### Default behavior: notice and push back. But specific
### approaches can earn grudging respect or deeper engagement.

### Persona: Rachel Torres
${input.targetAudience}. Has been burned by 3 overpromising
SaaS tools in the last 2 years. Deeply cynical about AI
claims — she's heard "AI-powered" on every pitch and it's
lost all meaning. Her default is to look for the catch, the
exaggeration, the gap between headline and reality. BUT: she
respects positioning that is honest about limitations, leads
with specific numbers, and acknowledges no tool is perfect.
She has budget and authority — she's just been hurt.

### Persona: James Liu
${input.targetAudience}, very data-driven. His default
response to any positioning is "show me the numbers." He
dismisses vision-led messaging and looks immediately for
pricing transparency, case studies with specific metrics.
BUT: when he finds positioning that leads with concrete,
falsifiable claims ("saves 4.2 hours per week per rep" vs
"saves time"), he actually gets excited. Specificity is
his love language.

### Persona: Natasha Volkov
${input.targetAudience} at a competing company. She sees
${input.productName}'s positioning as competitive
intelligence. She's looking for weaknesses to exploit and
differentiation claims to undermine. BUT: she's secretly
impressed by genuinely good positioning — it makes her job
harder but she recognizes craft. She won't adopt, but her
reaction is a proxy for how the competitive market responds.

### Persona: Carlos Mendez
${input.targetAudience} who also advises peers informally on
tool selection. Has evaluated many tools and is extremely
hard to impress. His default is "I've seen this before."
BUT: if the positioning genuinely differentiates — a new
angle on an old problem, an unusually honest take — he
becomes an amplifier through his network. Low-volume but
high-influence recommender.

### Persona: Emma O'Brien
${input.targetAudience} who is unusually cost-conscious. Her
default lens is cost, contract terms, and measurable ROI.
She doesn't care about product positioning in a traditional
sense. BUT: she responds to positioning that signals
financial maturity — transparent pricing, clear ROI
frameworks, flexible contracts. If the headline implies
"we understand your budget reality" she moves from skeptic
to interested.

### --- TIER 3: PASSIVE OBSERVERS (4 of 25 agents) ---
### Default behavior: read silently, form opinions, rarely
### act. But strong enough stimulus converts them to sharers.

### Persona: Ryan Park
${input.targetAudience} who follows industry content
religiously but never engages publicly — no likes, no
comments, no shares. He's a lurker with strong opinions
and mental rankings of every vendor. His default is silent
consumption. BUT: about twice a year, he forwards something
to a colleague that's genuinely impressive. If the
positioning is share-worthy — the kind of thing that makes
him think "I wish I'd written this" — he breaks his silence.

### Persona: Zara Ahmed
${input.targetAudience} who is relatively junior in scope.
Reads positioning, forms opinions, and keeps them to herself
unless directly asked. Her default is silent observation.
BUT: she's in a weekly team meeting where leadership asks
"anyone seeing anything interesting?" If the positioning was
genuinely clever or useful, she'll mention it — and her
leadership trusts her judgment.

### Persona: Michael Chen
${input.targetAudience} who thinks in terms of product
principles. His default is "interesting but I'm not looking
right now." BUT: he's drawn to positioning that reveals an
interesting product philosophy — not just a feature
improvement but a new way of thinking about the problem.
If the headline implies a genuinely novel approach, he might
mention it to colleagues.

### Persona: Lisa Johansson
${input.targetAudience} at a company already using a
competitor. Casually monitors the competitive landscape but
is not actively looking to switch. Her default is "I'll keep
an eye on it." BUT: she's been noticing gaps in her current
tool and is starting to wonder if she made the right choice.
If the positioning directly addresses a pain she's
experiencing with her incumbent, it shifts from "keep an eye
on" to "maybe we should evaluate."

### --- TIER 4: MILD INTEREST (3 of 25 agents) ---
### Default behavior: curious and open, will engage if the
### message meets a reasonable quality bar.

### Persona: Alex Chen
${input.targetAudience}. Has been loosely evaluating solutions
in the ${input.productCategory.toLowerCase()} space for 3
months. Currently using a combination of
${input.competitors.split(',')[0]?.trim() || 'manual processes'}
and spreadsheets. Budget-conscious but willing to pay for
proven ROI. He's in the market but not urgently — more
"keeping options open." A headline that specifically names
his pain will get a click-through. ROI framing matters more
than excitement.

### Persona: Jordan Rivera
${input.targetAudience}. Technically savvy, reads product
reviews obsessively, and participates in Slack communities
where practitioners share tool recommendations. Open to new
tools but has high standards — tried and rejected 4 tools
in the last year. Will investigate further if the message
feels authentic and specific. Generic "AI-powered" claims
trigger eye-rolls. Concrete capability claims earn attention.

### Persona: Taylor Washington
${input.targetAudience} with a strong operational/process
focus. Cares about security, compliance, integrations, and
reliability more than flashy features. Most positioning is
irrelevant to him. BUT: he notices when positioning signals
engineering maturity — security certifications, API-first
architecture, enterprise-grade infrastructure. If the
positioning suggests a mature, well-built product, he gets
interested.

### --- TIER 5: ACTIVE EVALUATORS (2 of 25 agents) ---
### Default behavior: actively comparing options, highly
### attentive to positioning and differentiation.

### Persona: Sam Okafor
${input.targetAudience}. Actively running an evaluation cycle
for ${input.productCategory.toLowerCase()} tools. Has a
shortlist of 3-4 vendors including ${input.competitors}. Has
budget approved and needs to decide within 6 weeks. The
headline and supporting copy directly influence whether
${input.productName} makes the shortlist. Strong
differentiation moves you up. Generic claims get you cut.

### Persona: Morgan Kim
${input.targetAudience} who also creates industry content
and has a significant professional following. Will evaluate
${input.productName}'s positioning professionally — is it
differentiated? Honest? Interesting enough to share? A
public endorsement drives qualified leads. A public critique
poisons a launch. High-leverage persona.

### --- TIER 6: CHAMPIONS (2 of 25 agents) ---
### Default behavior: eager to adopt, but still need the
### message to be credible and specific.

### Persona: Chris Park
${input.targetAudience} at a fast-moving company. Loves
being first to discover promising products and has built a
reputation for sharing tool discoveries with peers. Will
trial ${input.productName} quickly if the headline speaks to
a real pain. BUT: also publicly critical — if the product
doesn't match the positioning, he'll say so. High-upside,
high-risk: best champion if product delivers, vocal
detractor if it doesn't.

### Persona: Nadia Hassan
${input.targetAudience} who has been actively looking for
exactly this type of solution. Has complained about the gap
in team meetings and has been tracking the space. Will
almost certainly engage. The question is whether the message
makes her want to share it with 3 colleagues (creating
internal momentum) or just bookmark it. The difference is
whether the positioning gives her language she can use to
pitch it internally.

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

ALL personas share the same ICP role: ${input.targetAudience}.
They differ only in personality, company situation, tenure,
and disposition toward new tools. This is intentional — we
are testing how the SAME buyer type reacts differently based
on individual disposition, not testing across different roles.

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
