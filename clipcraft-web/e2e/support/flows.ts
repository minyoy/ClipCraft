import { expect, type Page, type Route } from '@playwright/test';
import path from 'node:path';

export const projectName = '김치찌개 브이로그 쇼츠';
export const scenarios = ['재료를 손질하는 장면', '김치찌개가 끓는 장면', '완성된 음식을 담는 장면'];
export const sampleVideoPath = path.join(process.cwd(), 'e2e/fixtures/sample.mp4');

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByTestId('email-input').fill('qa@example.com');
  await page.getByTestId('password-input').fill('Password123');
  await page.getByTestId('login-submit-button').click();
  await expect(page).toHaveURL(/\/workspace$/);
}

export async function createProject(page: Page, name = projectName) {
  await page.goto('/workspace');
  await page.getByTestId('new-project-button').click();
  await page.getByTestId('project-name-input').fill(name);
  await expect(page.getByTestId('aspect-ratio-select').first()).toContainText('세로 9:16');
  await page.getByTestId('start-editing-button').click();
  await expect(page).toHaveURL(/\/upload$/);
  await expect(page.getByTestId('project-title')).toHaveText(name);
  await expect(page.getByTestId('project-aspect-ratio')).toHaveText('세로 9:16');
}

export async function uploadSampleVideo(page: Page) {
  await expect(page.getByTestId('video-upload-area')).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(sampleVideoPath);
  await expect(page.getByText('sample.mp4')).toBeVisible();
}

export async function addScenarios(page: Page) {
  const input = page.getByTestId('scenario-input');
  for (const scenario of scenarios) {
    await input.fill(scenario);
    await page.getByTestId('add-scenario-button').click();
    await expect(page.getByText(scenario)).toBeVisible();
  }
}

export async function mockAnalysisApi(page: Page) {
  await page.route('**/analyze/jobs', async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', job_id: 'mock-job' }),
    });
  });

  await page.route('**/analyze/jobs/mock-job', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        progress: 100,
        step_id: 5,
        step_label: '하이라이트 구간 확정',
        message: 'mock analysis complete',
        logs: ['mock: received video', 'mock: matched 3 scenarios'],
        project: projectName,
        results: scenarios.map((scenario, index) => ({
          project_name: projectName,
          id: index + 1,
          scenario,
          title: scenario,
          start: 12 + index * 20,
          end: 20 + index * 20,
          score: Number((0.94 - index * 0.04).toFixed(2)),
          audio: {
            duration: 90,
            barCount: 88,
            amplitudes: Array.from({ length: 88 }, (_, barIndex) => Number((0.25 + Math.abs(Math.sin(barIndex * 0.35)) * 0.7).toFixed(3))),
          },
        })),
        error: null,
      }),
    });
  });
}

export async function runAnalysisFlow(page: Page) {
  await mockAnalysisApi(page);
  await createProject(page);
  await uploadSampleVideo(page);
  await addScenarios(page);
  await page.getByTestId('analyze-start-button').click();
  await expect(page.getByTestId('loading-page')).toBeVisible();
  await expect(page).toHaveURL(/\/editor\/mock-job$/);
  await expect(page.getByTestId('result-card')).toHaveCount(3);
}
