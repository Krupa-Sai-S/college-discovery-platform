import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'college.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      state TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('IIT','NIT','IIIT','Private','Deemed','Government')),
      rating REAL NOT NULL DEFAULT 0,
      total_fee INTEGER NOT NULL,
      established INTEGER,
      affiliation TEXT,
      overview TEXT,
      image_color TEXT,
      accreditation TEXT,
      nirf_rank INTEGER
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL REFERENCES colleges(id),
      name TEXT NOT NULL,
      duration TEXT NOT NULL,
      fee INTEGER NOT NULL,
      seats INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS placements (
      college_id INTEGER PRIMARY KEY REFERENCES colleges(id),
      avg_package INTEGER NOT NULL,
      highest_package INTEGER NOT NULL,
      placement_rate REAL NOT NULL,
      top_recruiters TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL REFERENCES colleges(id),
      author TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Overall'
    );

    CREATE TABLE IF NOT EXISTS predictor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL REFERENCES colleges(id),
      exam TEXT NOT NULL,
      cutoff_rank INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      branch TEXT NOT NULL DEFAULT 'CSE'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS colleges_fts USING fts5(
      name, location, state, affiliation,
      content=colleges, content_rowid=id
    );
  `);
}
