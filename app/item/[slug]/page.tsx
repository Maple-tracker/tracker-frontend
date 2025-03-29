import { PriceGraph } from "@/components/price-graph"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StarsBackground } from "@/components/stars-background"

// Mock function to get item data
async function getItemData(slug: string) {
  // In a real app, this would be an API call
  return {
    id: slug,
    name: decodeURIComponent(slug),
    currentPrice: 1250000000,
    averagePrice: 1200000000,
    lowestPrice: 1100000000,
    highestPrice: 1350000000,
    priceChange: 50000000,
    priceChangePercentage: 4.17,
    lastUpdated: "2023-05-15T12:30:00Z",
    // Generate 30 days of price data
    priceHistory: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))

      // Create some price fluctuation
      const basePrice = 1200000000
      const randomFactor = Math.sin(i * 0.3) * 0.15 + Math.random() * 0.1 - 0.05
      const price = Math.round(basePrice * (1 + randomFactor))

      return {
        date: date.toISOString().split("T")[0],
        price,
        volume: Math.floor(Math.random() * 20) + 5,
      }
    }),
  }
}

export default async function ItemPage({ params }: { params: { slug: string } }) {
  const itemData = await getItemData(params.slug)

  return (
    <div className="min-h-screen magical-gradient">
      <div className="absolute inset-0 aurora-gradient animate-aurora pointer-events-none"></div>
      <StarsBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-purple-200 hover:text-white hover:bg-purple-900/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              검색으로 돌아가기
            </Button>
          </Link>
        </div>

        <div className="bg-background/30 backdrop-blur-sm rounded-lg border border-purple-800/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{itemData.name}</h1>
              <p className="text-purple-200 text-sm">
                마지막 업데이트: {new Date(itemData.lastUpdated).toLocaleString()}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold text-white">{itemData.currentPrice.toLocaleString()} 메소</div>
              <div className={`text-sm ${itemData.priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {itemData.priceChange >= 0 ? "+" : ""}
                {itemData.priceChange.toLocaleString()} 메소 ({itemData.priceChange >= 0 ? "+" : ""}
                {itemData.priceChangePercentage.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background/20 p-4 rounded-lg">
              <div className="text-sm text-purple-200">평균 가격 (30일)</div>
              <div className="text-xl font-medium text-white">{itemData.averagePrice.toLocaleString()} 메소</div>
            </div>
            <div className="bg-background/20 p-4 rounded-lg">
              <div className="text-sm text-purple-200">최저 가격 (30일)</div>
              <div className="text-xl font-medium text-white">{itemData.lowestPrice.toLocaleString()} 메소</div>
            </div>
            <div className="bg-background/20 p-4 rounded-lg">
              <div className="text-sm text-purple-200">최고 가격 (30일)</div>
              <div className="text-xl font-medium text-white">{itemData.highestPrice.toLocaleString()} 메소</div>
            </div>
          </div>

          <PriceGraph priceHistory={itemData.priceHistory} />
        </div>
      </div>
    </div>
  )
}

