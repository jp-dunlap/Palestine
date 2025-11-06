'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';

export type A11yAnnouncerHandle = {
  announce: (message: string) => void;
};

export type A11yAnnouncerProps = HTMLAttributes<HTMLDivElement>;

const A11yAnnouncer = forwardRef<A11yAnnouncerHandle, A11yAnnouncerProps>(
  ({ className = 'sr-only', ...rest }, ref) => {
    const [message, setMessage] = useState('');
    const messageRef = useRef(message);

    useImperativeHandle(
      ref,
      () => ({
        announce(nextMessage: string) {
          messageRef.current = nextMessage;
          queueMicrotask(() => {
            setMessage('');
            queueMicrotask(() => {
              setMessage(messageRef.current);
            });
          });
        },
      }),
      []
    );

    return (
      <div
        {...rest}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={className}
      >
        {message}
      </div>
    );
  }
);

A11yAnnouncer.displayName = 'A11yAnnouncer';

export default A11yAnnouncer;
