// Single source of truth for currency based on country
// Used across the entire app — invoice, settings, dashboard

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  NG:'NGN', US:'USD', GB:'GBP', EU:'EUR', GH:'GHS', KE:'KES',
  ZA:'ZAR', AE:'AED', SA:'SAR', CA:'CAD', AU:'AUD', IN:'INR',
  BR:'BRL', ZM:'ZMW', TZ:'TZS', UG:'UGX', ET:'ETB', EG:'EGP',
  MA:'MAD', SN:'XOF', CI:'XOF', CM:'XAF', NG_DEFAULT:'NGN',
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN:'₦', USD:'$', GBP:'£', EUR:'€', GHS:'GH₵', KES:'KSh',
  ZAR:'R', AED:'AED', SAR:'SAR', CAD:'CA$', AUD:'A$', INR:'₹',
  BRL:'R$', ZMW:'ZMW', TZS:'TZS', UGX:'UGX', ETB:'ETB',
  EGP:'EGP', MAD:'MAD', XOF:'XOF', XAF:'XAF',
}

export const CURRENCY_NAMES: Record<string, string> = {
  NGN:'Nigerian Naira (₦)', USD:'US Dollar ($)', GBP:'British Pound (£)',
  EUR:'Euro (€)', GHS:'Ghanaian Cedi (GH₵)', KES:'Kenyan Shilling (KSh)',
  ZAR:'South African Rand (R)', AED:'UAE Dirham (AED)', SAR:'Saudi Riyal (SAR)',
  CAD:'Canadian Dollar (CA$)', AUD:'Australian Dollar (A$)', INR:'Indian Rupee (₹)',
  BRL:'Brazilian Real (R$)', ZMW:'Zambian Kwacha', TZS:'Tanzanian Shilling',
  UGX:'Ugandan Shilling', ETB:'Ethiopian Birr', EGP:'Egyptian Pound',
  MAD:'Moroccan Dirham', XOF:'West African CFA Franc',
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD'
}

export function formatAmount(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}
