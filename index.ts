import * as cron from "node-cron"
import { onLeaveMember, onMessage, onNewChatMember, sendMessage, startBot } from "./src/bot"
import { check } from "./src/checker"
import { GOODBYE } from "./src/constants"
import { addSubscription, removeSubscriptions } from "./src/db"
import { findProvince } from "./src/provinces"

onNewChatMember(async (chatId: number) => {
  sendMessage(chatId, "Benvenutə! Dimmi a che provincia sei interessatə!")
})

onMessage(async (chatId: number, text: string) => {
  if (text === GOODBYE) {
    await removeSubscriptions(chatId)
    return sendMessage(chatId, "Ciao! Spero tu sia riucitə a prenotare! Per iscriverti di nuovo, scrivi una provincia.")
  }
  const province = findProvince(text)
  if (!province) return sendMessage(chatId, "Mi spiace, non conosco questa provincia, riprova!")
  try {
    await addSubscription(chatId, province.code)
    sendMessage(chatId, `Fatto! Inviami il nome di altre province, oppure scrivimi '${GOODBYE}' per cancellarti.`)
  }
  catch (err) {
    console.error(err)
    sendMessage(chatId, "Mi spiace, s'è scassato qualcosa, riprova!")
  }
})

onLeaveMember(async (chatId: number) => {
  removeSubscriptions(chatId).then(console.log).catch(console.error)
})

cron.schedule("* * * * *", () => {
  check()
})

check()
startBot()