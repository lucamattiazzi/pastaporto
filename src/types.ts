export type AvailablePlace = {
  description?: string
  address?: string
  city?: string
  url?: string
}

export type Subscription = {
  telegramId: string
  province: string
}

export type SubscriptionGroup = {
  ids: string
  province: string
}

export type Province = {
  name: string
  code: string
}