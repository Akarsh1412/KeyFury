export const sortPlayersByWpm = (players) => {
  if (!players || typeof players !== 'object') {
    return [];
  }

  return Object.entries(players)
    .map(([userId, playerData]) => ({ userId, ...playerData }))
    .sort((a, b) => {
      if (b.wpm !== a.wpm) {
        return b.wpm - a.wpm;
      }
      return b.progress - a.progress;
    });
};