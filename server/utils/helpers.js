export const sortPlayersByProgress = (players) => {
  return Object.entries(players).map(([userId, data]) => ({
    userId,
    ...data
  })).sort((a, b) => b.progress - a.progress);
};
