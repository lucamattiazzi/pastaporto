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

export interface Bot {
  sendMessage: (chatId: number, text: string) => Promise<void>
}

export interface Db {
  retrieveSubscriptionsByProvince: () => Promise<SubscriptionGroup[]>
  addSubscription: (chatId: number, province: string) => Promise<void>
  removeSubscriptions: (chatId: number) => Promise<void>
}
