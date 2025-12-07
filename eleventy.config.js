export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("main.css");
    eleventyConfig.addPassthroughCopy("track.js");

    eleventyConfig.addCollection("blog", function (collectionApi) {
        return collectionApi.getFilteredByTag("blog").sort((a, b) => {
            // Extract leading numbers and compare
            const getNum = (item) =>
                parseInt(item.fileSlug.match(/^\d+/)?.[0] || 0, 10);
            return getNum(b) - getNum(a); // Descending order (newest first)
        });
    });
}
