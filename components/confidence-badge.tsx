/**
 * @fileoverview Confidence Badge Component
 * 
 * This component displays a visual indicator of PDF matching confidence levels,
 * used in the certificate auto-matching feature. It provides users with immediate
 * feedback on match quality and indicates when manual review is needed.
 * 
 * **Key Features:**
 * - Color-coded confidence levels (High/Medium/Low)
 * - Icon indicators for quick visual recognition
 * - Percentage display for precise confidence values
 * - Manual review flag for low-confidence matches
 * - Tooltip with detailed match information
 * - Accessible design with semantic colors
 * 
 * **Confidence Levels:**
 * - High (≥90%): Green - Strong match, no review needed
 * - Medium (70-89%): Yellow - Good match, optional review
 * - Low (<70%): Red - Weak match, manual review recommended
 * 
 * **Match Types:**
 * - exact: Perfect filename match
 * - pdf_contains: PDF filename contains recipient name
 * - name_contains: Recipient name contains PDF filename
 * - fuzzy: Similarity-based match (typo tolerance)
 * 
 * **Visual Indicators:**
 * - CheckCircle2: High confidence matches
 * - HelpCircle: Medium confidence matches
 * - AlertCircle: Low confidence or needs review
 * 
 * **Use Cases:**
 * - PDF auto-matching result display
 * - Manual review workflow prioritization
 * - Match quality visualization
 * - User confidence building
 * 
 * @module components/confidence-badge
 * @requires @/components/ui/badge - Badge UI component
 * @requires lucide-react - Icon components
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"

/**
 * Confidence Badge Props Interface
 * 
 * Defines the properties for the ConfidenceBadge component.
 * 
 * @interface ConfidenceBadgeProps
 * @property {number} confidence - Match confidence percentage (0-100)
 * @property {boolean} [needsReview] - Whether match requires manual review
 * @property {("exact" | "pdf_contains" | "name_contains" | "fuzzy")} [matchType] - Type of match algorithm used
 */
interface ConfidenceBadgeProps {
  confidence: number
  needsReview?: boolean
  matchType?: "exact" | "pdf_contains" | "name_contains" | "fuzzy"
}

/**
 * Confidence Badge Component
 * 
 * Displays a color-coded badge indicating the confidence level of a PDF match
 * with a recipient name. Provides visual feedback on match quality and alerts
 * users when manual review is recommended.
 * 
 * **Confidence Level Determination:**
 * - High (≥90%): Strong match with high certainty
 * - Medium (70-89%): Acceptable match with moderate certainty
 * - Low (<70%): Weak match requiring verification
 * 
 * **Visual Design:**
 * - Background: Semi-transparent colored background
 * - Border: Matching colored border
 * - Text: Darker shade for readability
 * - Icons: Visual indicators for each level
 * - Badge: Compact inline display
 * 
 * **Tooltip Information:**
 * Shows detailed match data on hover:
 * - Exact confidence percentage
 * - Match algorithm type
 * - Review requirement status
 * 
 * @component
 * @param {ConfidenceBadgeProps} props - Component properties
 * @returns {JSX.Element} Rendered confidence badge
 * 
 * @example
 * // High confidence exact match
 * <ConfidenceBadge 
 *   confidence={100} 
 *   matchType="exact" 
 *   needsReview={false}
 * />
 * 
 * @example
 * // Medium confidence fuzzy match
 * <ConfidenceBadge 
 *   confidence={78} 
 *   matchType="fuzzy" 
 *   needsReview={false}
 * />
 * 
 * @example
 * // Low confidence match requiring review
 * <ConfidenceBadge 
 *   confidence={65} 
 *   matchType="pdf_contains" 
 *   needsReview={true}
 * />
 * 
 * @example
 * // Usage in match results table
 * {matches.map((match) => (
 *   <tr key={match.id}>
 *     <td>{match.recipientName}</td>
 *     <td>{match.pdfName}</td>
 *     <td>
 *       <ConfidenceBadge
 *         confidence={match.confidence}
 *         matchType={match.matchType}
 *         needsReview={match.needsReview}
 *       />
 *     </td>
 *   </tr>
 * ))}
 */
export function ConfidenceBadge({ confidence, needsReview, matchType }: ConfidenceBadgeProps) {
  /**
   * Determines confidence level styling and icon
   * 
   * Maps confidence percentage to visual representation with appropriate
   * colors, icons, and labels.
   * 
   * @returns {Object} Confidence level configuration
   * @property {string} label - Display label ("High", "Medium", "Low")
   * @property {string} bgColor - Background color class
   * @property {string} borderColor - Border color class
   * @property {string} textColor - Text color class
   * @property {LucideIcon} icon - Icon component to display
   */
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
