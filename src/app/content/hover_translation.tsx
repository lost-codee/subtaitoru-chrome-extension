import { createRoot } from 'react-dom/client';
import { TranslationPopup } from '../../components/translation-popup';
import { createShadowContainer } from '../../utils/create-shadow-container';
import { TranslationFetcher } from '../../services/translation-fetcher';
import { tokenizeJapaneseText } from '../../utils/tokenize-japanese-text';

// State management
let currentTranslationPopup: { root: any; container: HTMLElement } | null = null;
let isEnabled = true;
let currentHoverElement: HTMLElement | null = null;
let hoverStyleSheet: HTMLStyleElement | null = null;

// Load settings
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings?.hoverTranslation) {
    isEnabled = result.settings.hoverTranslation.enabled;
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings?.newValue?.hoverTranslation) {
    isEnabled = changes.settings.newValue.hoverTranslation.enabled;
  }
});

// Add hover styles
const initializeHoverStyles = () => {
  hoverStyleSheet = document.createElement('style');
  hoverStyleSheet.textContent = `
    .japanese-token {
      display: inline-block;
      position: relative;
    }
    .hover-translate-highlight {
      background-color: rgba(0, 120, 255, 0.1) !important;
      cursor: pointer !important;
    }
    .hover-translate-highlight::after {
      content: '🔍';
      font-size: 12px;
      margin-left: 4px;
      opacity: 0.7;
    }
  `;
  document.head.appendChild(hoverStyleSheet);
};

// Wrap Japanese text in spans for better hover control
const wrapTextInSpans = (node: Text) => {
  const text = node.textContent || '';
  if (!text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) return;

  const tokens = tokenizeJapaneseText(text);
  const fragment = document.createDocumentFragment();
  let currentPosition = 0;

  tokens.forEach((token) => {
    const beforeText = text.slice(currentPosition, text.indexOf(token, currentPosition));
    if (beforeText) {
      fragment.appendChild(document.createTextNode(beforeText));
    }

    if (token.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
      const span = document.createElement('span');
      span.className = 'japanese-token';
      span.textContent = token;
      fragment.appendChild(span);
    } else {
      fragment.appendChild(document.createTextNode(token));
    }

    currentPosition = text.indexOf(token, currentPosition) + token.length;
  });

  const remainingText = text.slice(currentPosition);
  if (remainingText) {
    fragment.appendChild(document.createTextNode(remainingText));
  }

  node.parentNode?.replaceChild(fragment, node);
};

// Process text nodes in the document
const processTextNodes = (element: Node) => {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip nodes that are already processed or in script/style tags
        if (node.parentNode?.nodeName === 'SCRIPT' || 
            node.parentNode?.nodeName === 'STYLE' ||
            (node.parentNode as HTMLElement)?.className === 'japanese-token') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  textNodes.forEach(wrapTextInSpans);
};

// Show translation popup
const showTranslationPopup = async (word: string, x: number, y: number) => {
  // Remove existing popup if any
  if (currentTranslationPopup) {
    currentTranslationPopup.container.remove();
    currentTranslationPopup = null;
  }

  // Create container and shadow root
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.style.zIndex = '10001';
  container.style.pointerEvents = 'all';
  
  const shadow = createShadowContainer("hover-translation-popup");
  container.appendChild(shadow.host);
  
  const root = createRoot(shadow);

  try {
    const translation = await TranslationFetcher.fetchWordTranslation(word);
    if (translation) {
      // Render translation popup
      root.render(
        <TranslationPopup
          word={translation}
          isCached={false}
          onClose={() => {
            if (currentTranslationPopup) {
              currentTranslationPopup.container.remove();
              currentTranslationPopup = null;
            }
          }}
        />
      );

      // Store current popup
      currentTranslationPopup = { root, container };
      document.body.appendChild(container);
    }
  } catch (error) {
    console.error('Failed to fetch translation:', error);
  }
};

// Handle text hover
const handleTextHover = (e: MouseEvent) => {
  if (!isEnabled) return;
  
  const target = e.target as HTMLElement;
  if (!target || !target.classList?.contains('japanese-token')) {
    if (currentHoverElement) {
      currentHoverElement.classList.remove('hover-translate-highlight');
      currentHoverElement = null;
    }
    return;
  }

  // Remove highlight from previous element
  if (currentHoverElement && currentHoverElement !== target) {
    currentHoverElement.classList.remove('hover-translate-highlight');
  }

  // Add highlight to current element
  target.classList.add('hover-translate-highlight');
  currentHoverElement = target;
};

// Handle click for translation
const handleTextClick = async (e: MouseEvent) => {
  if (!isEnabled) return;

  const target = e.target as HTMLElement;
  if (!target || !target.classList?.contains('japanese-token')) return;

  const word = target.textContent;
  if (!word) return;

  // Show translation popup
  showTranslationPopup(word, e.clientX, e.clientY + 20);
};

// Remove highlight when mouse leaves
const handleMouseLeave = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target && target.classList && typeof target.classList.remove === 'function') {
    target.classList.remove('hover-translate-highlight');
    if (currentHoverElement === target) {
      currentHoverElement = null;
    }
  }
};

// Initialize hover translation
const init = async () => {
  // Initialize hover styles
  initializeHoverStyles();

  // Process existing text nodes
  processTextNodes(document.body);

  // Create an observer to process new text nodes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processTextNodes(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Add event listeners
  document.addEventListener('mousemove', handleTextHover);
  document.addEventListener('click', handleTextClick);
  document.addEventListener('mouseleave', handleMouseLeave, true);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}