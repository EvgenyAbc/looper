import { useEffect } from 'react';

import { looperDebugPageReady } from '@looper/shared';
import { UIButton,UIContainer } from '@looper/shared';

/** Варианты кнопок для демонстрации */
const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

export default function UIKitDemo() {
  useEffect(() => {
    looperDebugPageReady('app4:ui-kit-demo');
  }, []);

  return (
    <div className="page" data-testid="app4-ui-kit-demo">
      <h1>UI Looper — Button</h1>
      <p className="subtitle">
        Компоненты из <code>@ui-looper/core</code>, загруженные через Module Federation runtime.
      </p>

      <UIContainer fallback={<p className="ui-looper-loading">Загрузка компонентов UI…</p>}>
        <section className="ui-kit-section">
          <h2>Variants</h2>
          <div className="ui-kit-row">
            {VARIANTS.map((v) => (
              <UIButton key={v} variant={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </UIButton>
            ))}
          </div>
        </section>

        <section className="ui-kit-section">
          <h2>Sizes</h2>
          <div className="ui-kit-row">
            {SIZES.map((s) => (
              <UIButton key={s} size={s} variant="primary">
                Size {s}
              </UIButton>
            ))}
          </div>
        </section>

        <section className="ui-kit-section">
          <h2>States</h2>
          <div className="ui-kit-row">
            <UIButton variant="primary" loading>
              Loading
            </UIButton>
            <UIButton variant="primary" disabled>
              Disabled
            </UIButton>
            <UIButton variant="primary" fullWidth>
              Full Width
            </UIButton>
          </div>
        </section>

        <section className="ui-kit-section">
          <h2>Interactive demo</h2>
          <div className="ui-kit-row">
            <UIButton
              variant="primary"
              onClick={() => alert('Button clicked!')}
            >
              Click me
            </UIButton>
            <UIButton
              variant="danger"
              onClick={() => alert('Deleted!')}
            >
              Delete
            </UIButton>
            <UIButton
              variant="secondary"
              onClick={() => alert('Cancelled')}
            >
              Cancel
            </UIButton>
          </div>
        </section>
      </UIContainer>
    </div>
  );
}
