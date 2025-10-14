import { z } from "zod"

export const jsonValueSchema = z.any().superRefine((value, ctx) => {
  try {
    JSON.stringify(value)
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Value must be JSON serializable" })
  }
})

export type JsonValue = z.infer<typeof jsonValueSchema>

export const scenarioTypeEnum = z.enum(["cash", "finance", "lease"])

export const scenarioSchema = z.object({
  scenarioType: scenarioTypeEnum,
  price: z.number().nonnegative(),
  downPayment: z.number().nonnegative().default(0),
  termMonths: z.number().int().positive().optional(),
  apr: z.number().nonnegative().optional(),
  moneyFactor: z.number().nonnegative().optional(),
  residualValue: z.number().nonnegative().optional(),
  fees: jsonValueSchema.optional().default({}),
  taxes: jsonValueSchema.optional().default({}),
  metadata: jsonValueSchema.optional().default({}),
})

export type ScenarioInput = z.infer<typeof scenarioSchema>

export interface ScenarioFinancials {
  monthlyPayment: number
  totalDueAtSigning: number
  feesTotal: number
  taxAmount: number
  capitalizedCost: number
  residualValue?: number
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function sumArray(values: unknown[]): number {
  return values.reduce((acc, value) => {
    const num = toNumber(value)
    return acc + (num ?? 0)
  }, 0)
}

export function calculateTotalFees(fees: JsonValue | undefined): number {
  if (!fees) return 0
  if (typeof fees === "number") {
    return fees
  }
  if (Array.isArray(fees)) {
    return sumArray(
      fees.map((item) => {
        if (typeof item === "number") return item
        if (item && typeof item === "object" && "amount" in item) {
          return (item as Record<string, unknown>).amount
        }
        return 0
      }),
    )
  }
  if (typeof fees === "object") {
    if ("total" in fees) {
      const total = toNumber((fees as Record<string, unknown>).total)
      if (total !== null) {
        return total
      }
    }
    if ("items" in fees && Array.isArray((fees as Record<string, unknown>).items)) {
      return sumArray(
        ((fees as Record<string, unknown>).items as unknown[]).map((item) => {
          if (item && typeof item === "object" && "amount" in item) {
            return (item as Record<string, unknown>).amount
          }
          return 0
        }),
      )
    }
    return sumArray(Object.values(fees))
  }
  return 0
}

export function calculateTaxAmount(taxes: JsonValue | undefined, baseAmount: number): number {
  if (!taxes) return 0
  if (typeof taxes === "number") {
    return taxes
  }
  if (typeof taxes === "object") {
    const record = taxes as Record<string, unknown>
    if ("amount" in record) {
      const amount = toNumber(record.amount)
      if (amount !== null) return amount
    }
    if ("monthly" in record) {
      const monthly = toNumber(record.monthly)
      if (monthly !== null) return monthly
    }
    if ("rate" in record) {
      const rate = toNumber(record.rate)
      if (rate !== null) return baseAmount * rate
    }
  }
  return 0
}

export function calculateScenarioFinancials(input: ScenarioInput): ScenarioFinancials {
  const feesTotal = calculateTotalFees(input.fees)
  const price = input.price
  const downPayment = input.downPayment ?? 0
  const capitalizedCost = price - downPayment + feesTotal

  if (input.scenarioType === "cash") {
    const taxes = calculateTaxAmount(input.taxes, capitalizedCost)
    return {
      monthlyPayment: capitalizedCost + taxes,
      totalDueAtSigning: capitalizedCost + taxes,
      feesTotal,
      taxAmount: taxes,
      capitalizedCost,
    }
  }

  if (input.scenarioType === "finance") {
    const term = input.termMonths ?? 0
    if (!term) {
      throw new Error("Finance scenarios require termMonths to calculate payments.")
    }
    const apr = input.apr ?? 0
    const monthlyRate = apr > 0 ? apr / 100 / 12 : 0
    const principal = capitalizedCost
    let basePayment = 0
    if (monthlyRate === 0) {
      basePayment = principal / term
    } else {
      basePayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
    }
    const taxes = calculateTaxAmount(input.taxes, basePayment)
    return {
      monthlyPayment: basePayment + taxes,
      totalDueAtSigning: downPayment + feesTotal,
      feesTotal,
      taxAmount: taxes,
      capitalizedCost,
    }
  }

  // lease
  const term = input.termMonths ?? 0
  if (!term) {
    throw new Error("Lease scenarios require termMonths to calculate payments.")
  }
  const residualValue = input.residualValue ?? 0
  const moneyFactor = input.moneyFactor ?? 0
  const depreciation = (capitalizedCost - residualValue) / term
  const rentCharge = (capitalizedCost + residualValue) * moneyFactor
  const basePayment = depreciation + rentCharge
  const taxes = calculateTaxAmount(input.taxes, basePayment)
  return {
    monthlyPayment: basePayment + taxes,
    totalDueAtSigning: downPayment + feesTotal,
    feesTotal,
    taxAmount: taxes,
    capitalizedCost,
    residualValue,
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
