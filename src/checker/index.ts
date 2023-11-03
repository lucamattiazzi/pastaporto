import { appendFile } from "fs/promises"
import { Page } from "puppeteer"
import { PROVINCES } from "../constants"
import { log } from "../logger"
import { Bot, Db, Place } from "../types"
import { runOrRetry } from "../utils"
import { retrieveAvailable } from "./availability"
import { generateLoggedPage } from "./pageLogger"

const previouslyAvailableByProvinceCache: Record<string, Place[]> = {}

function trackStatus(difference: Place[], code: string, openSpots: number, timestamp: number) {
  const status = {
    newInstances: difference.map(d => ({ city: d.city, address: d.address })),
    openSpots: openSpots,
    timestamp: timestamp,
    province: code,
  }
  const line = JSON.stringify(status)
  appendFile(TRACK_LOG, `${line}\n`)
}

export const TRACK_LOG = "./db/tracker.jsonlines"

async function loop(bot: Bot, db: Db, page: Page) {
  const subscriptionsByProvince = await db.retrieveSubscriptionsByProvince()
  const timestamp = Date.now()
  log.log(`Checking availability @ ${timestamp}`)
  for (const province of PROVINCES) {
    const { code } = province
    const provinceSubscriptions = subscriptionsByProvince.find(s => s.province === code)
    const previouslyAvailable = previouslyAvailableByProvinceCache[code] || [] as Place[]
    const currentlyAvailable = await retrieveAvailable(page, code)
    const previouslyAvailableDescriptions = previouslyAvailable.map(c => c.description)
    const difference = currentlyAvailable.filter(a => !previouslyAvailableDescriptions.includes(a.description))
    await trackStatus(difference, code, currentlyAvailable.length, timestamp)
    const shouldSend = Boolean(previouslyAvailableByProvinceCache[code])
    previouslyAvailableByProvinceCache[code] = currentlyAvailable
    if (!provinceSubscriptions || !shouldSend) continue
    const telegramIds = provinceSubscriptions.ids.split(",")
    for (const telegramId of telegramIds) {
      for (const newlyAvailablePlace of difference) {
        const text = `Adesso c'è posto a ${newlyAvailablePlace.city} - ${newlyAvailablePlace.address}\nApri: ${newlyAvailablePlace.url}`
        bot.sendMessage(parseInt(telegramId), text)
      }
    }
  }
  setTimeout(() => loop(bot, db, page), 1000 * 60)
}

export async function startChecker(bot: Bot, db: Db) {
  const page = await runOrRetry(generateLoggedPage, 10, 1000 * 60 * 15)
  log.log("Checker page created")
  await loop(bot, db, page)
}