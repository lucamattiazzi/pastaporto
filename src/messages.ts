export const INPUT = {
  GOODBYE: "CIAONE",
  START: "/start",
}

export const OUTPUT = {
  START: "Benvenutə! Questo bot controlla continuamente se si liberano posti sul sito per prenotare l'appuntamento per il passaporto e ti avvisa.\nDimmi a che provincia sei interessatə!",
  GOODBYE: "Ciao! Spero tu sia riucitə a prenotare! Per iscriverti di nuovo, scrivi una provincia.",
  UNKNOWN_PROVINCE: "Non conosco questa provincia. Riprova!",
  ON_SUBSCRIBE: `Ottimo! Inviami il nome di altre province, oppure scrivimi '${INPUT.GOODBYE}' per cancellarti.`
}