import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMonths, differenceInYears, subDays, startOfDay, isAfter, isSameDay } from "date-fns";

let GLOBAL_ANNIVERSARY_DATE = new Date("2022-07-28T00:00:00");
let GLOBAL_TARGET_DATE = subDays(new Date(), -1); // Default to tomorrow

export function setDates(anniversary: string, target: string) {
  GLOBAL_ANNIVERSARY_DATE = new Date(anniversary);
  GLOBAL_TARGET_DATE = new Date(target);
}

export function getTimeTogether() {
  const now = new Date();
  
  const years = differenceInYears(now, GLOBAL_ANNIVERSARY_DATE);
  const months = differenceInMonths(now, GLOBAL_ANNIVERSARY_DATE) % 12;
  const days = differenceInDays(now, GLOBAL_ANNIVERSARY_DATE) % 30;
  const hours = differenceInHours(now, GLOBAL_ANNIVERSARY_DATE) % 24;
  const minutes = differenceInMinutes(now, GLOBAL_ANNIVERSARY_DATE) % 60;
  const seconds = differenceInSeconds(now, GLOBAL_ANNIVERSARY_DATE) % 60;

  return { years, months, days, hours, minutes, seconds };
}

/**
 * Returns true if we are on or after the target date
 */
export function isTargetMet() {
  const now = new Date();
  return isAfter(now, startOfDay(GLOBAL_TARGET_DATE)) || isSameDay(now, GLOBAL_TARGET_DATE);
}

/**
 * Checks if a specific day in the countdown is unlocked.
 * @param offset Days before targetDate (0 is the big day, 1 is day before, etc.)
 */
export function isDayUnlocked(offset: number) {
  if (typeof window !== "undefined") {
    const debugUnlock = localStorage.getItem("debug_unlock_all") === "true";
    if (debugUnlock) return true;
  }
  
  const now = new Date();
  const unlockDate = subDays(startOfDay(GLOBAL_TARGET_DATE), offset);
  return isAfter(now, unlockDate) || isSameDay(now, unlockDate);
}

/**
 * Gets time remaining until a specific day in the countdown
 */
export function getTimeUntilOffset(offset: number) {
  const now = new Date();
  const unlockDate = subDays(startOfDay(GLOBAL_TARGET_DATE), offset);
  const diff = unlockDate.getTime() - now.getTime();
  
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}
