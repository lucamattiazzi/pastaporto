import { config } from "dotenv"
import { appendFile } from "fs/promises"
import puppeteer, { Page } from "puppeteer"
import { findPlacesFromHTML } from "../src/availability"
config()

const SPID_USERNAME = process.env.SPID_USERNAME || ""
const SPID_PASSWORD = process.env.SPID_PASSWORD || ""
const FILE = "./all.txt"

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function waitForRedirectOrTimeout(page: Page, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeout)
    page.once("framenavigated", () => resolve())
  })
}

async function goToSPIDAuth(page: Page) {
  console.log("goToSPIDAuth")
  await page.goto("https://www.passaportonline.poliziadistato.it/LogInAction.do?codop=loginCittadino")
  const button = await page.$(".italia-it-button-text")
  if (!button) throw new Error("No buttons found")
  button.click()
  await page.waitForNavigation()
  await sleep(1000)
}

async function openSPIDList(page: Page) {
  console.log("openSPIDList")
  const button = await page.$(".italia-it-button-text")
  if (!button) throw new Error("No buttons found")
  button.click()
  await sleep(100)
}

async function goToSPIDLogin(page: Page) {
  console.log("goToSPIDLogin")
  const buttonContainer = await page.$('[data-idp="https://posteid.poste.it"]')
  if (!buttonContainer) throw new Error("No buttons found")
  const button = await buttonContainer.$("a")
  if (!button) throw new Error("No buttons found")
  button.click()
  await page.waitForNavigation()
}

async function fillForm(page: Page) {
  console.log("fillForm")
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
  console.log("generateAndroidNotification")
  const buttons = await page.$x("//a[contains(., 'ricevere una notifica')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
  await waitForRedirectOrTimeout(page, 60000)
}

async function goToPoliziaPage(page) {
  console.log("goToPoliziaPage")
  const buttons = await page.$x("//button[contains(., 'Acconsento')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
  await page.waitForNavigation()
}

async function goToPassportPage(page) {
  console.log("goToPassportPage")
  const buttons = await page.$x("//a[contains(., 'Inserisci Appuntamento')]")
  if (!buttons[0]) throw new Error("No buttons found")
  await buttons[0].click()
  await page.waitForNavigation()
}

async function retrievePlaces(page) {
  console.log("retrievePlaces")
  const html = await page.content()
  const allPlaces = findPlacesFromHTML(html)
  console.log("allPlaces", allPlaces)
  if (allPlaces.length === 0) throw new Error("No places found")
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")
  const total = allPlaces.length
  const available = allPlaces.filter(p => p.available).length
  const text = `${timestamp} - ${total} total places, ${available} available\n`
  await appendFile(FILE, text)
}

async function runAuthFlow() {
  console.log("runAuthFlow")
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await goToSPIDAuth(page)
  await openSPIDList(page)
  await goToSPIDLogin(page)
  await fillForm(page)
  await generateAndroidNotification(page)
  await goToPoliziaPage(page)
  await sleep(3000)
  await goToPassportPage(page)
  await sleep(3000)
  while (true) {
    try {
      await retrievePlaces(page)
      await sleep(60000)
      await page.reload()
    } catch (e) {
      console.error(e)
      break
    }
  }
  browser.close()
  process.exit(1)
}

runAuthFlow()