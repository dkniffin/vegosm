import OpeningHours from "opening_hours"

function _formatToAmPmParts(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Expected a valid Date object')
  }

  let hours = date.getHours()       // local hours
  const minutes = date.getMinutes() // local minutes
  const ampm = hours >= 12 ? "pm" : "am"

  hours = hours % 12
  hours = hours ? hours : 12 // convert 0 → 12

  let timeStr
  if (minutes === 0) {
    timeStr = `${hours}`
  } else {
    timeStr = `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  return { timeStr, ampm }
}

function _formatRange(fromDate, toDate) {
  const from = _formatToAmPmParts(fromDate)
  const to = _formatToAmPmParts(toDate)

  if (from.ampm === to.ampm) {
    return `${from.timeStr}-${to.timeStr}${to.ampm}`
  } else {
    return `${from.timeStr}${from.ampm}-${to.timeStr}${to.ampm}`
  }
}

export default function prettyOpenHours(tags) {
  if (!tags["opening_hours"]) { return }
  let prettyOpenHours = {}

  const oh = new OpeningHours(tags["opening_hours"], {}, { 'locale': navigator.language })

  prettyOpenHours["now"] = oh.getState()

  const dayOfWeekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Loop over the next 7 days (including today)
  for (let i = 0; i <= 6; i++) {
    const date = new Date(new Date().setDate(new Date().getDate() + i))
    const start = new Date(date.setHours(0, 0))
    const end = new Date(date.setHours(23, 59))
    const dayOfWeek = dayOfWeekMap[date.getDay()]

    const intervals = oh.getOpenIntervals(start, end)
    if (intervals.length == 0) {
      prettyOpenHours[dayOfWeek] = "Closed"
    } else {
      let prettyIntervalStrings = []

      for (const j in intervals) {
        // eg ["2025-08-17T15:00:00.000Z","2025-08-17T19:00:00.000Z",false,null]
        const interval = intervals[j]
        const from = new Date(interval[0])
        const to = new Date(interval[1])

        prettyIntervalStrings.push(_formatRange(from, to))

      }
      prettyOpenHours[dayOfWeek] = prettyIntervalStrings.join(", ")
    }
  }


  /*
    {
      now: true/false,
      monday: "8-9am",
      tuesday: "11am-2pm",
      wednesday: "5:30-7pm",
      thursday: "11am-1pm, 5-9pm",
      friday: "Closed",
      saturday: "Closed",
      sunday: "Closed",
    }
  */
  return prettyOpenHours
}
