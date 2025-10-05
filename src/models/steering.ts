/**
 * Steering document category enumeration
 */
export enum SteeringCategory {
  Strategy = 'strategy',
  Product = 'product',
  Technical = 'technical',
  Structure = 'structure',
  Custom = 'custom'
}

/**
 * Steering item interface for tree view
 */
export interface SteeringItem {
  label: string;
  resourceUri: string;
  category: SteeringCategory;
  frameworkId?: string;
  version?: string;
  isCustom: boolean;
  contextValue: string;
  isCategory?: boolean;
}
