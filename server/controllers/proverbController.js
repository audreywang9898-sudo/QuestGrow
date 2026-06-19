import pool from '../config/db.js';

export const getDailyProverb = async (req, res) => {
  try {
    const { date: dateStr } = req.query;
    
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

    // Calculate id index: 1-365
    // Use (dayOfYear - 1) % 365 + 1 to wrap 366 (leap years) to 1.
    const proverbId = ((dayOfYear - 1) % 365) + 1;

    const result = await pool.query(
      'SELECT id, content_zh AS "contentZh", content_en AS "contentEn" FROM daily_proverbs WHERE id = $1',
      [proverbId]
    );

    if (result.rows.length === 0) {
      // Fallback in case table is empty or id is not found
      return res.json({
        id: 1,
        contentZh: "千里之行，始於足下。",
        contentEn: "A journey of a thousand miles begins with a single step."
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching daily proverb:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
