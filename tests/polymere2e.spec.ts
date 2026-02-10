import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load JSON fixture
const checkoutData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './checkout.json'), 'utf-8')
);

async function addProductToCart(page: Page, category: string, productName: string) {
  await page.getByRole('link',{ name: category, exact: true }).click();

  const productImage = page.getByRole('img', { name: productName });
  await expect(productImage).toBeVisible();
  await productImage.click();

  await expect(page.locator('#content')).toBeVisible();

  const addToCartBtn = page.getByRole('button', {name: /add this item to cart/i});
  await expect(addToCartBtn).toBeVisible();
  await addToCartBtn.click();
  await expect(page.getByText('Added to cart')).toBeVisible();

  
  await page.goBack();
  await page.evaluate(() => window.scrollTo(0, 0));
}


async function fillCheckoutForm(page: Page, data: typeof checkoutData) {
  await page.fill('#accountEmail', data.email);
  await page.fill('#accountPhone', data.phone);

  await page.fill('#shipAddress', data.shipping.address);
  await page.fill('#shipCity', data.shipping.city);
  await page.fill('#shipState', data.shipping.state);
  await page.fill('#shipZip', data.shipping.zip);

  // Optional billing info
  // await page.fill('#billAddress', data.billing.address);
  // await page.fill('#billCity', data.billing.city);
  // await page.fill('#billState', data.billing.state);
  // await page.fill('#billZip', data.billing.zip);

  await page.fill('#ccName', data.creditCard.name);
  await page.fill('#ccNumber', data.creditCard.number);

  await page.fill('#ccCVV', data.creditCard.cvv);
}


async function removeFirstCartItem(cartItems: Locator) {
  const firstCartItem = cartItems.first();
  const deleteBtn = firstCartItem.getByRole('button', { name: /delete item/i });
  await deleteBtn.click();
}


test('Polymer Shop', async ({ page }) => {
  await page.goto('https://shop.polymer-project.org/');

  
  await addProductToCart(page, "Men's Outerwear", 'Anvil L/S Crew Neck - Grey');
  await addProductToCart(page, "Ladies T-Shirts", 'Ladies Chrome T-Shirt');

  
  await page.getByRole('button', { name: 'Shopping cart' }).click();
  await expect(page).toHaveURL(/\/cart/);

  
  const cartItems = page.locator('shop-cart-item');
  await expect(cartItems).toHaveCount(2);

  
  await removeFirstCartItem(cartItems);

  
  await expect(cartItems).toHaveCount(1);

  
  const checkout = page.getByRole('link', { name: 'Checkout' });
  await expect(checkout).toBeVisible();
  await checkout.click();
  await expect(page).toHaveURL(/\/checkout/);

  
  await fillCheckoutForm(page, checkoutData);

  const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
  await expect(placeOrderBtn).toBeEnabled();
  await placeOrderBtn.click();

  await expect(page).toHaveURL(/\/success/);
  await expect(page.getByText('Thank you')).toBeVisible();

  const finish = page.getByRole('link', { name: 'Finish' });
  await finish.click();
  await expect(page).toHaveURL("https://shop.polymer-project.org/");
});
