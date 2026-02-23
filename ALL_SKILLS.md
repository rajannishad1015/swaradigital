# Master Skill Reference — All 13 Skills

> This file teaches an AI all 13 skills in one place.  
> Each skill section is self-contained and ready to activate.

---

## Skill Index

| #   | Skill ID                       | Domain | Purpose                                                      |
| --- | ------------------------------ | ------ | ------------------------------------------------------------ |
| 1   | `seo-audit`                    | SEO    | Full technical + on-page diagnosis with Health Index (0–100) |
| 2   | `seo-authority-builder`        | SEO    | E-E-A-T authority & trust signal analysis                    |
| 3   | `seo-cannibalization-detector` | SEO    | Keyword overlap & content conflict detection                 |
| 4   | `seo-content-auditor`          | SEO    | Content quality scoring with improvement recommendations     |
| 5   | `seo-content-planner`          | SEO    | Topic clusters, outlines & content calendar creation         |
| 6   | `seo-content-refresher`        | SEO    | Content decay detection & freshness updates                  |
| 7   | `seo-content-writer`           | SEO    | Full publish-ready SEO article creation                      |
| 8   | `seo-fundamentals`             | SEO    | Core SEO principles & mental models                          |
| 9   | `seo-keyword-strategist`       | SEO    | Keyword density, LSI & entity mapping                        |
| 10  | `seo-meta-optimizer`           | SEO    | Title tags, meta descriptions & URL optimization             |
| 11  | `seo-snippet-hunter`           | SEO    | Featured snippet & Position Zero formatting                  |
| 12  | `seo-structure-architect`      | SEO    | Header hierarchy, schema markup & internal linking           |
| 13  | `ui-ux-pro-max`                | Design | Full UI/UX design intelligence across 9 stacks               |

---

---

# SKILL 1 — `seo-audit`

**Role:** SEO diagnostic specialist  
**Principle:** Identify, explain, and prioritize SEO issues. Do NOT implement fixes unless explicitly requested. All findings must be evidence-based.

## Scope Gate — Ask First if Missing

1. Business context (site type, primary SEO goal, target markets)
2. SEO focus (full site vs specific pages; technical / on-page / content / all)
3. Data access (Search Console, Analytics, known issues)

State assumptions explicitly if context is missing.

## Audit Framework (Priority Order)

1. **Crawlability & Indexation** — robots.txt, sitemaps, site architecture, crawl efficiency
2. **Technical Foundations** — Core Web Vitals (LCP <2.5s, INP <200ms, CLS <0.1), mobile-friendliness, HTTPS
3. **On-Page Optimization** — title tags, meta descriptions, heading structure, images, internal linking
4. **Content Quality & E-E-A-T** — experience, expertise, authoritativeness, trustworthiness
5. **Authority & Trust Signals** — backlinks, citations, topical focus

## SEO Health Index (0–100)

Weighted composite score:

| Category                  | Weight |
| ------------------------- | ------ |
| Crawlability & Indexation | 30     |
| Technical Foundations     | 25     |
| On-Page Optimization      | 20     |
| Content Quality & E-E-A-T | 15     |
| Authority & Trust Signals | 10     |

**Severity deductions per issue:**

- Critical (blocks crawling/indexing/ranking): −15 to −30
- High impact: −10
- Medium impact: −5
- Low / cosmetic: −1 to −3

**Confidence modifier:** Medium = 50% of deduction · Low = 25% of deduction

**Health Bands:**

| Score  | Status    | Meaning                           |
| ------ | --------- | --------------------------------- |
| 90–100 | Excellent | Minor optimizations only          |
| 75–89  | Good      | Clear improvement areas           |
| 60–74  | Fair      | Meaningful issues limiting growth |
| 40–59  | Poor      | Serious SEO constraints           |
| <40    | Critical  | SEO fundamentally broken          |

## Required Output for Every Finding

- **Issue** — concise description (no solution)
- **Category** — one of the 5 audit categories
- **Evidence** — objective proof (URLs, reports, metrics)
- **Severity** — Critical / High / Medium / Low
- **Confidence** — High / Medium / Low
- **Why It Matters** — plain-language SEO impact
- **Score Impact** — deduction before weighting
- **Recommendation** — what to fix (no implementation steps unless requested)

## Prioritized Action Plan

1. Critical Blockers
2. High-Impact Improvements
3. Quick Wins
4. Longer-Term Opportunities

**Key axiom:** Technical SEO enables ranking; content quality earns it.

---

---

# SKILL 2 — `seo-authority-builder`

**Role:** E-E-A-T specialist  
**Use proactively for YMYL topics.**

## E-E-A-T Framework

| Pillar         | Key Signals                                                               |
| -------------- | ------------------------------------------------------------------------- |
| **Experience** | First-hand examples, case studies, original research, process docs        |
| **Expertise**  | Author credentials, technical depth, industry terminology, expert quotes  |
| **Authority**  | External links, brand citations, industry recognition, published research |
| **Trust**      | Contact info, privacy policy, SSL, reviews, editorial guidelines          |

## Approach

1. Analyze content for existing E-E-A-T signals
2. Identify missing authority indicators
3. Suggest author credential additions
4. Recommend trust elements
5. Assess topical coverage depth
6. Propose expertise demonstrations
7. Recommend schema markup

## Output Format

```
Current Score: X/10
Target Score: Y/10

Priority Actions:
1. Add detailed author bios with credentials
2. Include case studies showing experience
3. Add trust badges and certifications
4. Create topic cluster around [subject]
5. Implement Organization schema
```

## Deliverables

- E-E-A-T audit scorecard
- Author bio templates
- Trust signal checklist
- Topical authority map
- Citation strategy
- Schema markup recommendations (Organization, Person, Article)

---

---

# SKILL 3 — `seo-cannibalization-detector`

**Role:** Keyword cannibalization specialist  
**Use proactively when reviewing similar content.**

## Cannibalization Types

| Type                   | Examples                                                |
| ---------------------- | ------------------------------------------------------- |
| **Title/Meta Overlap** | Same target keywords, duplicate meta descriptions       |
| **Content Overlap**    | Same topic, duplicate sections, identical search intent |
| **Structural Issues**  | Identical header patterns, same content depth           |

## Approach

1. Analyze keywords across all provided pages
2. Identify topic & keyword overlap
3. Compare search intent targets
4. Estimate content similarity
5. Find differentiation opportunities
6. Recommend consolidation or rewriting

## Report Format

```
Conflict: [Keyword]
Competing Pages:
- Page A: [URL] | Ranking: #X
- Page B: [URL] | Ranking: #Y

Resolution Strategy:
□ Consolidate into single authoritative page
□ Differentiate with unique angles
□ Implement canonical to primary
□ Adjust internal linking
```

## Deliverables

- Keyword overlap matrix
- Search intent analysis per page
- Resolution priority list
- Canonical & redirect guide
- Internal link cleanup plan

## Resolution Tactics

- **Merge** — consolidate weak into strong page
- **301 redirect** — kill the weaker page
- **Rewrite** — give each page distinct angle/intent
- **Canonicalize** — signal the preferred URL
- **Hub/spoke** — restructure into topic clusters

---

---

# SKILL 4 — `seo-content-auditor`

**Role:** SEO content auditor  
**Use proactively for content review.**

## What I Analyze

| Area                 | What I Check                                      |
| -------------------- | ------------------------------------------------- |
| Content Depth        | Completeness, missing subtopics                   |
| E-E-A-T Signals      | Author credentials, data/citations, expertise     |
| Readability          | Paragraph length, reading level, clarity          |
| Keyword Optimization | Density, distribution, semantic relevance         |
| Structure            | Heading hierarchy, internal linking opportunities |
| Trust Indicators     | Social proof, citations, unique value             |

## What I Cannot Do

- Check actual SERP rankings
- Access competitor content not provided
- Pull search volume data
- Verify technical SEO metrics or engagement stats

## Output Format

| Category             | Score | Issues Found      | Recommendations     |
| -------------------- | ----- | ----------------- | ------------------- |
| Content Depth        | X/10  | Missing subtopics | Add sections on...  |
| E-E-A-T Signals      | X/10  | No author bio     | Include credentials |
| Readability          | X/10  | Long paragraphs   | Break into chunks   |
| Keyword Optimization | X/10  | Low density       | Natural integration |

## Deliverables

- Overall content quality score (1–10)
- Specific improvement recommendations
- Missing topic suggestions
- Structure optimization advice
- Trust signal opportunities

---

---

# SKILL 5 — `seo-content-planner`

**Role:** SEO content strategist  
**Use proactively for content strategy and planning.**

## Planning Framework

**Content Outline Structure:**

- Main topic, angle & target audience
- Search intent (Informational / Commercial / Transactional)
- Primary + secondary keyword mapping
- Detailed section breakdown with word count targets
- Internal linking opportunities

**Topic Cluster Components:**

| Type                  | Purpose                           |
| --------------------- | --------------------------------- |
| Pillar page           | Comprehensive guide on core topic |
| Supporting articles   | Subtopic deep-dives               |
| FAQ / Glossary        | Quick-answer content              |
| How-to guides         | Step-by-step practical content    |
| Case studies          | Experience & proof                |
| Comparison content    | X vs Y pages                      |
| Tool / Resource pages | High-value reference content      |

## Outline Output Format

```
Title: [Main Topic]
Intent: [Informational/Commercial/Transactional]
Word Count: [Target]

I. Introduction (Hook → Value Prop → Overview)
II. Main Section 1
    A. Subtopic | B. Subtopic
III. Main Section 2 ...
```

## Deliverables

- Detailed content outline
- Topic cluster map
- Keyword targeting plan
- 30–60 day content calendar (week-by-week)
- Internal linking blueprint
- Content format recommendations
- Priority scoring per topic

---

---

# SKILL 6 — `seo-content-refresher`

**Role:** Content freshness specialist  
**Use proactively for older content.**

## Staleness Thresholds

| Element                 | Flag When                |
| ----------------------- | ------------------------ |
| Statistics & data       | Older than 2 years       |
| Examples & case studies | Older than 3 years       |
| Dates in titles         | Any stale year reference |
| Terminology             | Dated industry language  |
| Links & references      | Expired or changed       |

## Refresh Priority Matrix

| Priority               | Trigger                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| 🔴 High (Immediate)    | Pages losing 3+ ranking positions, outdated info, declining high-traffic pages |
| 🟡 Medium (This Month) | Stagnant rankings 6+ months, missing current trends                            |
| 🟢 Low                 | Minor cosmetic date refs, low-traffic stable pages                             |

## Output Format

```
Page: [URL]
Last Updated: [Date]
Priority: High / Medium / Low
Refresh Actions:
- Update statistics from [old year] → [current year]
- Add section on [new trend]
- Refresh examples with current ones
- Update meta title with current year
```

## Deliverables

- Content decay analysis
- Prioritized refresh queue
- Per-page update checklist
- New section recommendations
- Publishing calendar for refreshes

## Freshness Signals to Recommend

- Updated `dateModified` in schema
- New internal links pointing to refreshed content
- New multimedia additions
- Fresh expert quotes (E-E-A-T boost)
- Social resharing triggers

---

---

# SKILL 7 — `seo-content-writer`

**Role:** SEO content writer  
**Use proactively for content creation tasks.**

## Content Creation Framework

| Section          | Guidelines                                                                       |
| ---------------- | -------------------------------------------------------------------------------- |
| **Introduction** | 50–100 words · Hook + primary keyword + value prop                               |
| **Body**         | Comprehensive coverage · H2/H3 subheadings · data + examples · semantic keywords |
| **Conclusion**   | Key point summary + clear CTA                                                    |

## Quality Standards

- **Keyword density:** 0.5–1.5% (natural, not forced)
- **Reading level:** Grade 8–10
- **Paragraphs:** 2–3 sentences max
- **Format:** Bullet points & headers for scannability
- **E-E-A-T baked in:** First-hand examples, cited data, expert perspective

## Full Content Package Output

- Complete article at target word count
- 3–5 title variations
- Meta description (150–160 chars)
- Key takeaways / summary points
- Internal linking suggestions
- FAQ section (where applicable)

## E-E-A-T Elements Included

- First-hand experience mentions
- Specific examples & case references
- Data & statistics with citations
- Practical, actionable advice

**Principle:** Write for humans first. Optimize for search engines second.

---

---

# SKILL 8 — `seo-fundamentals`

**Role:** Foundational SEO knowledge layer — explains _why_ SEO works.

## 1. E-E-A-T

Not a direct ranking factor — a **quality evaluation framework**, especially critical for YMYL topics.

| Dimension         | Represents                | Common Signals                      |
| ----------------- | ------------------------- | ----------------------------------- |
| Experience        | First-hand involvement    | Original examples, lived experience |
| Expertise         | Subject-matter competence | Credentials, depth, accuracy        |
| Authoritativeness | Recognition by others     | Mentions, citations, links          |
| Trustworthiness   | Reliability and safety    | HTTPS, transparency, accuracy       |

## 2. Core Web Vitals

Measure user experience, not ranking merit. Failing CWV can hold back otherwise good pages.

| Metric | Target  | Reflects            |
| ------ | ------- | ------------------- |
| LCP    | < 2.5s  | Loading performance |
| INP    | < 200ms | Interactivity       |
| CLS    | < 0.1   | Visual stability    |

## 3. Relative Factor Weight

| Weight   | Factor                      |
| -------- | --------------------------- |
| Highest  | Content relevance & quality |
| High     | Authority & trust signals   |
| Medium   | Page experience (CWV, UX)   |
| Medium   | Mobile optimization         |
| Baseline | Technical accessibility     |

## 4. AI Content

Search engines evaluate **output quality**, not authorship method.

- ✅ AI as drafting/research assistant + human review
- ❌ Unedited AI output, hallucinations, keyword-stuffed thin content

## 5. Structured Data

Helps engines understand **meaning** — doesn't boost rankings directly. Enables eligibility for rich results.

**Core axiom:** _Technical SEO enables ranking; content quality earns it. Sustainable SEO = useful content + technical clarity + trust over time._

---

---

# SKILL 9 — `seo-keyword-strategist`

**Role:** Keyword strategist  
**Use proactively for content optimization.**

## Keyword Density Guidelines

| Type                      | Target                          |
| ------------------------- | ------------------------------- |
| Primary keyword           | 0.5–1.5%                        |
| Secondary keywords        | 3–5 targets                     |
| LSI / semantic variations | Natural distribution throughout |

Over-optimization (keyword stuffing) is flagged and must be corrected.

## What I Analyze

- Extract current keyword usage & calculate density
- Identify entities and related concepts
- Determine search intent from content type
- Flag over-optimization warnings

## Output Package

```
Primary: [keyword] (0.8% density, 12 uses)
Secondary: [keywords] (3-5 targets)
LSI Keywords: [20-30 semantic variations]
Entities: [related concepts to include]
```

## Deliverables

- Keyword density analysis
- Entity & concept mapping
- 20–30 LSI keyword suggestions
- Search intent assessment
- Keyword placement recommendations
- Over-optimization warnings

## Advanced Features

- **PAA** — question-based keyword opportunities
- **Voice search** — conversational term suggestions
- **Featured snippet** — format & phrasing opportunities
- **Keyword clustering** — topic hub structuring

---

---

# SKILL 10 — `seo-meta-optimizer`

**Role:** Meta tag optimization specialist  
**Use proactively for new content.**

## Optimization Rules

**URLs:**

- Max 60 characters · lowercase · hyphens only
- Primary keyword placed early · stop words removed

**Title Tags:**

- 50–60 characters optimal
- Primary keyword in first 30 characters
- Emotional triggers & power words
- Numbers/year for freshness signals

**Meta Descriptions:**

- 150–160 characters optimal
- Primary + secondary keywords naturally integrated
- Action verbs, user benefits, clear CTA
- Special characters for SERP visibility (✓ ★ →)

## Output Format

```
URL: /optimized-url-slug
Title: Primary Keyword – Compelling Hook | Brand (55 chars)
Description: Action verb + benefit + keyword. Clear CTA. ✓ (155 chars)
```

## Deliverables

- Character count validation per element
- 3–5 A/B test variations per title/description
- Power word & emotional trigger suggestions
- Schema markup recommendations
- Platform setup (WordPress: Yoast/RankMath · Next.js/Astro: metadata component)

---

---

# SKILL 11 — `seo-snippet-hunter`

**Role:** Featured snippet optimization specialist  
**Use proactively for question-based content.**

## Snippet Types

| Type          | Format Rules                                                      |
| ------------- | ----------------------------------------------------------------- |
| **Paragraph** | 40–60 words · direct answer in opening sentence · question header |
| **List**      | 5–8 numbered steps or bullets · clear header before list          |
| **Table**     | Comparison data · specs · clean formatting                        |

## Output Format

```markdown
## [Exact Question from SERP]

[40-60 word direct answer with keyword in first sentence.
Clear, definitive response that fully answers the query.]

### Supporting Details:

- Point 1 (enriching context)
- Point 2 (related entity)
- Point 3 (additional value)
```

## Deliverables

- Snippet-optimized content blocks (all 3 formats)
- PAA question/answer pairs
- Format recommendation (paragraph / list / table)
- Schema markup — `FAQPage`, `HowTo`
- Content placement strategy

## Advanced Tactics

- Jump links for long-form content
- FAQ sections for PAA dominance
- Comparison tables for product pages
- Video timestamps for video snippets
- Voice search optimization (conversational phrasing)

---

---

# SKILL 12 — `seo-structure-architect`

**Role:** Content structure specialist  
**Use proactively for content structuring.**

## Header Tag Best Practices

- **One H1** per page matching the main topic
- **H2s** for major sections with keyword variations
- **H3s** for subsections with LSI/related terms
- Strict logical hierarchy — never skip levels

## Structure Blueprint

```
H1: Primary Keyword Focus
├── H2: Major Section (Secondary KW)
│   ├── H3: Subsection (LSI term)
│   └── H3: Subsection (Entity)
└── H2: Major Section (Related KW)
```

## Schema Priority

| Priority  | Schema Types                                    |
| --------- | ----------------------------------------------- |
| 🔴 High   | `Article`, `FAQPage`, `HowTo`, `BreadcrumbList` |
| 🟡 Medium | `Organization`, `LocalBusiness`, `Review`       |

## Deliverables

- Header hierarchy outline
- Silo/cluster map visualization
- Internal linking matrix
- Schema markup in JSON-LD (ready to implement)
- Breadcrumb implementation
- Table of contents + jump links
- URL structure recommendations

## Siloing Strategy

Creates topical theme clusters with parent/child URL relationships and contextual internal links. Cross-links only when highly relevant.

---

---

# SKILL 13 — `ui-ux-pro-max`

**Role:** Comprehensive UI/UX design intelligence  
**Scope:** 50+ styles · 97 color palettes · 57 font pairings · 99 UX guidelines · 25 chart types · 9 stacks

## Priority Hierarchy

| Priority | Category            | Impact      |
| -------- | ------------------- | ----------- |
| 1        | Accessibility       | 🔴 CRITICAL |
| 2        | Touch & Interaction | 🔴 CRITICAL |
| 3        | Performance         | 🟠 HIGH     |
| 4        | Layout & Responsive | 🟠 HIGH     |
| 5        | Typography & Color  | 🟡 MEDIUM   |
| 6        | Animation           | 🟡 MEDIUM   |
| 7        | Style Selection     | 🟡 MEDIUM   |
| 8        | Charts & Data       | 🟢 LOW      |

## Critical Rules

| Rule                | ✅ Do                                      | ❌ Don't                               |
| ------------------- | ------------------------------------------ | -------------------------------------- |
| Icons               | SVG (Heroicons/Lucide)                     | Emojis as UI icons                     |
| Cursor              | `cursor-pointer` on all clickable elements | Default cursor on interactive elements |
| Transitions         | 150–300ms smooth                           | Instant or >500ms                      |
| Light mode text     | `#0F172A` (slate-900) minimum              | Gray-400 or lighter                    |
| Touch targets       | Min 44×44px                                | Smaller tap areas                      |
| Contrast            | 4.5:1 minimum ratio                        | Low contrast text                      |
| Glass cards (light) | `bg-white/80` or higher                    | `bg-white/10` (too transparent)        |
| Navbar              | `top-4 left-4 right-4` floating            | Stuck to edge `top-0`                  |

## Key Accessibility Rules

- Minimum 4.5:1 color contrast ratio for normal text
- Visible focus rings on all interactive elements
- Descriptive alt text for meaningful images
- `aria-label` on icon-only buttons
- Tab order matches visual order
- Form inputs have associated labels

## Key Interaction Rules

- Disable buttons during async operations
- Clear error messages near the problem field
- `cursor-pointer` on all clickable elements
- `prefers-reduced-motion` respected for animations

## Supported Stacks

`html-tailwind` (default) · `react` · `nextjs` · `vue` · `svelte` · `swiftui` · `react-native` · `flutter` · `shadcn`

## Workflow

1. **Analyze** — product type, style keywords, industry, stack
2. **Generate design system** — style + color + typography + effects
3. **Supplement** — domain-specific searches (UX, charts, typography)
4. **Apply stack guidelines** — implementation-specific best practices

## Pre-Delivery Checklist

### Visual Quality

- [ ] No emojis used as icons
- [ ] All icons from consistent set (Heroicons/Lucide)
- [ ] Hover states don't cause layout shift

### Interaction

- [ ] All clickable elements have `cursor-pointer`
- [ ] Transitions are smooth (150–300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode

- [ ] Light mode text has sufficient contrast (4.5:1 min)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes

### Layout

- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px · 768px · 1024px · 1440px
- [ ] No horizontal scroll on mobile

### Accessibility

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected

---

## How to Activate a Skill

When a user request matches a skill's domain:

1. **Identify** the relevant skill(s) from the index above
2. **Apply** the corresponding framework, approach, and output format
3. **Combine** multiple skills when the task spans domains (e.g., use `seo-content-writer` + `seo-meta-optimizer` + `seo-snippet-hunter` together for a full content creation task)
4. **Use `seo-fundamentals`** as the underlying mental model for all SEO decisions

---

_Master skill file — 13 skills combined. Last updated: February 2026._
