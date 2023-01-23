import * as Sentry from "@sentry/node"
import { config } from "dotenv"
import * as cron from "node-cron"
import { handleGoodbye, handleSubscription, onLeaveMember, onMessage, onNewChatMember, sendMessage, startBot } from "./src/bot"
import { check } from "./src/checker"
import { GOODBYE } from "./src/constants"
import { removeSubscriptions } from "./src/db"
import { findProvince } from "./src/provinces"

config()

Sentry.init({
  dsn: process.env.SENTRY_URL,
  tracesSampleRate: 1.0,
})

onNewChatMember(async (chatId: number) => {
  await sendMessage(chatId, "Benvenutə! Dimmi a che provincia sei interessatə!")
})

onMessage(async (chatId: number, text: string) => {
  if (text === GOODBYE) return handleGoodbye(chatId)
  const province = findProvince(text)
  if (!province) return sendMessage(chatId, "Mi spiace, non conosco questa provincia, riprova!")
  await handleSubscription(chatId, province)
})

onLeaveMember(async (chatId: number) => {
  await removeSubscriptions(chatId)
})

cron.schedule("* * * * *", () => check())
startBot()