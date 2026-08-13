export interface ValidationIssue {
  field: string
  code: 'REQUIRED' | 'NOT_FINITE' | 'OUT_OF_RANGE' | 'NOT_INTEGER' | 'UNSUPPORTED'
  message: string
}

export interface NumberRule {
  label: string
  min?: number
  max?: number
  integer?: boolean
  exclusiveMin?: boolean
}

export function validateNumbers(
  values: Record<string, unknown>,
  rules: Record<string, NumberRule>
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  for (const [field, rule] of Object.entries(rules)) {
    if (values[field] === '' || values[field] === null || values[field] === undefined) {
      issues.push({ field, code: 'REQUIRED', message: `${rule.label}不能为空` })
      continue
    }
    const value = Number(values[field])
    if (!Number.isFinite(value)) {
      issues.push({ field, code: 'NOT_FINITE', message: `${rule.label}必须是有限数值` })
      continue
    }
    if (rule.integer && !Number.isInteger(value)) {
      issues.push({ field, code: 'NOT_INTEGER', message: `${rule.label}必须是整数` })
    }
    if (rule.min !== undefined && (rule.exclusiveMin ? value <= rule.min : value < rule.min)) {
      issues.push({ field, code: 'OUT_OF_RANGE', message: `${rule.label}必须${rule.exclusiveMin ? '大于' : '不小于'} ${rule.min}` })
    }
    if (rule.max !== undefined && value > rule.max) {
      issues.push({ field, code: 'OUT_OF_RANGE', message: `${rule.label}必须不大于 ${rule.max}` })
    }
  }
  return issues
}

export function requireValidNumbers(values: Record<string, unknown>, rules: Record<string, NumberRule>) {
  const issues = validateNumbers(values, rules)
  if (issues.length) {
    const error = new RangeError(issues.map(issue => issue.message).join('；')) as RangeError & { issues: ValidationIssue[] }
    error.issues = issues
    throw error
  }
}
