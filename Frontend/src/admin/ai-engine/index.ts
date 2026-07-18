// AI & Intelligence — Phase 17J
// AI Assistant, natural language search, anomaly detection, forecasting, recommendations, summaries, copilot

export { AIBase } from "./shared/ai-base"
export type { AIContext, AIAction } from "./shared/ai-base"

export { AIAssistant } from "./assistant/AIAssistant"
export type { ChatMessage, AIAssistantResponse } from "./assistant/AIAssistant"

export { NaturalLanguageSearch } from "./search/NaturalLanguageSearch"
export type { SearchResult, NLSearchQuery } from "./search/NaturalLanguageSearch"

export { AnomalyDetector } from "./anomaly/AnomalyDetector"
export type { AnomalyResult } from "./anomaly/AnomalyDetector"

export { ForecastEngine } from "./forecast/ForecastEngine"
export type { ForecastResult, ForecastPoint } from "./forecast/ForecastEngine"

export { RecommendationEngine } from "./recommendations/RecommendationEngine"
export type { Recommendation } from "./recommendations/RecommendationEngine"

export { ReportSummarizer } from "./summaries/ReportSummarizer"
export type { ReportSummary } from "./summaries/ReportSummarizer"

export { ContextCopilot } from "./copilot/ContextCopilot"
export type { CopilotSuggestion } from "./copilot/ContextCopilot"
