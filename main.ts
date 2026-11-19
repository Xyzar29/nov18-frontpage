// nov18-frontpage — entry program for make.fun news-image-20261118.
// Copies the finished front page (entry.png, built in this repository)
// to the grader's output directory. Node 22, standard library only,
// no network, deterministic: the same bytes are written on every run.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const MAX_BYTES = 1048576; // 1 MiB gate cap

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "./out";
const target = join(outDir, "entry.png");

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  throw new Error(
    `entry.png is ${bytes.length} bytes, over the 1 MiB cap`,
  );
}
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png does not start with a PNG signature");
}
// IHDR chunk: width and height are the first 8 bytes of its data.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
const written = statSync(target).size;
if (written !== bytes.length) {
  throw new Error(`wrote ${written} bytes, expected ${bytes.length}`);
}
console.log(`wrote ${target} (${written} bytes)`);
