import { Bot } from "grammy"
import { OUTPUT } from "../messages"
import { Db, Province } from "../types"


const bot = new Bot(process.env.TELEGRAM_TOKEN as string)

export function botStart() {
  return bot.start()
}

export async function sendMessage(chatId: number, text: string) {
  await bot.api.sendMessage(chatId, text)
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

export async function handleGoodbye(db: Db, chatId: number): Promise<void> {
  await db.removeSubscriptions(chatId)
  return sendMessage(chatId, OUTPUT.GOODBYE)
}

export async function handleSubscription(db: Db, chatId: number, province: Province) {
  await db.addSubscription(chatId, province.code)
  await sendMessage(chatId, OUTPUT.ON_SUBSCRIBE)
  // const availables = await db.retrieveAvailable(province.code)
  // for (const available of availables) {
  //   await sendMessage(chatId, `C'è posto a ${available.city} - ${available.address}\nApri: ${available.url}`)
  // }
}