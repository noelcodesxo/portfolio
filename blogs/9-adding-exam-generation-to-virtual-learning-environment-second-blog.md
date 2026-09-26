---
title: Adding exam generation to virtual learning environment - Second blog
description: I share how I built an exam generator for my virtual learning environment, how Bloom's Taxonomy and research improved the generated questions, and how I moved the project's retrieval pipeline from TF-IDF to BM25 to improve the resources that get retrived in the RAG pipeline.
layout: blog.njk
tags: blog
topics:
  - ai
  - engineering
  - learning
isFeedback: false
feedbackThoughts: Are the exam examples clear about how Bloom's Taxonomy shapes the questions, and does the explanation of BM25 and the other project improvements make sense?
---

My goal in building this project is to have something that anyone can use to learn more effectively. A RAG pipeline that answers your questions regarding topics in your resources is not enough.

In this second blog of this series (where I share how I'm building this project), I share how I built the exam generation feature and how using it is better than just asking an LLM to make you an exam.

## Exam generation feature

### Naive generation feature
When I designed this feature, I didn't pay much attention to the prompt. I thought more about how to store exams, how many answers a question should have and how to navigate the exam using the keyboard. It is safe to say the first few exams were bad. All the questions tested only basic recall. Also, sometimes the LLM would generate really bad, obviously incorrect answers, which made it easier to pick the correct answer.

<figure>
  <img src="/images/9/before-handson-question.png" alt="A question about techniques like model/IO, memory, agents, and chains includes false distractors claiming that those techniques require fine-tuning LLM's weights; and requiring a new model.">
  <figcaption>Early exam question about techniques from chapter 7 of Hands-On Large Language Models.</figcaption>
</figure>

Here is an example of a bad question. One could answer this by simply reading chapter 7 of "*Hands-On Large Language Models*" and remembering the information, or by eliminating incorrect statements such as these: model I/O, memory, and the other techniques don't require to fine-tune the model; these techniques don't fine-tune the LLM's weights; and they don't require a new model.


<figure class="prompt-figure">
  <pre><code>You are an exam writer for a study assistant. You will be given source excerpts from one selected chapter or document. Write multiple-choice questions that test understanding of that source - every question must be answerable using only the excerpts provided. Do not use outside knowledge or add facts that are absent from the chapter.<br><br>First, silently plan the exam around the chapter's most important learning objectives: its central concepts, relationships, methods, trade-offs, and ideas needed to understand other material. Prioritize questions that test those ideas, including their application and meaningful distinctions. Avoid trivia, isolated examples, minor terminology, and repeated variations of the same fact unless they are essential to the chapter's core objective. Cover the important ideas deliberately for the requested question count.</code></pre>
  <figcaption>Initial prompt used. Notice how there are no detailed instructions for creating the questions.
</figcaption>
</figure>


### Improvements to exam generation feature (implementing what I learned from a research paper)
I decided to improve the exam generation feature after noticing that some LLM-generated answers were obviously incorrect and reading [A Comparative Study of AI-Generated (GPT-4) and Human-crafted MCQs in Programming Education](https://arxiv.org/pdf/2312.03173).

The first thing I did was add a form to let users select [Bloom's Taxonomy](https://www.valamis.com/hub/blooms-taxonomy) levels—each describes a different learning outcome and goes from simply remembering information to creating something new. For the project, the prompt includes two example questions for each level the user selects to guide the LLM in generating questions aligned with the desired learning outcomes.

<figure>
  <img src="/images/9/bloom-taxonomy-levels.png" alt="Bloom's Taxonomy level selector showing remember, understand, apply, analyze, evaluate, and create.">
  <figcaption>Bloom's Taxonomy level selector.</figcaption>
</figure>

<figure>
  <img src="/images/9/apply-call-stack-question.png" alt="An apply-level question asks how a program's call stack handles assignments to x across three functions.">
  <figcaption>Example of "apply" filter. Before adding Bloom's taxonomy levels the LLM never generated something like this (I probably generated ~100 exams).
</figcaption>
</figure>


The second thing I did was add a definition of what makes a high-quality multiple-choice question (MCQ). One of the key things I learned from the research paper is that the distractors should **not** give away the correct answer. They should be true statements that don't correctly answer the question.

<figure class="prompt-figure">
  <pre><code>Distractor design principles: write two high-quality distractors. Each is plausible and a valid, non-false statement; its incorrectness comes from failing to answer the specific condition, relationship, scope, or task. Use realistic misconceptions, nearby concepts, partial truths, and source-supported statements that answer a different question. Keep all three options parallel in grammatical form, detail, and length.</code></pre>
<figcaption>Part of the new prompt to improve distractors in exam generation</figcaption>
</figure>

## Virtual learning environment
### From TF-IDF to BM25 for chat (to get better resources back)
When I first implemented the RAG pipeline for the chat feature, I used [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) (an algorithm used to retrieve data by using Term Frequency) to decide which resources to pass to the LLM. In my implementation, TF-IDF didn’t account for chunk length—each resource gets turned into chunks and each chunk is a piece of information, such as half a page. As a result, a chunk from a book's index could rank higher than a chunk from its main text simply because the term appeared five times in the index chunk and four times in the main text chunk.

[BM25](https://en.wikipedia.org/wiki/Okapi_BM25) (an improvement upon TF-IDF) includes document-length normalization, so I replaced TF-IDF with BM25. It also has two customizable parameters: `K1` and `B`. `K1` controls how much term frequency affects the score, while  `B` controls the strength of length normalization. In my implementation, `K1` ranges from 0 to 2, and `B` ranges from 0  to 1.

In simple terms, `K1` controls how much extra weight a chunk gets when the term appears many times. The lower `K1` is, the less it cares about repeated occurrences; at 0, repeated occurrences add no extra weight. `B` controls how much chunk length affects the score; at 0, length doesn't affect the score, and at 1, length normalization is fully applied.

### Other (non-trivial) improvements to the project
Some other changes I didn't talk about in detail are:
- Resources don't get removed when you restart the project.
- Exams don't get removed when you restart the project.

### Next steps (Job's not finished)
At the beginning of the blog, I talked about how my goal with this project is to have something that can help you learn more effectively. I'm already using it every day to generate exams from the resources I'm consuming, and so far it's good. But it's definitely not done by any means.

I want to continue to improve the quality of exams generated, give the project a proper design (I may potentially work with an amazing friend who is a designer) and work on Anki generation/integration.

If you spot a bug or you'd like a new feature, let me know directly or open a GitHub issue. The project is open source and you can find it here: [virtual learning environment repository](https://github.com/noelcodesxo/virtual-learning-environment).

Thanks to Tiffany and Mike for giving me feedback on this blog. <3

Thanks for reading. If you want to read the first blog of the series, it's [here](https://www.noelcodes.dev/blogs/building-a-rag-pipeline-for-my-own-virtual-learning-environment/).
