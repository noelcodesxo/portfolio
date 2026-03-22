export default {
    layout: "blog.njk",
    tags: "weekly",
    eleventyComputed: {
        permalink: (data) => {
            const cleanSlug = data.page.fileSlug.replace(/^\d+-/, "");
            return `/weekly/${cleanSlug}/`;
        },
    },
};
