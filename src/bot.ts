import { Bot } from "grammy"
import { retrieveAvailable } from "./availability"
import { GOODBYE } from "./constants"
import { addSubscription, removeSubscriptions } from "./db"
import { Province } from "./types"


const bot = new Bot(process.env.TELEGRAM_TOKEN as string)

export function sendMessage(chatId: number, text: string) {
  bot.api.sendMessage(chatId, text)
}

export function onMessage(cb: (chatId: number, text: string) => Promise<void>) {
  bot.on("message:text", ctx => cb(ctx.message.chat.id, ctx.message.text))
}

export function onNewChatMember(cb: (chatId: number) => Promise<void>) {
  bot.on("message:new_chat_members", ctx => cb(ctx.message.chat.id))
  bot.command("start", ctx => cb(ctx.message.chat.id))
}

export function onLeaveMember(cb: (chatId: number) => Promise<void>) {
  bot.on("message:left_chat_member:me", ctx => cb(ctx.message.chat.id))
}

export function startBot() {
  bot.start()
}

export async function handleGoodbye(chatId: number) {
  await removeSubscriptions(chatId)
  return sendMessage(chatId, "Ciao! Spero tu sia riucitə a prenotare! Per iscriverti di nuovo, scrivi una provincia.")
}

export async function handleSubscription(chatId: number, province: Province) {
  await addSubscription(chatId, province.code)
  await sendMessage(chatId, `Fatto! Inviami il nome di altre province, oppure scrivimi '${GOODBYE}' per cancellarti.\nEcco lo stato attuale per questa provincia:`)
  const availables = await retrieveAvailable(province.code)
  for (const available of availables) {
    await sendMessage(chatId, `C'è posto a ${available.city} - ${available.address}\nApri: ${available.url}`)
  }
}