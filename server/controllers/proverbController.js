import pool from '../config/db.js';

export const getDailyProverb = async (req, res) => {
  try {
    const { date: dateStr, role } = req.query;
    
    let targetDate;
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        targetDate = new Date(year, month, day);
      }
    }
    
    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = new Date(); // Fallback to current server date
    }

    const year = targetDate.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = targetDate - start + ((start.getTimezoneOffset() - targetDate.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // Day of Year (1 - 366)

    // Determine target table based on role (either parent, admin vs kid)
    const userRole = role || (req.user ? req.user.role : 'kid');
    let tableName = 'daily_proverbs';
    if (userRole === 'parent' || userRole === 'admin') {
      tableName = 'daily_adult_proverbs';
    }

    // Get count of rows dynamically
    const countRes = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const totalRows = parseInt(countRes.rows[0].count, 10);

    if (totalRows === 0) {
      if (tableName === 'daily_adult_proverbs') {
        return res.json({
          id: 1,
          contentZh: "教育的秘訣在於尊重學生。",
          contentEn: "The secret of education lies in respecting the pupil."
        });
      } else {
        return res.json({
          id: 1,
          contentZh: "千里之行，始於足下。",
          contentEn: "A journey of a thousand miles begins with a single step."
        });
      }
    }

    // Calculate id index using dynamic table row count
    const proverbId = ((dayOfYear - 1) % totalRows) + 1;

    const result = await pool.query(
      `SELECT id, content_zh AS "contentZh", content_en AS "contentEn" FROM ${tableName} WHERE id = $1`,
      [proverbId]
    );

    if (result.rows.length === 0) {
      // Fallback: get the first row in case of ID gaps
      const fallbackResult = await pool.query(
        `SELECT id, content_zh AS "contentZh", content_en AS "contentEn" FROM ${tableName} ORDER BY id LIMIT 1`
      );
      return res.json(fallbackResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching daily proverb:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
