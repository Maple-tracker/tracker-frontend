"use client"

import { useState } from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PricePoint = {
  date: string
  price: number
  volume: number
}

type PriceGraphProps = {
  priceHistory: PricePoint[]
}

export function PriceGraph({ priceHistory }: PriceGraphProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d" | "all">("30d")

  // Filter data based on selected time range
  const filteredData = (() => {
    const now = new Date()
    let daysToShow = 30

    switch (timeRange) {
      case "7d":
        daysToShow = 7
        break
      case "14d":
        daysToShow = 14
        break
      case "30d":
        daysToShow = 30
        break
      case "all":
        return priceHistory
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(now.getDate() - daysToShow)

    return priceHistory.filter((point) => {
      const pointDate = new Date(point.date)
      return pointDate >= cutoffDate
    })
  })()

  // Format large numbers for display
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}십억`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}백만`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}천`
    }
    return price.toString()
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">가격 기록</h2>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7d")}
            className={timeRange === "7d" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-200 border-purple-800"}
          >
            7일
          </Button>
          <Button
            variant={timeRange === "14d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("14d")}
            className={timeRange === "14d" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-200 border-purple-800"}
          >
            14일
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30d")}
            className={timeRange === "30d" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-200 border-purple-800"}
          >
            30일
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
            className={timeRange === "all" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-200 border-purple-800"}
          >
            전체
          </Button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ChartContainer>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
            <YAxis tickFormatter={formatPrice} stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} width={60} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background/90 border border-purple-800 shadow-md"
                  labelFormatter={(label) => formatDate(label as string)}
                  itemFormatter={(value) => `${Number(value).toLocaleString()} 메소`}
                />
              }
            />
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
        </ChartContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background/20 p-3">
          <div className="text-xs text-purple-200">시작 가격</div>
          <div className="text-sm font-medium text-white">{filteredData[0]?.price.toLocaleString()} 메소</div>
        </Card>
        <Card className="bg-background/20 p-3">
          <div className="text-xs text-purple-200">종료 가격</div>
          <div className="text-sm font-medium text-white">
            {filteredData[filteredData.length - 1]?.price.toLocaleString()} 메소
          </div>
        </Card>
        <Card className="bg-background/20 p-3">
          <div className="text-xs text-purple-200">가격 변동</div>
          <div
            className={`text-sm font-medium ${
              filteredData[filteredData.length - 1]?.price - filteredData[0]?.price >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {(filteredData[filteredData.length - 1]?.price - filteredData[0]?.price).toLocaleString()} 메소
          </div>
        </Card>
        <Card className="bg-background/20 p-3">
          <div className="text-xs text-purple-200">평균 거래량</div>
          <div className="text-sm font-medium text-white">
            {Math.round(filteredData.reduce((sum, point) => sum + point.volume, 0) / filteredData.length)}
          </div>
        </Card>
      </div>
    </div>
  )
}

