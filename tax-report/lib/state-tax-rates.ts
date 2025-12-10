import { StateTaxRate } from "@/types/quiz";

export const stateTaxRates: StateTaxRate = {
  // No income tax states
  'Alaska': 0,
  'Florida': 0,
  'Nevada': 0,
  'New Hampshire': 0,
  'South Dakota': 0,
  'Tennessee': 0,
  'Texas': 0,
  'Washington': 0,
  'Wyoming': 0,

  // Low tax states (1-4%)
  'North Dakota': 2.9,
  'Pennsylvania': 3.07,
  'Indiana': 3.15,
  'Michigan': 4.25,
  'Colorado': 4.4,
  'Arizona': 2.5,
  'Utah': 4.85,
  'Illinois': 4.95,

  // Medium tax states (4-7%)
  'Ohio': 3.99,
  'Oklahoma': 4.75,
  'Georgia': 5.49,
  'Virginia': 5.75,
  'North Carolina': 4.75,
  'Massachusetts': 5.0,
  'Kentucky': 4.5,
  'Missouri': 4.95,
  'Louisiana': 4.25,
  'Iowa': 6.0,
  'Kansas': 5.7,
  'Arkansas': 4.9,
  'West Virginia': 6.5,
  'Nebraska': 6.84,
  'South Carolina': 6.5,

  // High tax states (8%+)
  'Oregon': 9.9,
  'Minnesota': 9.85,
  'New Jersey': 10.75,
  'Vermont': 8.75,
  'New York': 10.9,
  'California': 13.3,
  'Hawaii': 11.0,
  'Wisconsin': 7.65,
  'Maine': 7.15,
  'Rhode Island': 5.99,
  'Connecticut': 6.99,
  'Delaware': 6.6,
  'Maryland': 5.75,
  'District of Columbia': 10.75,
  'Idaho': 5.8,
  'Montana': 6.75,
  'New Mexico': 5.9,
  'Mississippi': 5.0,
  'Alabama': 5.0,

  // Default
  'Other': 5.0
};