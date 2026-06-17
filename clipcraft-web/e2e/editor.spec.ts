import { expect, test } from '@playwright/test';
import { runAnalysisFlow } from './support/flows';

async function sendCommand(page: import('@playwright/test').Page, command: string) {
  await page.getByTestId('chat-input').fill(command);
  await page.getByTestId('chat-send-button').click();
}

test('editor supports segment selection, timing controls, playback and chat commands', async ({ page }) => {
  await runAnalysisFlow(page);

  const firstCard = page.getByTestId('result-card').first();
  await firstCard.click();
  await expect(firstCard).toHaveAttribute('data-active', 'true');

  const secondCard = page.getByTestId('result-card').nth(1);
  await secondCard.click();
  await expect(secondCard).toHaveAttribute('data-active', 'true');

  await page.getByTestId('segment-start-input').first().hover();
  await page.mouse.down();
  await page.mouse.move(260, 180);
  await page.mouse.up();

  await page.getByTestId('segment-end-input').first().hover();
  await page.mouse.down();
  await page.mouse.move(420, 180);
  await page.mouse.up();

  await page.getByTestId('play-button').click();
  await expect(page.getByTestId('play-button')).toBeVisible();

  await page.getByTestId('result-card').first().click();
  await sendCommand(page, '2배속해줘');
  await expect(page.getByTestId('playback-rate-indicator').first()).toBeVisible();

  await sendCommand(page, '음소거해줘');
  await expect(page.getByTestId('mute-indicator').first()).toBeVisible();

  await sendCommand(page, '보여줘');
  await expect(page.getByTestId('result-card').first()).toBeVisible();

  await sendCommand(page, '삭제해줘');
  await expect(page.getByTestId('hidden-segment-indicator')).toBeVisible();
});
