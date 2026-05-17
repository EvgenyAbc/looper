import { Suspense } from 'react';

import {
  type AppMenuItem,
  appMfContainerName,
  useAppConfig,
} from '@looper/shared';

import { RemoteLoadingFallback } from './RemoteLoadingFallback';
import { RemotePage } from './RemotePage';

interface WidgetSlotProps {
  slot: string;
}

function WidgetMount({ item }: { item: AppMenuItem }) {
  const container = appMfContainerName(item);

  return (
    <Suspense fallback={<RemoteLoadingFallback variant="widget" label={item.name} />}>
      <RemotePage remoteName={container} modulePath={item.module ?? './App'} />
    </Suspense>
  );
}

/**
 * Host shell region: renders MF widgets registered in menu config (`displayMode: widget`, matching `widgetSlot`).
 */
export function WidgetSlot({ slot }: WidgetSlotProps) {
  const { apps } = useAppConfig();
  const items = apps.filter(
    (a) => a.displayMode === 'widget' && a.widgetSlot === slot,
  );

  if (items.length === 0) return null;

  return (
    <section className="widget-slot" aria-label={`Embedded widgets: ${slot}`}>
      <h2 className="widget-slot__heading">Widgets</h2>
      <div className="widget-slot__grid">
        {items.map((item) => (
          <div key={item.id} className="widget-slot__card">
            <WidgetMount item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
