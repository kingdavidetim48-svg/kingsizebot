/**
 * End-to-end verification of the Clerk route protection on `/`.
 *
 * 1. Signed out  -> `/` must redirect to `/sign-in`, and no protected content
 *                   may appear in the response.
 * 2. Signed in   -> `/` must render the protected content and the user button.
 *
 * Uses @clerk/testing's `setupClerkTestingToken` to bypass bot detection on
 * the sign-in form, then signs in through the real UI. `CLERK_SECRET_KEY`
 * comes from .env.local; no credential is stored in the repo.
 *
 * Usage: node scripts/verify-auth.mjs [test-user-email] [test-user-password]
 */
import { config } from "dotenv"
import { chromium } from "patchright"
import { setupClerkTestingToken, clerkSetup } from "@clerk/testing/playwright"
import { createClerkClient } from "@clerk/backend"

config({ path: ".env.local" })

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const TEST_USER = process.argv[2] ?? "clerk_test_protect@example.com"

/**
 * Creates the test user's password via the Clerk backend API, so the
 * credential is generated here and never passed in on the command line.
 */
async function ensureTestUserPassword(email) {
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  const { data } = await client.users.getUserList({ emailAddress: [email] })
  if (!data || data.length === 0) throw new Error(`No Clerk user ${email}`)

  const password = `Verify${Math.random().toString(36).slice(2)}Pass9`
  await client.users.updateUser(data[0].id, { password })
  return password
}

const results = { testUser: TEST_USER }
const browser = await chromium.launch({ executablePath: CHROME })

try {
  // ---- 1. Signed out -------------------------------------------------
  const anon = await browser.newContext()
  const anonPage = await anon.newPage()

  const response = await anonPage.goto(`${BASE}/`, {
    waitUntil: "domcontentloaded",
  })
  results.signedOutStatus = response?.status()
  results.signedOutUrl = anonPage.url()
  results.redirectedToSignIn = anonPage.url().includes("/sign-in")
  results.redirectUrlParam = new URL(anonPage.url()).searchParams.get(
    "redirect_url"
  )

  const anonBody = await anonPage.content()
  results.protectedContentLeaked = anonBody.includes("Project ready!")
  results.anonUserButtonCount = await anonPage
    .locator("button.clerk-userButton")
    .count()

  await anon.close()

  // ---- 2. Sign in through the real form ------------------------------
  {
    const TEST_PASSWORD = await ensureTestUserPassword(TEST_USER)
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // clerkSetup resolves CLERK_FAPI / CLERK_TESTING_TOKEN from the app's
    // publishable key, which setupClerkTestingToken then injects.
    await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" })
    await clerkSetup({ page })

    // Registers the FAPI route handler that injects the testing token.
    await setupClerkTestingToken({ context: ctx })

    await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" })

    await page.waitForSelector("input[name='identifier']", { timeout: 20000 })
    await page.fill("input[name='identifier']", TEST_USER)
    await page.locator("button.cl-formButtonPrimary").first().click()

    // Clerk may show a client-trust interstitial before the password step.
    await page
      .waitForURL((url) => !url.pathname.includes("/client-trust"), {
        timeout: 8000,
      })
      .catch(async () => {
        results.clientTrustPage = true
        results.clientTrustText = await page
          .locator("body")
          .innerText()
          .catch(() => "")
        results.clientTrustButtons = await page
          .locator("button")
          .evaluateAll((els) =>
            els.map((e) => ({
              text: (e.textContent ?? "").trim().slice(0, 40),
              visible: !!(e.offsetWidth || e.offsetHeight),
              cls: e.className?.toString().slice(0, 50),
            }))
          )
        // Click through the interstitial.
        await page
          .locator("button.cl-formButtonPrimary")
          .first()
          .click()
          .catch(() => {})
        await page.waitForTimeout(3000)
      })

    await page.waitForSelector("input[name='password']", { timeout: 20000 })
    await page.fill("input[name='password']", TEST_PASSWORD)
    await page.locator("button.cl-formButtonPrimary").first().click()

    await page
      .waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
        timeout: 20000,
      })
      .catch(async () => {
        results.afterPasswordUrl = page.url()
        results.afterPasswordText = await page
          .locator("body")
          .innerText()
          .catch(() => "")
        throw new Error("still on a sign-in route after submitting the password")
      })

    results.signedInUrl = page.url()
    results.sessionCookieSet = (await ctx.cookies()).some((c) =>
      c.name.startsWith("__session")
    )

    // Now open the protected route.
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" })
    await page
      .waitForSelector("text=Project ready!", { timeout: 20000 })
      .catch(() => {})

    results.protectedUrl = page.url()
    results.protectedContentVisible = await page
      .locator("text=Project ready!")
      .first()
      .isVisible()
      .catch(() => false)
    results.userButtonCount = await page
      .locator("button.clerk-userButton")
      .count()

    await ctx.close()
  }
} catch (err) {
  results.error = err.message
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))
