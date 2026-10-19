import type { FacilityCategory, Weekday } from "@slotbook/shared";

// «Вид» заведения точнее категории: и барбершоп, и маникюрный салон — это BEAUTY,
// но услуги, часы работы и картинка у них разные.
export const FACILITY_KINDS = [
  "barber",
  "hair",
  "nails",
  "brows",
  "dental",
  "physio",
  "gym",
  "climbing",
  "boxing",
  "surf",
  "pilates",
  "language",
  "music",
  "coding",
  "tutoring",
  "tea",
  "detailing",
  "yoga",
  "spa",
  "pottery",
  "studio",
] as const;
export type FacilityKind = (typeof FACILITY_KINDS)[number];

export const KIND_CATEGORY: Record<FacilityKind, FacilityCategory> = {
  barber: "BEAUTY",
  hair: "BEAUTY",
  nails: "BEAUTY",
  brows: "BEAUTY",
  dental: "MEDICAL",
  physio: "MEDICAL",
  gym: "SPORT_FITNESS",
  climbing: "SPORT_FITNESS",
  boxing: "SPORT_FITNESS",
  surf: "SPORT_FITNESS",
  pilates: "SPORT_FITNESS",
  language: "EDUCATION",
  music: "EDUCATION",
  coding: "EDUCATION",
  tutoring: "EDUCATION",
  tea: "EDUCATION",
  detailing: "AUTO",
  yoga: "OTHER",
  spa: "OTHER",
  pottery: "OTHER",
  studio: "OTHER",
};

// ─── услуги (цены в PLN, seed конвертирует в валюту заведения) ───────

export type ServiceTemplate = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  pricePln: number;
  isActive?: boolean;
};

const s = (
  name: string,
  description: string,
  category: string,
  durationMinutes: number,
  pricePln: number,
): ServiceTemplate => ({ name, description, category, durationMinutes, pricePln });

export const SERVICE_TEMPLATES: Record<FacilityKind, ServiceTemplate[]> = {
  barber: [
    s("Men's haircut", "Classic cut with styling", "haircut", 45, 80),
    s("Beard trim", "Shaping and hot towel finish", "beard", 30, 50),
    s("Women's haircut", "Cut, wash and blow dry", "haircut", 60, 120),
    s("Colouring", "Full colour with care treatment", "colour", 120, 250),
  ],
  hair: [
    s("Women's haircut", "Cut, wash and blow dry", "haircut", 60, 120),
    s("Blow dry & styling", "Wash and signature styling", "styling", 45, 90),
    s("Colouring", "Full colour with care treatment", "colour", 120, 250),
    s("Head spa", "Scalp cleanse and massage ritual", "care", 60, 180),
  ],
  nails: [
    s("Classic manicure", "Shape, cuticle care and polish", "manicure", 45, 80),
    s("Gel manicure", "Long lasting gel colour", "manicure", 60, 120),
    s("Pedicure", "Soak, scrub and polish", "pedicure", 60, 130),
    s("Nail art", "Hand painted design, add-on", "art", 30, 50),
  ],
  brows: [
    s("Brow shaping", "Wax, tweeze and tint", "brows", 30, 60),
    s("Brow lamination", "Brushed-up brows that last weeks", "brows", 45, 140),
    s("Lash lift", "Lift and tint of natural lashes", "lashes", 60, 160),
    s("Lash extensions", "Full classic set", "lashes", 120, 280),
  ],
  dental: [
    s("Consultation", "Initial specialist consultation", "consultation", 30, 200),
    s("Dental hygiene", "Scaling, polishing and fluoride", "hygiene", 45, 300),
    s("Annual check-up", "Full examination with report", "checkup", 60, 250),
    s("Teeth whitening", "In-office whitening session", "cosmetic", 60, 600),
  ],
  physio: [
    s("Initial assessment", "Examination and treatment plan", "consultation", 60, 220),
    s("Physiotherapy session", "Manual therapy and exercises", "therapy", 45, 180),
    s("Sports massage", "Recovery massage for active people", "massage", 60, 200),
  ],
  gym: [
    s("Personal training", "One-on-one session with a coach", "training", 60, 150),
    s("Group class", "Small group functional workout", "training", 45, 60),
    s("Fitness assessment", "Body composition and plan", "consultation", 30, 90),
  ],
  climbing: [
    s("Day pass & intro", "Gear, safety briefing and free climbing", "pass", 60, 45),
    s("Beginner course", "Technique basics with an instructor", "course", 90, 120),
    s("Kids climbing club", "Games and climbing for ages 6-12", "kids", 60, 60),
  ],
  boxing: [
    s("Boxing class", "Technique, bag work and conditioning", "class", 60, 50),
    s("Private pad work", "One-on-one with a coach", "private", 60, 160),
    s("Kids boxing", "Coordination and fun for ages 8-14", "kids", 45, 40),
  ],
  surf: [
    s("Group surf lesson", "Board, wetsuit and coach included", "lesson", 120, 180),
    s("Private surf lesson", "One-on-one in the water", "lesson", 90, 350),
    s("Board rental", "Two hours with a soft-top board", "rental", 120, 80),
  ],
  pilates: [
    s("Reformer class", "Small group reformer session", "class", 50, 110),
    s("Mat pilates", "Core focused mat class", "class", 60, 60),
    s("Private reformer", "One-on-one with an instructor", "private", 55, 250),
  ],
  language: [
    s("Trial lesson", "Level check and study plan", "lesson", 30, 30),
    s("Individual lesson", "One-on-one lesson with a tutor", "lesson", 60, 100),
    s("Exam preparation", "Focused prep with mock test", "exam", 90, 150),
  ],
  music: [
    s("Trial lesson", "Meet the teacher and try the piano", "lesson", 30, 40),
    s("Piano lesson", "Weekly lesson for any level", "lesson", 45, 120),
    s("Music theory", "Reading, harmony and ear training", "theory", 60, 100),
  ],
  coding: [
    s("Intro workshop", "Build your first web page", "workshop", 90, 100),
    s("1:1 mentoring", "Pair programming with a mentor", "mentoring", 60, 200),
    s("Code review session", "Review of your project with tips", "review", 45, 150),
  ],
  tutoring: [
    s("Trial lesson", "Level check and study plan", "lesson", 30, 30),
    s("Maths tutoring", "One-on-one lesson with a tutor", "lesson", 60, 110),
    s("Exam crash session", "Past papers and exam strategy", "exam", 90, 170),
  ],
  tea: [
    s("Tea ceremony experience", "Guided ceremony with sweets", "ceremony", 60, 150),
    s("Matcha workshop", "Learn to whisk your own matcha", "workshop", 75, 180),
    s("Private ceremony", "Ceremony for you and your guests", "private", 90, 400),
  ],
  detailing: [
    s("Interior detailing", "Deep clean of the cabin", "detailing", 180, 400),
    s("Paint polishing", "Single stage machine polish", "detailing", 240, 800),
    s("Ceramic coating", "Two layer coating with cure", "coating", 300, 2000),
  ],
  yoga: [
    s("Hatha class", "Slow paced group practice", "class", 60, 50),
    s("Vinyasa class", "Dynamic flow for all levels", "class", 75, 60),
    s("Private session", "Individual practice with a teacher", "private", 60, 200),
  ],
  spa: [
    s("Relaxing massage", "Full body massage with warm oils", "massage", 60, 200),
    s("Deep tissue massage", "Firm pressure for tight muscles", "massage", 60, 230),
    s("Hot stone massage", "Basalt stones and slow strokes", "massage", 90, 300),
    s("Facial", "Cleanse, mask and hydration", "facial", 45, 180),
  ],
  pottery: [
    s("Wheel taster", "Throw your first bowl on the wheel", "class", 120, 180),
    s("Hand building class", "Pinch, coil and slab techniques", "class", 120, 150),
    s("Private wheel lesson", "One-on-one at the wheel", "private", 90, 280),
  ],
  studio: [
    s("Rehearsal room", "Fully equipped room for your band", "rehearsal", 120, 120),
    s("Recording session", "Engineer, mics and rough mix", "recording", 180, 450),
    s("Podcast session", "Two mics, cameras and editing", "podcast", 60, 200),
  ],
};

// ─── часы работы по умолчанию ────────────────────────────────────────

export type HoursBlock = { days: Weekday[]; startTime: string; endTime: string };

export const MON_FRI: Weekday[] = [1, 2, 3, 4, 5];
export const MON_SAT: Weekday[] = [1, 2, 3, 4, 5, 6];
export const ALL_WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

const h = (days: Weekday[], startTime: string, endTime: string): HoursBlock => ({
  days,
  startTime: `${startTime}:00`,
  endTime: `${endTime}:00`,
});

const SALON = [h(MON_SAT, "10:00", "19:00")];
const CLINIC = [h(MON_FRI, "08:00", "12:00"), h(MON_FRI, "13:00", "17:00")]; // обед 12–13
const SPORT = [h(ALL_WEEK, "07:00", "22:00")];
const STUDIO_CLASSES = [h(MON_SAT, "07:00", "12:00"), h(MON_SAT, "17:00", "21:00")];
const SCHOOL = [h(MON_FRI, "10:00", "20:00"), h([6], "10:00", "14:00")];

export const KIND_HOURS: Record<FacilityKind, HoursBlock[]> = {
  barber: SALON,
  hair: SALON,
  nails: SALON,
  brows: SALON,
  dental: CLINIC,
  physio: [h(MON_FRI, "08:00", "20:00")],
  gym: SPORT,
  climbing: SPORT,
  boxing: SPORT,
  surf: [h(ALL_WEEK, "07:00", "17:00")],
  pilates: STUDIO_CLASSES,
  language: SCHOOL,
  music: SCHOOL,
  coding: SCHOOL,
  tutoring: SCHOOL,
  tea: [h([3, 4, 5, 6, 7], "10:00", "18:00")],
  detailing: [h(MON_SAT, "08:00", "18:00")],
  yoga: STUDIO_CLASSES,
  spa: [h(ALL_WEEK, "10:00", "21:00")],
  pottery: [h([2, 3, 4, 5, 6, 7], "11:00", "20:00")],
  studio: [h(ALL_WEEK, "12:00", "23:00")],
};

// Какой мотив рисует генератор картинок (tools/generate-images.mjs)
export const KIND_MOTIF: Record<FacilityKind, string> = {
  ...(Object.fromEntries(FACILITY_KINDS.map((k) => [k, k])) as Record<FacilityKind, string>),
  pilates: "yoga",
};
