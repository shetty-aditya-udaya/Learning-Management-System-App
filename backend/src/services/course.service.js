const { query } = require('../config/db');

class CourseService {
  static async getSubjects() {
    const result = await query(`
      SELECT 
        s.*, 
        s.thumbnail_url,
        s.short_description,
        s.learning_goals,
        COALESCE(u.name, u.email) as instructor_name, 
        COUNT(v.id)::int as total_lessons, 
        COALESCE(SUM(v.duration_seconds), 0)::int as total_duration
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      LEFT JOIN sections sec ON s.id = sec.subject_id
      LEFT JOIN videos v ON sec.id = v.section_id
      GROUP BY s.id, u.id
      ORDER BY s.title ASC
    `);
    return result.rows;
  }

  static async getCourseLessons(courseId) {
    const result = await query(`
      SELECT 
        v.id as lesson_id, 
        v.title, 
        v.order_index as order_number, 
        v.video_url
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = $1
      ORDER BY s.order_index ASC, v.order_index ASC
    `, [courseId]);
    return result.rows;
  }

  static async getSubjectById(subjectId, userId = null) {
    const result = await query(`
      SELECT 
        s.*, 
        s.thumbnail_url,
        s.short_description,
        s.learning_goals,
        COALESCE(u.name, u.email) as instructor_name, 
        COUNT(v.id)::int as total_lessons, 
        COALESCE(SUM(v.duration_seconds), 0)::int as total_duration
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      LEFT JOIN sections sec ON s.id = sec.subject_id
      LEFT JOIN videos v ON sec.id = v.section_id
      WHERE s.id = $1
      GROUP BY s.id, u.id
    `, [subjectId]);

    if (result.rows.length === 0) return null;
    const course = result.rows[0];

    // Check if user is enrolled
    let isEnrolled = false;
    if (userId) {
      const enrollment = await query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND subject_id = $2',
        [userId, subjectId]
      );
      isEnrolled = enrollment.rows.length > 0;
    }

    return { ...course, isEnrolled };
  }

  static async enroll(userId, subjectId) {
    const existing = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND subject_id = $2',
      [userId, subjectId]
    );

    if (existing.rows.length > 0) return { message: 'Already enrolled' };

    await query(
      'INSERT INTO enrollments (user_id, subject_id) VALUES ($1, $2)',
      [userId, subjectId]
    );

    return { success: true };
  }

  static async getCourseTree(subjectId, userId) {
    // Check enrollment
    const enrollment = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND subject_id = $2',
      [userId, subjectId]
    );

    if (enrollment.rows.length === 0) {
      throw new Error('User not enrolled in this course');
    }

    // Get subject title
    const subjectResult = await query('SELECT title FROM subjects WHERE id = $1', [subjectId]);
    if (subjectResult.rows.length === 0) throw new Error('Subject not found');

    // Get sections and videos
    const sectionsResult = await query(
      'SELECT * FROM sections WHERE subject_id = $1 ORDER BY order_index ASC',
      [subjectId]
    );

    const videosResult = await query(
      'SELECT v.* FROM videos v JOIN sections s ON v.section_id = s.id WHERE s.subject_id = $1 ORDER BY s.order_index ASC, v.order_index ASC',
      [subjectId]
    );

    // Get progress
    const progressResult = await query(
      'SELECT * FROM video_progress WHERE user_id = $1',
      [userId]
    );

    const progressMap = new Map(progressResult.rows.map(p => [p.video_id, p]));

    // Build tree
    const tree = sectionsResult.rows.map(section => {
      const sectionVideos = videosResult.rows.filter(v => v.section_id === section.id);

      return {
        id: section.id,
        title: section.title,
        order_index: section.order_index,
        lessons: sectionVideos.map(video => {
          const progress = progressMap.get(video.id);
          const isCompleted = progress ? progress.is_completed : false;

          // Strict ordering check
          let isLocked = false;
          if (video.order_index > 1) {
            const prevVideo = sectionVideos.find(v => v.order_index === video.order_index - 1);
            if (prevVideo) {
              const prevProgress = progressMap.get(prevVideo.id);
              if (!prevProgress || !prevProgress.is_completed) {
                isLocked = true;
              }
            }
          }

          return {
            id: video.id,
            title: video.title,
            duration: video.duration_seconds,
            order_index: video.order_index,
            isCompleted,
            watchedSeconds: progress ? progress.watched_seconds : 0,
            isLocked
          };
        })
      };
    });

    return { courseId: subjectId, title: subjectResult.rows[0].title, tree };
  }

  static async getVideoData(userId, subjectId, videoId) {
    const treeData = await this.getCourseTree(subjectId, userId);

    // Flatten all lessons across all sections to find sequence
    const allLessons = treeData.tree.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === videoId);

    if (currentIndex === -1) throw new Error('Video not found in this course');

    const targetVideo = allLessons[currentIndex];
    if (targetVideo.isLocked) throw new Error('Video is locked');

    const result = await query('SELECT * FROM videos WHERE id = $1', [videoId]);
    const videoData = result.rows[0];

    // Add navigation metadata
    videoData.prev_lesson_id = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
    videoData.next_lesson_id = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;

    return videoData;
  }

  // Instructor CRUD Methods
  static async createSubject(title, description, thumbnailUrl = null) {
    const result = await query(
      'INSERT INTO subjects (title, description, thumbnail_url) VALUES ($1, $2, $3) RETURNING *',
      [title, description, thumbnailUrl]
    );
    return result.rows[0];
  }

  static async updateSubject(id, title, description, thumbnailUrl) {
    const result = await query(
      'UPDATE subjects SET title = $1, description = $2, thumbnail_url = $3 WHERE id = $4 RETURNING *',
      [title, description, thumbnailUrl, id]
    );
    return result.rows[0];
  }

  static async deleteSubject(id) {
    await query('DELETE FROM subjects WHERE id = $1', [id]);
    return { success: true };
  }

  static async createSection(subjectId, title, orderIndex) {
    const result = await query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [subjectId, title, orderIndex]
    );
    return result.rows[0];
  }

  static async createVideo(sectionId, title, videoUrl, durationSeconds, orderIndex) {
    const result = await query(
      'INSERT INTO videos (section_id, title, video_url, duration_seconds, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sectionId, title, videoUrl, durationSeconds, orderIndex]
    );
    return result.rows[0];
  }
}

module.exports = CourseService;
