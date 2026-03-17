const { pool } = require('../config/db');

async function seed() {
  try {
    // 1. Create a subject
    const subResult = await pool.query(
      "INSERT INTO subjects (title, description) VALUES ($1, $2) RETURNING id",
      ["Mastering Fullstack Development", "A comprehensive guide to building modern apps with Next.js, Node.js, and PostgreSQL."]
    );
    const subjectId = subResult.rows[0].id;

    // 2. Create a section
    const secResult = await pool.query(
      "INSERT INTO sections (subject_id, title, order_index) VALUES ($1, $2, $3) RETURNING id",
      [subjectId, "Course Introduction", 1]
    );
    const sectionId = secResult.rows[0].id;

    // 3. Create videos
    await pool.query(
      "INSERT INTO videos (section_id, title, video_url, duration_seconds, order_index) VALUES ($1, $2, $3, $4, $5)",
      [sectionId, "Welcome Video", "https://www.w3schools.com/html/mov_bbb.mp4", 10, 1]
    );

    await pool.query(
      "INSERT INTO videos (section_id, title, video_url, duration_seconds, order_index) VALUES ($1, $2, $3, $4, $5)",
      [sectionId, "Project Architecture Overview", "https://www.w3schools.com/html/movie.mp4", 12, 2]
    );

    console.log("Database seeded successfully with test data.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
