/**
 * Cucumber World
 * 
 * The World is an isolated context for each scenario.
 * It provides access to VS Code extension testing utilities and Playwright browser.
 */

import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import * as vscode from 'vscode';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface ExtensionTestContext {
  extensionDevelopmentPath: string;
  extensionTestsPath: string;
  headless: boolean;
  slowMo: number;
  timeout: number;
}

/**
 * Custom World class for VS Code extension BDD tests
 */
export class ExtensionWorld extends World {
  // VS Code context
  public context?: vscode.ExtensionContext;
  public extension?: vscode.Extension<unknown>;
  
  // Playwright browser automation (for webviews)
  public browser?: Browser;
  public browserContext?: BrowserContext;
  public page?: Page;
  
  // Test configuration
  public config: ExtensionTestContext;
  
  // Test data storage
  public testData: Map<string, unknown>;
  
  constructor(options: IWorldOptions) {
    super(options);
    
    // Load configuration from world parameters
    this.config = {
      extensionDevelopmentPath: options.parameters.extensionDevelopmentPath || process.cwd(),
      extensionTestsPath: options.parameters.extensionTestsPath || './tests/bdd',
      headless: options.parameters.headless !== false,
      slowMo: options.parameters.slowMo || 0,
      timeout: options.parameters.timeout || 30000
    };
    
    this.testData = new Map();
  }
  
  /**
   * Initialize Playwright browser for webview testing
   */
  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo
      });
      
      this.browserContext = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      this.page = await this.browserContext.newPage();
      this.page.setDefaultTimeout(this.config.timeout);
    }
  }
  
  /**
   * Close Playwright browser
   */
  async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = undefined;
    }
    
    if (this.browserContext) {
      await this.browserContext.close();
      this.browserContext = undefined;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
  
  /**
   * Get VS Code extension instance
   */
  getExtension(): vscode.Extension<unknown> {
    if (!this.extension) {
      this.extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
      if (!this.extension) {
        throw new Error('Extension not found. Make sure it is installed and activated.');
      }
    }
    return this.extension;
  }
  
  /**
   * Activate the extension if not already active
   */
  async activateExtension(): Promise<void> {
    const ext = this.getExtension();
    if (!ext.isActive) {
      await ext.activate();
    }
  }
  
  /**
   * Store test data for use across steps
   */
  setData(key: string, value: unknown): void {
    this.testData.set(key, value);
  }
  
  /**
   * Retrieve test data
   */
  getData<T>(key: string): T | undefined {
    return this.testData.get(key) as T | undefined;
  }
  
  /**
   * Clear all test data
   */
  clearData(): void {
    this.testData.clear();
  }
}

// Set the custom World constructor
setWorldConstructor(ExtensionWorld);
