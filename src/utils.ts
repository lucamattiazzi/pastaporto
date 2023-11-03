import { get as levenshtein } from "fast-levenshtein"
import { PROVINCES } from "./constants"
import { Province } from "./types"

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function findProvince(text = ""): Province {
  const province = PROVINCES.find(p => {
    if (p.code === text.toUpperCase()) return true
    const distance = levenshtein(p.name.toUpperCase(), text.toUpperCase())
    return distance < 2
  })
  return province
}

type Retryable<O> = () => Promise<O>

export async function runOrRetry<O>(fn: Retryable<O>, retries = 0, delay = 1000): Promise<O> {
  try {
    return await fn()
  } catch (e) {
    if (retries > 0) {
      await sleep(delay)
      return runOrRetry(fn, retries - 1, delay)
    }
    throw e
  }
}
