import { PriceGraph } from "@/components/price-graph";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StarsBackground } from "@/components/stars-background";
import { ItemSearchMini } from "@/components/item-search-mini";
import type { ItemPriceResponse } from "@/types/price-api-types";

// 아이템 데이터 가져오기
async function getItemData(
  slug: string,
  optionId?: string
): Promise<ItemPriceResponse> {
  // 서버 컴포넌트에서 API 호출
  // 외부 API URL 구성 - 템플릿 리터럴 문법 수정
  const apiUrl = `https://dev.maplemarket.today/api/item/price/${slug}${
    optionId ? `?optionId=${optionId}` : ""
  }`;

  try {
    console.log(`API 요청 URL: ${apiUrl}`); // 디버깅용 로그 추가

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
      cache: "no-store", // 캐시 사용 안 함
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 응답 오류: ${response.status}`);
      console.error(`응답 내용: ${errorText}`);
      throw new Error(`API 응답 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API 응답 데이터:", data); // 디버깅용 로그 추가
    return data;
  } catch (error) {
    console.error("아이템 데이터 가져오기 실패:", error);

    // 에러 발생 시 기본 데이터 반환
    return {
      item: {
        id: slug,
        name: decodeURIComponent(slug),
        imageUrl: "/placeholder.svg?height=64&width=64",
        category: "알 수 없음",
        level: 0,
        tradable: false,
      },
      option: null,
      priceStats: {
        currentPrice: 0,
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        priceChange: 0,
        priceChangePercentage: 0,
        lastUpdated: new Date().toISOString(),
      },
      priceHistory: [],
    };
  }
}

// Next.js 15 타입 정의에 맞게 수정
type ItemPageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ItemPage({
  params,
  searchParams,
}: ItemPageProps) {
  const slug = params.slug;
  const optionId =
    typeof searchParams.optionId === "string"
      ? searchParams.optionId
      : undefined;

  // 비동기 데이터 가져오기
  const itemData = await getItemData(slug, optionId);

  return (
    <div className="magical-gradient">
      <div className="aurora-gradient animate-aurora"></div>
      <StarsBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="item-page-header">
          <Link href="/" className="back-button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            검색으로 돌아가기
          </Link>

          <ItemSearchMini currentItemName={itemData.item.name} />
        </div>

        <div className="item-details-card">
          <div className="item-header">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-purple-900/50 rounded-md flex items-center justify-center mr-4">
                <img
                  src={itemData.item.imageUrl || "/placeholder.svg"}
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
                {itemData.option && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                      {itemData.option.starForce}
                    </span>
                    <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                      {itemData.option.potentialOption}{" "}
                      {itemData.option.statType}
                    </span>
                    <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                      {itemData.option.additionalPotentialOption} 에디셔널
                    </span>
                    {itemData.option.enchantedFlag && (
                      <span className="inline-block px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">
                        인챈트
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
    </div>
  );
}
