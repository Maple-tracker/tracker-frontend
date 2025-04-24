"use client";

import { useState } from "react";
import { CandlestickChart } from "./candlestick-chart";
import type { PriceDataPoint } from "@/types/price-api-types";

type PriceGraphProps = {
  priceHistory: PriceDataPoint[];
};

export function PriceGraph({ priceHistory }: PriceGraphProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d" | "all">(
    "30d"
  );
  const [hoveredData, setHoveredData] = useState<any>(null);

  // 데이터가 없는 경우 처리
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-purple-900/20 rounded-lg">
        <p className="text-purple-200">가격 데이터가 없습니다</p>
      </div>
    );
  }

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

  // 캔들 차트를 위한 데이터 가공 및 전일 대비 등락 계산
  const processedData = filteredData.map((point, index, array) => {
    // 이전 데이터와 비교하여 상승/하락 여부 결정
    const isRising = index > 0 ? point.price >= array[index - 1].price : true;

    return {
      ...point,
      isRising,
    };
  });

  // 호버 이벤트 핸들러
  const handleHover = (dataPoint: any) => {
    setHoveredData(dataPoint);
  };

  return (
    <div>
      <div className="chart-header">
        <h2 className="chart-title">가격 기록</h2>
        <div className="chart-controls">
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
      </div>

      <div className="chart-container">
        <div className="candlestick-chart-wrapper">
          <CandlestickChart data={processedData} onHover={handleHover} />
        </div>
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
