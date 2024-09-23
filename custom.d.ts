// custom.d.ts
interface CSSStyleSheet {
  replaceSync(cssText: string): void; // Adding replaceSync to CSSStyleSheet
}

interface ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[]; // Adding adoptedStyleSheets to ShadowRoot
}
