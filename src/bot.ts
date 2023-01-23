import { config } from "dotenv"
import { Bot } from "grammy"

config()

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