import { Page } from "puppeteer"
import { provinces } from "../constants"
import { Bot, Db, Place } from "../types"
import { retrieveAvailable } from "./availability"
import { generateLoggedPage } from "./pageLogger"
const previouslyAvailableByProvince: Record<string, Place[]> = {}

// function trackStatus(difference: Place[], code: string, openSpots: number, timestamp: number) {
//   const status = {
//     newInstances: difference.map(d => ({ city: d.city, address: d.address })),
//     openSpots: openSpots,
//     timestamp: timestamp,
//     province: code,
//   }
//   const line = JSON.stringify(status)
//   appendFile(TRACK_LOG, `${line}\n`)
// }

// export const TRACK_LOG = "./db/tracker.jsonlines"

async function loop(bot: Bot, db: Db, page: Page) {
  const subscriptionsByProvince = await db.retrieveSubscriptionsByProvince()
  // const timestamp = Date.now()
  for (const province of provinces) {
    const { code } = province
    const provinceSubscriptions = subscriptionsByProvince.find(s => s.province === code)
    const previouslyAvailable = previouslyAvailableByProvince[code] || [] as Place[]
    const currentlyAvailable = await retrieveAvailable(page, code)
    const previouslyAvailableDescriptions = previouslyAvailable.map(c => c.description)
    const difference = currentlyAvailable.filter(a => !previouslyAvailableDescriptions.includes(a.description))
    // trackStatus(difference, code, currentlyAvailable.length, timestamp)
    const shouldSend = Boolean(previouslyAvailableByProvince[code])
    previouslyAvailableByProvince[code] = currentlyAvailable
    if (!provinceSubscriptions || !shouldSend) return
    const telegramIds = provinceSubscriptions.ids.split(",")
    for (const telegramId of telegramIds) {
      for (const newlyAvailablePlace of difference) {
        const text = `Adesso c'è posto a ${newlyAvailablePlace.city} - ${newlyAvailablePlace.address}\nApri: ${newlyAvailablePlace.url}`
        await bot.sendMessage(parseInt(telegramId), text)
      }
    }
  }
  setTimeout(() => loop(bot, db, page), 1000 * 60)
}

export async function startChecker(bot: Bot, db: Db) {
  const page = await generateLoggedPage()
  await loop(bot, db, page)
}