import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const MobileHeaderContext = createContext({
  title: '',
  actionLabel: '',
  handleActionClick: () => {},
  setHeader: () => {},
  setActionClick: () => {},
});

export const MobileHeaderProvider = ({ children }) => {
  const [headerState, setHeaderState] = useState({ title: '', actionLabel: '' });
  const actionClickRef = useRef(null);

  const handleActionClick = useCallback((e) => {
    if (actionClickRef.current) {
      actionClickRef.current(e);
    }
  }, []);

  const setHeader = useCallback((config) => {
    if (!config) {
      actionClickRef.current = null;
      setHeaderState((prev) => {
        if (!prev.title && !prev.actionLabel) return prev;
        return { title: '', actionLabel: '' };
      });
      return;
    }

    actionClickRef.current = config.action?.onClick || null;

    const nextTitle = config.title || '';
    const nextLabel = config.action?.label || '';

    setHeaderState((prev) => {
      if (prev.title === nextTitle && prev.actionLabel === nextLabel) {
        return prev;
      }
      return { title: nextTitle, actionLabel: nextLabel };
    });
  }, []);

  const setActionClick = useCallback((onClick) => {
    actionClickRef.current = onClick || null;
  }, []);

  return (
    <MobileHeaderContext.Provider
      value={{
        title: headerState.title,
        actionLabel: headerState.actionLabel,
        handleActionClick,
        setHeader,
        setActionClick,
      }}
    >
      {children}
    </MobileHeaderContext.Provider>
  );
};

export const useMobileHeader = (config) => {
  const { setHeader, setActionClick } = useContext(MobileHeaderContext);
  const title = config?.title || '';
  const actionLabel = config?.action?.label || '';

  // Synchronize click callback to ref without triggering state re-renders
  useEffect(() => {
    setActionClick(config?.action?.onClick);
  });

  // Only update header title/label if they actually change
  useEffect(() => {
    setHeader(config);
    return () => {
      setHeader(null);
    };
  }, [title, actionLabel, setHeader]);
};

export default MobileHeaderContext;
