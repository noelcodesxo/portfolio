---
title: How I Built My Own AI Reading Assistant (and Kept Making It Smarter)
description: I was feeling stressed about AI and the tech industry moving so fast, so I made an AI skill that could help me read and learn things fast to not fall behind.
date: 2026-05-15
layout: blog.njk
tags: blog
topics:
  - ai
  - claude
isFeedback: false
feedbackThoughts: Does the blog read well? Can you tell me who you think the target audience is based off it?
---

# How I Built My Own AI Reading Assistant (and Kept Making It Smarter)

Back in December of last year, I found myself stressing out every week. This was due to how fast the tech industry was moving because of AI. I started noticing that my friends (who all work for different companies) were talking about things I hadn't heard of before: slash commands, Lovable, V0, tons of different AI models, and all the new stuff coming out every week. I already used AI at work, but only what my company gives us access to, which is not everything — unlike at companies where you can use almost anything you want. 

So, I decided to create a new habit: read 2–4 hours every Sunday, anything I could find that's interesting and related to the tech industry. Sometimes it's AI (like reading the release notes of the new VS Code version to see changes for GitHub Copilot, or Anthropic docs to learn about how to use Claude Code — which is my favorite to use); other times it's blogs on how to grow your career, postmortems, etc. The point was to do it every Sunday at the exact same time — a new habit that would help me learn and not fall behind in tech.

## I Made an AI Reading Assistant (AI Skill)

The first two weeks, the system looked like this (no AI skill yet):

1. Go through my newsletter subscriptions and search the internet for interesting things.
2. Save anything that seems interesting into a notion page.
3. Read until I got tired or the timer went off.

Two weeks later, I was already playing with Claude Code skills, so I decided to make one to help me with this habit. Initially, I wanted to speed up my understanding of an article or blog post without having to skim it myself. That would save me a couple of minutes. So, I made the skill to accept a URL, then fetch the article and summarize it for me in the following format:

- Core idea (2–3 sentences)
- Target audience (who seems to be the target audience, so I can see if I'm that person)
- Verdict (read, skim, or skip, based on what Claude thinks about the article)

For the next couple of weeks, this is what I had: an AI skill that I would use to summarize the article or blog post before reading them, giving me a summary, target audience, and a verdict I could use to decide whether to read the article or not.

![First iteration of my AI skill](/images/6/article-summarizer-first-iteration.png)

## The Progression of My AI Skill

### Memory and Estimated Scores

The first progression was the summary, core idea, and target audience. That was good for a while. However, I realized I was still doing a lot manually — I'd find the articles myself, invoke the skill to summarize them, take notes on them, and save them in a page to keep track of what I had read. Then it hit me: "OMG, I can edit the skill so that Claude saves the articles I read, along with my notes, and refers to them when giving me estimates on other articles." 

I edited the skill to do that; this is the block I added:

```markdown
## Workflow for saving articles to memory
1. **Take the user's input**, ensuring they specify which article to add to memory and that they provide a rating.
2. **Create the entry** in the Markdown table at /memory/articles.md — come up with a summary of the article by fetching its content and describing what it's about.
```

Besides that, I also made it give me an estimated score for each article. It did this by looking at my history as well as the scores I had given previous articles — it would compare them against the new article I was asking about and give me a rough estimate based on the main topic or idea, and the author (it seemed like it would rate the same author higher by default if I had liked one of their previous blogs).

I kept it like that for a few weeks. I continued reading every weekend; the habit was already established, and I'd wake up every Sunday excited to read!

### User Profile

I started noticing the estimated scores were inconsistent. Sometimes I'd read new types of articles from new authors, and it felt like the model would just compare themes and throw a number at me. One day, I picked an article I didn't like at all — it was all over the place and contained things that weren't related to the topic. In my notes and score for that article, I wrote something like "I didn't like this article because X," and Claude replied: "The user didn't like the article because of X — will keep in mind for next time." However, it didn't write anything to any files!

That's when I realized it would be good to have a user profile that the model can use for estimates and update over time with my likes, dislikes, etc.

This worked really well. To this day, sometimes just by summarizing an article, the model realizes it's all over the place or contains things I don't like, and it tells me. I'm still making the final decision about whether to read it or not, but it helps a lot to see in roughly 10 seconds: "Oh, this article is talking about X and Y, and I don't care for that."

![Reader profile at the moment](/images/6/reader-profile.png)

## The Current Problem

Through the different progressions of my skill, I noticed it kept getting better over time. It would give me better estimates, tell me "skim this article because of Y," or "don't read this article because of Z."

However, there was one more issue I found a few weeks ago: neither I nor the model had a solid foundation for the estimate — it was basically just a random number. I needed something that my skill and I could both use when scoring or rating an article. We needed an evaluation system! I don't recall ever doing something like this, so I went to Claude and asked it to explain what an evaluation system is, what its components are, and what separates a good one from a bad one. Then I went through a few articles and Google searches.

I learned the following:

- An evaluation or rating system is one that takes an input and produces a judgment about its quality. In my case, the input is an article or blog post, and the output is a structured score.
- An evaluation system has the following components: criteria, rubric, scale, weights, aggregation method, and the rater.
- What separates a good one from a bad one is how well the components are defined. Without well-defined criteria and rubrics, the whole thing falls apart. It's a system where every component needs to be defined correctly.

## The Evaluation System I Came Up With

### Overview of an evaluation system

**1. Criteria** — The dimensions you're evaluating. These are the *what*. Examples: clarity, accuracy, originality, depth, relevance. Every scoring system starts here.

**2. Rubric** — The *how* of measurement. For each criterion, what does a 1 look like vs. a 3 vs. a 5? Without this, two people rating the same article will land on different scores for different reasons.

**3. Scale** — The range of possible scores per criterion (1–3, 1–5, 1–10). Simpler is usually better.

**4. Weights** — How much each criterion contributes to the final score. If accuracy matters twice as much as formatting, that should be reflected mathematically.

**5. Aggregation method** — How individual criterion scores roll up into a final score. Usually a weighted average, but sometimes you want a minimum threshold (e.g., an article automatically fails if accuracy is below a 2, regardless of other scores).

**6. The rater** — Who or what is actually doing the scoring: a human, an LLM, a rules-based system, or some combination.

### Defining my Scoring System

### Criteria

The dimensions I care about for evaluating the articles I read are:

- **Insightful** — Does it teach something meaningful or change your thinking?
- **Clarity** — Is the writing easy to follow?
- **Depth of subject** — Given the article's stated scope, does it explore the subject thoroughly?
- **Examples** — If it contains examples, are they clear and relevant?
- **Applicable to my life and goals** — Based on my reader profile (interests, goals, personal context), is this something I can apply to my life, or is it at least related to my goals?

### Rubric and Scale

- **Insightful:**
    1. No clear point or argument; nothing to take away.
    2. Makes a point, but it's obvious or something I already know.
    3. Teaches something real, but it's widely available and explained in the standard way.
    4. Familiar topic, but explained in a way that genuinely changes how I see it.
    5. Original thinking or findings I couldn't easily get elsewhere. Changes how I see or approach the subject.
- **Clarity:**
    1. Bad writing AND bad structure.
    2. Bad writing OR bad structure.
    3. Clear writing with good structure, but has fluff.
    4. Writing is precise and efficient; no fluff. Every sentence has earned its place.
    5. Structure and writing make complex things feel simple and memorable. May contain examples that aid the reader.
- **Depth of subject:**
    1. Writing describes what something is without exploring why or how. (Shallow)
    2. Goes somewhat beyond the surface but fails to make strong statements or points.
    3. Explores the subject with supporting material (other articles, books, studies).
    4. Analyzes rather than just exploring. Examines tradeoffs, challenges, and common assumptions.
    5. Synthesizes ideas and resources into something cohesive. Leaves you with a fuller mental model than where you started.
- **Examples:**
    1. No examples, and the content would have benefited from them.
    2. Examples that feel confusing or are unrelated to the topic.
    3. Real-life examples that are easy to follow.
- **Applicable to life and goals:**
    1. No meaningful connection to my current interests or goals.
    2. Touches on a relevant interest or goal but is too general or surface-level to be actionable.
    3. Directly relevant to a current goal or interest and gives you something concrete to think about or act on.

### Weights

I read every day, and I've stopped limiting myself to things I think I'll enjoy. I'm opening my mind to read broadly and then decide whether to continue. However, for this specific skill, I do want to be deliberate about the weights — because I use it specifically for learning things I can apply to my life and career.

That led me to the following weights:

- Insightful: 30%
- Clarity: 15%
- Depth of subject: 20%
- Examples: 10%
- Applicable to life and goals: 25%

### An Example

Here are all the rubrics with their weights and a sample score:

- Insightful (30%): 4 → 0.80 × 0.30 = 0.24
- Clarity (15%): 3 → 0.60 × 0.15 = 0.09
- Depth (20%): 4 → 0.80 × 0.20 = 0.16
- Examples (10%): 2 → 0.60 × 0.10 = 0.06
- Applicable (25%): 3 → 1.00 × 0.25 = 0.25

**Total = 81 out of 100.**

### Aggregation Method

I considered whether I want to reject an article outright if applicability or insightfulness fall below a certain threshold, but for now I'm going to leave it as-is and test it. If I find I want to change this in the near future, I'll do it then.

## Reflections

This is by far my favorite AI skill I've ever built. It's one I developed for my own needs, one I keep refining, and the one I use every single weekend for something that genuinely matters to me.

It's so cool to look back a few months and see how far it's come. I've learned not only how to set up a skill with default permissions (so it doesn't ask me to confirm every tool call), but also how to create a `PreToolUse` hook to log which tools I use and how often, how to build user profiles, and much more. Most recently I spent a whole afternoon learning about and designing an evaluation system.

![PreToolUse Hook example for Claude Code](/images/6/pretooluse-hook.png)

This is what I love about AI — the things you can do with it that are deeply personal. I grew up watching sci-fi movies, and what I want one day is a Jarvis built just for me. This skill is somewhat basic, but it's helped me build a foundation for others I want to create.

I encourage anyone interested in AI to build a skill from scratch — one that helps you do something interesting and personal. That's where (I think) AI really shines.