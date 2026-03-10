import { DateTime } from "luxon"

function isDateValue(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

class DateTimeUtils {
  static getCurrentDateTimeString(): string {
    return DateTime.utc().toISO() || ""
  }

  static getCurrentDateTimeUtc(): Date {
    return DateTime.utc().toJSDate()
  }

  static getTomorrowsDateTimeUtc(): Date {
    return DateTime.utc().plus({ day: 1 }).toJSDate()
  }

  static getCurrentUnixTimestamp(): number {
    return DateTime.utc().toUnixInteger()
  }

  /**
   * Returns as 02/11/2023
   * @param date
   */
  static getLocalDateShortFormatted(date: Date | string): string {
    if (!date) return ""
    if (typeof date === "string") {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT)
    }
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_SHORT)
  }

  /**
   * Returns as 11:23 AM
   * @param date
   */
  static getSimpleLocalTimeFormatted(date: Date | string): string {
    if (!date) return ""
    if (typeof date === "string") {
      return DateTime.fromISO(date).toLocaleString(DateTime.TIME_SIMPLE)
    }
    return DateTime.fromJSDate(date).toLocaleString(DateTime.TIME_SIMPLE)
  }

  // getUserDateTimeStringFromUnit(unixTime: string, userTimezone: string) {
  //   moment(unixTime, "X").tz(userTimezone).format("lll")
  // }

  static getResetPassExpirationDate() {
    return DateTime.utc().plus({ hour: 1 }).toUnixInteger()
  }

  static getEmailVerificationExpirationDate() {
    return DateTime.utc().plus({ day: 1 }).toUnixInteger()
  }

  static toJsDate(d: any): Date | null {
    if (!d) return null
    if (isDateValue(d)) return d
    if (typeof d === "string") return DateTime.fromISO(d).toJSDate()
    throw Error("unknown date object")
  }
}

export default DateTimeUtils
