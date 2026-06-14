import pool from '../config/db.js';
import { getOnlineUsersCount } from '../utils/sessionTracker.js';

export const getAdminStats = async (req, res) => {
  try {
    // 1. Get online users count
    const onlineCount = getOnlineUsersCount();

    // 2. Query all users and their family plan information
    const queryResult = await pool.query(`
      SELECT 
        u.id AS "userId",
        u.email,
        u.name AS "userName",
        u.role,
        u.avatar AS "userAvatar",
        u.created_at AS "createdAt",
        f.id AS "familyId",
        f.name AS "familyName",
        f.growth_score AS "familyGrowthScore",
        c.id AS "childProfileId",
        c.level AS "childLevel",
        c.job_class AS "childJobClass"
      FROM users u
      LEFT JOIN families f ON u.family_id = f.id
      LEFT JOIN children c ON u.child_id = c.id
      ORDER BY u.created_at DESC
    `);

    const membersList = queryResult.rows.map(row => {
      // Mask email for data minimization: user@example.com → use***@example.com
      const rawEmail = row.email || '';
      const [localPart, domain] = rawEmail.split('@');
      const maskedEmail = localPart
        ? `${localPart.slice(0, 3)}***@${domain || ''}`
        : '***';

      return {
        userId: row.userId,
        email: maskedEmail,
        userName: row.userName,
        role: row.role,
        userAvatar: row.userAvatar,
        createdAt: row.createdAt ? row.createdAt.toISOString().split('T')[0] : null,
        familyId: row.familyId,
        familyName: row.familyName,
        familyGrowthScore: row.familyGrowthScore || 0,
        childProfileId: row.childProfileId,
        childLevel: row.childLevel,
        childJobClass: row.childJobClass
      };
    });


    res.json({
      onlineUsers: onlineCount,
      members: membersList
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: '取得管理員統計資訊失敗。' });
  }
};
