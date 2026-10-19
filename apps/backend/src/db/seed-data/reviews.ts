// Клиенты, которые «оставили» отзывы во всех новых заведениях
export const REVIEWERS = [
  { name: "Lena Fischer", email: "reviewer1@slotbook.test", timezone: "Europe/Berlin" },
  { name: "Marco Rossi", email: "reviewer2@slotbook.test", timezone: "Europe/Rome" },
  { name: "Aisha Khan", email: "reviewer3@slotbook.test", timezone: "Asia/Kolkata" },
  { name: "Noah Smith", email: "reviewer4@slotbook.test", timezone: "America/New_York" },
  { name: "Zuzanna Nowak", email: "reviewer5@slotbook.test", timezone: "Europe/Warsaw" },
  { name: "Kenji Mori", email: "reviewer6@slotbook.test", timezone: "Asia/Tokyo" },
];

// Пары «оценка + текст» идут по кругу, поэтому средняя у заведений разная: от 4.0 до 5.0
export const REVIEW_POOL: Array<{ rating: number; comment: string | null }> = [
  { rating: 5, comment: "Super friendly team and a spotless place." },
  { rating: 5, comment: "Booked in two minutes, no waiting at all." },
  { rating: 4, comment: "Exactly what I asked for. Coming back next month." },
  { rating: 5, comment: null },
  { rating: 4, comment: "Great value for the price." },
  { rating: 5, comment: "Very professional, explained everything clearly." },
  { rating: 3, comment: "A bit of a wait, but the result was worth it." },
  { rating: 5, comment: "Best in the city, honestly." },
  { rating: 4, comment: "Good experience, parking nearby is tricky though." },
  { rating: 5, comment: "Lovely atmosphere and easy to find." },
];

// Сколько прошедших броней с отзывами получит i-е заведение (0 — «новое», без рейтинга)
export const REVIEW_COUNTS = [4, 2, 5, 3, 6, 0, 3, 5, 2, 4, 6, 3];
