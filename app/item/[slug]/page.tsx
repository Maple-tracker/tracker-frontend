import { StarsBackground } from "@/components/stars-background";
import type { ItemPriceResponse } from "@/types/price-api-types";
import ClientWrapper from "./client-wrapper";
import ItemDetailContent from "./item-detail-content";

// 아이템 데이터 가져오기
async function getItemData(slug: string): Promise<ItemPriceResponse> {
  // 서버 컴포넌트에서 API 호출
  // URL 인코딩된 slug를 디코딩하여 원래 한글 아이템명으로 복원
  const decodedSlug = decodeURIComponent(slug);
  const apiUrl = `https://dev.maplemarket.today/api/item/price/${slug}`;

  try {
    console.log(`API 요청 URL: ${apiUrl}`); // 디버깅용 로그 추가

    // POST 요청으로 변경
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ optionIds: [] }),
      next: { revalidate: 3600 }, // 1시간마다 재검증
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
        name: decodedSlug,
        imageUrl: "/placeholder.svg?height=64&width=64",
        category: "알 수 없음",
        level: 0,
        tradable: false,
      },
      option: null,
      itemOptions: [],
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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ItemPage({
  params,
  searchParams,
}: ItemPageProps) {
  // params와 searchParams를 await로 접근
  const { slug } = await params;

  // 비동기 데이터 가져오기
  const initialData = await getItemData(slug);

  return (
    <div className="magical-gradient">
      <div className="aurora-gradient animate-aurora"></div>
      <StarsBackground />
      <ClientWrapper slug={slug} initialData={initialData} />
    </div>
  );
}
