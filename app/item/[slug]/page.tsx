import { PriceGraph } from "@/components/price-graph";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StarsBackground } from "@/components/stars-background";

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
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));

      // Create some price fluctuation
      const basePrice = 1200000000;
      const randomFactor =
        Math.sin(i * 0.3) * 0.15 + Math.random() * 0.1 - 0.05;
      const price = Math.round(basePrice * (1 + randomFactor));

      return {
        date: date.toISOString().split("T")[0],
        price,
        volume: Math.floor(Math.random() * 20) + 5,
      };
    }),
  };
}

export default async function ItemPage({
  params,
}: {
  params: { slug: string };
}) {
  const itemData = await getItemData(params.slug);

  return (
    <div className="magical-gradient">
      <div className="aurora-gradient animate-aurora"></div>
      <StarsBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Link href="/" className="back-button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            검색으로 돌아가기
          </Link>
        </div>

        <div className="item-details-card">
          <div className="item-header">
            <div>
              <h1 className="item-title">{itemData.name}</h1>
              <p className="item-update-time">
                마지막 업데이트:{" "}
                {new Date(itemData.lastUpdated).toLocaleString()}
              </p>
            </div>

            <div className="item-price">
              <div className="current-price">
                {itemData.currentPrice.toLocaleString()} 메소
              </div>
              <div
                className={`price-change ${
                  itemData.priceChange >= 0 ? "positive" : "negative"
                }`}
              >
                {itemData.priceChange >= 0 ? "+" : ""}
                {itemData.priceChange.toLocaleString()} 메소 (
                {itemData.priceChange >= 0 ? "+" : ""}
                {itemData.priceChangePercentage.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-summary-item">
              <div className="summary-label">평균 가격 (30일)</div>
              <div className="summary-value">
                {itemData.averagePrice.toLocaleString()} 메소
              </div>
            </div>
            <div className="price-summary-item">
              <div className="summary-label">최저 가격 (30일)</div>
              <div className="summary-value">
                {itemData.lowestPrice.toLocaleString()} 메소
              </div>
            </div>
            <div className="price-summary-item">
              <div className="summary-label">최고 가격 (30일)</div>
              <div className="summary-value">
                {itemData.highestPrice.toLocaleString()} 메소
              </div>
            </div>
          </div>

          <PriceGraph priceHistory={itemData.priceHistory} />
        </div>
      </div>
    </div>
  );
}
