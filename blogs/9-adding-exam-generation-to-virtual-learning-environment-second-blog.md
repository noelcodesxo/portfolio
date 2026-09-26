---
title: Adding exam generation to virtual learning environment - Second blog
description: I share how I built exam generation for my virtual learning environment, how Bloom's Taxonomy and research improved the questions, and how I moved the project's retrieval pipeline from TF-IDF to BM25.
layout: blog.njk
tags: blog
topics:
  - ai
  - engineering
  - learning
isFeedback: true
feedbackThoughts: Are the exam examples clear about how Bloom's Taxonomy shapes the questions, and does the explanation of BM25 and the other project improvements make sense?
---

My goal in building this project is to have something that anyone can use to learn more effectively. A RAG pipeline that answers your questions regarding topics in your resources is not enough.

In this second blog of this series (where I share how I'm building this project), I share how I built the exam generation feature and how using it is better than just asking an LLM to make you an exam.

## Exam generation feature

### Naive generation feature
When I designed this feature, I didn't pay much attention to the prompt. I thought more about how to store exams, how many answers a question should have and how to navigate the exam using the keyboard. It is safe to say the first few exams were bad. All the questions tested only basic recall. Also, sometimes the LLM would generate really bad, obviously incorrect answers, which made it easier to pick the correct answer.


![Before the update, a question about techniques from Hands-On Large Language Models includes obviously false distractors about fine-tuning, training a new model, and cloud hosting.](/images/9/before-handson-question.png)
Here is an example of a bad question. One could answer this by simply reading chapter 7 of "*Hands-On Large Language Models*" and remembering the information, or by eliminating incorrect statements such as these: model I/O, memory, and the other techniques don't require to fine-tune the model; these techniques don't fine-tune the LLM's weights; and they don't require a new model.

```
You are an exam writer for a study assistant. You will be given source excerpts from one selected chapter or document. Write multiple-choice questions that test understanding of that source - every question must be answerable using only the excerpts provided. Do not use outside knowledge or add facts that are absent from the chapter.

First, silently plan the exam around the chapter's most important learning objectives: its central concepts, relationships, methods, trade-offs, and ideas needed to understand other material. Prioritize questions that test those ideas, including their application and meaningful distinctions. Avoid trivia, isolated examples, minor terminology, and repeated variations of the same fact unless they are essential to the chapter's core objective. Cover the important ideas deliberately for the requested question count.
```
Initial prompt used. Notice how there are no detailed instructions for creating the questions.

### Improvements to exam generation feature (implementing what I learned from a research paper)
I decided to improve the exam generation feature after noticing that some LLM-generated answers were obviously incorrect and reading [A Comparative Study of AI-Generated (GPT-4) and Human-crafted MCQs in Programming Education](https://arxiv.org/pdf/2312.03173).

The first thing I did was add a form to let users select [Bloom's Taxonomy](https://www.valamis.com/hub/blooms-taxonomy) levels—each describes a different learning outcome and goes from simply remembering information to creating something new. For the project, the prompt includes two example questions for each level the user selects to guide the LLM in generating questions aligned with the desired learning outcomes.

![The exam form shows all six Bloom's Taxonomy levels selected.](/images/9/bloom-taxonomy-levels.png)

![An apply-level question asks how a program's call stack handles assignments to x across three functions.](/images/9/apply-call-stack-question.png)
Example of "apply" filter. Before adding Bloom's taxonomy levels the LLM never generated something like this (I probably generated ~100 exams).


The second thing I did was add a definition of what makes a high-quality multiple-choice question (MCQ). One of the key things I learned from the research paper is that the distractors should **not** give away the correct answer. They should be true statements that don't correctly answer the question.

### Comparing exams generated before the updates and after
**Important note**: The non-deterministic nature of LLMs means they generate different exams each time. That's why I'm not comparing the exact same ones.
#### Example one

![Before the update, a prompt-engineering question includes false distractors about model weights, resource use, and fine-tuned models.](/images/9/before-ai-engineering.png)
Before updating exam generation

**Explanation**
Answer #4 is a false statement because prompt engineering doesn't only work with models that have been fine-tuned. Answer #2 is also a false statement because prompt engineering is not more resource-intensive than fine-tuning a model.

Notice how those false statements make it easier to pick the correct answer.

![After the update, a tenant-rights chatbot scenario asks how to separate system instructions from the uploaded lease and user question.](/images/9/after-ai-engineering.png)
After updating exam generation

**Explanation**
Better distractors; all of them are true statements. They also don't make the correct answer obvious. Someone new to LLMs could easily pick an incorrect answer, which is the point of high-quality distractors.

#### Example 2
![Before the update, a question about recurrent models includes false distractors about attention and gradient-based training.](/images/9/before-attention.png)
Before updating exam generation

**Explanation**
Answer #3 is a false statement because recurrent sequence models can use attention mechanisms. Answer #4 is false because recurrent sequence models can be trained with gradient-based methods.

![After the update, a long-sequence scenario asks how to avoid sequential hidden-state generation.](/images/9/after-attention.png)
After updating exam generation

It's not perfect yet. Even with the improvements, answer #3 on this exam is a false statement as well: longer sequences and larger datasets generally require more memory.

Overall, though, these changes greatly improved the quality of the exams the project generates.

## Virtual learning environment
### From TF-IDF to BM25 for chat (to get better resources back)
When I first implemented the RAG pipeline for the chat feature, I used [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) (an algorithm used to retrieve data by using Term Frequency) to decide which resources to pass to the LLM. In my implementation, TF-IDF didn’t account for chunk length—each resource gets turned into chunks and each chunk is a piece of information, such as half a page. As a result, a chunk from a book's index could rank higher than a chunk from its main text simply because the term appeared five times in the index chunk and four times in the main text chunk.

[BM25](https://en.wikipedia.org/wiki/Okapi_BM25) (an improvement upon TF-IDF) includes document-length normalization, so I replaced TF-IDF with BM25. It also has two customizable parameters: `K1` and `B`. `K1` controls how much term frequency affects the score, while  `B` controls the strength of length normalization. In my implementation, `K1` ranges from 0 to 2, and `B` ranges from 0  to 1.

In simple terms, `K1` controls how much extra weight a chunk gets when the term appears many times. The lower `K1` is, the less it cares about repeated occurrences; at 0, repeated occurrences add no extra weight. `B` controls how much chunk length affects the score; at 0, length doesn't affect the score, and at 1, length normalization is fully applied.

### Other (trivial) improvements to the project
Some other changes I didn't talk about in detail are:
- Resources don't get removed when you restart the project.
- Exams don't get removed when you restart the project.

### Next steps (Job's not finished)
At the beginning of the blog, I talked about how my goal with this project is to have something that can help you learn more effectively. I'm already using it every day to generate exams from the resources I'm consuming, and so far it's good. But it's definitely not done by any means.

I want to continue to improve the quality of exams generated, give the project a proper design (I may potentially work with an amazing friend who is a designer) and work on Anki generation/integration.

If you spot a bug or you'd like a new feature, let me know directly or open a GitHub issue. The project is open source and you can find it here: [virtual learning environment repository](https://github.com/noelcodesxo/virtual-learning-environment).

Thanks for reading. If you want to read the first blog of the series, it's [here](https://www.noelcodes.dev/blogs/building-a-rag-pipeline-for-my-own-virtual-learning-environment/).
