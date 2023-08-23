// Setup PG client
const pg = require("pg");
const client = new pg.Client({
  host: "localhost",
  port: 5432,
  database: "Zephyr",
  user: "postgres",
  password: "Evie"
});

const chunkSize = 2048;
let isConnected = false;

function debug(text) {
  console.log(text);
}

/**
 * Retrieves a package from the database
 * @param {string} packageName The name of the package
 * @param {string} packageVersion The version of the package
 * @returns {Buffer[]} The buffer of the zip file
 */
async function retrievePackage(packageName, packageVersion) {
  await checkConnected();

  // Check for package
  const packageRes = await client.query(
    `SELECT * FROM packages WHERE name = '${packageName}'`
  );

  // Check if it existed
  if (packageRes.rowCount == 0) {
    throw `Package ${packageName} not found in repository`;
  }

  // Check if package version is @latest
  if (packageVersion == "@latest") {
    packageVersion = packageRes.rows[0].latest_version;
  }

  // Fetch the version
  const versionRes = await client.query(
    `SELECT * FROM versions WHERE package = '${packageName}' AND version = '${packageVersion}'`
  );

  // Check if it existed
  if (versionRes.rowCount == 0) {
    throw `Package ${packageName}'s version ${packageVersion} was not found in the repository`;
  }

  const versionID = versionRes.rows[0].version_id;

  // Fetch the chunks
  const chunksRes = await client.query(`SELECT * FROM chunks WHERE package_version = '${versionID}'`);
  const chunkData = chunksRes.rows
    .sort((a, b) => a.chunk_position - b.chunk_position)
    .map(x => x.chunk_data)
    .join("");

  const buf = Buffer.from(chunkData, "hex");

  return buf;
}

/**
 * Creates a package
 * @param {string} packageName The name of the package
 * @param {number} ownerID The ID of the owner
 * @returns void
 */
async function createPackage(packageName, ownerID) {
  await checkConnected();

  // Check if it exists
  debug("Checking if package exists");
  if (await packageExists(packageName)) {
    throw `The package ${packageName} already exists in the repository`
  }

  // Create it
  debug("Creating package");
  await client.query(
    `INSERT INTO packages(name, author_id, latest_version) VALUES('${packageName}', ${ownerID}, '@unknown')`
  );
  debug("Created package");

  // Done
  return;
}

/**
 * Uploads a version of the package to the repository
 * @param {string} packageName The name of the package
 * @param {string} packageVersion The version of the package
 * @param {Buffer} packageData The buffer data
 */
async function uploadPackageVersion(packageName, packageVersion, packageData) {
  await checkConnected();

  // Check if package exists
  debug("Checking if package exists");
  if (await packageExists(packageName) == false) {
    throw `Cannot upload version as the package ${packageName} was not found in the repository`
  }

  // Check if version already exists
  const vRes = await client.query(
    `SELECT * FROM versions WHERE package = '${packageName}' AND version = '${packageVersion}'`
  );

  if (vRes.rowCount != 0) {
    throw `Package ${packageName} already has a version for ${packageVersion}`
  }

  // Create version
  debug("Creating version");
  const versionRes = await client.query(
    `INSERT INTO versions(package, version) VALUES('${packageName}', '${packageVersion}') RETURNING *`
  );

  const versionID = versionRes.rows[0].version_id;
  debug("Version ID is " + versionID);

  // Chunk the data
  let idx = 0;
  for (let i = 0; i < packageData.length; i += chunkSize) {
    const chunk = packageData.slice(i, i + chunkSize);

    // Upload chunk to DB
    await client.query(
      `INSERT INTO chunks (package, package_version, chunk_placement, chunk_data) VALUES('${packageName}', '${versionID}', ${idx}, '${chunk.toString('hex')}')`
    );
    debug(`Uploaded chunk ${idx}`);

    idx++;
  }

  // Update version
  await client.query(
    `UPDATE packages SET latest_version = '${packageVersion}' WHERE name = '${packageName}'`
  );
  console.log("update v")

  return;
}

/**
 * Checks if a package exists or not
 * @param {string} packageName The package to check
 * @returns {bool} True or false
 */
async function packageExists(packageName) {
  await checkConnected();

  // Fetch package
  const packageRes = await client.query(
    `SELECT * FROM packages WHERE name = '${packageName}'`
  );

  return packageRes.rowCount != 0;
}

async function fetchPackage(packageName) {
  await checkConnected();
  
  // Check if exists
  if (await packageExists(packageName) == false) {
    throw `Package ${packageName} does not exist in the repository`
  };

  // Fetch data
  const packageRes = await client.query(
    `SELECT * FROM packages WHERE name = '${packageName}'`
  );

  return packageRes.rows[0];
}

/**
 * Checks if the client is connected and if it is not it connects
 * @returns Void
 */
async function checkConnected() {
  if (isConnected == false) {
    await client.connect();
    isConnected = true;
  }
  
  return;
}

// Export
module.exports = {
  createPackage,
  uploadPackageVersion,
  packageExists,
  retrievePackage,
  fetchPackage
};