import { useCallback, useState } from 'react';
import { UiButton } from './ui-button';
import type { ButtonPressed } from './ui-button.types';

/**
 * React host wiring. This is what a React page would do after loading the
 * button-element script: render `<ui-button>` through a wrapper that sets
 * properties and listens for the `pressed` CustomEvent.
 */
export function App() {
  const [label, setLabel] = useState('Save draft');
  const [disabled, setDisabled] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handlePressed = useCallback((detail: ButtonPressed) => {
    setLog((lines) => [`pressed → ${JSON.stringify(detail)}`, ...lines]);
  }, []);

  return (
    <main className="demo">
      <p className="demo__kicker">React host → web component</p>
      <h1>
        Use <code>&lt;ui-button&gt;</code> from React
      </h1>
      <p className="demo__lede">
        The widget is still the Angular Elements custom element from{' '}
        <code>@angular-nx-repo/ui/button</code>. This page loads that drop-in
        bundle, then a React wrapper assigns <code>label</code> and{' '}
        <code>disabled</code> and subscribes to <code>pressed</code>.
      </p>

      <section className="demo__panel">
        <label className="demo__field">
          Label input
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <label className="demo__field demo__field--inline">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(event) => setDisabled(event.target.checked)}
          />
          Disabled
        </label>
        <UiButton label={label} disabled={disabled} onPressed={handlePressed} />
      </section>

      <section className="demo__log-panel">
        <h2>Output log</h2>
        <p className="demo__hint">
          Clicks dispatch a bubbling <code>pressed</code> CustomEvent. The event
          detail is the current label payload.
        </p>
        <div className="demo__log">
          {log.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
