// Vercel Serverless Function entry point.
//
// Every request to /api/* is routed here. We lazily import the Express app
// (ESM) and hand the request/response to it, so the whole backend runs as a
// single serverless function on the same domain as the site.
let appPromise;

module.exports = async (req, res) => {
  if (!appPromise) {
    appPromise = import("../server/index.js").then((m) => m.default);
  }
  const app = await appPromise;
  await new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);
    app(req, res);
  });
};
