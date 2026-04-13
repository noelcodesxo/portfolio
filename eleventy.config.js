export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("main.css");
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("site.webmanifest");

    eleventyConfig.addFilter("isoDate", (date) => {
        return new Date(date).toISOString();
    });

    eleventyConfig.addFilter("limit", (array, n) => array.slice(0, n));

    eleventyConfig.addCollection("blog", function (collectionApi) {
        return collectionApi.getFilteredByTag("blog").sort((a, b) => {
            const getNum = (item) =>
                parseInt(item.fileSlug.match(/^\d+/)?.[0] || 0, 10);
            return getNum(b) - getNum(a);
        });
    });

    eleventyConfig.addCollection("weekly", function (collectionApi) {
        return collectionApi.getFilteredByTag("weekly").sort((a, b) => {
            const getDate = (item) => {
                const match = item.fileSlug.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                if (!match) return 0;
                return new Date(`${match[3]}-${match[1]}-${match[2]}`);
            };
            return getDate(b) - getDate(a);
        });
    });
}
