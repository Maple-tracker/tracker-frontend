"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, Package, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { ItemOptions } from "@/components/item-options";
import { StarsBackground } from "@/components/stars-background";

// 자동완성 API 호출 함수
const fetchAutocompleteSuggestions = async (query: string, isItem: boolean) => {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      "https://dev.maplemarket.today/api/item_name/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: query }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.names || [];
    } else {
      console.error("자동완성 API 오류:", response.status);
      return [];
    }
  } catch (error) {
    console.error("자동완성 API 호출 실패:", error);
    return [];
  }
};

// 아이템 옵션 정보 가져오기
const fetchItemOptions = async (itemName: string) => {
  try {
    // 실제 API 호출 (현재는 목업 데이터 반환)
    // const response = await fetch(`/api/item-options?name=${encodeURIComponent(itemName)}`);
    // if (response.ok) {
    //   return await response.json();
    // }

    // 목업 데이터 - 실제 API 연결 시 제거
    return {
      starForce: ["0성", "10성", "15성", "17성", "20성", "22성", "25성"],
      upperPotential: [
        "3%",
        "6%",
        "9%",
        "12%",
        "15%",
        "18%",
        "21%",
        "24%",
        "27%",
        "30%",
      ],
      lowerPotentialGrade: ["레어", "에픽", "유니크", "레전더리"],
      hasNoDrag: true,
    };
  } catch (error) {
    console.error("아이템 옵션 정보 가져오기 실패:", error);
    return null;
  }
};

export function SearchPage() {
  const [isItemSearch, setIsItemSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemOptions, setItemOptions] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const router = useRouter();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length >= 2 && isItemSearch) {
        const results = await fetchAutocompleteSuggestions(query, isItemSearch);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }
    },
    [isItemSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Handle toggle change with animation
  useEffect(() => {
    if (isItemSearch) {
      setOptionsVisible(true);
    } else {
      // Delay hiding to allow animation to complete
      const timer = setTimeout(() => {
        setOptionsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isItemSearch]);

  // 아이템 선택 시 옵션 정보 가져오기
  const handleItemSelect = async (itemName: string) => {
    setSelectedItem(itemName);
    setSearchQuery(itemName);
    setShowSuggestions(false);

    setIsLoadingOptions(true);
    const options = await fetchItemOptions(itemName);
    setItemOptions(options);
    setIsLoadingOptions(false);
  };

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      if (isItemSearch) {
        // 아이템 검색 모드
        router.push(`/item/${encodeURIComponent(query)}`);
      } else {
        // 캐릭터 검색 모드
        router.push(`/character/${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="magical-gradient">
      <div className="aurora-gradient animate-aurora"></div>
      <StarsBackground />

      <div className="content-container">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          메이플 경매장 트래커
        </h1>
        <p className="text-lg text-purple-200 mb-8">
          아이템의 지난 시세를 여기서 편하게 찾아볼 수 있답니다!
        </p>

        <div className="mb-6">
          {/* Enhanced toggle with buttons on either side */}
          <div className="toggle-container">
            <div
              className={`toggle-slider ${!isItemSearch ? "right" : ""}`}
              aria-hidden="true"
            ></div>
            <button
              className={`toggle-button ${
                isItemSearch ? "text-white" : "text-purple-300"
              }`}
              onClick={() => setIsItemSearch(true)}
              type="button"
            >
              <Package className="inline-block mr-2 h-4 w-4" />
              아이템 검색
            </button>
            <button
              className={`toggle-button ${
                !isItemSearch ? "text-white" : "text-purple-300"
              }`}
              onClick={() => setIsItemSearch(false)}
              type="button"
            >
              <User className="inline-block mr-2 h-4 w-4" />
              캐릭터 검색
            </button>
          </div>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder={isItemSearch ? "아이템 검색..." : "캐릭터 검색..."}
              value={searchQuery}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue);
                setSelectedItem(null); // 입력 변경 시 선택된 아이템 초기화

                // 아이디 검색 모드일 때는 자동완성 API 이용하지 않음
                if (!isItemSearch) {
                  setSuggestions([]);
                  setShowSuggestions(false);
                  return;
                }

                // 이전 디바운스 타이머 취소
                if (debounceTimer) {
                  clearTimeout(debounceTimer);
                }

                // 2글자 미만이면 자동완성 숨기기
                if (newValue.length < 2) {
                  setSuggestions([]);
                  setShowSuggestions(false);
                  return;
                }

                // 스페이스바 입력 감지
                if (newValue.endsWith(" ") && newValue.trim().length >= 2) {
                  fetchSuggestions(newValue.trim());
                  return;
                }

                // 0.5초 디바운스 설정
                const timer = setTimeout(() => {
                  setDebounceTimer(timer);
                  fetchSuggestions(newValue);
                }, 500);
              }}
              className="search-input"
            />
            {showSuggestions && (
              <div className="suggestions-container">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleItemSelect(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            <Search className="search-icon" />
          </div>
          <button
            className="search-button"
            onClick={() => {
              if (isItemSearch) {
                // 아이템 검색 모드: 옵션 선택 버튼
                if (searchQuery.trim().length >= 2) {
                  handleItemSelect(searchQuery.trim());
                }
              } else {
                // 캐릭터 검색 모드: 검색 버튼
                if (searchQuery.trim()) {
                  router.push(
                    `/character/${encodeURIComponent(searchQuery.trim())}`
                  );
                }
              }
            }}
            type="button"
          >
            {isItemSearch ? (
              <>
                <Filter className="mr-2 h-4 w-4" />
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Animated options panel */}
        <div className={isItemSearch ? "slide-enter" : "slide-exit"}>
          {optionsVisible && (
            <div className="options-wrapper">
              <ItemOptions
                isActive={!!selectedItem}
                itemName={selectedItem}
                availableOptions={itemOptions}
                isLoading={isLoadingOptions}
              />

              {selectedItem && itemOptions && (
                <div className="search-button-container">
                  <button
                    className="search-button-large"
                    onClick={() => handleSearch()}
                    type="button"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    검색
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
