const fs = require("fs");

async function run() {
  const { compileImageTargets } =
    await import("mind-ar/src/image-target/compiler.js");

  const images = ["uploads/img1.jpg", "uploads/img2.jpg"];

  const buffers = images.map((p) => fs.readFileSync(p));

  const compiled = await compileImageTargets(buffers);

  fs.writeFileSync("uploads/targets.mind", compiled);

  console.log("Done");
}

run();
