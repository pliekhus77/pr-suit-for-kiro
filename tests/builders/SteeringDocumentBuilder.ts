import { SteeringItem, SteeringCategory } from '../../src/models/steering';

/**
 * Builder for creating test SteeringItem objects with fluent API
 */
export class SteeringDocumentBuilder {
  private steeringItem: SteeringItem;

  constructor() {
    // Default steering item with sensible test values
    this.steeringItem = {
      label: 'test-steering.md',
      resourceUri: '/workspace/.kiro/steering/test-steering.md',
      category: SteeringCategory.Custom,
      isCustom: true,
      contextValue: 'steeringDocument',
      isCategory: false
    };
  }

  /**
   * Set the label
   */
  withLabel(label: string): SteeringDocumentBuilder {
    this.steeringItem.label = label;
    return this;
  }

  /**
   * Set the resource URI
   */
  withResourceUri(resourceUri: string): SteeringDocumentBuilder {
    this.steeringItem.resourceUri = resourceUri;
    return this;
  }

  /**
   * Set the category
   */
  withCategory(category: SteeringCategory): SteeringDocumentBuilder {
    this.steeringItem.category = category;
    return this;
  }

  /**
   * Set the framework ID
   */
  withFrameworkId(frameworkId: string): SteeringDocumentBuilder {
    this.steeringItem.frameworkId = frameworkId;
    return this;
  }

  /**
   * Set the version
   */
  withVersion(version: string): SteeringDocumentBuilder {
    this.steeringItem.version = version;
    return this;
  }

  /**
   * Set whether this is a custom document
   */
  asCustom(isCustom: boolean = true): SteeringDocumentBuilder {
    this.steeringItem.isCustom = isCustom;
    return this;
  }

  /**
   * Set the context value
   */
  withContextValue(contextValue: string): SteeringDocumentBuilder {
    this.steeringItem.contextValue = contextValue;
    return this;
  }

  /**
   * Set whether this is a category node
   */
  asCategory(isCategory: boolean = true): SteeringDocumentBuilder {
    this.steeringItem.isCategory = isCategory;
    return this;
  }

  /**
   * Create a strategy steering document
   */
  asStrategyDocument(): SteeringDocumentBuilder {
    this.steeringItem.category = SteeringCategory.Strategy;
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a product steering document
   */
  asProductDocument(): SteeringDocumentBuilder {
    this.steeringItem.label = 'product.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/product.md';
    this.steeringItem.category = SteeringCategory.Product;
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a technical steering document
   */
  asTechnicalDocument(): SteeringDocumentBuilder {
    this.steeringItem.label = 'tech.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/tech.md';
    this.steeringItem.category = SteeringCategory.Technical;
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a structure steering document
   */
  asStructureDocument(): SteeringDocumentBuilder {
    this.steeringItem.label = 'structure.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/structure.md';
    this.steeringItem.category = SteeringCategory.Structure;
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a TDD/BDD strategy document
   */
  asTddBddStrategy(): SteeringDocumentBuilder {
    this.steeringItem.label = 'strategy-tdd-bdd.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/strategy-tdd-bdd.md';
    this.steeringItem.category = SteeringCategory.Strategy;
    this.steeringItem.frameworkId = 'tdd-bdd-strategy';
    this.steeringItem.version = '1.0.0';
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a security strategy document
   */
  asSecurityStrategy(): SteeringDocumentBuilder {
    this.steeringItem.label = 'strategy-security.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/strategy-security.md';
    this.steeringItem.category = SteeringCategory.Strategy;
    this.steeringItem.frameworkId = 'security-strategy';
    this.steeringItem.version = '1.0.0';
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a C4 model strategy document
   */
  asC4ModelStrategy(): SteeringDocumentBuilder {
    this.steeringItem.label = 'strategy-c4-model.md';
    this.steeringItem.resourceUri = '/workspace/.kiro/steering/strategy-c4-model.md';
    this.steeringItem.category = SteeringCategory.Strategy;
    this.steeringItem.frameworkId = 'c4-model-strategy';
    this.steeringItem.version = '1.0.0';
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringDocument';
    return this;
  }

  /**
   * Create a category node
   */
  asCategoryNode(categoryName: string, category: SteeringCategory): SteeringDocumentBuilder {
    this.steeringItem.label = categoryName;
    this.steeringItem.resourceUri = '';
    this.steeringItem.category = category;
    this.steeringItem.isCustom = false;
    this.steeringItem.contextValue = 'steeringCategory';
    this.steeringItem.isCategory = true;
    return this;
  }

  /**
   * Build and return the steering item object
   */
  build(): SteeringItem {
    return { ...this.steeringItem };
  }

  /**
   * Create a new builder instance (static factory method)
   */
  static create(): SteeringDocumentBuilder {
    return new SteeringDocumentBuilder();
  }
}
