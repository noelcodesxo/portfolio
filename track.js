export default async function handler(req, res) {
    const data = {
        path: req.headers.referer || "unknown",
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(data)); // Just loging this to my consol4 to sort of track visitors <3.
    res.status(204).end();
}
