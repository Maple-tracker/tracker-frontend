"use client";

import type React from "react";
import {
  ResponsiveContainer as RechartsResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
} from "recharts";

export const Chart = () => {
  return null;
};

export const Line = RechartsLine;
export const LineChart = RechartsLineChart;
export const XAxis = RechartsXAxis;
export const YAxis = RechartsYAxis;
export const CartesianGrid = RechartsCartesianGrid;
export const Tooltip = RechartsTooltip;
export const ResponsiveContainer = RechartsResponsiveContainer;
export const Area = RechartsArea;
export const AreaChart = RechartsAreaChart;

interface ChartTooltipContentProps {
  labelFormatter?: (label: string | number) => string;
  itemFormatter?: (value: string | number) => string;
  label?: string | number;
  payload?: any[];
  className?: string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  labelFormatter,
  itemFormatter,
  label,
  payload,
  className,
}) => {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {label && (
        <div className="recharts-tooltip-label">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <ul className="recharts-tooltip-item-list">
        {payload.map((item, index) => (
          <li key={`tooltip-item-${index}`} className="recharts-tooltip-item">
            <span className="recharts-tooltip-item-name">{item.name}:</span>
            <span className="recharts-tooltip-item-value">
              {itemFormatter ? itemFormatter(item.value) : item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ChartContainerProps {
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
};

export const ChartTooltip = RechartsTooltip;
