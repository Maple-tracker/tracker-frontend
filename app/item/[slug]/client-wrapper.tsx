"use client";
import { useEffect, useState } from "react";
import type { ItemPriceResponse } from "@/types/price-api-types";
import ItemDetailContent from "./item-detail-content";

type ClientWrapperProps = {
  slug: string;
  initialData: ItemPriceResponse;
};

export default function ClientWrapper({
  slug,
  initialData,
}: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [itemData, setItemData] = useState<ItemPriceResponse>(initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 로컬 스토리지에서 선택된 옵션 ID 가져오기
        const storedOptionIds = localStorage.getItem(
          `optionIds_${decodeURIComponent(slug)}`
        );
        const optionIds = storedOptionIds ? JSON.parse(storedOptionIds) : [];

        if (optionIds.length > 0) {
          // 옵션 ID가 있으면 API 호출
          const response = await fetch(
            `https://dev.maplemarket.today/api/item/price/${slug}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ optionIds }),
            }
          );

          if (response.ok) {
            // 응답이 성공하면 데이터 업데이트
            const data = await response.json();
            setItemData(data);

            // 로컬 스토리지에서 옵션 ID 제거
            localStorage.removeItem(`optionIds_${decodeURIComponent(slug)}`);
          }
        }
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  // 자식 컴포넌트에 데이터 직접 전달
  return <ItemDetailContent slug={slug} itemData={itemData} />;
}
