import express from "express"
import serveIndex from "serve-index"
import { retrieveSubscriptionsByProvince } from "./db"

express.static.mime.define({
  "application/json": ["jsonlines"]
})
const app = express()


app.use("/db", express.static("./db"), serveIndex("./db", { "icons": true }))

app.get("/subscriptions", async (_req, res) => {
  const subscriptions = await retrieveSubscriptionsByProvince()
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

export function startServer() {
  app.listen(8000)
}