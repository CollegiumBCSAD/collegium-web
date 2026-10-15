export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a letter", test: (p: string) => /[A-Za-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
] as const;

export const firstFailedPasswordRule = (password: string) =>
  PASSWORD_RULES.find((rule) => !rule.test(password));
