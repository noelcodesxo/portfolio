export default {
    layout: "base.njk",
    tags: "blog",
    eleventyComputed: {
        permalink: (data) => {
            // Strip leading number and hyphen from the file slug
            // e.g., "3-the-world-i-want-to-live-in" -> "the-world-i-want-to-live-in"
            const cleanSlug = data.page.fileSlug.replace(/^\d+-/, "");
            return `/blogs/${cleanSlug}/`;
        },
    },
};
