const { readCSV, DataFrame, Series } = require("nodejs-polars");

const changeUptime = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":");

  let convertedHours = parseInt(hours);

  if (convertedHours >= 24) {
    convertedHours = convertedHours % 24;
    return `${convertedHours
      .toString()
      .padStart(2, "0")}:${minutes}:${seconds}`;
  } else if (hours.length < 2) {
    return `0${hours}:${minutes}:${seconds}`;
  }

  return timeString;
};

const timeStringFixer = (dirtyCSV) => {

  let stoptimeDataframe = readCSV(dirtyCSV, {
    encoding: "utf8"
  });

  console.log(stoptimeDataframe)

  //get the rows and map over them

  const arrivals = stoptimeDataframe.getColumn("arrival_time");
  const departures = stoptimeDataframe.getColumn("departure_time");

  const arrivalsArray = [...arrivals.values()];
  const departuresArray = [...departures.values()];

  const arrivalMapped = arrivalsArray.map(changeUptime);
  const departureMapped = departuresArray.map(changeUptime);

  stoptimeDataframe = stoptimeDataframe.withColumn(
    Series("arrival_time", arrivalMapped)
  );

  stoptimeDataframe = stoptimeDataframe.withColumn(
    Series("departure_time", departureMapped)
  );

  return stoptimeDataframe.writeCSV();
};

module.exports = { timeStringFixer };
