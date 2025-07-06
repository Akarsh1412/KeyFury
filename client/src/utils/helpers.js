export const countErrors = (actual, expected) => {
  const expectedCharacters = expected.split('');

  return expectedCharacters.reduce((errors, expectedChar, index) => {
    const actualChar = actual[index];
    if (actualChar !== expectedChar) {
      errors++;
    }
    return errors;
  }, 0);
}

export const calculateAccuracy = (errors, total) => {
    if (total > 0) {
        const corrects = total - errors;
        return ((corrects / total) * 100).toFixed(2);
    }
    return 0;
}

export const calculateWpm = (totalTyped, timeLimit) => {
  if (timeLimit == 0) return 0;
  const words = totalTyped / 5;
  const minutes = timeLimit / 60;
  return Math.round(words / minutes);
};

export const isKeyboardCodeAllowed = (code) => {
  return (
    code.startsWith("Key") ||
    code.startsWith("Digit") ||
    code === "Backspace" ||
    code === "Space"
  );
};

export const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};