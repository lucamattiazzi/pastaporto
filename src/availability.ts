
import axios from "axios"
import { parse } from "node-html-parser"
import { Place } from "./types"

export function findPlacesFromHTML(html: string): Place[] {
  const parsed = parse(html)
  const disponibilities = parsed.querySelectorAll("[headers='disponibilita']")
  const parents = disponibilities.map(f => f.parentNode)
  const available: Place[] = parents.map((p, idx) => {
    const description = p.querySelector("[headers='descrizione']")?.innerHTML
    const address = p.querySelector("[headers='indirizzo']")?.innerHTML
    const city = p.querySelector("[headers='citta']")?.innerHTML
    const path = p.querySelector("[headers='selezionaStruttura']")?.getElementsByTagName("a")[0]?.getAttribute("href") || ""
    const available = disponibilities[idx].innerHTML !== "No"
    const url = `https://www.passaportonline.poliziadistato.it/${path}`
    return { description, address, city, url, available }
  })
  return available
}

export async function retrieveAvailable(province: string): Promise<Place[]> {
  const response = await axios.get(`https://www.passaportonline.poliziadistato.it/CittadinoAction.do?codop=resultRicercaRegistiProvincia&provincia=${province}`)
  const html = await response.data
  const allPlaces = findPlacesFromHTML(html)
  const available = allPlaces.filter(p => p.available)
  return available
}
