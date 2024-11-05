import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { tooltipContext, type TooltipContext } from './context';

const TooltipContainer = styled.div(() => ({
  width: 0,
  height: 0,
  overflow: 'hidden',
}));

type Props = {
  children: React.ReactNode;
};

export default function TooltipProvider({ children }: Props) {
  const tooltipParentRef = useRef<HTMLDivElement | null>(null);
  const [contextValue, setContextValue] = useState<TooltipContext>({ initialised: false });

  useEffect(() => {
    setContextValue({ initialised: true, targetDiv: tooltipParentRef.current ?? undefined });
  }, []);

  return (
    <tooltipContext.Provider value={contextValue}>
      {children}
      <TooltipContainer ref={tooltipParentRef} />
    </tooltipContext.Provider>
  );
}
