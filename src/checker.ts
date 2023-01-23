import { retrieveAvailable } from "./availability"
import { sendMessage } from "./bot"
import { retrieveSubscriptionsByProvince } from "./db"
import { AvailablePlace } from "./types"

const currentlyAvailableByProvince: Record<string, AvailablePlace[]> = {}

export async function check(): Promise<void> {
  const subscriptionsByProvince = await retrieveSubscriptionsByProvince()
  if (subscriptionsByProvince.length === 0) return
  for (const provinceSubscriptions of subscriptionsByProvince) {
    const province = provinceSubscriptions.province
    const telegramIds = provinceSubscriptions.ids.split(",")
    const currentlyAvailable = currentlyAvailableByProvince[province] || [] as AvailablePlace[]
    const available = await retrieveAvailable(province)
    const currentlyAvailableDescriptions = currentlyAvailable.map(c => c.description)
    const difference = available.filter(a => !currentlyAvailableDescriptions.includes(a.description))
    console.log("difference", difference)
    const shouldSend = Boolean(currentlyAvailableByProvince[province])
    if (shouldSend) {
      for (const telegramId of telegramIds) {
        for (const newlyAvailablePlace of difference) {
          const text = `Adesso c'è posto a ${newlyAvailablePlace.city} - ${newlyAvailablePlace.address}\nApri: ${newlyAvailablePlace.url}`
          sendMessage(parseInt(telegramId), text)
        }
      }
    }
    currentlyAvailableByProvince[province] = available
  }
}
