export interface ValidationRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const emailRules: ValidationRule[] = [
  {
    id: "email-format",
    label: "Formato de correo electrónico válido",
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
];

export const passwordRules: ValidationRule[] = [
  {
    id: "uppercase",
    label: "Al menos una letra mayúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "punctuation",
    label: "Al menos un carácter de puntuación (!, @, #, $...)",
    test: (value: string) =>
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
  },
];

export function validateEmail(email: string): boolean {
  return emailRules.every((rule) => rule.test(email));
}

export function validatePassword(password: string): boolean {
  return passwordRules.every((rule) => rule.test(password));
}
