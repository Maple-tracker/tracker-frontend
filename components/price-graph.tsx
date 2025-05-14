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

  // 필터링된 데이터가 없는 경우 모든 데이터 표시
  let dataToDisplay = filteredData.length > 0 ? filteredData : priceHistory;

  // 데이터를 날짜 오름차순으로 정렬 (오래된 날짜 -> 최신 날짜)
  dataToDisplay = [...dataToDisplay].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 캔들 차트를 위한 데이터 가공 및 전일 대비 등락 계산
  const processedData = dataToDisplay.map((point, index, array) => {
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

  // 시작 가격과 종료 가격 계산 (데이터가 하나인 경우도 처리)
  const startPrice = dataToDisplay.length > 0 ? dataToDisplay[0].price : 0;
  const endPrice =
    dataToDisplay.length > 0
      ? dataToDisplay[dataToDisplay.length - 1].price
      : 0;
  const priceChange = endPrice - startPrice;
  const priceChangePercent =
    startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  // 평균 거래량 계산
  const avgVolume =
    dataToDisplay.length > 0
      ? Math.round(
          dataToDisplay.reduce((sum, point) => sum + point.volume, 0) /
            dataToDisplay.length
        )
      : 0;

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
          <div className="stat-label">평균 가격</div>
          <div className="stat-value">
            {filteredData[0]?.price.toLocaleString()} 메소
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">가격 변동</div>
          <div
            className={`stat-value ${
              priceChange >= 0 ? "positive" : "negative"
            }`}
          >
            {priceChange.toLocaleString()} 메소
            {dataToDisplay.length > 1 && (
              <span className="text-xs ml-1">
                ({priceChangePercent >= 0 ? "+" : ""}
                {priceChangePercent.toFixed(2)}%)
              </span>
            )}
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

      <style jsx>{`
        .chart-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chart-toggle {
          display: flex;
          align-items: center;
        }

        .chart-toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .chart-toggle-input {
          margin-right: 0.5rem;
          accent-color: #9333ea;
          width: 1rem;
          height: 1rem;
        }

        .chart-toggle-text {
          color: #c1abff;
          font-size: 0.875rem;
        }

        .candlestick-chart-wrapper {
          width: 100%;
          height: 400px;
          position: relative;
        }

        .tooltip-change.positive {
          color: #4ade80;
        }

        .tooltip-change.negative {
          color: #f87171;
        }
      `}</style>
    </div>
  );
}
