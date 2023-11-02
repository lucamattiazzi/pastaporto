import { config } from "dotenv"
config()

import * as Sentry from "@sentry/node"
import { startBot } from "./bot/index"
import { startChecker } from "./checker/index"
import { db } from "./db/index"
import { startServer } from "./server/index"

Sentry.init({
  dsn: process.env.SENTRY_URL,
  tracesSampleRate: 1.0,
})

const bot = startBot(db)
startChecker(bot, db)
startServer(db)