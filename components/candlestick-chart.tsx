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
    if (!canvas || !data || data.length === 0 || containerSize.width === 0)
      return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정 - 컨테이너 크기에 맞춤
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    // 차트 영역 설정
    const padding = { top: 20, right: 50, bottom: 30, left: 60 };
    const chartWidth = containerSize.width - padding.left - padding.right;
    const chartHeight = containerSize.height - padding.top - padding.bottom;

    // 데이터 범위 계산
    const prices = data.flatMap((d) => [d.highPrice, d.lowPrice, d.price]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // 가격 -> Y좌표 변환 함수
    const priceToY = (price: number) => {
      return (
        padding.top +
        chartHeight -
        ((price - minPrice) / priceRange) * chartHeight
      );
    };

    // 배경 그리기
    ctx.fillStyle = "rgba(15, 15, 26, 0.3)";
    ctx.fillRect(0, 0, containerSize.width, containerSize.height);

    // 그리드 그리기
    ctx.strokeStyle = "rgba(51, 51, 51, 0.2)";
    ctx.lineWidth = 0.5;

    // 수평 그리드
    const priceStep = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + i * priceStep;
      const y = priceToY(price);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(containerSize.width - padding.right, y);
      ctx.stroke();

      // 가격 레이블
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(formatPrice(price), padding.left - 5, y);
    }

    // 수직 그리드 및 날짜 레이블
    const dateStep = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += dateStep) {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, containerSize.height - padding.bottom);
      ctx.stroke();

      // 날짜 레이블
      const date = new Date(data[i].date);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(dateStr, x, containerSize.height - padding.bottom + 5);
    }

    // 캔들스틱 그리기
    const candleWidth = Math.min(12, chartWidth / data.length / 1.5); // 더 굵은 캔들로 변경

    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const candleX = x - candleWidth / 2;

      const highY = priceToY(d.highPrice);
      const lowY = priceToY(d.lowPrice);

      // 평균가 계산 (price 필드 사용)
      const avgY = priceToY(d.price);

      // 상승/하락 여부 결정 (이전 데이터와 비교)
      const isRising = i > 0 ? d.price >= data[i - 1].price : true;
      const candleColor = isRising ? "#4ade80" : "#f87171";

      // 캔들 실체(body) 그리기 - 최고가에서 최저가까지의 굵은 막대
      ctx.fillStyle = candleColor;
      ctx.fillRect(candleX, highY, candleWidth, lowY - highY);

      // 평균가 표시 (작은 선으로)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(candleX, avgY);
      ctx.lineTo(candleX + candleWidth, avgY);
      ctx.stroke();

      // 호버 효과
      if (i === hoveredIndex) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          candleX - 1,
          highY - 1,
          candleWidth + 2,
          lowY - highY + 2
        );
      }
    });

    // 가격 포맷 함수
    function formatPrice(price: number) {
      if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(1)}B`;
      } else if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M`;
      } else if (price >= 1000) {
        return `${(price / 1000).toFixed(1)}K`;
      }
      return price.toString();
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

    // 차트 영역 설정
    const padding = { top: 20, right: 50, bottom: 30, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;

    // 마우스 위치에 해당하는 데이터 인덱스 계산
    const dataIndex = Math.round(
      ((x - padding.left) / chartWidth) * (data.length - 1)
    );

    if (dataIndex >= 0 && dataIndex < data.length) {
      setHoveredIndex(dataIndex);
      if (onHover) {
        onHover(data[dataIndex], dataIndex);
      }
    } else {
      setHoveredIndex(null);
    }
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
          {hoveredIndex > 0 && (
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
