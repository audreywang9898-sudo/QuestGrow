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
    // 3. Query all families and their retention metrics
    const familiesResult = await pool.query(`
      SELECT 
        f.id AS "familyId",
        f.name AS "familyName",
        f.family_nickname AS "familyNickname",
        f.growth_score AS "familyGrowthScore",
        COUNT(DISTINCT u.id)::int AS "membersCount",
        COALESCE(MIN(u.created_at), f.created_at) AS "createdAt",
        COALESCE(MAX(el.timestamp), COALESCE(MIN(u.created_at), f.created_at)) AS "lastActiveAt",
        COUNT(el.id)::int AS "totalEvents"
      FROM families f
      LEFT JOIN users u ON u.family_id = f.id
      LEFT JOIN event_logs el ON el.family_id = f.id
      GROUP BY f.id, f.name, f.family_nickname, f.growth_score
      ORDER BY "createdAt" DESC
    `);

    const now = new Date();
    const familiesList = familiesResult.rows.map(row => {
      const createdAt = new Date(row.createdAt);
      const lastActiveAt = new Date(row.lastActiveAt);
      
      // Calculate stay duration (minimum 0.1 days)
      const diffTime = Math.abs(lastActiveAt - createdAt);
      let stayDurationDays = diffTime / (1000 * 60 * 60 * 24);
      if (stayDurationDays < 0.1) {
        stayDurationDays = 0.1;
      }
      stayDurationDays = Math.round(stayDurationDays * 10) / 10;

      // Retention status based on last active timestamp compared to now
      const timeSinceLastActive = Math.abs(now - lastActiveAt);
      const hoursSinceLastActive = timeSinceLastActive / (1000 * 60 * 60);
      
      let retentionStatus = '🔴 已流失';
      if (hoursSinceLastActive <= 24) {
        retentionStatus = '🟢 活躍中';
      } else if (hoursSinceLastActive <= 24 * 7) {
        retentionStatus = '🟡 閒置中';
      }

      return {
        ...row,
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
        lastActiveAt: row.lastActiveAt ? row.lastActiveAt.toISOString() : null,
        stayDurationDays,
        retentionStatus
      };
    });

    // 4. Query admin notifications
    const notificationsResult = await pool.query(`
      SELECT 
        id,
        user_id AS "userId",
        title,
        message,
        is_read AS "isRead",
        created_at AS "createdAt"
      FROM admin_notifications
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({
      onlineUsers: onlineCount,
      members: membersList,
      families: familiesList,
      notifications: notificationsResult.rows
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: '取得管理員統計資訊失敗。' });
  }
};
