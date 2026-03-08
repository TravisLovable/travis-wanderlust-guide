/**
 * Tests for who-water-safety schema-agnostic parsing.
 *
 * Run with:
 *   deno test --allow-net supabase/functions/who-water-safety/index.test.ts
 */

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"

// ── Re-implement the exported helpers here for isolated testing ──
// (Edge function uses `serve()` which auto-starts; importing it would start the server.
//  So we duplicate the pure functions. Keep in sync with index.ts.)

function detectLocationField(row: Record<string, any>): string | null {
  if (row.SpatialDim !== undefined) return 'SpatialDim'
  if (row.LocationCode !== undefined) return 'LocationCode'
  if (row.Location !== undefined && typeof row.Location === 'string' && /^[A-Z]{3}$/.test(row.Location)) {
    return 'Location'
  }
  return null
}

function detectYearField(row: Record<string, any>): string | null {
  if (row.TimeDim !== undefined) return 'TimeDim'
  if (row.Year !== undefined) return 'Year'
  if (row.Period !== undefined) return 'Period'
  return null
}

function extractValue(row: Record<string, any>): number | null {
  if (row.NumericValue != null) {
    const n = Number(row.NumericValue)
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  if (row.Value != null) {
    const n = parseFloat(String(row.Value))
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  if (row.DisplayValue != null) {
    const n = parseFloat(String(row.DisplayValue))
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  return null
}

function hasTotal(row: Record<string, any>): boolean {
  const keys = Object.keys(row)
  for (const k of keys) {
    if (k.toLowerCase().includes('residence') || k.toLowerCase().includes('area')) {
      const v = String(row[k] ?? '').toLowerCase()
      if (v.includes('totl') || v === 'total') return true
    }
  }
  for (let i = 1; i <= 8; i++) {
    const v = row[`Dim${i}`]
    if (v != null) {
      const s = String(v).toLowerCase()
      if (s.includes('totl') || s === 'total') return true
    }
  }
  return false
}

function selectRow(
  rows: any[],
  iso3: string
): { chosen: any | null; year: number | null; locationField: string | null; yearField: string | null } {
  if (rows.length === 0) return { chosen: null, year: null, locationField: null, yearField: null }
  const sample = rows[0]
  const locationField = detectLocationField(sample)
  const yearField = detectYearField(sample)
  if (!locationField) return { chosen: null, year: null, locationField: null, yearField: null }

  const isoUpper = iso3.toUpperCase()
  const countryRows = rows.filter((r: any) => String(r[locationField]).toUpperCase() === isoUpper)
  if (countryRows.length === 0) return { chosen: null, year: null, locationField, yearField }

  let latestYear = 0
  if (yearField) {
    for (const r of countryRows) {
      const y = parseInt(String(r[yearField]), 10)
      if (!isNaN(y) && y > latestYear) latestYear = y
    }
  }
  const latestRows = yearField
    ? countryRows.filter((r: any) => parseInt(String(r[yearField]), 10) === latestYear)
    : countryRows

  let chosen = latestRows.find((r: any) => hasTotal(r))
  if (!chosen) chosen = latestRows[0]

  return { chosen, year: latestYear || null, locationField, yearField }
}

// ── Tests ──

Deno.test("SpatialDim: picks latest year and Total", () => {
  const rows = [
    { SpatialDim: "PER", TimeDim: "2022", Dim1: "RESIDENCEAREATYPE_URB", NumericValue: 72.5 },
    { SpatialDim: "PER", TimeDim: "2022", Dim1: "RESIDENCEAREATYPE_RUR", NumericValue: 28.3 },
    { SpatialDim: "PER", TimeDim: "2022", Dim1: "RESIDENCEAREATYPE_TOTL", NumericValue: 51.2 },
    { SpatialDim: "PER", TimeDim: "2021", Dim1: "RESIDENCEAREATYPE_TOTL", NumericValue: 49.8 },
  ]

  const { chosen, year, locationField } = selectRow(rows, "PER")
  assertEquals(locationField, "SpatialDim")
  assertEquals(year, 2022)
  assertEquals(chosen.Dim1, "RESIDENCEAREATYPE_TOTL")
  assertEquals(chosen.NumericValue, 51.2)
})

Deno.test("LocationCode: ZAF returns year=2024 value=68", () => {
  // Schema where SpatialDim is absent but LocationCode exists
  const rows = [
    { LocationCode: "ZAF", Year: "2023", ResidenceAreaType: "Urban", NumericValue: 82.1 },
    { LocationCode: "ZAF", Year: "2023", ResidenceAreaType: "Rural", NumericValue: 41.5 },
    { LocationCode: "ZAF", Year: "2023", ResidenceAreaType: "Total", NumericValue: 65.0 },
    { LocationCode: "ZAF", Year: "2024", ResidenceAreaType: "Urban", NumericValue: 84.3 },
    { LocationCode: "ZAF", Year: "2024", ResidenceAreaType: "Rural", NumericValue: 43.0 },
    { LocationCode: "ZAF", Year: "2024", ResidenceAreaType: "Total", NumericValue: 68.0 },
    { LocationCode: "GBR", Year: "2024", ResidenceAreaType: "Total", NumericValue: 99.0 },
  ]

  const { chosen, year, locationField, yearField } = selectRow(rows, "ZAF")
  assertEquals(locationField, "LocationCode")
  assertEquals(yearField, "Year")
  assertEquals(year, 2024)
  assertEquals(chosen.ResidenceAreaType, "Total")
  assertEquals(extractValue(chosen), 68.0)
})

Deno.test("Location field: only used if value looks like ISO3", () => {
  // Location with full country name should NOT be used
  const rowName = { Location: "South Africa", Period: "2024", NumericValue: 68.0 }
  assertEquals(detectLocationField(rowName), null)

  // Location with ISO3 code should be used
  const rowIso = { Location: "ZAF", Period: "2024", NumericValue: 68.0 }
  assertEquals(detectLocationField(rowIso), "Location")
})

Deno.test("falls back to first row when Total not present", () => {
  const rows = [
    { SpatialDim: "XYZ", TimeDim: "2023", Dim1: "RESIDENCEAREATYPE_URB", NumericValue: 88.0 },
    { SpatialDim: "XYZ", TimeDim: "2023", Dim1: "RESIDENCEAREATYPE_RUR", NumericValue: 45.0 },
  ]

  const { chosen, year } = selectRow(rows, "XYZ")
  assertEquals(year, 2023)
  assertEquals(chosen.NumericValue, 88.0)
})

Deno.test("value extraction: NumericValue > Value > DisplayValue", () => {
  assertEquals(extractValue({ NumericValue: 49.428 }), 49.43)
  assertEquals(extractValue({ Value: "72" }), 72)
  assertEquals(extractValue({ DisplayValue: "55.5" }), 55.5)
  assertEquals(extractValue({ Value: "not-a-number" }), null)
  assertEquals(extractValue({}), null)
})

Deno.test("year field detection: TimeDim > Year > Period", () => {
  assertEquals(detectYearField({ TimeDim: "2024", Year: "2023" }), "TimeDim")
  assertEquals(detectYearField({ Year: "2024" }), "Year")
  assertEquals(detectYearField({ Period: "2024" }), "Period")
  assertEquals(detectYearField({ Foo: "bar" }), null)
})

Deno.test("hasTotal detects across Dim fields and ResidenceAreaType", () => {
  assertEquals(hasTotal({ Dim1: "RESIDENCEAREATYPE_TOTL" }), true)
  assertEquals(hasTotal({ Dim3: "Total" }), true)
  assertEquals(hasTotal({ ResidenceAreaType: "Total" }), true)
  assertEquals(hasTotal({ Dim1: "RESIDENCEAREATYPE_URB" }), false)
  assertEquals(hasTotal({}), false)
})

Deno.test("ISO3 validation regex", () => {
  const iso3Regex = /^[A-Z]{3}$/
  assertEquals(iso3Regex.test("PER"), true)
  assertEquals(iso3Regex.test("ZAF"), true)
  assertEquals(iso3Regex.test("per"), false)
  assertEquals(iso3Regex.test("US"), false)
  assertEquals(iso3Regex.test("PERU"), false)
  assertEquals(iso3Regex.test("P3R"), false)
  assertEquals(iso3Regex.test(""), false)
})

Deno.test("no matching country returns null", () => {
  const rows = [
    { SpatialDim: "PER", TimeDim: "2024", NumericValue: 49.0 },
  ]
  const { chosen, year } = selectRow(rows, "ZAF")
  assertEquals(chosen, null)
  assertEquals(year, null)
})
