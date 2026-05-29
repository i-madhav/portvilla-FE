export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters required.')
  if (password.length > 64) errors.push('Maximum 64 characters allowed.')
  if (!/[a-z]/.test(password)) errors.push('Include a lowercase letter.')
  if (!/[A-Z]/.test(password)) errors.push('Include an uppercase letter.')
  if (!/\d/.test(password)) errors.push('Include a digit.')
  if (!/[\W_]/.test(password)) errors.push('Include a special character.')

  return { valid: errors.length === 0, errors }
}
