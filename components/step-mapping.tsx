"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSendWizard } from "./send-wizard-context"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Edit2 } from "lucide-react"

export default function StepMapping() {
  const { state, setMapping, setStep, updateRowEdit, skipRow, unskipRow } = useSendWizard()
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({})

  const handleMapFieldChange = (
    fieldType: "name" | "email" | "certificateLink" | "customMessage",
    columnName: string,
  ) => {
    const value = columnName === "none" ? undefined : columnName
    setMapping({
      ...state.mapping,
      [fieldType]: value,
    })
  }

  const startEditRow = (rowIndex: number) => {
    const editedRow = state.rowEdits.get(rowIndex) || state.rows[rowIndex]
    setEditingRow(rowIndex)
    setEditValues({ ...editedRow })
  }

  const saveRowEdit = (rowIndex: number) => {
    updateRowEdit(rowIndex, editValues)
    setEditingRow(null)
  }

  const isMappingComplete = state.mapping.email !== undefined

  const activeRows = state.rows.map((_, idx) => !state.skippedRows.has(idx))
  const activeCount = activeRows.filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Map Your Fields</h2>
        <p className="text-muted-foreground">Connect your file columns to email fields</p>
      </div>

      {/* Mapping Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Field Mapping</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Email Field *</label>
            <Select value={state.mapping.email || ""} onValueChange={(val) => handleMapFieldChange("email", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select email column" />
              </SelectTrigger>
              <SelectContent>
                {state.headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Name Field (optional)</label>
            <Select value={state.mapping.name || "none"} onValueChange={(val) => handleMapFieldChange("name", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select name column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {state.headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Certificate Link Field (optional)</label>
            <Select
              value={state.mapping.certificateLink || "none"}
              onValueChange={(val) => handleMapFieldChange("certificateLink", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select certificate column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {state.headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Message Field (optional)</label>
            <Select
              value={state.mapping.customMessage || "none"}
              onValueChange={(val) => handleMapFieldChange("customMessage", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select message column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {state.headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Recipients Overview */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm">
          <strong>Total Recipients:</strong> {state.rows.length} • <strong>Active:</strong> {activeCount} •{" "}
          <strong>Skipped:</strong> {state.skippedRows.size}
        </p>
      </div>

      {/* Data Preview Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Skip</th>
              <th className="text-left py-2 px-3 font-semibold">Email</th>
              {state.mapping.name && <th className="text-left py-2 px-3 font-semibold">{state.mapping.name}</th>}
              {state.mapping.certificateLink && <th className="text-left py-2 px-3 font-semibold">Certificate</th>}
              <th className="text-left py-2 px-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, idx) => {
              const isSkipped = state.skippedRows.has(idx)
              const displayRow = state.rowEdits.get(idx) || row
              const isEditing = editingRow === idx

              return (
                <tr
                  key={idx}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${isSkipped ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-3">
                    <Checkbox
                      checked={isSkipped}
                      onCheckedChange={(checked) => (checked ? skipRow(idx) : unskipRow(idx))}
                    />
                  </td>
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <Input
                        value={editValues[state.mapping.email || "email"] || ""}
                        onChange={(e) =>
                          setEditValues({ ...editValues, [state.mapping.email || "email"]: e.target.value })
                        }
                        className="h-8"
                      />
                    ) : (
                      displayRow[state.mapping.email || "email"]
                    )}
                  </td>
                  {state.mapping.name && (
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <Input
                          value={editValues[state.mapping.name] || ""}
                          onChange={(e) => setEditValues({ ...editValues, [state.mapping.name]: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        displayRow[state.mapping.name]
                      )}
                    </td>
                  )}
                  {state.mapping.certificateLink && (
                    <td className="py-3 px-3 text-xs text-muted-foreground truncate">
                      {displayRow[state.mapping.certificateLink]}
                    </td>
                  )}
                  <td className="py-3 px-3 flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveRowEdit(idx)} className="text-primary text-xs font-medium">
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRow(null)}
                          className="text-muted-foreground text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEditRow(idx)} className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isMappingComplete && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600 font-medium">✓ Mapping Complete</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button
          onClick={() => setStep(5)}
          disabled={!isMappingComplete}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          Next: SMTP Config
        </Button>
      </div>
    </div>
  )
}
