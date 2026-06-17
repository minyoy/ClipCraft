import { expect, test } from '@playwright/test';
import { addScenarios, createProject, mockAnalysisApi, uploadSampleVideo } from './support/flows';

test('scenario input starts analysis and renders three recommendation cards', async ({ page }) => {
  await mockAnalysisApi(page);
  await createProject(page);
  await uploadSampleVideo(page);
  await addScenarios(page);

  await page.getByTestId('analyze-start-button').click();
  await expect(page.getByTestId('loading-page')).toBeVisible();
  await expect(page).toHaveURL(/\/editor\/mock-job$/);

  const cards = page.getByTestId('result-card');
  await expect(cards).toHaveCount(3);
  await expect(page.getByTestId('result-start-time')).toHaveCount(3);
  await expect(page.getByTestId('result-end-time')).toHaveCount(3);
  await expect(page.getByTestId('result-score')).toHaveCount(3);
});
