import { } from "../constants"
import { log } from "../logger"
import { INPUT, OUTPUT } from "../messages"
import { Bot, Db } from "../types"
import { findProvince } from "../utils"
import { botStart, handleGoodbye, handleSubscription, onLeaveMember, onMessage, onNewChatMember, sendMessage } from "./eventHandlers"

async function registerHandlers(db: Db) {
  onNewChatMember(async (chatId: number) => {
    await sendMessage(chatId, OUTPUT.START)
  })

  onMessage(async (chatId: number, text: string) => {
    if (text === INPUT.GOODBYE) return handleGoodbye(db, chatId)
    if (text === INPUT.START) return sendMessage(chatId, OUTPUT.START)
    const province = findProvince(text)
    if (!province) return sendMessage(chatId, OUTPUT.UNKNOWN_PROVINCE)
    await handleSubscription(db, chatId, province)
  })

  onLeaveMember(async (chatId: number) => {
    await db.removeSubscriptions(chatId)
  })

  botStart()
}

export function startBot(db: Db): Bot {
  registerHandlers(db)
  log.log("Bot Started")
  return {
    sendMessage,
  }
}