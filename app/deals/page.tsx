"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  calculateScenarioFinancials,
  formatCurrency,
  type ScenarioFinancials,
} from "@/lib/deal-calculations"

interface ScenarioFormState {
  scenarioType: "cash" | "finance" | "lease"
  price: number
  downPayment: number
  termMonths?: number
  apr?: number
  moneyFactor?: number
  residualValue?: number
  feesTotal: number
  taxRate: number
}

interface DealScenario {
  id: string
  scenarioType: "cash" | "finance" | "lease"
  version: number
  price: number
  downPayment: number
  termMonths: number | null
  apr: number | null
  moneyFactor: number | null
  residualValue: number | null
  payment: number | null
  fees: Record<string, unknown>
  taxes: Record<string, unknown>
  metadata: Record<string, unknown>
  createdAt: string
}

interface DealDocumentSummary {
  id: string
  dealId: string
  scenarioId: string | null
  documentType: string
  fileName: string
  metadata: Record<string, unknown>
  createdAt: string
}

interface DealResponse {
  deal: {
    id: string
    storeId: string
    customerId: string | null
    title: string
    status: string
    basePrice: number
    vehicle: Record<string, unknown>
    notes?: string | null
    createdAt: string
    updatedAt: string
  }
  store: {
    id: string
    name: string
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    settings: Record<string, unknown>
  }
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    profile: Record<string, unknown>
  } | null
  scenarios: DealScenario[]
  documents: DealDocumentSummary[]
  calculations?: Record<string, ScenarioFinancials>
}

type DealSummary = DealResponse["deal"] & {
  storeName: string
  customerName: string | null
  scenarios: DealScenario[]
  documents: DealDocumentSummary[]
}

const defaultScenarios: ScenarioFormState[] = [
  {
    scenarioType: "cash",
    price: 45000,
    downPayment: 45000,
    feesTotal: 495,
    taxRate: 7.5,
  },
  {
    scenarioType: "finance",
    price: 45000,
    downPayment: 5000,
    termMonths: 72,
    apr: 5.5,
    feesTotal: 795,
    taxRate: 7.5,
  },
  {
    scenarioType: "lease",
    price: 45000,
    downPayment: 3000,
    termMonths: 36,
    moneyFactor: 0.0021,
    residualValue: 26000,
    feesTotal: 895,
    taxRate: 7.5,
  },
]

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function DealsWorkspace() {
  const [storeId, setStoreId] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeEmail, setStoreEmail] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storePresetName, setStorePresetName] = useState("Default")
  const [storePresetDefault, setStorePresetDefault] = useState(true)

  const [customerId, setCustomerId] = useState("")
  const [customerFirstName, setCustomerFirstName] = useState("")
  const [customerLastName, setCustomerLastName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerPresetName, setCustomerPresetName] = useState("Preferred")

  const [dealTitle, setDealTitle] = useState("New Vehicle Proposal")
  const [basePrice, setBasePrice] = useState(45000)
  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleTrim, setVehicleTrim] = useState("")
  const [vehicleVin, setVehicleVin] = useState("")
  const [dealNotes, setDealNotes] = useState("")

  const [scenarios, setScenarios] = useState<ScenarioFormState[]>(defaultScenarios)
  const [currentDeal, setCurrentDeal] = useState<DealResponse | null>(null)
  const [dealHistory, setDealHistory] = useState<DealSummary[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const scenarioCalculations = useMemo(() => {
    return scenarios.reduce<Record<string, { result: ScenarioFinancials | null; error: string | null }>>(
      (acc, scenario) => {
        try {
          const taxes = Number.isFinite(scenario.taxRate) ? scenario.taxRate / 100 : 0
          const result = calculateScenarioFinancials({
            scenarioType: scenario.scenarioType,
            price: scenario.price,
            downPayment: scenario.downPayment,
            termMonths: scenario.termMonths,
            apr: scenario.apr,
            moneyFactor: scenario.moneyFactor,
            residualValue: scenario.residualValue,
            fees: { total: scenario.feesTotal },
            taxes: { rate: taxes },
            metadata: {},
          })
          acc[scenario.scenarioType] = { result, error: null }
        } catch (error) {
          acc[scenario.scenarioType] = {
            result: null,
            error: error instanceof Error ? error.message : String(error),
          }
        }
        return acc
      },
      {},
    )
  }, [scenarios])

  const updateScenario = useCallback(
    (type: ScenarioFormState["scenarioType"], field: keyof ScenarioFormState, value: number | undefined) => {
      setScenarios((prev) =>
        prev.map((scenario) =>
          scenario.scenarioType === type
            ? {
                ...scenario,
                [field]: value,
              }
            : scenario,
        ),
      )
    },
    [],
  )

  const vehiclePayload = useMemo(() => {
    const payload: Record<string, string> = {}
    if (vehicleYear) payload.year = vehicleYear
    if (vehicleMake) payload.make = vehicleMake
    if (vehicleModel) payload.model = vehicleModel
    if (vehicleTrim) payload.trim = vehicleTrim
    if (vehicleVin) payload.vin = vehicleVin
    return payload
  }, [vehicleYear, vehicleMake, vehicleModel, vehicleTrim, vehicleVin])

  const customerProfile = useMemo(() => {
    return {
      history: currentDeal?.scenarios ?? [],
    }
  }, [currentDeal])

  const loadDealHistory = useCallback(async () => {
    if (!storeId) return
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`/api/deals?storeId=${storeId}`)
      if (!response.ok) {
        throw new Error("Failed to load deal history")
      }
      const data = (await response.json()) as DealSummary[]
      setDealHistory(data)
    } catch (error) {
      toast({ title: "History error", description: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoadingHistory(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeId) {
      void loadDealHistory()
    }
  }, [loadDealHistory, storeId])

  const persistDeal = useCallback(async () => {
    if (!storeId) {
      toast({ title: "Store ID required", description: "Provide a store identifier before saving." })
      return
    }
    if (!storeName) {
      toast({ title: "Store name required", description: "Provide the store name to persist presets." })
      return
    }
    if (!customerFirstName || !customerLastName) {
      toast({ title: "Customer details required", description: "Customer first and last name are mandatory." })
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: currentDeal?.deal.id,
          storeId,
          storeProfile: {
            name: storeName,
            contactEmail: storeEmail || undefined,
            contactPhone: storePhone || undefined,
            address: storeAddress || undefined,
            settings: {
              defaultPreset: storePresetName,
              defaultScenario: "finance",
            },
          },
          title: dealTitle,
          basePrice,
          vehicle: vehiclePayload,
          notes: dealNotes || undefined,
          customer: {
            id: customerId || undefined,
            firstName: customerFirstName,
            lastName: customerLastName,
            email: customerEmail || undefined,
            phone: customerPhone || undefined,
            profile: customerProfile,
          },
          scenarios: scenarios.map((scenario) => ({
            scenarioType: scenario.scenarioType,
            price: scenario.price,
            downPayment: scenario.downPayment,
            termMonths: scenario.termMonths,
            apr: scenario.apr,
            moneyFactor: scenario.moneyFactor,
            residualValue: scenario.residualValue,
            fees: { total: scenario.feesTotal },
            taxes: { rate: Number.isFinite(scenario.taxRate) ? scenario.taxRate / 100 : 0 },
            metadata: { preparedBy: storeName },
          })),
          storePreset: {
            presetName: storePresetName,
            payload: {
              scenarios,
              basePrice,
            },
            isDefault: storePresetDefault,
          },
          customerPreset: {
            presetName: customerPresetName,
            payload: {
              preferredContact: customerEmail || customerPhone,
              notes: dealNotes,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error ?? "Failed to save deal")
      }

      const data = (await response.json()) as DealResponse
      setCurrentDeal(data)
      setCustomerId(data.customer?.id ?? "")
      toast({ title: "Deal saved", description: "Deal scenarios and presets have been persisted." })
      await loadDealHistory()
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsSaving(false)
    }
  }, [
    basePrice,
    currentDeal?.deal.id,
    customerId,
    customerEmail,
    customerFirstName,
    customerLastName,
    customerPhone,
    customerPresetName,
    customerProfile,
    dealNotes,
    dealTitle,
    loadDealHistory,
    scenarios,
    storeAddress,
    storeEmail,
    storeId,
    storeName,
    storePhone,
    storePresetDefault,
    storePresetName,
    vehiclePayload,
  ])

  const loadScenarioFromHistory = useCallback(
    (scenario: DealScenario) => {
      setScenarios((prev) =>
        prev.map((current) =>
          current.scenarioType === scenario.scenarioType
            ? {
                ...current,
                price: scenario.price,
                downPayment: scenario.downPayment,
                termMonths: scenario.termMonths ?? undefined,
                apr: scenario.apr ?? undefined,
                moneyFactor: scenario.moneyFactor ?? undefined,
                residualValue: scenario.residualValue ?? undefined,
                feesTotal: typeof scenario.fees?.total === "number" ? (scenario.fees.total as number) : current.feesTotal,
                taxRate:
                  typeof scenario.taxes?.rate === "number"
                    ? Number(((scenario.taxes.rate as number) * 100).toFixed(4))
                    : current.taxRate,
              }
            : current,
        ),
      )
      toast({
        title: "Scenario loaded",
        description: `${scenario.scenarioType.toUpperCase()} v${scenario.version} applied to the workspace`,
      })
    },
    [],
  )

  const generatePdf = useCallback(
    async (scenarioId: string) => {
      if (!currentDeal) return
      try {
        const response = await fetch(`/api/deals/${currentDeal.deal.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId, documentType: "deal_summary", preparedBy: storeName }),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Failed to generate PDF" }))
          throw new Error(error.error ?? "Failed to generate PDF")
        }
        const data = await response.json()
        if (data?.pdf) {
          const link = document.createElement("a")
          link.href = `data:application/pdf;base64,${data.pdf}`
          link.download = data.document.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          toast({ title: "PDF ready", description: "The document has been generated and downloaded." })
          await loadDealHistory()
          const detail = await fetch(`/api/deals/${currentDeal.deal.id}`)
          if (detail.ok) {
            const detailData = (await detail.json()) as DealResponse
            setCurrentDeal(detailData)
          }
        }
      } catch (error) {
        toast({ title: "PDF error", description: error instanceof Error ? error.message : String(error) })
      }
    },
    [currentDeal, loadDealHistory, storeName],
  )

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Deal Structuring Workspace</h1>
          <p className="text-muted-foreground">
            Configure cash, finance, and lease options, persist presets, and generate professional PDFs.
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={persistDeal} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Deal"}
          </Button>
          <Button variant="outline" onClick={loadDealHistory} disabled={!storeId || isLoadingHistory}>
            {isLoadingHistory ? "Loading..." : "Refresh History"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store &amp; Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeId">Store Identifier</Label>
              <Input id="storeId" value={storeId} onChange={(event) => setStoreId(event.target.value.trim())} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" value={storeName} onChange={(event) => setStoreName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={storeEmail}
                onChange={(event) => setStoreEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Store Phone</Label>
              <Input id="storePhone" value={storePhone} onChange={(event) => setStorePhone(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeAddress">Store Address</Label>
              <Input
                id="storeAddress"
                value={storeAddress}
                onChange={(event) => setStoreAddress(event.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID (optional)</Label>
              <Input id="customerId" value={customerId} onChange={(event) => setCustomerId(event.target.value.trim())} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerFirstName">Customer First Name</Label>
              <Input
                id="customerFirstName"
                value={customerFirstName}
                onChange={(event) => setCustomerFirstName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerLastName">Customer Last Name</Label>
              <Input
                id="customerLastName"
                value={customerLastName}
                onChange={(event) => setCustomerLastName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storePresetName">Store Preset Name</Label>
              <Input
                id="storePresetName"
                value={storePresetName}
                onChange={(event) => setStorePresetName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPresetName">Customer Preset Name</Label>
              <Input
                id="customerPresetName"
                value={customerPresetName}
                onChange={(event) => setCustomerPresetName(event.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="storePresetDefault"
                type="checkbox"
                checked={storePresetDefault}
                onChange={(event) => setStorePresetDefault(event.target.checked)}
              />
              <Label htmlFor="storePresetDefault">Use as default store preset</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle &amp; Deal Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dealTitle">Deal Title</Label>
              <Input id="dealTitle" value={dealTitle} onChange={(event) => setDealTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(event) => setBasePrice(toNumber(event.target.value, basePrice))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleVin">Vehicle VIN</Label>
              <Input id="vehicleVin" value={vehicleVin} onChange={(event) => setVehicleVin(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Year</Label>
              <Input id="vehicleYear" value={vehicleYear} onChange={(event) => setVehicleYear(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleMake">Make</Label>
              <Input id="vehicleMake" value={vehicleMake} onChange={(event) => setVehicleMake(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model</Label>
              <Input id="vehicleModel" value={vehicleModel} onChange={(event) => setVehicleModel(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleTrim">Trim</Label>
              <Input id="vehicleTrim" value={vehicleTrim} onChange={(event) => setVehicleTrim(event.target.value)} />
            </div>
          </div>
          <Textarea
            placeholder="Internal notes, incentives, or delivery information"
            value={dealNotes}
            onChange={(event) => setDealNotes(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="cash" className="space-y-6">
            <TabsList>
              <TabsTrigger value="cash">Cash</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="lease">Lease</TabsTrigger>
            </TabsList>
            {scenarios.map((scenario) => {
              const calculation = scenarioCalculations[scenario.scenarioType]
              return (
                <TabsContent key={scenario.scenarioType} value={scenario.scenarioType} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario.scenarioType}-price`}>Vehicle Price</Label>
                      <Input
                        id={`${scenario.scenarioType}-price`}
                        type="number"
                        value={scenario.price}
                        onChange={(event) => updateScenario(scenario.scenarioType, "price", toNumber(event.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario.scenarioType}-down`}>Down Payment</Label>
                      <Input
                        id={`${scenario.scenarioType}-down`}
                        type="number"
                        value={scenario.downPayment}
                        onChange={(event) =>
                          updateScenario(scenario.scenarioType, "downPayment", toNumber(event.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario.scenarioType}-fees`}>Total Fees</Label>
                      <Input
                        id={`${scenario.scenarioType}-fees`}
                        type="number"
                        value={scenario.feesTotal}
                        onChange={(event) => updateScenario(scenario.scenarioType, "feesTotal", toNumber(event.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {(scenario.scenarioType === "finance" || scenario.scenarioType === "lease") && (
                      <div className="space-y-2">
                        <Label htmlFor={`${scenario.scenarioType}-term`}>Term (months)</Label>
                        <Input
                          id={`${scenario.scenarioType}-term`}
                          type="number"
                          value={scenario.termMonths ?? ""}
                          onChange={(event) =>
                            updateScenario(
                              scenario.scenarioType,
                              "termMonths",
                              event.target.value ? toNumber(event.target.value) : undefined,
                            )
                          }
                        />
                      </div>
                    )}
                    {scenario.scenarioType === "finance" && (
                      <div className="space-y-2">
                        <Label htmlFor="finance-apr">APR (%)</Label>
                        <Input
                          id="finance-apr"
                          type="number"
                          step="0.001"
                          value={scenario.apr ?? ""}
                          onChange={(event) =>
                            updateScenario(
                              scenario.scenarioType,
                              "apr",
                              event.target.value ? toNumber(event.target.value) : undefined,
                            )
                          }
                        />
                      </div>
                    )}
                    {scenario.scenarioType === "lease" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="lease-moneyFactor">Money Factor</Label>
                          <Input
                            id="lease-moneyFactor"
                            type="number"
                            step="0.000001"
                            value={scenario.moneyFactor ?? ""}
                            onChange={(event) =>
                              updateScenario(
                                scenario.scenarioType,
                                "moneyFactor",
                                event.target.value ? toNumber(event.target.value) : undefined,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lease-residual">Residual Value</Label>
                          <Input
                            id="lease-residual"
                            type="number"
                            value={scenario.residualValue ?? ""}
                            onChange={(event) =>
                              updateScenario(
                                scenario.scenarioType,
                                "residualValue",
                                event.target.value ? toNumber(event.target.value) : undefined,
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario.scenarioType}-tax`}>Tax Rate (%)</Label>
                      <Input
                        id={`${scenario.scenarioType}-tax`}
                        type="number"
                        step="0.01"
                        value={scenario.taxRate}
                        onChange={(event) => updateScenario(scenario.scenarioType, "taxRate", toNumber(event.target.value))}
                      />
                    </div>
                  </div>

                  {calculation?.error ? (
                    <p className="text-sm text-destructive">{calculation.error}</p>
                  ) : calculation?.result ? (
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-xl font-semibold">
                          {formatCurrency(calculation.result.monthlyPayment)}
                        </p>
                      </div>
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Due at Signing</p>
                        <p className="text-xl font-semibold">
                          {formatCurrency(calculation.result.totalDueAtSigning)}
                        </p>
                      </div>
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Capitalized Cost</p>
                        <p className="text-xl font-semibold">
                          {formatCurrency(calculation.result.capitalizedCost)}
                        </p>
                      </div>
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Taxes</p>
                        <p className="text-xl font-semibold">{formatCurrency(calculation.result.taxAmount)}</p>
                      </div>
                    </div>
                  ) : null}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {currentDeal && (
        <Card>
          <CardHeader>
            <CardTitle>Current Deal Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-medium">Deal ID: {currentDeal.deal.id}</p>
              <p className="text-sm text-muted-foreground">Updated: {new Date(currentDeal.deal.updatedAt).toLocaleString()}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {currentDeal.scenarios.map((scenario) => (
                <div key={scenario.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{scenario.scenarioType.toUpperCase()} v{scenario.version}</p>
                      <p className="text-sm text-muted-foreground">
                        Payment: {scenario.payment ? formatCurrency(scenario.payment) : "N/A"}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => generatePdf(scenario.id)}>
                      Generate PDF
                    </Button>
                  </div>
                  <Button variant="outline" className="mt-3 w-full" onClick={() => loadScenarioFromHistory(scenario)}>
                    Load Scenario
                  </Button>
                </div>
              ))}
            </div>
            {currentDeal.documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Generated Documents</h3>
                <div className="space-y-2">
                  {currentDeal.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(doc.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/deals/${currentDeal.deal.id}/documents/${doc.id}`} target="_blank" rel="noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Deal History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dealHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals saved for this store yet.</p>
          ) : (
            dealHistory.map((deal) => (
              <div key={deal.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {deal.customerName ?? "Unassigned"} · Last Updated: {" "}
                      {new Date(deal.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deal.documents.map((doc) => (
                      <Button key={doc.id} asChild size="sm" variant="outline">
                        <a href={`/api/deals/${deal.id}/documents/${doc.id}`} target="_blank" rel="noreferrer">
                          {doc.documentType.toUpperCase()}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deal.scenarios.map((scenario) => (
                    <Button
                      key={scenario.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => loadScenarioFromHistory(scenario)}
                    >
                      {scenario.scenarioType.toUpperCase()} v{scenario.version}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
