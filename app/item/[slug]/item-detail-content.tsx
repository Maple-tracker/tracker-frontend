"use client";

import { PriceGraph } from "@/components/price-graph";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ItemSearchMini } from "@/components/item-search-mini";
import type { ItemPriceResponse } from "@/types/price-api-types";

type ItemDetailContentProps = {
  slug: string;
  itemData: ItemPriceResponse;
};

export default function ItemDetailContent({
  slug,
  itemData,
}: ItemDetailContentProps) {
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="item-page-header">
        <Link href="/" className="back-button">
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>

        <ItemSearchMini currentItemName={itemData.item.name} />
      </div>

      <div className="item-details-card">
        <div className="item-header">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-purple-900/50 rounded-md flex items-center justify-center mr-4">
              <img
                src={
                  itemData.item.imageUrl ||
                  "/placeholder.svg?height=64&width=64"
                }
                alt={itemData.item.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="item-title">{itemData.item.name}</h1>
              <p className="item-update-time">
                마지막 업데이트:{" "}
                {new Date(itemData.priceStats.lastUpdated).toLocaleString()}
              </p>

              {/* 다수의 옵션 표시 */}
              {itemData.itemOptions && itemData.itemOptions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {itemData.itemOptions.map((option, index) => (
                    <div key={option.id || index} className="option-tag-group">
                      <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                        {option.starForce}
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                        {option.potentialOption} {option.statType}
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                        {option.additionalPotentialOption} 에디셔널
                      </span>
                      {option.enchantedFlag && (
                        <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                          노작여부
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 이전 버전과의 호환성을 위해 단일 옵션도 처리 */}
              {!itemData.itemOptions?.length && itemData.option && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                    {itemData.option.starForce}
                  </span>
                  <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                    {itemData.option.potentialOption} {itemData.option.statType}
                  </span>
                  <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                    {itemData.option.additionalPotentialOption} 에디셔널
                  </span>
                  {itemData.option.enchantedFlag && (
                    <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                      노작 여부
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="item-price">
            <div className="current-price">
              {itemData.priceStats.currentPrice.toLocaleString()} 메소
            </div>
            <div
              className={`price-change ${
                itemData.priceStats.priceChange >= 0 ? "positive" : "negative"
              }`}
            >
              {itemData.priceStats.priceChange >= 0 ? "+" : ""}
              {itemData.priceStats.priceChange.toLocaleString()} 메소 (
              {itemData.priceStats.priceChange >= 0 ? "+" : ""}
              {itemData.priceStats.priceChangePercentage.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="price-summary">
          <div className="price-summary-item">
            <div className="summary-label">평균 가격 (30일)</div>
            <div className="summary-value">
              {itemData.priceStats.averagePrice.toLocaleString()} 메소
            </div>
          </div>
          <div className="price-summary-item">
            <div className="summary-label">최저 가격 (30일)</div>
            <div className="summary-value">
              {itemData.priceStats.lowestPrice.toLocaleString()} 메소
            </div>
          </div>
          <div className="price-summary-item">
            <div className="summary-label">최고 가격 (30일)</div>
            <div className="summary-value">
              {itemData.priceStats.highestPrice.toLocaleString()} 메소
            </div>
          </div>
        </div>

        <PriceGraph priceHistory={itemData.priceHistory} />
      </div>
    </div>
  );
}
