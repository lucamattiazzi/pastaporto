import { appendFile } from "fs/promises"
import { retrieveAvailable } from "./availability"
import { sendMessage } from "./bot"
import { provinces, TRACK_LOG } from "./constants"
import { retrieveSubscriptionsByProvince } from "./db"
import { Place } from "./types"

const previouslyAvailableByProvince: Record<string, Place[]> = {}

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

export async function check(): Promise<void> {
  const subscriptionsByProvince = await retrieveSubscriptionsByProvince()
  const timestamp = Date.now()
  provinces.forEach(async (province) => {
    const { code } = province
    const provinceSubscriptions = subscriptionsByProvince.find(s => s.province === code)
    const previouslyAvailable = previouslyAvailableByProvince[code] || [] as Place[]
    const currentlyAvailable = await retrieveAvailable(code)
    const previouslyAvailableDescriptions = previouslyAvailable.map(c => c.description)
    const difference = currentlyAvailable.filter(a => !previouslyAvailableDescriptions.includes(a.description))
    trackStatus(difference, code, currentlyAvailable.length, timestamp)
    const shouldSend = Boolean(previouslyAvailableByProvince[code])
    previouslyAvailableByProvince[code] = currentlyAvailable
    if (!provinceSubscriptions || !shouldSend) return
    const telegramIds = provinceSubscriptions.ids.split(",")
    for (const telegramId of telegramIds) {
      for (const newlyAvailablePlace of difference) {
        const text = `Adesso c'è posto a ${newlyAvailablePlace.city} - ${newlyAvailablePlace.address}\nApri: ${newlyAvailablePlace.url}`
        sendMessage(parseInt(telegramId), text)
      }
    }
  })
}
