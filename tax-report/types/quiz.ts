export interface QuizResponses {
  q1: string; // income_range
  q2: string; // state
  q3: string[]; // income_sources
  q4: string; // business_profit
  q5: string[]; // current_strategies
  q6: string; // filing_status
  q7: string; // owns_home
  q8: string; // real_estate_interest
  q9: string; // time_available
  q10: string; // risk_tolerance
  q11: string; // primary_goal
  q12?: string; // additional_context
}

export interface UserData {
  name: string;
  email: string;
  responses: QuizResponses;
}

export interface Question {
  id: string;
  question: string;
  type: 'select' | 'multiselect' | 'text';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface StateTaxRate {
  [state: string]: number;
}