import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';


const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "var(--primary_blue_color) !important",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "var(--primary_blue_color) !important",
  },
}));
export default BootstrapTooltip;
