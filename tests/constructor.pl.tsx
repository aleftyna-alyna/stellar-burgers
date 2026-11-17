import { test, expect } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR('tests/hars/ingredients.har', {
    url: '**/api/ingredients',
    update: false,
  });

  await page.goto('/');
});

test.describe('Добавление ингредиентов в конструктор', () => {
  test('добавление булки и начинок из списка в конструктор бургера', async ({
    page,
  }) => {
    const constructorSection = page.locator('section', {
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });

    await expect(constructorSection.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();

    const bunCard = page.locator('li', { hasText: BUN_NAME });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(constructorSection.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructorSection.getByText(`${BUN_NAME} (низ)`)).toBeVisible();

    const mainCard = page.locator('li', { hasText: MAIN_NAME });
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    const sauceCard = page.locator('li', { hasText: SAUCE_NAME });
    await sauceCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
    await expect(constructorSection.getByText(SAUCE_NAME)).toBeVisible();
  });
});

test.describe('Работа модальных окон ингредиентов', () => {
  test('открытие модального окна с деталями ингредиента и закрытие по крестику', async ({
    page,
  }) => {
    await page.getByText(MAIN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(MAIN_NAME)).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();
    await expect(modal.getByText('4242')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
  });

  test('закрытие модального окна ингредиента по клику на оверлей', async ({ page }) => {
    await page.getByText(BUN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).toBeVisible();
    await expect(modal.getByText('420')).toBeVisible();

    await modal.locator('[class*="overlay"]').click({ position: { x: 10, y: 10 } });
    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
  });
});

test.describe('Оформление заказа', () => {
  test('создание заказа авторизованным пользователем и очистка конструктора', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer fake-access-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false,
    });

    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      update: false,
    });

    await page.goto('/');

    const header = page.locator('header');
    await expect(header.getByText('Тестовый Космонавт')).toBeVisible();

    await page
      .locator('li', { hasText: BUN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await page
      .locator('li', { hasText: MAIN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('777888')).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal.getByText('777888')).toHaveCount(0);

    const constructorSection = page.locator('section', {
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });
    await expect(constructorSection.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();
  });
});
