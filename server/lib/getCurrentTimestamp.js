function getCurrentTimestamp() {
  const nowDate = new Date()
  const justTime = nowDate.toTimeString().split(' ')[0].replace(/^0/, '')
  return justTime
}

function getCurrentDay() {
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const date = new Date()
  return weekday[date.getDay()].toLowerCase()
}

module.exports = { getCurrentTimestamp, getCurrentDay }
