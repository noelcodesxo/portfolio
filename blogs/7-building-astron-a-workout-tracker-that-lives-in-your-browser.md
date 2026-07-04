---
title: Building Astron, a Workout Tracker That Lives in Your Browser
description: I built Astron, a workout tracker that behaves like a native app but lives entirely in your browser — here's why I made it, how I designed it, and the stack behind it (FastAPI, SQLModel, Supabase, Alembic).
layout: blog.njk
tags: blog
topics:
  - engineering
  - python
  - supabase
isFeedback: true
feedbackThoughts: Does the motivation section make you care about why I built this? Does the technical section drag anywhere, and is there too much/too little depth on any one part (FastAPI, Supabase, migrations)?
---

# Building Astron — a Workout Tracker That Lives in Your Browser

## Intro

Over the past three weeks, I built Astron, a workout tracker that behaves like a native app but lives entirely in your browser. In this post, I'll walk through what pushed me to build it, how I approached the design, the implementation details (tech stack, auth, migrations, and all), what I learned along the way, and where I'm taking it next.

Astron is live at [useastron.com](https://www.useastron.com) — I've been testing it with a few friends (huge s/o to Mike, Thomas and Jasmine) and would genuinely love your feedback too.

**Contents**

- [Motivations](#motivations)
- [Thinking through app design](#thinking-through-app-design)
  - [Data](#data)
  - [Server](#server)
  - [Frontend](#frontend)
  - [CI/CD](#cicd)
  - [The whole system](#the-whole-system)
- [In the trenches (what happened during build time)](#in-the-trenches-what-happened-during-build-time)
  - [FastAPI and endpoints](#fastapi-and-endpoints)
  - [Supabase](#supabase)
  - [Data migrations using Alembic](#data-migrations-using-alembic)
- [Next steps](#next-steps)
  - [Use data to find personal records (PRs) and patterns](#use-data-to-find-personal-records-prs-and-patterns)
  - [Data replication to not lose users data](#data-replication-to-not-lose-users-data)
  - [OAuth Social authentication with Google and Apple](#oauth-social-authentication-with-google-and-apple)
  - [Voice feature to not have to enter stuff manually](#voice-feature-to-not-have-to-enter-stuff-manually)
  - [Share feature (that I'm excited about)](#share-feature-that-im-excited-about)

## Motivations

I've been working out on and off for most of my life. The past couple of years I got more and more into it (especially calisthenics) and for the past 2-3 years, this is how I logged my workouts (Google notes):

![Old workout notes, screenshot 1](/images/7/old-workout-notes-1.png)

![Old workout notes, screenshot 2](/images/7/old-workout-notes-2.png)

This was easy enough to do (which is why I kept doing it for so long). I'd just open my notes app and log whatever I was doing. But as I progressed and my goals grew, things got difficult. For example, I'd think to myself "How much did I squat last week?" so I could add more weight — to find out I had to scroll a wall of text to find that one entry. Other questions I couldn't easily answer:

- "What was my longest handstand this month?"
- "This is a PR, but what was the one before?"
- Have I been progressing like I want (5lbs+ per week on squats)?

Some of you might be thinking: why not use an existing app? Why bother making something? The truth is, I did try a ton of apps before I decided to make this one. In fact, these are some of the apps I tried and why I didn't like them:

| Application | Reasons why I didn't like it |
|---|---|
| Fit Notes | Ugly design imo, feels old. Was trying to charge me $6.99 to be able to enter time, for example if I wanted to enter "HS hold for 10s" |
| Strong | Insta account requirement. Didn't want an app |
| Gymbro workout tracker gym log | This one had potential but I didn't like having to choose a primary muscle and I believe I wasn't able to create new ones or something like that. I also did not like the design and I couldn't specify a time-range for an exercise (I need that for isometric exercises such as front lever, back lever, etc) |
| JetFit | Couldn't even test it without making an account |

After going through all of those and not being happy with a single one, I decided to build my own. I want it to have these features:

- Extremely low friction to try — jump in, test it, leave if you don't like it.
- No profile creation requirement — this isn't an app that generates workouts for you; it's for people who already have a routine and just need somewhere to track it.
- No app install requirement.
- Good UX, built around actually creating routines and logging workouts.
- Free — no ads, only pay for actual features that provide real value, which the app does not have at the moment.

## Thinking through app design

### Data

With the motivations in place, it was time to design the schema. It's relational (Postgres, of course), and intentionally simple:

![Astron database schema](/images/7/db-schema.png)

- A routine defines its own set of routine-exercises and belongs to a user.
- Exercises are global rather than per-user. I didn't see the point of 10 users each defining "pull ups" separately. The trade-off is that deleting an exercise affects everyone — so exercises are only ever disabled, never fully removed.
- A workout can be started from a routine (which loads all its exercises automatically) or as a free workout, where the user enters any exercise and sets/reps on the fly.
- Each user can see and manage their own routines and exercises.

I used Supabase for both the database and authentication, and it's honestly become one of my favorite tools this year — more on why in the auth section below.

### Server

Python's been growing on me for a while, and I wanted to actually master it rather than keep using it "here and there." I built most of the server by hand — reading FastAPI's docs directly and working through the fundamentals myself — up through data modeling and endpoints. When I got to setting up server-side authorization, I started using Claude Code (I call it Claudy :p) to move faster, and did the same later on for parts of the migrations work while refining the schema.

Here are the libraries I used:

- FastAPI for the API layer.
- SQLModel to bridge Pydantic data objects and Postgres tables in a single model definition.
- Pydantic for data validation and parsing.
- Alembic for schema migrations.

### Frontend

I went with Next.js for a couple of reasons. First, practical: I already host most of my projects on Vercel, and deploying both frontend and backend there (via Vercel Functions) meant one provider for deployments. Second, technical: since almost everything (workouts, routines, exercises) needed to be loaded from the server, I wanted a React-based framework. I was also new to Supabase, and Vercel's docs on connecting Next.js and Supabase made that integration easy.

### CI/CD

I'd read about GitHub Actions but never used them, so this felt like a good time to learn it. My goal: every PR triggers a CI build, and the PR can't merge until it passes. I had that working in just over an hour (not bad for someone who never did it, and doing it all by hand lol)

### The whole system

Zoomed out, here's the full stack:

- Python.
- Next.js.
- GitHub Actions.
- Docker, for local development.
- Supabase CLI, to run Supabase's services locally during dev instead of testing against production.
- Resend, as the SMTP provider for auth emails.

What I wanted from this setup:

- Fast local iteration — see changes immediately.
- The ability to work on one feature at a time, with CI catching failing tests and blocking a PR before it can break the app.
- A local Supabase environment where I could actually understand how the system works under the hood — how email templates are configured, how auth flows behave.

## In the trenches (what happened during build time)

I'm sharing some of the pieces that were interesting or fun to work through. Worth noting: I work primarily in Java, so Python is still new stuff for me — mastering it is very much the goal.

### FastAPI and endpoints

Once the models were in place, I mapped out the endpoints I'd need and started building with FastAPI. One thing I really like about FastAPI is how easily it lets you define parameters, security schemas, and object dependencies together.

For example, here's an endpoint (`post_workout`) to create a workout. Conceptually, it needs a database session, the user the workout belongs to, the workout data itself, and a JWT to authorize that user. But notice that the function signature only takes `workout` directly — `service` is a dependency that resolves the session, the current user, and the JWT authorization automatically:

```python
def get_workout_service(
    session: Annotated[Session, Depends(get_session)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> WorkoutService: return WorkoutService(session, user.id)

WorkoutServiceDep = Annotated[WorkoutService, Depends(get_workout_service)]

@router.post("/")
def post_workout(workout: WorkoutCreate, service: WorkoutServiceDep):
    result = service.create_workout(workout)
    if result is None:
        raise HTTPException(status_code=500, detail="Could not create workout")
    return result
```

Thanks to FastAPI, the `post_workout` endpoint only takes `workout: WorkoutCreate` as its body parameter, so the expected JSON is just:

```json
{
  "workout_type": "pull",
  "workout_start_time": "2026-07-01T18:21:12.013Z",
  "routine_id": 0
}
```

`service` never shows up in that payload (it's resolved as a dependency, not passed in by the client). That's the part I love about FastAPI's pattern: without dependency injection, I'd have to manually construct the service, session, and resolve and authorize the user inside every endpoint that needs them. This way, I declare each dependency once and reuse it anywhere.

### Supabase

This is the tool I completely fell in love with on this project. I'd heard tons of people talk about it for a while and always wondered what the fuss was about (now I get it!).

Signing in and spinning up a project took less than five minutes, and I had a working database ready to connect to. The UI is clean, and things literally just work. That made me curious about what's actually happening under the hood:

- Where does my database actually run?
- How do the different connection types work?
- Could I replicate this myself, and get it for free?

#### Supabase database connections

Turns out that when you launch a Supabase project, they spin up an EC2 instance running Postgres behind it. I wouldn't be able to just spin up an EC2 instance myself on the free tier — AWS gives you more raw compute to work with directly, but once you cross the free-tier usage limits, you're paying regardless.

Supabase offers two connection types: burst connections (for Lambda-style compute) and long-lived connections (for always-on apps like ECS or Kubernetes). This is important because with the API in Vercel Functions, you could at any time spin up 50 (or more) Vercel Functions simultaneously, if you were using long-lived connections, you'd be opening and closing 50 separate connections in the span of a few seconds. Postgres (and most database engines) just isn't built to handle that kind of churn, and it goes through slow HTTP overhead each time. Burst connections solve this with a pooled set of long-lived connections underneath, handing one out whenever you need it and reclaiming it after (no manual open/close required).

#### Supabase CLI

The Supabase CLI made it easy to run all the services (Postgres, dashboard, auth service, and mail server) all through `docker compose`. I set environment variables for both frontend and backend to point at the local Supabase services and ran everything from there.

One thing that tripped me up: setting up an email template locally hit a [Supabase CLI bug](https://github.com/supabase/cli/issues/5124) (which has been there for about 3 years). The docs say to use relative paths for email templates, but that only works for `auth.email.template.*` templates. For `auth.email.notification.*` templates (which is what my auth flow uses) you need an absolute path instead. It's an annoying thing in how their config resolves paths. Not annoying enough for me to dig into a fix, and the issue looks closed on their end, so I'm not even sure if it's actually a bug.

#### Supabase authentication and issues with magic link

My original plan for auth was as frictionless as possible: no password, just a link emailed to you. Except a few early testers (shoutout to Thomas, Mike and Jasmine) hit a weird bug — the _first_ magic link they received wouldn't authenticate them, but every link after that worked fine.

I couldn't reproduce it locally. Digging into it, I found this has been a [known issue for years](https://www.reddit.com/r/Supabase/comments/16cj0ks/users_complaining_about_magic_link_issues/): some email providers automatically scan incoming links to check for malicious content, and that scan itself "opens" and expires the link before the user ever clicks it themselves.

The fix I saw many people do is ditching magic links for a one-time password (OTP) (still email-based, but the user enters a code instead of clicking a link). I didn't love adding that extra step, but for now, it's what works. Google and Apple sign-in are next on my list, which should get auth down to a single click for users who want to sign in with Google and Apple.

#### Supabase email limits and how I got over that

Something else I didn't catch upfront: Supabase's free tier caps you at 2 emails per hour. Since my auth flow depends on email notifications, that limit wasn't workable, so I set up a dedicated SMTP provider to handle sending. I landed on [Resend](https://resend.com/), which has a generous free tier — 100 emails/day — with pay-as-you-go available if I need to scale past that.

### Data migrations using Alembic

I was surprised to find that SQLModel doesn't handle migrations at all (seems like it came out a couple years ago, and their docs have absolutely nothing on the topic). A quick online search pointed me to Alembic, which most SQLModel/SQLAlchemy users rely on for this.

I wish I'd set up migrations from day one instead of retrofitting them after the schema had already evolved. Here's roughly how that played out:

- **v1** — initial schema, generated by running Alembic against an empty database.
- **v2** — added the columns needed for Supabase auth integration.
- **v3** — added a `completed` flag on individual sets.
- **v4** — switched integer to decimal for sets weight (I completely missed that).

Right now, every schema change means generating a new migration and running it manually. Eventually I'd like to turn this into a CD pipeline with GitHub Actions — I just need to look into whether conditional arguments are possible there.

Overall, Alembic does exactly what it needs to: it's easy to set up, and I really like that it can generate raw SQL offline to verify a migration.

## Next steps

### Use data to find personal records (PRs) and patterns

I want to have a page where people can see their PRs. I am thinking this will be just grabbed from the workout automatically to see all-time PRs, and then 3-6-12 month ones, or something along those lines that I want to refine.

I know not everyone is competitive and some people work out for the health benefits and don't care much about the number. However, there are many people that do care and I am one of those, plus I think everyone could benefit from seeing this and realizing how much they've improved over time. It just makes you feel happy to see your own progress.

### Data replication to not lose users data

At the moment there is no data replication, if something happened to my Supabase database I'd lose everything. I'm planning to fix this as soon as possible. I'm looking into exporting the data and creating backups in S3 maybe? I want to find a cheap option that I can run once a week or month. If anyone has any recommendations please let me know.

### OAuth Social authentication with Google and Apple

Since the magic link didn't end up working and now you have to enter an OTP, I really want to enable Google and Apple authentication for anyone who rather use that to log into the app. I just need to make the accounts for each provider and complete the setup, so don't expect this to take too long.

### Voice feature to not have to enter stuff manually

This is the one that I feel is more a nice to have and maybe lower prio, but allowing users to simply say: "Hey, so I did X routine today, I completed everything that was planned, for squats I did 300lbs for the 5 sets, for RDLs 425 for 3 sets and 420 for 2 sets, ..." and let AI handle the creation of the workout for the user to just confirm if it's correct would be nice, for anyone who doesn't want to type manually. However, doing this will definitely incur costs associated with the AI APIs so I'll see how I can either offer some of it for free or if I'll have to block this for someone who wants to pay for it.

I haven't even planned to charge for anything so I'll have to come up with something before enabling this.

### Share feature (that I'm excited about)

The overall idea of this application was to simply track your workouts, that's the truth. I wanted it for myself, but as I started to make it, I thought it wouldn't be difficult and would make me feel better to make it not only for me but anyone who wanted to use it.

I don't run, but on Instagram I do follow a few people who do, there is an app I've never used called Strava, they seem to have a share feature that shows how much you run, at which speed, and has like a little map showing the route you took. I want to think of something cool like that for this app; a share feature that shows the workout you did, maybe highlighting some numbers or PRs if any. I'll share more when I refine this.
