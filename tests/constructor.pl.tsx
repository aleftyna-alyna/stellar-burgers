import { test, expect } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';

test.describe('add ingredients to constructor works correctly', () => {
  test.beforeEach(async ({ page }) => {
    // перехватываем запрос получения ингредиентов из HAR-файла
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    });

    await page.goto('/');
  });

  test('добавление булки и начинок из списка в конструктор бургера', async ({
    page,
  }) => {
    const constructorSection = page.locator('section').nth(1);

    await expect(constructorSection.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();

    // находим карточку булки и кликаем «Добавить»
    const bunCard = page.locator('li', { hasText: BUN_NAME });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    // проверяем, что булка добавилась сверху и снизу
    await expect(constructorSection.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructorSection.getByText(`${BUN_NAME} (низ)`)).toBeVisible();

    // добавляем начинку и соус
    const mainCard = page.locator('li', { hasText: MAIN_NAME });
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    const sauceCard = page.locator('li', { hasText: SAUCE_NAME });
    await sauceCard.getByRole('button', { name: 'Добавить' }).click();

    // проверяем, что начинки отображаются в конструкторе
    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
    await expect(constructorSection.getByText(SAUCE_NAME)).toBeVisible();
  });

  test('открытие модального окна с деталями ингредиента и закрытие по крестику', async ({
    page,
  }) => {
    await page.getByText(MAIN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(MAIN_NAME)).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();

    // закрываем модалку по клику на крестик
    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
  });

  test('закрытие модального окна ингредиента по клику на оверлей', async ({ page }) => {
    await page.getByText(BUN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
  });

  test('создание заказа авторизованным пользователем и очистка конструктора', async ({
    page,
    context,
  }) => {
    // 1. Подставляем фейковые токены в cookie и localStorage
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

    // 2. Перехватываем запросы через routeFromHAR с fallback
    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      notFound: 'fallback',
      update: false,
    });

    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      notFound: 'fallback',
      update: false,
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@yandex.ru', name: 'Тестовый Космонавт' },
        }),
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Краторный био-марсианский бургер',
          order: { number: 777888 },
        }),
      });
    });

    // 3. Открываем страницу и проверяем авторизацию
    await page.goto('/');
    await expect(page.getByText('Тестовый Космонавт')).toBeVisible();

    // собираем бургер
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

    const constructorSection = page.locator('section').nth(1);
    await expect(constructorSection.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructorSection.getByText('Выберите начинку')).toBeVisible();
  });
});
