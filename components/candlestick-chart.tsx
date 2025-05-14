"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import type { PriceDataPoint } from "@/types/price-api-types";

type CandlestickChartProps = {
  data: (PriceDataPoint & {
    isRising?: boolean;
  })[];
  width?: number;
  height?: number;
  onHover?: (dataPoint: any, index: number) => void;
};

export function CandlestickChart({
  data,
  width = 800,
  height = 400,
  onHover,
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 컨테이너 크기 감지 및 업데이트
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    // 초기 크기 설정
    updateSize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerSize.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정 - 컨테이너 크기에 맞춤
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    // 차트 영역 설정
    const padding = { top: 20, right: 50, bottom: 30, left: 100 };
    const chartWidth = containerSize.width - padding.left - padding.right;
    const chartHeight = containerSize.height - padding.top - padding.bottom;

    // 캔들 색상 테마 정의
    const candleTheme = {
      rising: {
        body: "#00c853", // 더 선명한 녹색
        border: "#00e676", // 밝은 녹색 테두리
        wick: "#69f0ae", // 심지(wick) 색상
        average: "#ffffff", // 평균가 선 색상
      },
      falling: {
        body: "#d50000", // 더 선명한 빨간색
        border: "#ff1744", // 밝은 빨간색 테두리
        wick: "#ff5252", // 심지(wick) 색상
        average: "#ffffff", // 평균가 선 색상
      },
      hover: {
        border: "#ffffff", // 호버 테두리 색상
        shadow: "rgba(255, 255, 255, 0.3)", // 호버 그림자 색상
      },
      grid: {
        line: "rgba(80, 80, 120, 0.2)", // 그리드 선 색상
        text: "#b0bec5", // 그리드 텍스트 색상
      },
      background: "rgba(15, 15, 30, 0.4)", // 배경 색상
    };

    // 데이터가 없거나 너무 적은 경우 처리
    if (!data || data.length === 0) {
      // 데이터가 없는 경우 메시지 표시
      ctx.fillStyle = candleTheme.background;
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);

      ctx.fillStyle = candleTheme.grid.text;
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "데이터가 없습니다",
        containerSize.width / 2,
        containerSize.height / 2
      );
      return;
    }

    // 데이터 범위 계산
    const prices = data.flatMap((d) => [d.highPrice, d.lowPrice, d.price]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 최소값과 최대값이 같은 경우(데이터 포인트가 하나인 경우) 범위 조정
    const priceRange =
      maxPrice - minPrice > 0 ? maxPrice - minPrice : maxPrice * 0.1;

    // Y축 범위 설정 - 최소값을 0으로 설정
    const adjustedMinPrice = 0; // 최소값을 0으로 설정
    const paddingTop = priceRange * 0.05; // 위쪽에 5% 여유 공간
    const adjustedMaxPrice = Math.max(maxPrice + paddingTop, minPrice * 1.05); // 최대값 조정
    const adjustedPriceRange = adjustedMaxPrice - adjustedMinPrice;

    // 가격 -> Y좌표 변환 함수 (수정된 범위 사용)
    const priceToY = (price: number) => {
      return (
        padding.top +
        chartHeight -
        ((price - adjustedMinPrice) / adjustedPriceRange) * chartHeight
      );
    };

    // 배경 그리기
    ctx.fillStyle = candleTheme.background;
    ctx.fillRect(0, 0, containerSize.width, containerSize.height);

    // 그리드 그리기
    ctx.strokeStyle = candleTheme.grid.line;
    ctx.lineWidth = 0.5;

    // 수평 그리드
    const priceStep = adjustedPriceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const price = adjustedMinPrice + i * priceStep;
      const y = priceToY(price);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(containerSize.width - padding.right, y);
      ctx.stroke();

      // 가격 레이블
      ctx.fillStyle = candleTheme.grid.text;
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      // 숫자 길이에 따라 패딩 조정
      const priceText = formatPrice(price);
      const textPadding = Math.min(5 + priceText.length * 1.5, 15);
      ctx.fillText(priceText, padding.left - textPadding, y);
    }

    // 데이터를 날짜 오름차순으로 정렬 (오래된 날짜 -> 최신 날짜)
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // 정렬된 데이터로 작업
    data = sortedData;

    // 캔들스틱 그리기
    // 데이터 포인트 수에 관계없이 일정한 간격 유지
    const maxCandleWidth = 12; // 최대 캔들 너비
    const minCandleSpacing = 4; // 캔들 사이 최소 간격
    const totalCandlesWidth =
      data.length * maxCandleWidth + (data.length - 1) * minCandleSpacing;
    const scaleFactor =
      totalCandlesWidth > chartWidth ? chartWidth / totalCandlesWidth : 1;
    const candleWidth = Math.min(maxCandleWidth, maxCandleWidth * scaleFactor); // 조정된 캔들 너비
    const candleSpacing = Math.max(
      minCandleSpacing * scaleFactor,
      minCandleSpacing
    ); // 조정된 간격

    data.forEach((d, i) => {
      // 데이터 포인트 수에 관계없이 균등한 간격으로 배치
      const x =
        padding.left + i * (candleWidth + candleSpacing) + candleWidth / 2;
      const candleX = x - candleWidth / 2;

      const highY = priceToY(d.highPrice);
      const lowY = priceToY(d.lowPrice);

      // 평균가 계산 (price 필드 사용)
      const avgY = priceToY(d.price);

      // 상승/하락 여부 결정 (이전 데이터와 비교)
      const isRising = i > 0 ? d.price >= data[i - 1].price : true;
      const theme = isRising ? candleTheme.rising : candleTheme.falling;

      // 캔들 심지(wick) 그리기 - 최고가에서 최저가까지의 선
      ctx.strokeStyle = theme.wick;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 캔들 실체(body) 그리기 - 각 캔들의 실제 최고가와 최저가 위치에 그리기
      const bodyHeight = Math.max(lowY - highY, 1); // 최소 1px 높이 보장

      // 캔들 내부 채우기
      ctx.fillStyle = theme.body;
      ctx.fillRect(candleX, highY, candleWidth, bodyHeight);

      // 캔들 테두리 그리기
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(candleX, highY, candleWidth, bodyHeight);

      // 평균가 표시 (작은 선으로)
      ctx.strokeStyle = theme.average;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX, avgY);
      ctx.lineTo(candleX + candleWidth, avgY);
      ctx.stroke();

      // 호버 효과
      if (i === hoveredIndex) {
        // 그림자 효과
        ctx.shadowColor = candleTheme.hover.shadow;
        ctx.shadowBlur = 8;

        // 테두리 강조
        ctx.strokeStyle = candleTheme.hover.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(candleX - 1, highY - 1, candleWidth + 2, bodyHeight + 2);

        // 그림자 효과 초기화
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
    });

    // 가격 포맷 함수 - 단위 변환 없이 천 단위 콤마만 적용
    function formatPrice(price: number) {
      // 소수점 이하 숫자 제거하고 천 단위 콤마 적용
      return Math.round(price).toLocaleString();
    }
  }, [data, containerSize, hoveredIndex]);

  // 마우스 이벤트 핸들러
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();

    // 마우스 위치 계산 - 캔버스 내 상대 좌표
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 마우스 위치 저장 (툴팁 위치 계산용)
    setMousePosition({ x: e.clientX, y: e.clientY });

    // 차트 영역 설정 - 캔버스 그리기와 동일한 패딩 사용
    const padding = { top: 20, right: 50, bottom: 30, left: 100 };

    // 캔들 위치 계산에 사용된 것과 동일한 로직 적용
    const maxCandleWidth = 12;
    const minCandleSpacing = 4;
    const chartWidth = rect.width - padding.left - padding.right;
    const totalCandlesWidth =
      data.length * maxCandleWidth + (data.length - 1) * minCandleSpacing;
    const scaleFactor =
      totalCandlesWidth > chartWidth ? chartWidth / totalCandlesWidth : 1;
    const candleWidth = Math.min(maxCandleWidth, maxCandleWidth * scaleFactor);
    const candleSpacing = Math.max(
      minCandleSpacing * scaleFactor,
      minCandleSpacing
    );

    // 마우스 위치에 해당하는 데이터 인덱스 계산
    // 수정된 캔들 위치 계산 로직에 맞게 업데이트
    if (x < padding.left || x > rect.width - padding.right) {
      setHoveredIndex(null);
      return;
    }

    const relativeX = x - padding.left;
    const candleAndSpacingWidth = candleWidth + candleSpacing;
    const index = Math.floor(relativeX / candleAndSpacingWidth);

    if (index >= 0 && index < data.length) {
      // 캔들 중앙 위치 계산
      const candleCenterX =
        padding.left + index * candleAndSpacingWidth + candleWidth / 2;
      // 마우스가 캔들 주변에 있는지 확인 (캔들 너비의 1.5배 범위 내)
      if (Math.abs(x - candleCenterX) <= candleWidth * 1.5) {
        setHoveredIndex(index);
        if (onHover) {
          onHover(data[index], index);
        }
        return;
      }
    }

    setHoveredIndex(null);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setMousePosition(null);
  };

  // 툴팁 위치 계산
  const getTooltipPosition = () => {
    if (!mousePosition || !containerRef.current) return { top: 10, left: 10 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // 툴팁의 대략적인 너비
    const tooltipHeight = 180; // 툴팁의 대략적인 높이
    const margin = 10; // 마우스와 툴팁 사이의 여백

    // 마우스 위치를 기준으로 툴팁 위치 계산
    let left = mousePosition.x - containerRect.left + margin;
    let top = mousePosition.y - containerRect.top + margin;

    // 화면 오른쪽 경계를 벗어나지 않도록 조정
    if (left + tooltipWidth > containerRect.width) {
      left = mousePosition.x - containerRect.left - tooltipWidth - margin;
    }

    // 화면 아래쪽 경계를 벗어나지 않도록 조정
    if (top + tooltipHeight > containerRect.height) {
      top = mousePosition.y - containerRect.top - tooltipHeight - margin;
    }

    // 음수 값이 되지 않도록 조정
    left = Math.max(10, left);
    top = Math.max(10, top);

    return { top, left };
  };

  return (
    <div
      ref={containerRef}
      className="candlestick-chart-container"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {hoveredIndex !== null && data[hoveredIndex] && mousePosition && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            ...getTooltipPosition(),
            background: "rgba(26, 26, 46, 0.95)",
            border: "1px solid #3c1b99",
            borderRadius: "0.375rem",
            padding: "0.75rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            color: "white",
            zIndex: 10,
            pointerEvents: "none", // 툴팁이 마우스 이벤트를 방해하지 않도록
            width: "200px",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {new Date(data[hoveredIndex].date).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div
            style={{ display: "grid", gap: "0.25rem", marginBottom: "0.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#c1abff", fontSize: "0.75rem" }}>
                평균가:
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                {data[hoveredIndex].price.toLocaleString()} 메소
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#c1abff", fontSize: "0.75rem" }}>
                최고가:
              </span>
              <span
                style={{
                  color: "#4ade80",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {data[hoveredIndex].highPrice.toLocaleString()} 메소
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#c1abff", fontSize: "0.75rem" }}>
                최저가:
              </span>
              <span
                style={{
                  color: "#f87171",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {data[hoveredIndex].lowPrice.toLocaleString()} 메소
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#c1abff", fontSize: "0.75rem" }}>
                거래량:
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                {data[hoveredIndex].volume} 개
              </span>
            </div>
          </div>
          {hoveredIndex > 0 && data.length > 1 && (
            <div
              style={{
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "0.75rem",
                fontWeight: 500,
                textAlign: "center",
                color:
                  data[hoveredIndex].price - data[hoveredIndex - 1].price >= 0
                    ? "#4ade80"
                    : "#f87171",
              }}
            >
              {`전일대비: ${
                data[hoveredIndex].price - data[hoveredIndex - 1].price >= 0
                  ? "+"
                  : ""
              }${(
                data[hoveredIndex].price - data[hoveredIndex - 1].price
              ).toLocaleString()} (${
                data[hoveredIndex].price - data[hoveredIndex - 1].price >= 0
                  ? "+"
                  : ""
              }${(
                ((data[hoveredIndex].price - data[hoveredIndex - 1].price) /
                  data[hoveredIndex - 1].price) *
                100
              ).toFixed(2)}%)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
