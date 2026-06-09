import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { getPointGroup } from '../src/data/pointGroups.js';

const baseUrl = process.env.QA_BASE_URL ?? 'http://localhost:5173/';
const outDir = path.resolve('qa/screenshots');
await mkdir(outDir, { recursive: true });

const cases = [
  { name: 'c3v-desktop', group: 'C3v', width: 1440, height: 920, operation: 'C3' },
  { name: 'd3d-desktop', group: 'D3d', width: 1440, height: 920, operation: 'σd1' },
  { name: 'oh-desktop', group: 'Oh', width: 1440, height: 920, operation: 'i' },
  { name: 'c4v-mobile', group: 'C4v', width: 390, height: 844, operation: 'C4' },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const testCase of cases) {
    const page = await browser.newPage({
      viewport: { width: testCase.width, height: testCase.height },
      deviceScaleFactor: testCase.width < 600 ? 2 : 1,
      isMobile: testCase.width < 600,
    });
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await chooseGroup(page, testCase.group);

    const button = page.locator('.operation-grid button', { hasText: testCase.operation }).first();
    await button.click();
    await page.waitForTimeout(1300);

    const stats = await page.locator('.scene-canvas canvas').evaluate((canvas) => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const width = canvas.width;
      const height = canvas.height;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let colored = 0;
      let samples = 0;
      const step = Math.max(1, Math.floor(Math.min(width, height) / 120));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          samples += 1;
          if (r + g + b > 70 && Math.max(r, g, b) - Math.min(r, g, b) > 12) colored += 1;
        }
      }
      return { width, height, coloredRatio: colored / samples };
    });

    if (stats.width < 300 || stats.height < 300 || stats.coloredRatio < 0.01) {
      throw new Error(`${testCase.name} canvas looks blank: ${JSON.stringify(stats)}`);
    }
    if (errors.length) {
      throw new Error(`${testCase.name} browser errors:\n${errors.join('\n')}`);
    }

    await page.screenshot({ path: path.join(outDir, `${testCase.name}.png`), fullPage: true });
    console.log(`${testCase.name}: ok ${stats.width}x${stats.height}, colored ${(stats.coloredRatio * 100).toFixed(2)}%`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await chooseGroup(page, 'S4');
  await page.locator('.operation-grid button', { hasText: 'S4' }).first().click();
  await page.waitForTimeout(300);
  const s4LabelsBeforeSwitch = await page.locator('.scene-label', { hasText: 'S4' }).count();
  if (s4LabelsBeforeSwitch !== 1) {
    throw new Error(`expected one S4 label after S4 operation, got ${s4LabelsBeforeSwitch}`);
  }
  await page.getByRole('button', { name: '返回' }).click();
  await chooseGroup(page, 'C3v');
  await page.waitForTimeout(300);
  const staleS4Labels = await page.locator('.scene-label', { hasText: 'S4' }).count();
  if (staleS4Labels !== 0) {
    throw new Error(`stale labels remain after group switch: ${staleS4Labels} S4 labels`);
  }
  console.log('label-cleanup: ok');
  await page.close();
} finally {
  await browser.close();
}

async function chooseGroup(page, groupKey) {
  const pointGroup = getPointGroup(groupKey);
  const systemButton = page.locator(`[data-action="system"][data-system="${pointGroup.crystalSystem}"]`).first();
  if (await systemButton.count() === 0) {
    await page.locator('[data-action="home"]').first().click();
  }
  await page.locator(`[data-action="system"][data-system="${pointGroup.crystalSystem}"]`).first().click();
  await page.locator(`[data-action="group"][data-group="${groupKey}"]`).first().click();
  await page.waitForTimeout(500);
}
