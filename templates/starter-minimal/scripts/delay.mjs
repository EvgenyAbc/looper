#!/usr/bin/env node
const sec = Number(process.argv[2]);
if (!Number.isFinite(sec) || sec < 0) {
  console.error('usage: node scripts/delay.mjs <seconds>');
  process.exit(1);
}
setTimeout(() => process.exit(0), sec * 1000);
