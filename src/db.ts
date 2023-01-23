import * as sqlite3 from "sqlite3"
import { SubscriptionGroup } from "./types"

sqlite3.verbose()
const db = new sqlite3.Database("./db/db.sqlite")

export async function retrieveSubscriptionsByProvince(): Promise<SubscriptionGroup[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT GROUP_CONCAT(telegram_id, ", ") as ids, province FROM subscriptions GROUP BY province;', (err, res: SubscriptionGroup[]) => {
      if (err) return reject(err)
      console.log("res", res)
      resolve(res)
    })
  })
}

export async function addSubscription(chatId: number, province: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run("INSERT OR IGNORE INTO subscriptions (telegram_id, province) VALUES (?, ?)", chatId.toString(), province, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

export async function removeSubscriptions(chatId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM subscriptions WHERE telegram_id = ?", chatId.toString(), (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}