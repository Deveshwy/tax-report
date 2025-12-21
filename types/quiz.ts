export interface QuizResponses {
  q1: number; // EXACT income_amount
  q2: string; // state
  q3: string[]; // income_sources
  q4: string; // business_profit
  q4a?: number; // EXACT business net profit (conditional)
  q5: string[]; // current_strategies
  q6: string; // filing_status
  q7: string; // owns_home
  q8: string; // real_estate_interest
  q8a?: string; // rental_units_count (conditional)
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
  type: 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  condition?: {
    field: string;
    values: string[];
  };
}

export interface StateTaxRate {
  [state: string]: number;
}