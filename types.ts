export interface PopulationFact {
  fact: string;
  source: string;
}

export interface CountryData {
  rank: number;
  country: string;
  population: string;
  growthRate: string;
}

export interface CityData {
  rank: number;
  city: string;
  country: string;
  population: string;
  description: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}