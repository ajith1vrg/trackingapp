import * as SQLite from "expo-sqlite";

/* -------------------- DB INSTANCE -------------------- */
let db: SQLite.SQLiteDatabase | null = null;

const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync("locations.db");
  }
  return db;
};

/* -------------------- INIT DB -------------------- */
export const initDB = () => {
  const database = getDB();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp TEXT NOT NULL,
      backToSchool INTEGER DEFAULT 0
    );
  `);
};

/* -------------------- SAVE LOCATION -------------------- */
export const saveLocation = (
  latitude: number,
  longitude: number,
  backToSchool: number
) => {
  try {
    const database = getDB();

    database.runSync(
      `INSERT INTO locations (latitude, longitude, backToSchool, timestamp)
       VALUES (?, ?, ?, datetime('now'));`,
      [latitude, longitude, backToSchool]
    );

    //console.log("📌 Location saved:", latitude, longitude);
  } catch (e) {
    //console.log("❌ ERROR saving location:", e);
  }
};

/* -------------------- GET ALL LOCATIONS -------------------- */
export const getAllLocations = () => {
  try {
    const database = getDB();

    return database.getAllSync(`
      SELECT * FROM locations
      ORDER BY id DESC;
    `);
  } catch (e) {
    //console.log("❌ ERROR fetching locations:", e);
    return [];
  }
};

/* -------------------- CLEAR LOCATIONS (MANUAL USE ONLY) -------------------- */
export const clearAllLocations = () => {
  try {
    const database = getDB();
    database.execSync(`DELETE FROM locations;`);
    //console.log("🗑️ Locations cleared");
  } catch (e) {
    //console.log("❌ ERROR clearing locations:", e);
  }
};