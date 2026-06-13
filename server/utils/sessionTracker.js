// In-memory active user sessions tracker (last active time)
const activeUsers = new Map(); // userId -> lastActiveTimestamp

export const trackUserActivity = (userId) => {
  if (userId) {
    activeUsers.set(userId, Date.now());
  }
};

export const getOnlineUsersCount = () => {
  const now = Date.now();
  const threshold = 15 * 60 * 1000; // 15 minutes of inactivity threshold

  // Clean up old sessions
  for (const [userId, lastActive] of activeUsers.entries()) {
    if (now - lastActive > threshold) {
      activeUsers.delete(userId);
    }
  }

  return activeUsers.size;
};
