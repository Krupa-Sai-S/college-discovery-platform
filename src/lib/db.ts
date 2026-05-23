import path from 'path';
import fs from 'fs';
import { colleges, COURSES, REVIEW_TEMPLATES, EXAM_CUTOFFS, TOP_RECRUITERS } from './data';

// Detection variables
let sqliteAvailable = false;
let Database: any = null;

try {
  // On Vercel or in serverless environments, we force using the Pure JS in-memory database
  // to avoid native module binary issues and read-only filesystem errors.
  const isServerless = process.env.VERCEL === '1' || 
                       process.env.NOW_BUILDER === '1' || 
                       process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
                       process.env.NETLIFY === 'true';

  if (isServerless) {
    console.log("Running in a serverless environment (e.g. Vercel). Falling back to Pure JS in-memory adapter to prevent filesystem write errors.");
    sqliteAvailable = false;
  } else {
    // Use a dynamic require so serverless compilers like Vercel Webpack 
    // don't try to build the native C binary at build time and fail.
    Database = require('better-sqlite3');
    sqliteAvailable = true;
    console.log("better-sqlite3 native module loaded successfully.");
  }
} catch (e) {
  console.log("better-sqlite3 native module not available. Falling back to Pure JS in-memory adapter.");
}

export { sqliteAvailable };

const DB_PATH = path.join(process.cwd(), 'data', 'college.db');
let sqliteDbInstance: any = null;

// Pure JS Memory Database Tables
let memoryColleges: any[] = [];
let memoryCourses: any[] = [];
let memoryPlacements: any[] = [];
let memoryReviews: any[] = [];
let memoryPredictorData: any[] = [];

export function initMemoryDb() {
  if (memoryColleges.length > 0) return;

  console.log("Initializing Pure JS In-Memory Database...");

  colleges.forEach((c, idx) => {
    const id = idx + 1;
    memoryColleges.push({
      id,
      name: c.name,
      location: c.location,
      state: c.state,
      type: c.type,
      rating: c.rating,
      total_fee: c.total_fee,
      established: c.established,
      affiliation: c.affiliation,
      overview: c.overview,
      image_color: c.color,
      accreditation: c.accreditation,
      nirf_rank: c.nirf_rank
    });

    // Courses
    const courseList = COURSES[c.recruiterType] ?? COURSES.tech;
    courseList.forEach((course, cIdx) => {
      memoryCourses.push({
        id: memoryCourses.length + 1,
        college_id: id,
        name: course.name,
        duration: course.duration,
        fee: Math.round(c.total_fee * course.baseMultiplier / 1000) * 1000,
        seats: 60 + ((id * cIdx) % 40)
      });
    });

    // Placements
    const ratingFactor = c.rating / 5;
    const avgPackage = Math.round((ratingFactor * 1800000 + 400000 + ((id * 10000) % 300000)) / 10000) * 10000;
    const highestPackage = Math.round((avgPackage * (2.5 + (id % 5) * 0.4)) / 100000) * 100000;
    const placementRate = Math.min(100, Math.round(ratingFactor * 60 + 30 + (id % 15)));
    const recruiters = (TOP_RECRUITERS[c.recruiterType] ?? TOP_RECRUITERS.tech)
      .slice(id % 4, (id % 4) + 6);

    memoryPlacements.push({
      college_id: id,
      avg_package: avgPackage,
      highest_package: highestPackage,
      placement_rate: placementRate,
      top_recruiters: JSON.stringify(recruiters)
    });

    // Reviews
    const reviewCount = 3 + (id % 3);
    for (let r = 0; r < reviewCount; r++) {
      const tmpl = REVIEW_TEMPLATES[(r + id) % REVIEW_TEMPLATES.length];
      memoryReviews.push({
        id: memoryReviews.length + 1,
        college_id: id,
        author: tmpl.author,
        rating: Number(Math.min(5, Math.max(3, c.rating + ((id * r) % 6) * 0.1 - 0.25)).toFixed(1)),
        comment: tmpl.comment,
        date: new Date(Date.now() - (r + id) * 10 * 24 * 3600000).toISOString().split('T')[0],
        category: tmpl.category
      });
    }

    // Predictor
    EXAM_CUTOFFS.forEach(examData => {
      const isMgmt = c.recruiterType === 'mgmt';
      const isMgmtExam = examData.exam === 'CAT' || examData.exam === 'GMAT';
      if (isMgmt !== isMgmtExam) return;

      const rankFactor = 6 - c.rating;
      let cutoff = Math.round(examData.baseRank * rankFactor + (id % 10) * (examData.variance / 10));
      if (examData.exam === 'CAT') cutoff = Math.min(100, Math.max(75, 100 - Math.round(rankFactor * 4)));

      const categories = ['General', 'OBC', 'SC', 'ST'];
      categories.forEach(cat => {
        const catMultiplier = cat === 'General' ? 1 : cat === 'OBC' ? 1.3 : cat === 'SC' ? 2.0 : 3.0;
        const branches = c.recruiterType === 'tech' ? ['CSE', 'ECE', 'ME', 'EE'] : ['MBA'];
        branches.forEach(branch => {
          memoryPredictorData.push({
            id: memoryPredictorData.length + 1,
            college_id: id,
            exam: examData.exam,
            cutoff_rank: Math.round(cutoff * catMultiplier),
            category: cat,
            branch
          });
        });
      });
    });
  });

  console.log(`Pure JS database seeded successfully with ${memoryColleges.length} colleges.`);
}

// Memory database statement mock execution
function executeMockQuery(sql: string, params: any, mode: 'all' | 'get'): any {
  initMemoryDb();

  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Search Query: colleges_fts
  if (cleanSql.includes('colleges_fts')) {
    let q = '';
    if (Array.isArray(params)) {
      q = params[0] || '';
    } else if (params && typeof params === 'object') {
      q = Object.values(params)[0] as string;
    } else {
      q = String(params);
    }
    q = q.replace(/\*/g, '').toLowerCase().trim();

    if (!q) return [];

    return memoryColleges
      .filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q))
      )
      .map(c => ({ rowid: c.id }));
  }

  // 2. Count Query
  if (cleanSql.includes('SELECT COUNT(*)') || cleanSql.includes('COUNT(*) as total')) {
    const list = filterCollegesMemory(params);
    return mode === 'get' ? { total: list.length } : [{ total: list.length }];
  }

  // 3. College detail with placements left join (general list query)
  if (cleanSql.includes('SELECT c.*') && cleanSql.includes('FROM colleges c') && !cleanSql.includes('WHERE c.id IN')) {
    let list = filterCollegesMemory(params);

    // Sort mapping
    if (cleanSql.includes('c.rating DESC')) {
      list.sort((a, b) => b.rating - a.rating);
    } else if (cleanSql.includes('c.rating ASC')) {
      list.sort((a, b) => a.rating - b.rating);
    } else if (cleanSql.includes('c.total_fee ASC')) {
      list.sort((a, b) => a.total_fee - b.total_fee);
    } else if (cleanSql.includes('c.total_fee DESC')) {
      list.sort((a, b) => b.total_fee - a.total_fee);
    } else if (cleanSql.includes('c.name ASC')) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (cleanSql.includes('c.nirf_rank ASC')) {
      list.sort((a, b) => (a.nirf_rank || 999) - (b.nirf_rank || 999));
    }

    // Limit/Offset pagination
    let limit = 12;
    let offset = 0;
    if (params && typeof params === 'object') {
      limit = params.limit ?? 12;
      offset = params.offset ?? 0;
    }

    const sliced = list.slice(offset, offset + limit);
    return sliced.map(c => {
      const placement = memoryPlacements.find(p => p.college_id === c.id);
      return {
        ...c,
        avg_package: placement ? placement.avg_package : null,
        highest_package: placement ? placement.highest_package : null,
        placement_rate: placement ? placement.placement_rate : null
      };
    });
  }

  // 4. College detail in predictor (WHERE c.id IN placeholders)
  if (cleanSql.includes('FROM colleges c') && cleanSql.includes('WHERE c.id IN')) {
    let ids: number[] = [];
    if (Array.isArray(params)) {
      ids = params;
    } else if (params && typeof params === 'object') {
      ids = Object.values(params).map(Number).filter(Boolean);
    }
    
    let list = memoryColleges.filter(c => ids.includes(c.id));
    
    // Default predictor sort by rating DESC
    list.sort((a, b) => b.rating - a.rating);

    return list.map(c => {
      const placement = memoryPlacements.find(p => p.college_id === c.id);
      return {
        ...c,
        avg_package: placement ? placement.avg_package : null,
        highest_package: placement ? placement.highest_package : null,
        placement_rate: placement ? placement.placement_rate : null
      };
    });
  }

  // 5. Single / Multiple College Detail (colleges table general)
  if (cleanSql.includes('FROM colleges') && cleanSql.includes('WHERE id')) {
    if (cleanSql.includes('IN')) {
      let ids: number[] = [];
      if (Array.isArray(params)) {
        ids = params;
      } else if (params && typeof params === 'object') {
        ids = Object.values(params).map(Number).filter(Boolean);
      }
      return memoryColleges.filter(c => ids.includes(c.id));
    } else {
      const idVal = Array.isArray(params) ? params[0] : params;
      const res = memoryColleges.find(c => c.id === Number(idVal));
      return mode === 'get' ? res : (res ? [res] : []);
    }
  }

  // 6. Courses detail
  if (cleanSql.includes('FROM courses')) {
    if (cleanSql.includes('IN')) {
      let ids: number[] = [];
      if (Array.isArray(params)) {
        ids = params;
      } else if (params && typeof params === 'object') {
        ids = Object.values(params).map(Number).filter(Boolean);
      }
      return memoryCourses.filter(c => ids.includes(c.college_id));
    } else {
      const idVal = Array.isArray(params) ? params[0] : params;
      return memoryCourses.filter(c => c.college_id === Number(idVal));
    }
  }

  // 7. Placements detail
  if (cleanSql.includes('FROM placements')) {
    if (cleanSql.includes('IN')) {
      let ids: number[] = [];
      if (Array.isArray(params)) {
        ids = params;
      } else if (params && typeof params === 'object') {
        ids = Object.values(params).map(Number).filter(Boolean);
      }
      return memoryPlacements.filter(p => ids.includes(p.college_id));
    } else {
      const idVal = Array.isArray(params) ? params[0] : params;
      const res = memoryPlacements.find(p => p.college_id === Number(idVal));
      return mode === 'get' ? res : (res ? [res] : []);
    }
  }

  // 8. Reviews detail
  if (cleanSql.includes('FROM reviews')) {
    const idVal = Array.isArray(params) ? params[0] : params;
    const list = memoryReviews.filter(r => r.college_id === Number(idVal));
    // Sort by date DESC
    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }

  // 9. Predictor data cutoff resolution
  if (cleanSql.includes('FROM predictor_data pd')) {
    let exam = '';
    let category = '';
    let branch = '';
    let rank = 0;

    if (Array.isArray(params)) {
      exam = params[0];
      category = params[1];
      if (params.length === 3) {
        rank = Number(params[2]);
      } else {
        branch = params[2];
        rank = Number(params[3]);
      }
    } else if (params && typeof params === 'object') {
      const vals = Object.values(params);
      exam = vals[0] as string;
      category = vals[1] as string;
      if (vals.length === 3) {
        rank = Number(vals[2]);
      } else {
        branch = vals[2] as string;
        rank = Number(vals[3]);
      }
    }

    const isPercentile = exam === 'CAT' || exam === 'GMAT';
    let list = memoryPredictorData.filter(pd => pd.exam === exam && pd.category === category);

    if (isPercentile) {
      list = list.filter(pd => pd.cutoff_rank <= rank);
      list.sort((a, b) => b.cutoff_rank - a.cutoff_rank);
    } else {
      list = list.filter(pd => pd.branch === branch && pd.cutoff_rank >= rank);
      list.sort((a, b) => a.cutoff_rank - b.cutoff_rank);
      list = list.slice(0, 20);
    }

    return list;
  }

  return [];
}

// Memory database filtering sub-utility
function filterCollegesMemory(params: any): any[] {
  let list = [...memoryColleges];
  if (!params) return list;

  const type = params.type;
  const state = params.state;
  const minFee = params.minFee ?? 0;
  const maxFee = params.maxFee ?? 99999999;
  const minRating = params.minRating ?? 0;
  const idsParam = params.ids; // Support raw IN filtering

  if (type) list = list.filter(c => c.type === type);
  if (state) list = list.filter(c => c.state === state);
  list = list.filter(c => c.total_fee >= minFee && c.total_fee <= maxFee);
  list = list.filter(c => c.rating >= minRating);
  if (idsParam) {
    const ids = String(idsParam).split(',').map(Number).filter(Boolean);
    list = list.filter(c => ids.includes(c.id));
  }

  return list;
}

class MockStatement {
  sql: string;
  constructor(sql: string) {
    this.sql = sql;
  }
  all(...args: any[]) {
    const p = args[0] !== undefined && typeof args[0] === 'object' ? args[0] : args;
    return executeMockQuery(this.sql, p, 'all');
  }
  get(...args: any[]) {
    const p = args[0] !== undefined && typeof args[0] === 'object' ? args[0] : args;
    return executeMockQuery(this.sql, p, 'get');
  }
  run(...args: any[]) {
    return { lastInsertRowid: 1, changes: 1 };
  }
}

class MockDatabase {
  exec(sql: string) {
    return this;
  }
  pragma(sql: string) {
    return this;
  }
  prepare(sql: string) {
    return new MockStatement(sql);
  }
  transaction(fn: any) {
    return fn;
  }
}

export function getDb(): any {
  if (sqliteAvailable) {
    if (!sqliteDbInstance) {
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      sqliteDbInstance = new Database(DB_PATH);
      sqliteDbInstance.pragma('journal_mode = WAL');
      sqliteDbInstance.pragma('foreign_keys = ON');
      
      // Init schema
      sqliteDbInstance.exec(`
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
    return sqliteDbInstance;
  }

  // SQLite not available, return pure JS Mock Database instance!
  return new MockDatabase();
}
