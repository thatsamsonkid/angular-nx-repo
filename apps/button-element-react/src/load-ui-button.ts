/**
 * Loads the drop-in button-element browser bundle, which calls
 * `defineUiButton()` and registers `<ui-button>`.
 *
 * A React (or any non-Angular) host would typically do this with a script
 * tag. Registration is awaited before the first render so property writes
 * are not lost during upgrade.
 */
export async function loadUiButton(): Promise<void> {
  if (customElements.get('ui-button')) {
    return;
  }

  const src = '/button-element/main.js';
  if (!document.querySelector(`script[src="${src}"]`)) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  await customElements.whenDefined('ui-button');
}
