// مسیر پیشنهادی: server/utils/attributeExtractor.ts

// تبدیل اعداد فارسی به انگلیسی برای یکپارچگی دیتابیس
const normalizeNumbers = (str: string) => {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g]
  const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]
  for (let i = 0; i < 10; i++) {
    str = str.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString())
  }
  return str
}

export const extractAttributesFromName = (rawName: string) => {
  const name = normalizeNumbers(rawName)
  const attributes: Record<string, string> = {}

  // ۱. استخراج آلیاژ (معمولاً اعداد 3 رقمی مثل 201, 304, 316)
  const alloyMatch = name.match(/(?:استیل|آلیاژ)?\s*(201|304|310|316|420|430)/)
  if (alloyMatch) attributes['alloy'] = alloyMatch[1]

  // ۲. استخراج ابعاد/سایز (مثل 20*20 یا 20×20)
  const sizeMatch = name.match(/سایز\s*([\d]+[\*×xX][\d]+)/i)
  if (sizeMatch) attributes['size'] = sizeMatch[1].toLowerCase().replace('×', '*')

  // ۳. استخراج ضخامت (اعداد اعشاری یا صحیح بعد از کلمه ضخامت)
  const thicknessMatch = name.match(/ضخامت\s*([\d.]+)/)
  if (thicknessMatch) attributes['thickness'] = thicknessMatch[1]

  // ۴. استخراج کیفیت سطح یا رنگ (هر چیزی که بعد از خط تیره "-" آمده باشد)
  const surfaceMatch = name.match(/-\s*(.+)$/)
  if (surfaceMatch) attributes['surface'] = surfaceMatch[1].trim()

  return attributes
}