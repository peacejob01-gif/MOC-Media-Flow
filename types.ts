export type Pillar = 'Trust' | 'Update' | 'Policy';
export type Status = 'Backlog' | 'In Production' | 'Reviewing' | 'Approved' | 'Published';

export interface MediaItem {
  id: string;
  date: string;
  headline: string;
  rawContent: string;
  pillar: Pillar;
  priority: number; // 1-10
  suggestedMediaType: string[]; // Changed from string to string[]
  assignee: string;
  status: Status;
  liveLink?: string;
  feedback?: string;
  comments?: string[];
}

export interface AnalysisResult {
  headline: string;
  priority: number;
  pillar: Pillar;
  suggestedMediaType: string[];
  summary: string;
}