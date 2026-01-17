/**
 * Validation Utilities
 *
 * Username validation and suggestion generation.
 */

export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscore only
};

export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

export const validateUsername = (username: string): UsernameValidation => {
  if (username.length < USERNAME_RULES.minLength) {
    return {
      isValid: false,
      error: `Username must be at least ${USERNAME_RULES.minLength} characters`
    };
  }

  if (username.length > USERNAME_RULES.maxLength) {
    return {
      isValid: false,
      error: `Username must be ${USERNAME_RULES.maxLength} characters or less`
    };
  }

  if (!USERNAME_RULES.pattern.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Check for reserved/inappropriate words
  const reservedWords = ['admin', 'system', 'wojak', 'official', 'mod', 'moderator', 'support', 'help'];
  if (reservedWords.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved'
    };
  }

  return { isValid: true };
};

// Generate username suggestions when desired name is taken
export const generateUsernameSuggestions = (baseName: string): string[] => {
  const suggestions: string[] = [];
  const cleanBase = baseName.slice(0, 15); // Leave room for suffix

  // Add numbers
  suggestions.push(`${cleanBase}${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${cleanBase}${new Date().getFullYear() % 100}`);

  // Add suffixes
  const suffixes = ['_OG', '_Pro', '_Fan', 'gg', '_x'];
  suffixes.forEach(suffix => {
    if ((cleanBase + suffix).length <= 20) {
      suggestions.push(`${cleanBase}${suffix}`);
    }
  });

  return suggestions.slice(0, 4);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
