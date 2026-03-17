const { query } = require('../config/db');

class ProgressService {
  static async heartbeat(userId, videoId, watchedSeconds) {
    // Check if progress exists
    const result = await query(
      'SELECT id, watched_seconds FROM video_progress WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    if (result.rows.length === 0) {
      await query(
        'INSERT INTO video_progress (user_id, video_id, watched_seconds) VALUES ($1, $2, $3)',
        [userId, videoId, watchedSeconds]
      );
    } else {
      const currentSeconds = result.rows[0].watched_seconds;
      if (watchedSeconds > currentSeconds) {
        await query(
          'UPDATE video_progress SET watched_seconds = $1, last_watched_at = NOW() WHERE id = $2',
          [watchedSeconds, result.rows[0].id]
        );
      }
    }
    return { success: true };
  }

  static async complete(userId, videoId) {
    const videoResult = await query('SELECT duration_seconds FROM videos WHERE id = $1', [videoId]);
    if (videoResult.rows.length === 0) throw new Error('Video not found');
    
    const duration = videoResult.rows[0].duration_seconds;

    const result = await query(
      'UPDATE video_progress SET is_completed = true, watched_seconds = $1, last_watched_at = NOW() WHERE user_id = $2 AND video_id = $3',
      [duration, userId, videoId]
    );

    if (result.rowCount === 0) {
      await query(
        'INSERT INTO video_progress (user_id, video_id, watched_seconds, is_completed) VALUES ($1, $2, $3, true)',
        [userId, videoId, duration]
      );
    }
    return { success: true };
  }

  static async getResumeData(userId, subjectId) {
    // Find last watched video in this subject
    const result = await query(
      `SELECT vp.video_id, vp.watched_seconds 
       FROM video_progress vp 
       JOIN videos v ON vp.video_id = v.id 
       JOIN sections s ON v.section_id = s.id 
       WHERE vp.user_id = $1 AND s.subject_id = $2
       ORDER BY vp.last_watched_at DESC LIMIT 1`,
      [userId, subjectId]
    );

    if (result.rows.length === 0) return null;
    return { lessonId: result.rows[0].video_id, watched_seconds: result.rows[0].watched_seconds };
  }
}

module.exports = ProgressService;
