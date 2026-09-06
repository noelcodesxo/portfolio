---
title: How I cut our multi-region deployments time by 50%
description: How I used Spinnaker's parent pipeline to run multi-region deployments in parallel, cutting deploy time by 50 percent.
date: 2026-03
layout: blog.njk
tags: blog
topics:
  - engineering
  - devops
  - cloud
---

# I cut our multi-region deployments time by 50%

## Intro

I recently found myself doing some production deployments and realized the process was repetitive. I was repeatedly modifying parameters for a CD pipeline and retriggering it. My manager and I discussed the issue, and he emphasized that it was important for us to improve the process. I started looking into ways to optimize it, and the result was **cutting our multi-region deployments time in half**.

## The problem

In my team, we have a way to generate Spinnaker templates. Because of this, creating a CD pipeline to deploy infrastructure to our AWS accounts is not very time-consuming. The problem was that these pipelines target only a single region. This means you end up with two identical pipelines where the only difference is the parameters passed at execution time.

![Two Spinnaker pipelines where the only difference was the parameters](/images/5-how-i-cut-our-multi-region-deployments-time-by-50-percent/problem_pipeline.png)

Our workflow looked something like this:

1. Cut a release and trigger CI (Jenkins).
2. Once CI completes, it triggers the Spinnaker CD pipeline for our primary region.
3. Then repeat the process for the secondary region, or manually trigger the Spinnaker pipeline for it.

EW.

## Potential solution

I started digging around, reading more about Spinnaker and reviewing both internal and external repositories. I also was just thinking… What if I created a large pipeline with duplicate stages, containing the configuration for both regions and then splitting into two sub-stages, something like this:

![A potential Spinnaker pipeline to use with two branches for stages, one per regional deployment](/images/5-how-i-cut-our-multi-region-deployments-time-by-50-percent/potential_pipeline_solution.png)

However, I didn't like the idea that if one of the sub-stages failed, it would complicate the pipeline. I would have had to add a way to restart the stage for that region, or restart the entire pipeline, even if perhaps the other region was already done. I know, it is possible in Spinnaker to manually do stuff, such as a stage to skip another stage, but again, that meant I would have more stages, which is just making the pipeline more complicated.

I wanted a way to improve the time it took us to deploy, as well as making it straightforward for anyone deploying. I then realized that in Spinnaker it's possible to execute one pipeline from another. FUCK YES!

## The solution

I decided to go with a much simpler approach. I created a pipeline that can be triggered once for both regions (a parent pipeline). In its configuration stage, it passes the parameters for both regions and executes two identical child pipelines. One receives the arguments for the primary region, and the other receives the arguments for the secondary region. IN PARALLEL!

If something goes wrong with one of the child pipelines, that's fine. Since it's a separate pipeline, we can simply retry or manually re-trigger it. The process is very simple. The parent pipeline always takes the parameters for both regions (the template contains them all). Upon execution, there is a parameter called `isMultiRegionDeployment`. If it is `true`, the pipeline deploys to both regions; otherwise, it deploys only to the primary region.

The result was this pipeline:

![The final pipeline that solved the problem. A parent Spinnaker pipeline that calls the child pipeline twice, with the parameters for each of the regional deployment](/images/5-how-i-cut-our-multi-region-deployments-time-by-50-percent/final_pipeline.png)

This pipeline triggers both child pipelines in parallel during multi-region deployments and allows us to choose whether to deploy to both regions or only the primary region. Previously, deploying to both regions took about 1 hour (30 minutes per pipeline when run sequentially). With this setup, we can trigger the parent pipeline and deploy to both regions simultaneously in 30 minutes.

This is how you can call a child pipeline from a parent pipeline in Spinnaker:

```json
{
  "application": "composite-pipeline",
  "name": "Parent Pipeline",
  "stages": [
    {
      "type": "pipeline",
      "name": "primary-region-pipeline",
      "refId": "1",
      "requisiteStageRefIds": [],
      "application": "my-app",
      "pipeline": "<CHILD_PIPELINE_ID>",
      "waitForCompletion": true,
      "parameters": {
        "ENV": "production",
        "VERSION": "${trigger.properties['version']}"
      }
    }
  ]
}
```
