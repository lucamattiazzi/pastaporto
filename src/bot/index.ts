import { GOODBYE } from "../constants"
import { Bot, Db } from "../types"
import { handleGoodbye, handleSubscription, onLeaveMember, onMessage, onNewChatMember, sendMessage } from "./eventHandlers"
import { findProvince } from "./utils"

function registerHandlers(db: Db) {
  onNewChatMember(async (chatId: number) => {
    await sendMessage(chatId, "Benvenutə! Dimmi a che provincia sei interessatə!")
  })

  onMessage(async (chatId: number, text: string) => {
    if (text === GOODBYE) return handleGoodbye(db, chatId)
    const province = findProvince(text)
    if (!province) return sendMessage(chatId, "Mi spiace, non conosco questa provincia, riprova!")
    await handleSubscription(db, chatId, province)
  })

  onLeaveMember(async (chatId: number) => {
    await db.removeSubscriptions(chatId)
  })
}

export function startBot(db: Db): Bot {
  registerHandlers(db)
  return {
    sendMessage,
  }
}