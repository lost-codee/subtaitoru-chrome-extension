// Styles
import shadowStyles from "../generated-shadow-styles.css";

/**
 * Creates a container with Shadow DOM to isolate styles.
 */
export const createShadowContainer = (id: string): ShadowRoot => {
  const container = document.createElement("div");
  container.id = id;
  const shadowRoot = container.attachShadow({ mode: "closed" });
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(shadowStyles);
  shadowRoot.adoptedStyleSheets = [stylesheet];
  return shadowRoot;
};
