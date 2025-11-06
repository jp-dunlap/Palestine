'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type AnnouncementTone = 'info' | 'success' | 'error';

type Announcement = {
  id: number;
  message: string;
  tone: AnnouncementTone;
};

type AnnounceOptions = {
  message: string;
  tone?: AnnouncementTone;
};

type AnnouncerContextValue = {
  announce: (options: AnnounceOptions) => void;
};

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

const toneClasses: Record<AnnouncementTone, string> = {
  info: 'bg-gray-900 text-white',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
};

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Announcement[]>([]);
  const [liveMessage, setLiveMessage] = useState('');
  const counterRef = useRef(0);

  const announce = useCallback(({ message, tone = 'info' }: AnnounceOptions) => {
    if (!message) return;
    counterRef.current += 1;
    const id = counterRef.current;
    const announcement: Announcement = { id, message, tone };

    setLiveMessage(message);
    setToasts((current) => [...current, announcement]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const contextValue = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </div>
      <div
        aria-hidden="true"
        className="fixed bottom-4 right-4 flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded px-3 py-2 text-sm shadow-lg ${toneClasses[toast.tone]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer() {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  return ctx;
}
