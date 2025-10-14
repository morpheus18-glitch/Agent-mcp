import { query, transaction } from "./db"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import type { PDFFont, PDFPage } from "pdf-lib"
import { z } from "zod"
import {
  calculateScenarioFinancials,
  formatCurrency,
  jsonValueSchema,
  scenarioSchema,
  type JsonValue,
  type ScenarioInput,
} from "./deal-calculations"

interface DealListFilter {
  storeId: string
  customerId?: string
}

const storeProfileSchema = z
  .object({
    name: z.string().min(1),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    settings: jsonValueSchema.optional(),
  })
  .partial({ name: true })

const customerSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  profile: jsonValueSchema.optional(),
})

const storePresetSchema = z.object({
  presetName: z.string().min(1),
  payload: jsonValueSchema,
  isDefault: z.boolean().optional(),
})

const customerPresetSchema = z.object({
  presetName: z.string().min(1),
  payload: jsonValueSchema,
})

const dealUpsertSchema = z.object({
  dealId: z.string().uuid().optional(),
  storeId: z.string().uuid(),
  storeProfile: storeProfileSchema.optional(),
  title: z.string().min(1),
  basePrice: z.number().nonnegative(),
  vehicle: jsonValueSchema.optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  customer: customerSchema,
  scenarios: z.array(
    scenarioSchema.extend({
      id: z.string().uuid().optional(),
      version: z.number().int().positive().optional(),
    }),
  ),
  storePreset: storePresetSchema.optional(),
  customerPreset: customerPresetSchema.optional(),
})

const documentRequestSchema = z.object({
  scenarioId: z.string().uuid(),
  documentType: z.string().default("deal_summary"),
  preparedBy: z.string().optional(),
})

function ensureJson(value: JsonValue | undefined): Record<string, unknown> {
  if (value === undefined || value === null) {
    return {}
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return { value }
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function sanitizeJson(value: JsonValue | undefined) {
  if (value === undefined) {
    return {}
  }
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    throw new Error("Unable to serialize JSON payload")
  }
}

function buildVehicleDescription(vehicle: Record<string, unknown> | undefined): string {
  if (!vehicle) return ""
  const year = vehicle["year"]
  const make = vehicle["make"]
  const model = vehicle["model"]
  const trim = vehicle["trim"]
  const parts = [year, make, model, trim].filter((part) => typeof part === "string" || typeof part === "number")
  return parts.join(" ")
}

async function ensureStore(
  client: { query: typeof query },
  storeId: string,
  storeProfile?: z.infer<typeof storeProfileSchema>,
) {
  const existing = await client.query(`SELECT * FROM stores WHERE id = $1`, [storeId])
  if (existing.rows.length === 0) {
    if (!storeProfile?.name) {
      throw new Error("Store does not exist and no store profile was provided to create it.")
    }
    await client.query(
      `INSERT INTO stores (id, name, contact_email, contact_phone, address, settings) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        storeId,
        storeProfile.name,
        storeProfile.contactEmail ?? null,
        storeProfile.contactPhone ?? null,
        storeProfile.address ?? null,
        sanitizeJson(storeProfile.settings ?? {}),
      ],
    )
    return
  }

  if (storeProfile) {
    await client.query(
      `UPDATE stores SET
        name = COALESCE($2, name),
        contact_email = COALESCE($3, contact_email),
        contact_phone = COALESCE($4, contact_phone),
        address = COALESCE($5, address),
        settings = COALESCE($6::jsonb, settings),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        storeId,
        storeProfile.name ?? null,
        storeProfile.contactEmail ?? null,
        storeProfile.contactPhone ?? null,
        storeProfile.address ?? null,
        storeProfile.settings ? sanitizeJson(storeProfile.settings) : null,
      ],
    )
  }
}

async function upsertStorePreset(
  client: { query: typeof query },
  storeId: string,
  preset?: z.infer<typeof storePresetSchema>,
) {
  if (!preset) return null
  const result = await client.query(
    `INSERT INTO store_deal_presets (store_id, preset_name, payload, is_default)
     VALUES ($1, $2, $3, COALESCE($4, FALSE))
     ON CONFLICT (store_id, preset_name)
     DO UPDATE SET payload = EXCLUDED.payload, is_default = EXCLUDED.is_default, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [storeId, preset.presetName, sanitizeJson(preset.payload), preset.isDefault ?? false],
  )
  return result.rows[0] ?? null
}

async function upsertCustomer(
  client: { query: typeof query },
  storeId: string,
  customer: z.infer<typeof customerSchema>,
) {
  const profile = sanitizeJson(customer.profile ?? {})
  if (customer.id) {
    const result = await client.query(
      `UPDATE customers SET
         first_name = $2,
         last_name = $3,
         email = $4,
         phone = $5,
         profile = $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [customer.id, customer.firstName, customer.lastName, customer.email ?? null, customer.phone ?? null, profile],
    )
    if (result.rows.length === 0) {
      throw new Error("Customer not found for update")
    }
    return result.rows[0]
  }

  const result = await client.query(
    `INSERT INTO customers (store_id, first_name, last_name, email, phone, profile)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [storeId, customer.firstName, customer.lastName, customer.email ?? null, customer.phone ?? null, profile],
  )
  return result.rows[0]
}

async function upsertCustomerPreset(
  client: { query: typeof query },
  customerId: string,
  preset?: z.infer<typeof customerPresetSchema>,
) {
  if (!preset) return null
  const result = await client.query(
    `INSERT INTO customer_deal_presets (customer_id, preset_name, payload)
     VALUES ($1, $2, $3)
     ON CONFLICT (customer_id, preset_name)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [customerId, preset.presetName, sanitizeJson(preset.payload)],
  )
  return result.rows[0] ?? null
}

async function insertDeal(
  client: { query: typeof query },
  payload: z.infer<typeof dealUpsertSchema>,
  customerId: string | null,
) {
  const vehicle = sanitizeJson(payload.vehicle ?? {})
  if (payload.dealId) {
    const result = await client.query(
      `UPDATE deals SET
         customer_id = $2,
         title = $3,
         vehicle = $4,
         status = COALESCE($5, status),
         base_price = $6,
         notes = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [payload.dealId, customerId, payload.title, vehicle, payload.status ?? null, payload.basePrice, payload.notes ?? null],
    )
    if (result.rows.length === 0) {
      throw new Error("Deal not found for update")
    }
    return result.rows[0]
  }

  const result = await client.query(
    `INSERT INTO deals (store_id, customer_id, title, vehicle, status, base_price, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      payload.storeId,
      customerId,
      payload.title,
      vehicle,
      payload.status ?? "active",
      payload.basePrice,
      payload.notes ?? null,
    ],
  )
  return result.rows[0]
}

async function insertScenario(
  client: { query: typeof query },
  dealId: string,
  scenario: ScenarioInput & { id?: string; version?: number },
) {
  const existingVersion = await client.query(
    `SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM deal_scenarios WHERE deal_id = $1 AND scenario_type = $2`,
    [dealId, scenario.scenarioType],
  )
  const version = scenario.version ?? Number(existingVersion.rows[0]?.next_version ?? 1)
  const financials = calculateScenarioFinancials(scenario)
  const result = await client.query(
    `INSERT INTO deal_scenarios (
        deal_id,
        scenario_type,
        version,
        price,
        down_payment,
        term_months,
        apr,
        money_factor,
        residual_value,
        payment,
        fees,
        taxes,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
    [
      dealId,
      scenario.scenarioType,
      version,
      scenario.price,
      scenario.downPayment ?? 0,
      scenario.termMonths ?? null,
      scenario.apr ?? null,
      scenario.moneyFactor ?? null,
      scenario.residualValue ?? null,
      financials.monthlyPayment,
      sanitizeJson(scenario.fees ?? {}),
      sanitizeJson(scenario.taxes ?? {}),
      sanitizeJson(scenario.metadata ?? {}),
    ],
  )
  return {
    row: result.rows[0] as Record<string, unknown>,
    calculations: financials,
  }
}

function normalizeDealRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    customerId: (row.customer_id as string) ?? null,
    title: row.title as string,
    vehicle:
      row.vehicle && typeof row.vehicle === "object"
        ? (row.vehicle as Record<string, unknown>)
        : {},
    status: row.status as string,
    basePrice: parseNumeric(row.base_price) ?? 0,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function normalizeScenarioRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    dealId: row.deal_id as string,
    scenarioType: row.scenario_type as ScenarioInput["scenarioType"],
    version: Number(row.version ?? 0),
    price: parseNumeric(row.price) ?? 0,
    downPayment: parseNumeric(row.down_payment) ?? 0,
    termMonths: (row.term_months as number) ?? null,
    apr: row.apr !== null ? parseNumeric(row.apr) : null,
    moneyFactor: row.money_factor !== null ? parseNumeric(row.money_factor) : null,
    residualValue: row.residual_value !== null ? parseNumeric(row.residual_value) : null,
    payment: row.payment !== null ? parseNumeric(row.payment) : null,
    fees:
      row.fees && typeof row.fees === "object"
        ? (row.fees as Record<string, unknown>)
        : {},
    taxes:
      row.taxes && typeof row.taxes === "object"
        ? (row.taxes as Record<string, unknown>)
        : {},
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: row.created_at as string,
  }
}

function normalizeDocumentRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    dealId: row.deal_id as string,
    scenarioId: (row.scenario_id as string) ?? null,
    documentType: row.document_type as string,
    fileName: row.file_name as string,
    createdAt: row.created_at as string,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
  }
}

export async function saveDeal(payload: unknown) {
  const input = dealUpsertSchema.parse(payload)
  const transactionResult = await transaction(async (client) => {
    await ensureStore(client, input.storeId, input.storeProfile)
    const storePreset = await upsertStorePreset(client, input.storeId, input.storePreset)
    const customerRow = await upsertCustomer(client, input.storeId, input.customer)
    const customerPreset = await upsertCustomerPreset(client, customerRow.id, input.customerPreset)
    const dealRow = await insertDeal(client, input, customerRow.id)
    const scenarios = [] as Array<ReturnType<typeof normalizeScenarioRow> & { calculations: ReturnType<typeof calculateScenarioFinancials> }>

    for (const scenarioInput of input.scenarios) {
      const parsed = scenarioSchema.parse({
        scenarioType: scenarioInput.scenarioType,
        price: scenarioInput.price,
        downPayment: scenarioInput.downPayment ?? 0,
        termMonths: scenarioInput.termMonths,
        apr: scenarioInput.apr,
        moneyFactor: scenarioInput.moneyFactor,
        residualValue: scenarioInput.residualValue,
        fees: scenarioInput.fees ?? {},
        taxes: scenarioInput.taxes ?? {},
        metadata: scenarioInput.metadata ?? {},
      })
      const created = await insertScenario(client, dealRow.id, { ...parsed, version: scenarioInput.version })
      const normalized = normalizeScenarioRow(created.row)
      scenarios.push({ ...normalized, calculations: created.calculations })
    }

    return {
      deal: normalizeDealRow(dealRow),
      customer: {
        id: customerRow.id,
        firstName: customerRow.first_name,
        lastName: customerRow.last_name,
        email: customerRow.email,
        phone: customerRow.phone,
        profile: customerRow.profile ?? {},
      },
      storePreset: storePreset ? ensureJson(storePreset.payload) : null,
      customerPreset: customerPreset ? ensureJson(customerPreset.payload) : null,
      scenarios,
    }
  })

  const dealDetails = await getDeal(transactionResult.deal.id)
  return {
    ...dealDetails,
    calculations: Object.fromEntries(
      transactionResult.scenarios.map((scenario) => [scenario.id, scenario.calculations]),
    ),
  }
}

export async function listDeals(filter: DealListFilter) {
  const params = [filter.storeId]
  let where = "WHERE d.store_id = $1"
  if (filter.customerId) {
    params.push(filter.customerId)
    where += ` AND d.customer_id = $${params.length}`
  }
  const deals = await query(
    `SELECT d.*, s.name AS store_name, c.first_name, c.last_name
     FROM deals d
     JOIN stores s ON s.id = d.store_id
     LEFT JOIN customers c ON c.id = d.customer_id
     ${where}
     ORDER BY d.updated_at DESC`,
    params,
  )

  const dealRows = deals.rows as Array<Record<string, unknown>>
  const dealIds = dealRows.map((row) => row.id as string)
  const scenarios = dealIds.length
    ? await query(
        `SELECT * FROM deal_scenarios WHERE deal_id = ANY($1::uuid[]) ORDER BY created_at DESC`,
        [dealIds],
      )
    : { rows: [] }

  const documents = dealIds.length
    ? await query(
        `SELECT id, deal_id, scenario_id, document_type, file_name, created_at, metadata
         FROM deal_documents
         WHERE deal_id = ANY($1::uuid[])
         ORDER BY created_at DESC`,
        [dealIds],
      )
    : { rows: [] }

  const scenarioMap = new Map<string, ReturnType<typeof normalizeScenarioRow>[]>()
  const scenarioRows = scenarios.rows as Array<Record<string, unknown>>
  for (const row of scenarioRows) {
    const dealId = row.deal_id as string
    const list = scenarioMap.get(dealId) ?? []
    list.push(normalizeScenarioRow(row))
    scenarioMap.set(dealId, list)
  }

  const documentMap = new Map<string, ReturnType<typeof normalizeDocumentRow>[]>()
  const documentRows = documents.rows as Array<Record<string, unknown>>
  for (const row of documentRows) {
    const dealId = row.deal_id as string
    const list = documentMap.get(dealId) ?? []
    list.push(normalizeDocumentRow(row))
    documentMap.set(dealId, list)
  }

  return dealRows.map((row) => {
    const id = row.id as string
    const firstName = (row.first_name as string) ?? ""
    const lastName = (row.last_name as string) ?? ""
    const name = firstName ? `${firstName} ${lastName}`.trim() : null
    return {
      ...normalizeDealRow(row),
      storeName: (row.store_name as string) ?? "",
      customerName: name,
      scenarios: scenarioMap.get(id) ?? [],
      documents: documentMap.get(id) ?? [],
    }
  })
}

export async function getDeal(dealId: string) {
  const dealResult = await query(
    `SELECT d.*, s.name AS store_name, s.contact_email, s.contact_phone, s.address, s.settings,
            c.first_name, c.last_name, c.email, c.phone, c.profile
     FROM deals d
     JOIN stores s ON s.id = d.store_id
     LEFT JOIN customers c ON c.id = d.customer_id
     WHERE d.id = $1`,
    [dealId],
  )
  if (dealResult.rows.length === 0) {
    throw new Error("Deal not found")
  }
  const dealRow = dealResult.rows[0] as Record<string, unknown>
  const scenarioResult = await query(
    `SELECT * FROM deal_scenarios WHERE deal_id = $1 ORDER BY created_at DESC`,
    [dealId],
  )
  const documentResult = await query(
    `SELECT id, deal_id, scenario_id, document_type, file_name, created_at, metadata
     FROM deal_documents WHERE deal_id = $1 ORDER BY created_at DESC`,
    [dealId],
  )

  return {
    deal: normalizeDealRow(dealRow),
    store: {
      id: dealRow.store_id as string,
      name: (dealRow.store_name as string) ?? "",
      contactEmail: (dealRow.contact_email as string) ?? null,
      contactPhone: (dealRow.contact_phone as string) ?? null,
      address: (dealRow.address as string) ?? null,
      settings:
        dealRow.settings && typeof dealRow.settings === "object"
          ? (dealRow.settings as Record<string, unknown>)
          : {},
    },
    customer: dealRow.first_name
      ? {
          id: (dealRow.customer_id as string) ?? null,
          firstName: (dealRow.first_name as string) ?? "",
          lastName: (dealRow.last_name as string) ?? "",
          email: (dealRow.email as string) ?? null,
          phone: (dealRow.phone as string) ?? null,
          profile:
            dealRow.profile && typeof dealRow.profile === "object"
              ? (dealRow.profile as Record<string, unknown>)
              : {},
        }
      : null,
    scenarios: (scenarioResult.rows as Array<Record<string, unknown>>).map((row) =>
      normalizeScenarioRow(row),
    ),
    documents: (documentResult.rows as Array<Record<string, unknown>>).map((row) =>
      normalizeDocumentRow(row),
    ),
  }
}

async function fetchScenarioForPdf(dealId: string, scenarioId: string) {
  const result = await query(
    `SELECT d.id as deal_id, d.title, d.base_price, d.vehicle, d.notes,
            s.id as store_id, s.name as store_name, s.contact_email, s.contact_phone, s.address, s.settings,
            c.id as customer_id, c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone, c.profile,
            sc.id as scenario_id, sc.scenario_type, sc.version, sc.price, sc.down_payment, sc.term_months, sc.apr,
            sc.money_factor, sc.residual_value, sc.payment, sc.fees, sc.taxes, sc.metadata, sc.created_at
     FROM deals d
     JOIN stores s ON s.id = d.store_id
     LEFT JOIN customers c ON c.id = d.customer_id
     JOIN deal_scenarios sc ON sc.id = $2 AND sc.deal_id = d.id
     WHERE d.id = $1`,
    [dealId, scenarioId],
  )
  if (result.rows.length === 0) {
    throw new Error("Scenario not found for deal")
  }
  return result.rows[0] as Record<string, unknown>
}

function drawSectionHeader(page: PDFPage, font: PDFFont, text: string, x: number, y: number) {
  page.drawText(text, {
    x,
    y,
    size: 14,
    font,
    color: rgb(0.2, 0.2, 0.2),
  })
}

function drawLabelValue(page: PDFPage, font: PDFFont, label: string, value: string, x: number, y: number) {
  page.drawText(label, {
    x,
    y,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35),
  })
  page.drawText(value, {
    x,
    y: y - 14,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })
}

export async function generateDealDocument(dealId: string, payload: unknown) {
  const { scenarioId, documentType, preparedBy } = documentRequestSchema.parse(payload)
  const row = await fetchScenarioForPdf(dealId, scenarioId)
  const scenario = normalizeScenarioRow(row)
  const deal = normalizeDealRow(row)
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89])
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const margin = 40
  let cursor = page.getHeight() - margin

  page.drawText("Professional Deal Summary", {
    x: margin,
    y: cursor,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  })
  cursor -= 32

  const storeName = (row.store_name as string) ?? ""
  const prepared = preparedBy ? `Prepared by ${preparedBy}` : ""
  drawLabelValue(page, helvetica, "Store", storeName, margin, cursor)
  drawLabelValue(page, helvetica, "Deal", deal.title, margin + 280, cursor)
  cursor -= 40

  const vehicleDescription = buildVehicleDescription(
    row.vehicle && typeof row.vehicle === "object"
      ? (row.vehicle as Record<string, unknown>)
      : undefined,
  )
  drawSectionHeader(page, helveticaBold, "Vehicle", margin, cursor)
  cursor -= 24
  drawLabelValue(page, helvetica, "Description", vehicleDescription || "N/A", margin, cursor)
  drawLabelValue(
    page,
    helvetica,
    "Base Price",
    formatCurrency(parseNumeric(row.base_price) ?? 0),
    margin + 280,
    cursor,
  )
  cursor -= 40

  drawSectionHeader(page, helveticaBold, "Scenario", margin, cursor)
  cursor -= 24
  drawLabelValue(page, helvetica, "Type", scenario.scenarioType.toUpperCase(), margin, cursor)
  drawLabelValue(page, helvetica, "Version", `v${scenario.version}`, margin + 140, cursor)
  drawLabelValue(
    page,
    helvetica,
    "Monthly Payment",
    scenario.payment !== null ? formatCurrency(scenario.payment) : "N/A",
    margin + 280,
    cursor,
  )
  cursor -= 40

  const financials = calculateScenarioFinancials({
    scenarioType: scenario.scenarioType as ScenarioInput["scenarioType"],
    price: scenario.price,
    downPayment: scenario.downPayment,
    termMonths: scenario.termMonths ?? undefined,
    apr: scenario.apr ?? undefined,
    moneyFactor: scenario.moneyFactor ?? undefined,
    residualValue: scenario.residualValue ?? undefined,
    fees: scenario.fees,
    taxes: scenario.taxes,
    metadata: scenario.metadata,
  })

  drawLabelValue(
    page,
    helvetica,
    "Capitalized Cost",
    formatCurrency(financials.capitalizedCost),
    margin,
    cursor,
  )
  drawLabelValue(
    page,
    helvetica,
    "Fees",
    formatCurrency(financials.feesTotal),
    margin + 200,
    cursor,
  )
  drawLabelValue(
    page,
    helvetica,
    "Taxes",
    formatCurrency(financials.taxAmount),
    margin + 350,
    cursor,
  )
  cursor -= 40

  if (scenario.scenarioType === "lease" && financials.residualValue !== undefined) {
    drawLabelValue(
      page,
      helvetica,
      "Residual Value",
      formatCurrency(financials.residualValue),
      margin,
      cursor,
    )
    drawLabelValue(
      page,
      helvetica,
      "Money Factor",
      scenario.moneyFactor !== null ? `${scenario.moneyFactor?.toFixed(6)}` : "N/A",
      margin + 200,
      cursor,
    )
    cursor -= 40
  }

  if (scenario.scenarioType === "finance") {
    drawLabelValue(
      page,
      helvetica,
      "APR",
      scenario.apr !== null ? `${scenario.apr?.toFixed(3)}%` : "N/A",
      margin,
      cursor,
    )
    drawLabelValue(
      page,
      helvetica,
      "Term",
      scenario.termMonths ? `${scenario.termMonths} months` : "N/A",
      margin + 200,
      cursor,
    )
    cursor -= 40
  }

  const firstName = (row.first_name as string) ?? ""
  const lastName = (row.last_name as string) ?? ""
  const customerName = firstName ? `${firstName} ${lastName}`.trim() : "N/A"
  drawSectionHeader(page, helveticaBold, "Customer", margin, cursor)
  cursor -= 24
  drawLabelValue(page, helvetica, "Name", customerName, margin, cursor)
  drawLabelValue(
    page,
    helvetica,
    "Contact",
    [row.customer_email as string, row.customer_phone as string]
      .filter((value) => Boolean(value))
      .join(" | ") || "N/A",
    margin + 200,
    cursor,
  )
  cursor -= 40

  const notes = (row.notes as string) ?? ""
  if (notes) {
    drawSectionHeader(page, helveticaBold, "Notes", margin, cursor)
    cursor -= 20
    const lines = notes.match(/.{1,80}/g) ?? [notes]
    for (const line of lines) {
      page.drawText(line.trim(), { x: margin, y: cursor, size: 10, font: helvetica })
      cursor -= 14
    }
  }

  if (prepared) {
    cursor -= 10
    page.drawText(prepared, { x: margin, y: cursor, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) })
  }

  const pdfBytes = await doc.save()
  const fileName = `deal-${dealId}-${scenario.scenarioType}-v${scenario.version}.pdf`
  const metadata = {
    scenarioType: scenario.scenarioType,
    version: scenario.version,
    preparedBy: preparedBy ?? null,
  }

  const insertResult = await query(
    `INSERT INTO deal_documents (deal_id, scenario_id, document_type, file_name, pdf_data, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [dealId, scenarioId, documentType, fileName, Buffer.from(pdfBytes), metadata],
  )

  const base64 = Buffer.from(pdfBytes).toString("base64")
  return {
    document: {
      id: insertResult.rows[0].id,
      dealId,
      scenarioId,
      documentType,
      fileName,
      createdAt: insertResult.rows[0].created_at,
      metadata,
    },
    pdf: base64,
  }
}

export async function getDealDocumentBinary(dealId: string, documentId: string) {
  const result = await query(
    `SELECT file_name, pdf_data FROM deal_documents WHERE id = $1 AND deal_id = $2`,
    [documentId, dealId],
  )
  if (result.rows.length === 0) {
    throw new Error("Document not found")
  }
  return {
    fileName: result.rows[0].file_name,
    pdfData: result.rows[0].pdf_data as Buffer,
  }
}
