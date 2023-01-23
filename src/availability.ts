
import axios from "axios"
import { parse } from "node-html-parser"
import { AvailablePlace } from "./types"

export async function retrieveAvailable(province: string): Promise<AvailablePlace[]> {
  const response = await axios.get(`https://www.passaportonline.poliziadistato.it/CittadinoAction.do?codop=resultRicercaRegistiProvincia&provincia=${province}`)
  const html = await response.data
  const parsed = parse(html)
  const disponibilities = parsed.querySelectorAll("[headers='disponibilita']")
  const filtered = disponibilities.filter(d => d.innerHTML !== "No")
  const parents = filtered.map(f => f.parentNode)
  const available: AvailablePlace[] = parents.map(p => {
    const description = p.querySelector("[headers='descrizione']")?.innerHTML
    const address = p.querySelector("[headers='indirizzo']")?.innerHTML
    const city = p.querySelector("[headers='citta']")?.innerHTML
    const path = p.querySelector("[headers='selezionaStruttura']")?.getElementsByTagName("a")[0].getAttribute("href")
    const url = `https://www.passaportonline.poliziadistato.it/${path}`
    return { description, address, city, url }
  })
  return available
}
