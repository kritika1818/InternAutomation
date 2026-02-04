import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
test.describe("Demoblaze", () => {
test.beforeEach(async ({page})=>{
       await page.goto('/');
});
test('SignUp',async({page}) =>{
  await page.click('#signin2');
  await page.waitForSelector('#signInModal');
  await page.fill('#sign-username', process.env.demo_Username!);
  await page.fill('#sign-password',process.env.demo_Password!);
  await page.getByRole ('button',{name:'Sign up'}).click();
  page.once('dialog',async dialog=>{
    console.log('Signup alert:',dialog.message());
    await expect(dialog.message()).toMatch(/Sign up successful|This user already exists\./,);
    await dialog.accept();
  });

})
test('LogIn and AddtoCart', async ({ page }) => {
  await page.click('#login2');
  await page.waitForSelector('#logInModal');
  await page.fill('#loginusername', process.env.demo_Username!);
  await page.fill('#loginpassword', process.env.demo_Password!);
  await page.getByRole('button', { name: 'Log in' }).click();
  const welcome = page.locator('#nameofuser');
  await expect(welcome).toHaveText(`Welcome ${process.env.demo_Username!}`);

  const addItem = async (itemName: string) => {
    await page.getByRole('link', { name: itemName }).click();
    const addToCart = page.getByRole('link', { name: 'Add to cart' });
    await expect(addToCart).toBeVisible();
    await addToCart.click();
    page.once('dialog', async dialog => {
      console.log('Add to cart popup:', dialog.message());
      await dialog.accept();
    });
    await page.getByRole("link",{name:"Home"}).click();
  };

  await addItem ('Samsung galaxy s6');
  await addItem('Nokia lumia 1520');
  await addItem('Nexus 6');
  
  await page.click('#cartur');
  const rows = page.locator('#tbodyid tr');
  await expect(rows).toHaveCount(3);

  while (await rows.count() >1)
  {
    await rows.first().getByRole('link',{name:'Delete'}).click();
  }
  await page.pause();
  await page.getByRole('button', { name: 'Place Order' }).click();
  await page.fill('#name',process.env.demo_Name!);
  await page.fill('#country',process.env.demo_Country!);
  await page.fill('#city',process.env.demo_City!);
  await page.fill('#card',process.env.demo_Creditcard!);
  const month =new Date().getMonth();
  await page.fill('#month','month');
  const year=new Date().getFullYear();
  await page.fill('#year','year');
  await page.getByRole('button', { name: 'Purchase' }).click();
  await page.waitForSelector('.sweet-alert.showSweetAlert.visible');
  const okButton = page.locator('.sweet-alert button.confirm');
  await expect(okButton).toBeVisible();
  await okButton.click();
  await expect(page).toHaveURL('https://www.demoblaze.com/index.html');

});
});