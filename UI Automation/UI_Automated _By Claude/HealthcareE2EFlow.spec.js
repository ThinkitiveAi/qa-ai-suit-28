import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const firstNames = ['Amit', 'Rahul', 'Sneha', 'Priya', 'Anjali', 'Ravi', 'Karan', 'Meena'];
const lastNames = ['Sharma', 'Verma', 'Kapoor', 'Singh', 'Mehta', 'Reddy', 'Patel', 'Nair'];

test('E2E Provider Workflow – Virtual and In Person Flow', async ({ page }) => {
  const timestamp = Date.now();

  // --- Step 1: Login ---
  await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');
  await page.getByRole('textbox', { name: 'Email' }).fill('amanda.lee@healthcaretest.com');
  await page.getByRole('textbox', { name: '*********' }).fill('Admin@123');
  await page.getByRole('button', { name: "Let's get Started" }).click();
  await page.waitForURL('**/app/provider/**');

  // --- Step 2: Add Provider ---
  const providerFirstName = getRandomItem(firstNames);
  const providerLastName = getRandomItem(lastNames);
  const providerEmail = `auto.${providerFirstName.toLowerCase()}.${providerLastName.toLowerCase()}${timestamp}@testmail.com`;

  const providerData = {
    firstName: providerFirstName,
    lastName: providerLastName,
    email: providerEmail
  };

  await page.locator('a:has-text("Settings"), button:has-text("Settings"), [data-testid*="settings"]').first().click();
  await page.waitForTimeout(1000);
  await page.getByText('User Settings', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByText('Providers', { exact: true }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Add Provider User' }).click();
  await page.waitForTimeout(2000);

  await page.locator('input[name="firstName"]').fill(providerFirstName);
  await page.locator('input[name="lastName"]').fill(providerLastName);

  await page.locator('input[name="role"][role="combobox"]').click();
  await page.getByText('Provider', { exact: true }).click();

  await page.locator('input[name="gender"][role="combobox"]').click();
  await page.getByText('Male', { exact: true }).click();

  await page.locator('input[name="email"]').fill(providerEmail);

  const saveButton = page.locator('button:has-text("Save")');
  await expect(saveButton).toBeVisible({ timeout: 5000 });
  await saveButton.click();
  await page.waitForTimeout(2000);

  console.log(`✅ Provider created: ${providerEmail}`);

  // --- Step 3: Create Patient ---
// ✅ Add this DOB generator function above your test if not already present
function generateRandomDOB(){
  const startYear = 1960;
  const endYear = 2005;
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`;
}

const patientFirstName = faker.name.firstName();
const patientLastName = faker.name.lastName();
const patientEmail = `test.${faker.datatype.uuid().slice(0, 6)}@mailinator.com`;
const patientMobile = faker.phone.number('98########');
const patientDOB = generateRandomDOB();

await page.locator('div').filter({ hasText: /^Create$/ }).nth(1).click();
await page.getByRole('menuitem', { name: 'New Patient' }).click();
await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).click();
await page.getByRole('button', { name: 'Next' }).click();

await page.getByRole('textbox', { name: 'First Name *' }).fill(patientFirstName);
await page.getByRole('textbox', { name: 'Last Name *' }).fill(patientLastName);

// ✅ Format and fill DOB
if (!patientDOB || !patientDOB.includes('-')) {
  throw new Error(`Invalid patientDOB format: ${patientDOB}`);
}
const [month, day, year] = patientDOB.split('-');
const formattedDOB = `${month}/${day}/${year}`;
await page.getByRole('textbox', { name: 'Date Of Birth *' }).click();
await page.keyboard.type(formattedDOB);

// ✅ Fill Gender, Mobile, Email
await page.click('input[name="gender"]');
await page.click('text=Male');

await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(patientMobile);
await page.getByRole('textbox', { name: 'Email *' }).fill(patientEmail);

await page.getByRole('button', { name: 'Save' }).click();
await expect(page.locator('text=Patient Details Added Successfully.')).toBeVisible();
console.log(`✅ Patient created: ${patientFirstName} ${patientLastName}`);


 // ===== SET AVAILABILITY =====
await test.step('Set Provider Availability', async () => {
    console.log('🌐 Setting availability for Telehealth...');
    await page.getByText('Scheduling').click();
    await page.locator("//p[text()='Availability']").click();

    await page.getByRole('button', { name: 'Edit Availability' }).click();

    // Click the input field
    await page.locator('input[name="providerId"][placeholder="Select Provider"]').click();

    // ✅ FIXED: Use already defined variables instead of testData
    await page.locator('input[name="providerId"]').fill(`${providerFirstName} ${providerLastName}`);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Fill timezone input
    await page.locator('input[name="timezone"]').fill('Indian Standard Time');

    // ✅ FIXED: Use getByText for clicking the timezone option
    await page.getByText('Indian Standard Time (UTC +5:30)').click();

    // Set booking window
    const bookingInput = page.locator('input[name="bookingWindow"]');
    await expect(bookingInput).toBeVisible();
    await bookingInput.click({ force: true });
    await bookingInput.fill('1 week');

    const option = page.getByText('1 week');
    await expect(option).toBeVisible();
    await option.click();

    // Set Start and End Time
    console.log('⏰ Setting Start Time and End Time for Virtual appointments...');
    const startTimeInput = page.getByRole('combobox', { name: 'Start Time *' });
    const endTimeInput = page.getByRole('combobox', { name: 'End Time *' });

    await expect(startTimeInput).toBeVisible({ timeout: 10000 });
    await startTimeInput.click();
    await startTimeInput.fill('8:00 AM');
    await page.getByText('8:00 AM').click();

    await expect(endTimeInput).toBeVisible({ timeout: 10000 });
    await endTimeInput.click();
    await endTimeInput.fill('4:00 PM');
    await page.getByText('4:00 PM').click();

    await page.getByLabel('Set to Weekdays').check();
    await page.locator('p:has-text("Telehealth")').locator('..').locator('..').locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Save' }).click();
   console.log('✅ Virtual availability set successfully (8:00 AM - 4:00 PM)');
  });

  // ===== BOOK TELEHEALTH APPOINTMENT =====
  await test.step('Book Telehealth Appointment', async () => {
    console.log('🌐 Scheduling Telehealth appointment...');

    await page.locator('div').filter({ hasText: /^Create$/ }).nth(1).click();
    await page.getByText('New Appointment').click();

   const patientName = `${patientFirstName} ${patientLastName}`;
await page.locator('input[name="patientId"]').fill(patientName);

// ✅ Wait robustly, then click
const patientOption = page.locator(`li[role="option"]:has-text("${patientName}")`);
await expect(patientOption).toBeVisible({ timeout: 10000 });
await patientOption.click();

    const appointmentType = 'New Patient Visit';
    await page.locator('input[name="type"]').fill(appointmentType);
    const optionLocator = page.locator(`li[role="option"]:has-text("${appointmentType}")`);
    await optionLocator.waitFor({ state: 'visible' });
    await optionLocator.click();

    await page.getByLabel('Reason for Visit').fill('Routine Checkup');

    const timezone = 'Indian Standard Time (GMT +05:30)';
    const timezoneInput = page.locator('input[name="timezone"]');
    await timezoneInput.click();
    await timezoneInput.fill(timezone);

    const optionLocator1 = page.locator(`li[role="option"]:has-text("${timezone}")`);
    await optionLocator1.waitFor({ state: 'visible' });
    await optionLocator1.click();

    await page.locator('button[value="VIRTUAL"]').click();

    
        // Select provider
       const providerName = `${providerFirstName} ${providerLastName}`;
          
    // Select provider
    await this.page.click('div:has-text("Provider") + div .MuiSelect-select, [name*="provider"]');
    await this.page.waitForSelector(`li:has-text("${provider}")`);
    await this.page.click(`li:has-text("${provider}")`)
    
    // await expect(page.locator('input[placeholder="Search Provider"]')).toHaveValue(providerName);
    // await page.keyboard.press('ArrowDown');
    // await page.keyboard.press('Enter');

    await page.getByRole('button', { name: 'View Availability' }).click();
    await page.getByText(/\d{1,2}:\d{2} (AM|PM)/).first().click();
    await page.getByRole('button', { name: 'Save and Close' }).click();

    console.log('✅ Telehealth Appointment Booked');
  });
}); // ✅ Now this is truly the end of test block