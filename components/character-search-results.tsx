"use client";

import { useState, useEffect } from "react";
import { CharacterEquipment } from "./character-equipment";
import type { CharacterData } from "@/app/api/character/[name]/route";
import { Loader2 } from "lucide-react";

interface CharacterSearchResultsProps {
  characterName: string | null;
}

export function CharacterSearchResults({
  characterName,
}: CharacterSearchResultsProps) {
  const [characterData, setCharacterData] = useState<CharacterData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 캐릭터 데이터 가져오기
  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!characterName) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/character/${encodeURIComponent(characterName)}`
        );

        if (!response.ok) {
          throw new Error(
            `캐릭터 정보를 가져오는데 실패했습니다. (${response.status})`
          );
        }

        const data = await response.json();
        setCharacterData(data);
      } catch (err) {
        console.error("캐릭터 데이터 가져오기 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setCharacterData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, [characterName]);

  // 캐릭터 이름이 없는 경우 빈 장비창 표시
  if (!characterName) {
    return (
      <div className="options-panel character-search-panel">
        <div className="character-info-header mb-2">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-white opacity-50">
              캐릭터 정보
            </h3>
          </div>
          <div className="text-sm text-purple-300 mt-1 opacity-50">
            캐릭터를 검색하면 장비 정보가 표시됩니다
          </div>
        </div>

        <CharacterEquipment
          equippedItems={[]}
          characterImageUrl="/placeholder.svg?key=e3woe"
          characterName=""
        />
      </div>
    );
  }

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="options-panel">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
          <p className="text-purple-200">캐릭터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류가 발생한 경우
  if (error) {
    return (
      <div className="options-panel">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-red-400 mb-2">⚠️ 오류 발생</div>
          <p className="text-red-200">{error}</p>
          <p className="text-purple-200 mt-4">
            다시 시도하거나 다른 캐릭터를 검색해보세요.
          </p>
        </div>
      </div>
    );
  }

  // 캐릭터 데이터가 없는 경우
  if (!characterData) {
    return (
      <div className="options-panel">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-purple-200">캐릭터 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 캐릭터 정보 표시
  return (
    <div className="options-panel character-search-panel">
      <div className="character-info-header mb-2">
        <div className="flex items-center flex-wrap">
          <h3 className="text-lg font-medium text-white mr-2">
            {characterData.name}
          </h3>
          <span className="mr-2 px-2 py-0.5 bg-purple-900/50 rounded text-xs text-purple-200">
            Lv.{characterData.level}
          </span>
          <span className="px-2 py-0.5 bg-purple-900/50 rounded text-xs text-purple-200">
            {characterData.job}
          </span>
        </div>
        <div className="text-sm text-purple-300 mt-1">
          {characterData.server} 서버
          {characterData.guild && <span> / {characterData.guild} 길드</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          마지막 업데이트:{" "}
          {new Date(characterData.lastUpdated).toLocaleString()}
        </div>
      </div>

      <CharacterEquipment
        equippedItems={characterData.equippedItems}
        characterImageUrl={characterData.imageUrl}
        characterName={characterData.name}
      />
    </div>
  );
}
