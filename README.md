# Endless Content - Infinite Blog

This blog is powered by AI to create an infinite amount of post.

OpenAI offers free api requests if you agree to share your data with them, mainly for training of new models. I recently had the "chance" to be enrolled for this offer.
Of course, OpenAI is doing this because they want me to send them high quality content. In other words, content that they don't already have.

Because I like the idea of free things, but I disliske the fact that my data is being used for training GPT-5,6, ..., I asked myself: how could I use this free tokens in a funny way ? A way that don't profit OpenAI (or maybe a bit, but without sending real, quality data).

This is why I created this Infinite Blog in a weekend.

# How it works

The blogs starts with 10 basic articles. Each time you open an article the model generates the body of the article. While creating body, the models also generates 3 new articles titles, in the "recommended articles" section. When you click on a recommended article, it generates the body and 3 new articles with it. Since, articles topics were boring I added the ability to create an article by inputting keywords. The models generates a new article from user prompt.

The quality of posts are bad, and it is the whole purpose of this site : having a large amount of shitty ai generated content.

I also added an AI translation feature, after an article has been fully generated, the user has the ability to translate it in the langage of their choice (not really limited because I use LLM to translate it).

The cost of operating is super low : i'm using gpt-4o-mini, the super cheap model and the 2.5 millions tokens are free of charge.

# Stack

- The website is using the NextJS framework (v15) - with app router.
- Vercel AI SDK is used for everything related to LLM api calls.
- Database is provided by neon.tech free-tier
- Website + api endpoints are hosted on vercel.
