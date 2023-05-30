const neo4j = require("neo4j-driver");
const { IndexQueries, loadQueries } = require("./queries");
const {
  writeFile,
  access,
  mkdir,
  opendir,
  readdir,
  rename,
  readFile
} = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { default: axios } = require("axios");
const admZip = require("adm-zip");
const path = require("node:path");
const driver = neo4j.driver(
  "bolt://localhost:7999",
  neo4j.auth.basic("neo4j", "password")
);

const config = require("./gtfs-config.json");
const { timeStringFixer } = require("./datacleanser");

const checkFolderExists = async (folderName) => {
  try {
    const dirContents = await opendir(`${config.savepath}${folderName}`);
    dirContents.close();
    return Promise.resolve("Exists");
  } catch (error) {
    console.error(`${error.message}, creating folder...`);
    await mkdir(`${config.savepath}${folderName}`);
    return Promise.resolve("folder created");
  }
};

const downloadFile = async (url, folderName) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    await checkFolderExists(folderName);
    // Write the file to disk
    await writeFile(`${config.savepath}${folderName}/data.zip`, buffer);

    console.log(
      `Downloaded file from ${url} and saved it to ${config.savepath}${folderName}`
    );
    return Promise.resolve(folderName);
  } catch (err) {
    console.error(`Error downloading file from ${url}: ${err.message}`);
  }
};

//run the following queries
const GTFSLoader = async (folderName, omittedSubAgency) => {
  const session = driver.session();
  let promise = Promise.resolve();
  for (const query of IndexQueries) {
    promise = promise.then(() => session.run(query));
  }

  for (const query of loadQueries) {
    promise = promise.then(() =>
      session.run(
        query.replace("$folder_name", folderName).replace(
          "$items",
          omittedSubAgency?.length
            ? `${omittedSubAgency
                .filter((item) => typeof item === "string")
                .map((str) => `'${str}'`)
                .join(", ")}`
            : []
        )
      )
    );
  }
  await promise;

  session.close();

  return Promise.resolve(folderName);
};

const main = async () => {
  //interate over the JSON config
  const downloadsArray = [];
  console.log(`${config.savepath}`);

  for (const agency of config.agencies) {
    downloadsArray.push(downloadFile(agency.url, agency.agency));
  }

  //wait for downloads to finish
  const results = await Promise.allSettled(downloadsArray);

  //extract
  console.time("downloading");
  for (const agency of config.agencies) {
    const filePath = `${config.savepath}${agency.agency}/data.zip`;
    const unzip = new admZip(filePath);
    unzip.extractAllTo(`${config.savepath}${agency.agency}`);

    try {
      // look into the fileSwap and add what ever is there into the folder
      // get files in the folder

      if (agency.fileSwaps.length != 0) {
        // loop over it and add whatever is in there
        for (const fileSwap of agency.fileSwaps || []) {
          let swapURL = fileSwap.url;
          let filePath = `${config.savepath}${agency.agency}/${fileSwap.file}`;

          // Replace the file with the one from the swap URL
          const response = await axios.get(swapURL, {
            responseType: "arraybuffer"
          });
          const buffer = Buffer.from(response.data);

          // Save the downloaded file, overwriting the existing one
          await writeFile(filePath, buffer);

          console.log(`Replaced file ${fileSwap.file} with ${swapURL}`);
        }
      }

      // get the stoptimes file and edit it

      await writeFile(
        `${config.savepath}${agency.agency}/stop_times.txt`,
        timeStringFixer(await readFile(`${config.savepath}${agency.agency}/stop_times.txt`))
      );
    } catch (e) {
      console.error(e);
    }
  }
  console.timeEnd("downloading");

  // load each one into the database
  console.time("loading");
  for (const agency of config.agencies) {
    console.log(`loading agency data ${agency.agency}`);
    await GTFSLoader(agency.agency, agency.omittedSubAgency);
  }
  console.timeEnd("loading");
  console.log("Finished");
  driver.close();
};

main();
