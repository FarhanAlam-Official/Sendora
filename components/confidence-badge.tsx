import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"

interface ConfidenceBadgeProps {
  confidence: number
  needsReview?: boolean
  matchType?: "exact" | "pdf_contains" | "name_contains" | "fuzzy"
}

export function ConfidenceBadge({ confidence, needsReview, matchType }: ConfidenceBadgeProps) {
  const getConfidenceLevel = () => {
    if (confidence >= 90) return { label: "High", bgColor: "bg-green-500/10", borderColor: "border-green-500/30", textColor: "text-green-700", icon: CheckCircle2 }
    if (confidence >= 70) return { label: "Medium", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30", textColor: "text-yellow-700", icon: HelpCircle }
    return { label: "Low", bgColor: "bg-red-500/10", borderColor: "border-red-500/30", textColor: "text-red-700", icon: AlertCircle }
  }

  const level = getConfidenceLevel()
  const Icon = level.icon

  return (
    <Badge
      variant="outline"
      className={`${level.bgColor} ${level.borderColor} ${level.textColor} flex items-center gap-1.5 px-2 py-0.5`}
      title={`Confidence: ${confidence.toFixed(0)}% • Match type: ${matchType || "unknown"}${needsReview ? " • Needs review" : ""}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{level.label}</span>
      {needsReview && <AlertCircle className="w-3 h-3 text-red-600" />}
      <span className="text-xs opacity-75">({confidence.toFixed(0)}%)</span>
    </Badge>
  )
}
