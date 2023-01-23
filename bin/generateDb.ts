import * as sqlite3 from "sqlite3"
sqlite3.verbose()
const db = new sqlite3.Database("./db/db.sqlite")

db.run("CREATE TABLE subscriptions (telegram_id TEXT, province TEXT, UNIQUE(telegram_id, province))", () => db.close())
