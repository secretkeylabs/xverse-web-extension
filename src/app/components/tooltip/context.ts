import { createContext } from 'react';

export type TooltipContext = {
  targetDiv?: HTMLDivElement;
  initialised: boolean;
};

export const tooltipContext = createContext<TooltipContext>({ initialised: false });
