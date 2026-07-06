/** TIMELINE */

export const TIMELINE_START_MIN = 8 * 60;
// export const TIMELINE_TOTAL_MIN = 12 * 60;
// export const TIMELINE_TOTAL_MIN = 14 * 60;

export const BED_LABEL_WIDTH_PX = 80; // matches your w-[80px]
export const TOTAL_MINS = 14 * 60; // 08:00–22:00 = 840 mins
// export const TOTAL_WIDTH_PX = (TOTAL_MINS / 60) * HOUR_WIDTH_PX; // 1680px

export const TIMELINE_END_MIN = 22 * 60; // 1320 (22:00)
export const TIMELINE_TOTAL_MIN = TIMELINE_END_MIN - TIMELINE_START_MIN; // 840
// export const HOUR_WIDTH_PX = 120; // px per hour
// export const HOUR_WIDTH_PX = 160; // px per hour
export const HOUR_WIDTH_PX = 98; // px per hour
export const TOTAL_WIDTH_PX = (TIMELINE_TOTAL_MIN / 60) * HOUR_WIDTH_PX; // 1680px
