import { get as levenshtein } from "fast-levenshtein"
import { provinces } from "./constants"
import { Province } from "./types"

export function findProvince(text = ""): Province {
  const province = provinces.find(p => {
    if (p.code === text.toUpperCase()) return true
    const distance = levenshtein(p.name.toUpperCase(), text.toUpperCase())
    return distance < 2
  })
  return province
}