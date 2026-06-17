import { expect, test } from '@playwright/test';
import { createProject, projectName } from './support/flows';

test('workspace creates a project with default vertical aspect ratio', async ({ page }) => {
  await createProject(page);

  await expect(page.getByTestId('video-upload-area')).toBeVisible();
  await expect(page.getByTestId('project-title')).toHaveText(projectName);
  await expect(page.getByTestId('project-aspect-ratio')).toHaveText('세로 9:16');
});
