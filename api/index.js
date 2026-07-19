// Vercel Serverless Function entry point.
//
// vercel.json rewrites every /api/* request to this function. We lazily import
// the Express app (ESM) and hand it the request/response, so the whole backend
// runs as a single serverless function on the same domain as the site. Vercel
// preserves the original request URL, so Express's /api/* routes still match.
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
