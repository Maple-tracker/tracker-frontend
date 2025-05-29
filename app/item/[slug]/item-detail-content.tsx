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
            <div className="item-image-container mr-4">
              <img
                src={
                  itemData.item.imageUrl ||
                  "/placeholder.svg?height=64&width=64"
                }
                alt={itemData.item.name}
                className="item-image"
              />
            </div>
            <div>
              <h1 className="item-title"> {itemData.item.name}</h1>
              <p className="item-update-time">
                마지막 업데이트:{" "}
                {new Date(itemData.priceStats.lastUpdated).toLocaleString()}
              </p>

              {/* 옵션 태그 - 세로 나열 방식 (스크롤 가능) */}
              <div className="mt-2">
                {itemData.itemOptions && itemData.itemOptions.length > 0 ? (
                  <div className="options-scroll-container">
                    <div className="options-scroll-header">
                      <span className="options-count-text">
                        검색 옵션 ({itemData.itemOptions.length}개)
                      </span>
                    </div>
                    <div className="options-scroll-content">
                      {itemData.itemOptions.map((option, index) => (
                        <div
                          key={option.id || index}
                          className="inline-option-set"
                        >
                          {itemData.itemOptions.length > 1 && (
                            <span className="inline-option-number">
                              옵션 {index + 1}
                            </span>
                          )}
                          <div className="inline-tags-wrapper">
                            <span className="inline-tag tag-starforce">
                              {option.starForce}
                            </span>
                            <span className="inline-tag tag-potential">
                              {option.statType} {option.potentialOption}
                            </span>
                            <span className="inline-tag tag-additional">
                              {option.additionalPotentialOption}
                            </span>
                            {option.enchantedFlag && (
                              <span className="inline-tag tag-enchant">
                                노작
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : itemData.option ? (
                  <div className="inline-itemOptions-container">
                    <div className="inline-option-set">
                      <div className="inline-tags-wrapper">
                        <span className="inline-tag tag-starforce">
                          {itemData.option.starForce}
                        </span>
                        <span className="inline-tag tag-potential">
                          {itemData.option.statType}{" "}
                          {itemData.option.potentialOption}
                        </span>
                        <span className="inline-tag tag-additional">
                          {itemData.option.additionalPotentialOption}
                        </span>
                        {itemData.option.enchantedFlag && (
                          <span className="inline-tag tag-enchant">노작</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
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
