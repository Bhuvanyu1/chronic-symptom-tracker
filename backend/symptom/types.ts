export interface User {
  id: string;
  name: string;
  conditions: string[];
  checkInTime: string;
  joinDate: string;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  date: string;
  timestamp: number;
  symptoms: {
    pain: number;
    mood: number;
    energy: number;
    sleep: number;
  };
  notes?: string;
  triggers: string[];
  completed: boolean;
}

export interface Pattern {
  type: 'correlation' | 'trend' | 'trigger';
  description: string;
  confidence: number;
  data: any;
}

export interface CreateUserRequest {
  name: string;
  conditions: string[];
  checkInTime: string;
}

export interface CreateEntryRequest {
  userId: string;
  date: string;
  symptoms: {
    pain: number;
    mood: number;
    energy: number;
    sleep: number;
  };
  notes?: string;
  triggers: string[];
}

export interface GetEntriesRequest {
  userId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface GetEntriesResponse {
  entries: SymptomEntry[];
}

export interface GetPatternsRequest {
  userId: string;
  days?: number;
}

export interface GetPatternsResponse {
  patterns: Pattern[];
}
