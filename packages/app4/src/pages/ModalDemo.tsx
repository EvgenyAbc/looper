import { useEffect, useState } from 'react';

import { looperDebugPageReady } from '@looper/shared';
import {
  UIButton,
  UICard,
  UICardBody,
  UICardHeader,
  UIContainer,
  UIHeading,
  UIModal,
  UIText,
} from '@looper/shared';

export default function ModalDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    looperDebugPageReady('app4:modal');
  }, []);

  return (
    <div className="page" data-testid="app4-modal">
      <UIHeading as="h1">Modal</UIHeading>
      <UIText variant="caption" color="secondary">
        Диалог из @ui-looper/core через типизированную обёртку UIModal.
      </UIText>

      <UIContainer>
        <UICard variant="outlined" style={{ marginTop: 24, maxWidth: 480 }}>
          <UICardHeader>
            <UIHeading as="h3" size="h4">Dialog demo</UIHeading>
          </UICardHeader>
          <UICardBody>
            <UIText variant="body">
              Нажмите кнопку, чтобы открыть модальное окно. Закрытие — по крестику, маске или ESC.
            </UIText>
            <div style={{ marginTop: 16 }}>
              <UIButton variant="primary" onClick={() => setOpen(true)}>
                Open modal
              </UIButton>
            </div>
          </UICardBody>
        </UICard>

        <UIModal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
          size="md"
          maskClosable
          footer={
            <>
              <UIButton variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </UIButton>
              <UIButton variant="primary" onClick={() => setOpen(false)}>
                Confirm
              </UIButton>
            </>
          }
        >
          <UIText>
            This modal is loaded from <code>ui_looper/Modal</code> at runtime via Module Federation.
          </UIText>
        </UIModal>
      </UIContainer>
    </div>
  );
}
