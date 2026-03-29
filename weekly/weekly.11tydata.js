export default {
    layout: "blog.njk",
    tags: "weekly",
    eleventyComputed: {
        permalink: (data) => `/weekly/${data.page.fileSlug}/`,
    },
};
