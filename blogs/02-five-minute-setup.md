# 5-Minute Setup: Your First Framework Installation

*Published: Week 1, Wednesday - Foundation Series*

## The Setup That Actually Takes 5 Minutes

Remember when "5-minute setup" usually meant "5 minutes if you're lucky and have everything pre-configured"? I hate those guides too. This one actually takes 5 minutes, assuming you have VS Code and are working on a project that uses Amazon Kiro.

I timed myself doing this on our e-commerce platform project yesterday. Start to finish: 4 minutes and 32 seconds. Here's exactly what I did.

## Step 1: Install the Extension (30 seconds)

Open VS Code, hit `Ctrl+Shift+X`, search for "Pragmatic Rhino SUIT", click install. Done.

If you don't see it activate immediately, make sure your workspace has a `.kiro/` directory. If not, you'll need to initialize a Kiro workspace first - but that's a different 5-minute setup.

## Step 2: Browse Available Frameworks (1 minute)

Hit `Ctrl+Shift+P` and type "Browse Frameworks". You'll see our curated library of frameworks. 

For most teams, I recommend starting with these three:
- **TDD/BDD Testing Strategy** - Because untested code is technical debt waiting to happen
- **Clean Architecture** - Keeps your business logic separate from framework concerns
- **Cloud Strategy** (AWS or Azure) - Helps AI make sensible infrastructure decisions

Don't go crazy here. Resist the urge to install everything that sounds cool. Start small.

## Step 3: Install Your First Framework (2 minutes)

Click on "TDD/BDD Testing Strategy" and hit "Install". The extension copies the framework file to `.kiro/steering/strategy-tdd-bdd.md`.

Open that file and skim it. You'll see it's not a 50-page academic paper - it's practical guidance about when to write tests, what makes a good test, and how to structure your testing approach. The kind of stuff you'd explain to a new team member.

## Step 4: See It In Action (1 minute)

Now ask Kiro to create a new feature - let's say "user registration". Instead of generating basic CRUD code, it'll include:
- Test scenarios for happy path and edge cases
- Proper separation between domain logic and infrastructure
- Validation patterns that actually make sense

The AI now understands your team's testing approach without you having to explain it every time.

## What Just Happened?

You gave your AI assistant context about how your team works. That framework file is now part of Kiro's understanding of your project. Every spec it creates, every piece of code it generates, will follow those patterns.

## Real Example: Our E-Commerce Team

Before installing frameworks, when someone asked Kiro to "add product reviews":
```
Kiro: "Here's a basic review model with CRUD operations"
Developer: "No, we need proper validation, test coverage, and it should follow our domain patterns..."
Kiro: "Let me regenerate that with your requirements..."
```

After installing TDD/BDD and Clean Architecture frameworks:
```
Kiro: "Here's a product review feature with:
- Domain model with business rules validation
- Test scenarios covering edge cases
- Repository pattern for data access
- Command/Query separation"
Developer: "Perfect, ship it."
```

## The Gotchas I've Hit

**Framework Overload**: Don't install 10 frameworks on day one. Your AI will get confused trying to follow conflicting guidance. Start with 2-3 core ones.

**Team Buy-In**: Make sure your team actually agrees with the framework before installing it. Nothing kills adoption faster than "why are we following this pattern nobody wanted?"

**Customization Temptation**: The frameworks work well out of the box. Resist the urge to customize everything immediately. Use them as-is for a few weeks first.

## What's Next

Friday I'll show you how to choose frameworks that actually fit your project type and team size. Spoiler: if you're building a simple CRUD app, you probably don't need the enterprise architecture framework.

Next week we'll dive into specific frameworks - starting with TDD/BDD and why it's the one framework every team should consider, even if you're not doing "pure" TDD.

## Your Turn

What frameworks did you install first? Are you seeing AI generate better code, or is it still producing generic solutions? I'm curious what patterns other teams are finding useful.

---

*Having issues with the setup? Check out our [troubleshooting guide](link) or drop a comment below. The most common problem is forgetting to initialize the Kiro workspace first.*
