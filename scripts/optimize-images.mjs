import sharp from "sharp";
import { stat } from "node:fs/promises";

const targets = [
  {
    input: "public/logo.png",
    output: "public/logo-nav.webp",
    width: 256,
    format: "webp",
    quality: 82,
  },
  {
    input: "public/favicon.png",
    output: "public/favicon-32.webp",
    width: 64,
    format: "webp",
    quality: 80,
  },
  {
    input: "public/favicon.png",
    output: "public/favicon-opt.png",
    width: 128,
    format: "png",
  },
];

for (const target of targets) {
  let pipeline = sharp(target.input).resize({
    width: target.width,
    withoutEnlargement: true,
  });

  if (target.format === "webp") {
    pipeline = pipeline.webp({ quality: target.quality });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  }

  await pipeline.toFile(target.output);

  const [before, after] = await Promise.all([
    stat(target.input),
    stat(target.output),
  ]);
  console.log(
    `${target.input} -> ${target.output}: ${before.size} -> ${after.size} bytes`
  );
}
