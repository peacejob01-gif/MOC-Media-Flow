export type Pillar = 'Trust' | 'Update' | 'Policy';
export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export interface MediaItem {
  id: string;
  headline: string;
  rawContent: string;
  priority: number;
  pillar: Pillar;
  suggestedMediaType: string[];
  assignee: string;
  status: Status;
  date: string;
  summary?: string;
}

export interface AnalysisResult {
  headline: string;
  priority: number;
  pillar: string;
  suggestedMediaType: string[];
  summary: string;
}
