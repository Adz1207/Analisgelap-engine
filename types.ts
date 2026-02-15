export enum Sender {
  USER = 'USER',
  AI = 'AI',
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  isMultimedia?: boolean;
  aspectRatio?: string;
}

export interface AnalysisState {
  isLoading: boolean;
  loadingText?: string;
  messages: Message[];
  error: string | null;
}