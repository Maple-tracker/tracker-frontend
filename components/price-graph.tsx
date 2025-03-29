"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type PricePoint = {
  date: string;
  price: number;
  volume: number;
};

type PriceGraphProps = {
  priceHistory: PricePoint[];
};

export function PriceGraph({ priceHistory }: PriceGraphProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d" | "all">(
    "30d"
  );

  // Filter data based on selected time range
  const filteredData = (() => {
    const now = new Date();
    let daysToShow = 30;

    switch (timeRange) {
      case "7d":
        daysToShow = 7;
        break;
      case "14d":
        daysToShow = 14;
        break;
      case "30d":
        daysToShow = 30;
        break;
      case "all":
        return priceHistory;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToShow);

    return priceHistory.filter((point) => {
      const pointDate = new Date(point.date);
      return pointDate >= cutoffDate;
    });
  })();

  // Format large numbers for display
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}십억`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}백만`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}천`;
    }
    return price.toString();
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  // 차트 툴팁 커스텀 컴포넌트
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          <p className="tooltip-price">{`${Number(
            payload[0].value
          ).toLocaleString()} 메소`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="chart-header">
        <h2 className="chart-title">가격 기록</h2>
        <div className="chart-buttons">
          <button
            className={`chart-button ${timeRange === "7d" ? "active" : ""}`}
            onClick={() => setTimeRange("7d")}
          >
            7일
          </button>
          <button
            className={`chart-button ${timeRange === "14d" ? "active" : ""}`}
            onClick={() => setTimeRange("14d")}
          >
            14일
          </button>
          <button
            className={`chart-button ${timeRange === "30d" ? "active" : ""}`}
            onClick={() => setTimeRange("30d")}
          >
            30일
          </button>
          <button
            className={`chart-button ${timeRange === "all" ? "active" : ""}`}
            onClick={() => setTimeRange("all")}
          >
            전체
          </button>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              tickFormatter={formatPrice}
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#9333EA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 6, fill: "#9333EA", stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="stat-card">
          <div className="stat-label">시작 가격</div>
          <div className="stat-value">
            {filteredData[0]?.price.toLocaleString()} 메소
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">종료 가격</div>
          <div className="stat-value">
            {filteredData[filteredData.length - 1]?.price.toLocaleString()} 메소
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">가격 변동</div>
          <div
            className={`stat-value ${
              filteredData[filteredData.length - 1]?.price -
                filteredData[0]?.price >=
              0
                ? "positive"
                : "negative"
            }`}
          >
            {(
              filteredData[filteredData.length - 1]?.price -
              filteredData[0]?.price
            ).toLocaleString()}{" "}
            메소
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">평균 거래량</div>
          <div className="stat-value">
            {Math.round(
              filteredData.reduce((sum, point) => sum + point.volume, 0) /
                filteredData.length
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
