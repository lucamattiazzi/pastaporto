export interface Place {
  description?: string
  address?: string
  city?: string
  url?: string
  available?: boolean
}
export interface Subscription {
  telegramId: string
  province: string
}

export interface SubscriptionGroup {
  ids: string
  province: string
}

export interface Province {
  name: string
  code: string
}