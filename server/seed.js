// One-off: overwrite the content collections in MongoDB with the full defaults.
// Run:  npm --prefix server run seed   (or: node --env-file=.env seed.js)
import { DEFAULTS, setCollection } from "./store.js";

for (const key of ["cases", "testimonials", "services"]) {
  await setCollection(key, DEFAULTS[key]);
  console.log(`Seeded ${key}: ${DEFAULTS[key].length} items`);
}
process.exit(0);
