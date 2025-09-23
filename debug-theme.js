// Theme Toggle Debug Script
// Paste this into the browser console at http://localhost:3001

console.log('=== Theme Debug Script Starting ===');

// Check HTML element
const htmlElement = document.documentElement;
console.log('HTML element class:', htmlElement.className);
console.log('HTML element style attribute:', htmlElement.getAttribute('style'));
console.log('HTML data-theme attribute:', htmlElement.getAttribute('data-theme'));

// Check localStorage
const storageKeys = Object.keys(localStorage).filter(key => key.includes('theme'));
console.log('Theme-related localStorage keys:', storageKeys);
storageKeys.forEach(key => {
  console.log(`  ${key}:`, localStorage.getItem(key));
});

// Test manual theme application
console.log('\n=== Testing Manual Theme Application ===');
console.log('Adding class="dark" to HTML element...');
htmlElement.className = 'dark';

setTimeout(() => {
  const testElement = document.querySelector('body');
  const styles = window.getComputedStyle(testElement);
  console.log('Body background after adding dark class:', styles.backgroundColor);
  console.log('Body color after adding dark class:', styles.color);

  // Check if CSS variables updated
  const rootStyles = window.getComputedStyle(document.documentElement);
  console.log('--background CSS variable:', rootStyles.getPropertyValue('--background'));
  console.log('--foreground CSS variable:', rootStyles.getPropertyValue('--foreground'));
}, 100);

// Monitor theme toggle clicks
console.log('\n=== Monitoring Theme Toggle Clicks ===');
console.log('Click the theme toggle button and watch for console output...');

// Try to find and click theme toggle programmatically
setTimeout(() => {
  const themeButton = document.querySelector('[aria-label*="theme"]');
  if (themeButton) {
    console.log('Found theme toggle button:', themeButton);
    console.log('Button element:', themeButton.outerHTML);
  } else {
    console.log('Could not find theme toggle button');
  }
}, 1000);

// Monitor class changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      console.log('[MutationObserver] HTML class changed to:', htmlElement.className);
    }
  });
});

observer.observe(htmlElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
console.log('MutationObserver attached to monitor HTML element changes');

console.log('=== Debug Script Ready ===');
console.log('Now click the theme toggle button and watch the console output');