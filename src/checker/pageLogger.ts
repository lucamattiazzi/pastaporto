import puppeteer, { Page } from "puppeteer"
import { sleep } from "../utils"

const SPID_USERNAME = process.env.SPID_USERNAME || ""
const SPID_PASSWORD = process.env.SPID_PASSWORD || ""

function waitForRedirectOrTimeout(page: Page, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeout)
    page.once("framenavigated", () => resolve())
  })
}

async function goToSPIDAuth(page: Page) {
  await page.goto("https://passaportonline.poliziadistato.it/cittadino/n/sc/loginCittadino/sceltaLogin")
  await sleep(2000)
  const button = await page.$(".italia-it-button")
  if (!button) throw new Error("No buttons found")
  button.click()
  await page.waitForNavigation()
  await sleep(1000)
}

async function openSPIDList(page: Page) {
  await sleep(2000)
  const button = await page.$(".italia-it-button")
  if (!button) throw new Error("No buttons found")
  button.click()
  await sleep(1000)
}

async function goToSPIDLogin(page: Page) {
  const buttonContainer = await page.$('[data-idp="https://posteid.poste.it"]')
  console.log("buttonContainer", buttonContainer)
  if (!buttonContainer) throw new Error("No buttons found")
  const button = await buttonContainer.$("a")
  if (!button) throw new Error("No buttons found")
  button.click()
  await page.waitForNavigation()
}

async function fillForm(page: Page) {
  const usernameElement = await page.$("#username")
  const passwordElement = await page.$("#password")
  if (!usernameElement || !passwordElement) throw new Error("No username or password element found")
  await usernameElement.type(SPID_USERNAME)
  await passwordElement.type(SPID_PASSWORD)
  const button = await page.$(".btn-login")
  if (!button) throw new Error("No buttons found")
  button.click()
  await page.waitForNavigation()
}

async function generateAndroidNotification(page) {
  const buttons = await page.$x("//a[contains(., 'ricevere una notifica')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
  await waitForRedirectOrTimeout(page, 60000)
}

async function acceptCookies(page) {
  const acceptCookiesButton = await page.$("#acceptCheckbox")
  if (!acceptCookiesButton) throw new Error("No button found")
  acceptCookiesButton.click()
  const confirmButtons = await page.$x("//button[contains(text(), 'Conferma')]")
  if (!confirmButtons[0]) throw new Error("No buttons found")
  confirmButtons[0].click()
  await page.waitForNavigation()(page, 60000)
}

async function goToPoliziaPage(page) {
  const buttons = await page.$x("//button[contains(., 'Acconsento')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
  await page.waitForNavigation()
}

async function goToPassportPage(page) {
  const buttons = await page.$x("//a[contains(., 'Inserisci Appuntamento')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
}

export async function generateLoggedPage(): Promise<Page> {
  const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox", "--disable-setuid-sandbox"] })
  const page = await browser.newPage()
  console.log("page", page)
  await goToSPIDAuth(page)
  await openSPIDList(page)
  await goToSPIDLogin(page)
  await fillForm(page)
  await generateAndroidNotification(page)
  await goToPoliziaPage(page)
  await sleep(2000)
  await acceptCookies(page)
  await sleep(3000)
  await goToPassportPage(page)
  await sleep(5000)
  return page
}