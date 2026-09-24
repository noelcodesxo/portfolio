---
title: Adding exam generation to virtual learning environment - Second blog
description: I explain how research on AI-generated multiple choice questions shaped the exam generation feature in my virtual learning environment, including Bloom's Taxonomy and examples of stronger distractors.
layout: blog.njk
tags: blog
topics:
  - ai
  - engineering
  - learning
isFeedback: true
feedbackThoughts: Do the before-and-after examples make the difference between weak and useful distractors clear? Does the explanation of the research paper and Bloom's Taxonomy make sense, and are there parts you'd like me to explain further?
---

# Adding exam generation to virtual learning environment - Second blog

## Exam generation feature

As I began working on the exam generation feature for the project, I decided to create a form that will take a document from the resources in the project, and a section from that document to generate the exam from. The selected document and the section, along with instructions are sent to an LLM to generate the exam.

As I was testing this, I realized the local model (`Qwen3:8b`) I was using for the chat couldn't be used because between the system prompt and the section of a long document, such as a book or research paper, can be too much for its context window. I ended up adding support for OpenRouter models so that it's easy to pick any model you want. I've been using `glm-5.3-flash` from [zcode](https://zcode.z.ai/) to test with, and so far it is good, and very cheap.

## I read a research paper that made me realize how bad the exams that the project generates (and even LLMs directly generate) are

Look, I could be wrong, but I have a feeling that people who use LLMs to learn effectively are simply saying "Generate an exam for me to study X". That is definitely better than no exam at all. But a good exam should include different types of questions that focus on different things, such as applying a concept you learned or analyzing different scenarios to choose the correct answer. In my experience, the LLM was generating very simple questions to mostly test recall. Open-ended questions let learners explain things in their own words, though they can be a bit more difficult to review with AI since it's non-deterministic and explanations can differ a lot.

The research paper I read is [A Comparative Study of AI-Generated (GPT-4) and Human-crafted MCQs in Programming Education](https://arxiv.org/pdf/2312.03173). I want to share a little bit about what I learned and what I implemented in the project to make the exam generation better.

### Multiple Choice Questions (MCQs)

The paper only focuses on MCQs, because when you generate MCQs the components—the stem (question), the distractors (2 or so wrong answers) and the key (the correct answer)—are simple enough to verify.

I learned that a high-quality MCQ should have a clear and focused steam (not too long or complicated). The distractors should **not** give away the correct answer, they should be phrased positively and be true statements that don't correctly answer the stem. The key should also not make it obvious that it is the correct answer.

### Learning objectives

In the paper they generated MCQs for exams from university courses in which they had learning objectives such as "Explain what Python is and how to use it to run single-line expressions as well as small multi-line programs". They used a classifier model ([BERT](https://arxiv.org/abs/1810.04805)) to take those types of learning objectives and classify them into [Bloom's Taxonomy levels](https://www.valamis.com/hub/blooms-taxonomy), and from Bloom's Taxonomy levels to question types such as fill-in-the-blank, scenario-based or correct output.

I decided to add a filter to the exam generation form so users can select the Bloom's Taxonomy levels they want. Each level is mapped to two example questions, which are sent in the prompt to the LLM. For example, if you pick `remember`, the prompt includes those two examples. If you also pick `apply`, it includes four question examples.

<figure>
  <img src="/images/9/build_exam_form.jpg" alt="Exam-generation form with a description field, source and chapter selectors, question-count controls, and six selected Bloom's Taxonomy levels.">
  <figcaption>Exam form with all six Bloom's Taxonomy levels selected.</figcaption>
</figure>

The thing that surprised me at first was that in their research they were not uploading the full content of the courses into the LLM. They provided course and module information along with learning objectives, and relied on the model’s training data for its Python knowledge. For my project, though, that approach wouldn't work. One reason I started this project was my experience trying to use Sonnet in [claude.ai](https://claude.ai) to generate exams. When I asked it to make an exam from a specific book and section, it generated questions about the book's topics, but they weren't necessarily grounded in the book's actual information. I wanted to provide the relevant text so the generated questions could use it.

<figure>
  <img src="/images/9/claude-book-chapter-context.png" alt="Claude says it cannot retrieve a book chapter from memory and asks the user to provide the text to create a quiz grounded in that chapter.">
  <figcaption>Claude asks for the chapter text before generating a source-grounded quiz.</figcaption>
</figure>

### Question type examples

I had already built the exam generation feature before reading this paper. I had noticed that some questions were bad because the correct answer was almost obvious. After reading the paper, I wanted to update the exam generation module to add Bloom's Taxonomy levels, support different types of questions, and improve the quality of the questions being generated by providing example questions to the model.

The way I implemented Bloom's Taxonomy levels was to send the LLM two question examples for each level the user selects, as I explained above. In my testing, the changes resulted in more varied and better aligned exams with questions that test the cognitive process associated with the selected Bloom's Taxonomy level.

## Improvements to project from last blog

### Durable resources

The project now saves your resources so that when it gets reset they remain there.

### Durable index and BM25

I also made it so that the application loads the saved index at startup instead of rebuilding it each time. The index is a JSON file containing the chunks and their precomputed scores. It used TF-IDF before, but now it uses BM25.

The main difference between TF-IDF and BM25 is that BM25 accounts for document length. This helps reduce length-related bias when searching across sections of different sizes, so longer sections are less likely to rank higher just because they contain a search term more often. This can help the chat find useful information across all your resources, including shorter sections.

### Exam generation

This is the new feature that you can use to generate good exams to aid with your learning, which is the main objective I have with this project.

I asked Codex (my new favorite agent) to generate screenshots of before and after exams while I was writing this because I forgot to do it while I was working on implementing the feature.

Here are a couple of before and after (updating the exam generation feature) exams. And quick note: Since I'm feeding the section of a document to the LLM to generate the questions, every time I send a request I get slightly different answers, so I couldn't do a before/after with the same questions.

#### Example #1

<figure>
  <img src="/images/9/before-ai-engineering.png" alt="Before the update, the prompt-engineering question has false distractors claiming it changes model weights, costs more than fine-tuning, or only works with fine-tuned models.">
  <figcaption>Before updating exam generation</figcaption>
</figure>

<b>Explanation</b>

As you can see in the before, answer #4 is a wrong statement. Prompt engineering does not only work with models that have been fine-tuned. Even without a model being fine-tuned, you could do prompt engineering (whether it helps the model or not is a different thing). Answer #2 is also a wrong statement because prompt engineering is not more resource-intensive than fine-tuning a model. The resource cost of inference is far less than the resource cost of fine-tuning a model.

**Remember, a high quality MCQ should have distractors that are true statements.**

<figure>
  <img src="/images/9/after-ai-engineering.png" alt="After the update, a tenant-rights chatbot scenario asks how to separate its instructions from the uploaded lease and the user's question across system and user prompts.">
  <figcaption>After updating exam generation</figcaption>
</figure>

<b>Explanation</b>

Better distractors, all of them are true statements. They also don't make the correct answer obvious. Somebody new to LLMs could easily pick the correct answer - that's the point of a high quality distractor.

#### Example #2

<figure>
  <img src="/images/9/before-attention.png" alt="Before the update, a question about why Transformers departed from recurrent models includes false distractors claiming recurrent models cannot use attention or gradient-based training.">
  <figcaption>Before updating exam generation</figcaption>
</figure>

<b>Explanation</b>

In the screenshot, answer #3 is a wrong statement because recurrent models can 100% have the attention mechanism. Anyone who is familiar with recurrent models will immediately know that answer #3 is not correct, which makes it easier to pick the correct answer. Answer #4 is also a weak distractor because recurrent models can be trained with gradient-based methods.

<figure>
  <img src="/images/9/after-attention.png" alt="After the update, a long-sequence scenario asks how to avoid sequential hidden-state generation, with choices about removing recurrence or keeping it and reducing sequence length.">
  <figcaption>After updating exam generation</figcaption>
</figure>

<b>Explanation</b>

Even with the improvements, in this screenshot we see that the answer #3 is weak too, longer sequences and larger datasets generally require more memory.

---

I will continue to work on this. My goal with this project is to make it a good application that can be used to help people learn fast. Active learning is a requirement if you want to learn effectively and I've learned that retrieval practice is one of the best ways you can study in order to help your brain create synapses (create/strengthen connections between neurons).

## Outro and next steps

The project is open source and it's already usable (I've been using it for my own learning). You can find it here: [virtual learning environment repository](https://github.com/noelcodesxo/virtual-learning-environment)

I would love to get feedback. If you spot a bug or if you'd like a feature added, let me know directly, or open a GitHub issue.

My next step is to continue to work on this. I want to try a couple of different models and edit the prompts until I'm happy with the quality of the MCQs. After that I most likely will work on Anki generation/integration.
