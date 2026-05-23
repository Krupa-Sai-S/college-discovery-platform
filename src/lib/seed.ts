import { getDb, sqliteAvailable } from './db';
import { colleges, COURSES, REVIEW_TEMPLATES, EXAM_CUTOFFS, TOP_RECRUITERS } from './data';

export function seed() {
  // If we are in Pure JS / Serverless fallback mode, do not execute SQLite transactions
  if (!sqliteAvailable) {
    return;
  }

  const db = getDb();

  // Check if already seeded
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM colleges').get() as { cnt: number }).cnt;
  if (count > 0) return;

  console.log('Seeding SQLite database...');

  const insertCollege = db.prepare(`
    INSERT INTO colleges (name, location, state, type, rating, total_fee, established, affiliation, overview, image_color, accreditation, nirf_rank)
    VALUES (@name, @location, @state, @type, @rating, @total_fee, @established, @affiliation, @overview, @image_color, @accreditation, @nirf_rank)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (college_id, name, duration, fee, seats)
    VALUES (@college_id, @name, @duration, @fee, @seats)
  `);

  const insertPlacement = db.prepare(`
    INSERT INTO placements (college_id, avg_package, highest_package, placement_rate, top_recruiters)
    VALUES (@college_id, @avg_package, @highest_package, @placement_rate, @top_recruiters)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (college_id, author, rating, comment, date, category)
    VALUES (@college_id, @author, @rating, @comment, @date, @category)
  `);

  const insertPredictor = db.prepare(`
    INSERT INTO predictor_data (college_id, exam, cutoff_rank, category, branch)
    VALUES (@college_id, @exam, @cutoff_rank, @category, @branch)
  `);

  const seedAll = db.transaction(() => {
    for (const college of colleges) {
      const result = insertCollege.run({
        name: college.name,
        location: college.location,
        state: college.state,
        type: college.type,
        rating: college.rating,
        total_fee: college.total_fee,
        established: college.established,
        affiliation: college.affiliation,
        overview: college.overview,
        image_color: college.color,
        accreditation: college.accreditation,
        nirf_rank: college.nirf_rank,
      });
      const id = result.lastInsertRowid as number;

      // Seed FTS
      db.prepare(`INSERT INTO colleges_fts(rowid, name, location, state, affiliation) VALUES (?, ?, ?, ?, ?)`)
        .run(id, college.name, college.location, college.state, college.affiliation);

      // Courses
      const courseList = COURSES[college.recruiterType] ?? COURSES.tech;
      for (const course of courseList) {
        insertCourse.run({
          college_id: id,
          name: course.name,
          duration: course.duration,
          fee: Math.round(college.total_fee * course.baseMultiplier / 1000) * 1000,
          seats: Math.floor(Math.random() * 80) + 40,
        });
      }

      // Placements
      const ratingFactor = college.rating / 5;
      const avgPackage = Math.round((ratingFactor * 1800000 + 400000 + Math.random() * 300000) / 10000) * 10000;
      const highestPackage = Math.round((avgPackage * (2.5 + Math.random() * 2)) / 100000) * 100000;
      const placementRate = Math.min(100, Math.round(ratingFactor * 60 + 30 + Math.random() * 10));
      const recruiters = (TOP_RECRUITERS[college.recruiterType] ?? TOP_RECRUITERS.tech)
        .sort(() => Math.random() - 0.5).slice(0, 6);
      insertPlacement.run({
        college_id: id,
        avg_package: avgPackage,
        highest_package: highestPackage,
        placement_rate: placementRate,
        top_recruiters: JSON.stringify(recruiters),
      });

      // Reviews — pick 3-5 random reviews
      const reviewCount = 3 + Math.floor(Math.random() * 3);
      const shuffled = [...REVIEW_TEMPLATES].sort(() => Math.random() - 0.5);
      for (let r = 0; r < reviewCount; r++) {
        const tmpl = shuffled[r % shuffled.length];
        insertReview.run({
          college_id: id,
          author: tmpl.author,
          rating: Math.min(5, Math.max(3, college.rating + (Math.random() * 0.6 - 0.3))).toFixed(1),
          comment: tmpl.comment,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0],
          category: tmpl.category,
        });
      }

      // Predictor data
      for (const examData of EXAM_CUTOFFS) {
        const isMgmt = college.recruiterType === 'mgmt';
        const isMgmtExam = examData.exam === 'CAT' || examData.exam === 'GMAT';
        if (isMgmt !== isMgmtExam) continue;

        const rankFactor = 6 - college.rating;
        let cutoff = Math.round(examData.baseRank * rankFactor + Math.random() * examData.variance);
        if (examData.exam === 'CAT') cutoff = Math.min(100, Math.max(75, 100 - (rankFactor * 5)));

        const categories = ['General', 'OBC', 'SC', 'ST'];
        for (const cat of categories) {
          const catMultiplier = cat === 'General' ? 1 : cat === 'OBC' ? 1.3 : cat === 'SC' ? 2.0 : 3.0;
          const branches = college.recruiterType === 'tech' ? ['CSE', 'ECE', 'ME', 'EE'] : ['MBA'];
          for (const branch of branches) {
            const branchMultiplier = branch === 'CSE' ? 1 : branch === 'ECE' ? 1.2 : 1.5;
            insertPredictor.run({
              college_id: id,
              exam: examData.exam,
              cutoff_rank: Math.round(cutoff * catMultiplier * branchMultiplier),
              category: cat,
              branch,
            });
          }
        }
      }
    }
  });

  seedAll();
  console.log(`Seeded ${colleges.length} colleges successfully.`);
}
