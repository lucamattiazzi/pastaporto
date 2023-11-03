import express from "express"
import serveIndex from "serve-index"
import { log } from "../logger"
import { Db } from "../types"

express.static.mime.define({
  "application/json": ["jsonlines"]
})

export function startServer(db: Db) {
  const app = express()

  app.use("/db", express.static("./db"), serveIndex("./db", { "icons": true }))

  app.get("/subscriptions", async (_req, res) => {
    const subscriptions = await db.retrieveSubscriptionsByProvince()
    res.json(subscriptions)
  })

  app.get("/", async (_req, res) => {
    const html = `
    <a href="/db">Databases</a>
    </br>
    <a href="/subscriptions">Subscriptions</a>
  `
    res.send(html)
  })

  app.listen(8000, () => log.log("Server started on port 8000"))
}