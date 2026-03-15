export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("main.css");
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("site.webmanifest");

    eleventyConfig.addFilter("isoDate", (date) => {
        return new Date(date).toISOString();
    });

    eleventyConfig.addCollection("blog", function (collectionApi) {
        return collectionApi.getFilteredByTag("blog").sort((a, b) => {
            // Extract leading numbers and compare
            const getNum = (item) =>
                parseInt(item.fileSlug.match(/^\d+/)?.[0] || 0, 10);
            return getNum(b) - getNum(a); // Descending order (newest first)
        });
    });
}
