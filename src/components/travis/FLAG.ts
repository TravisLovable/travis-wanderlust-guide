export const FLAG: Record<string, string> = {
  Portugal: "🇵🇹",
  Spain: "🇪🇸",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Greece: "🇬🇷",
  Germany: "🇩🇪",
  "United Kingdom": "🇬🇧",
  Ireland: "🇮🇪",
  Netherlands: "🇳🇱",
  Switzerland: "🇨🇭",
  Japan: "🇯🇵",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  "South Korea": "🇰🇷",
  Indonesia: "🇮🇩",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Kenya: "🇰🇪",
  "South Africa": "🇿🇦",
  Cuba: "🇨🇺",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Peru: "🇵🇪",
  Colombia: "🇨🇴",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Canada: "🇨🇦",
  "United States": "🇺🇸",
  Iceland: "🇮🇸",
};

export function flagFor(country: string | undefined | null): string {
  if (!country) return "";
  return FLAG[country] ?? "";
}
