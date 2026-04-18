export interface ProductOption {
    id: string;
    name: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    values: OptionValue[];
  }
  
  export interface OptionValue {
    id: string;
    value: string;
    colorValue?: string | null;
    optionId: string;
    createdAt: string; // ISO date string
  }