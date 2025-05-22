"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, Package, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { ItemOptions } from "@/components/item-options";
import { StarsBackground } from "@/components/stars-background";
import { CharacterSearchResults } from "@/components/character-search-results";

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
    const response = await fetch(
      `https://dev.maplemarket.today/api/item_name/options?name=${encodeURIComponent(
        itemName
      )}`
    );
    if (response.ok) {
      return await response.json();
    }
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
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );
  const [itemOptions, setItemOptions] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);

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
    // 검색 모드 변경 시 상태 초기화
    setSearchQuery("");
    setSelectedItem(null);
    setSelectedCharacter(null);
    setSelectedOptionIds([]);
    setSuggestions([]);
    setShowSuggestions(false);
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
    setSelectedOptionIds([]);
    setSelectedSuggestionIndex(-1);

    setIsLoadingOptions(true);
    const options = await fetchItemOptions(itemName);
    setItemOptions(options);
    setIsLoadingOptions(false);
  };

  // 옵션 선택 핸들러
  const handleOptionSelect = (optionIds: number[]) => {
    setSelectedOptionIds(optionIds);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = async () => {
    if (selectedItem) {
      // 아이템 검색 모드
      try {
        setIsSearching(true);
        // 선택된 옵션 ID를 로컬 스토리지에 저장
        if (selectedOptionIds.length > 0) {
          localStorage.setItem(
            `optionIds_${selectedItem}`,
            JSON.stringify(selectedOptionIds)
          );
          // 아이템 상세 페이지로 이동
          router.push(`/item/${encodeURIComponent(selectedItem)}`);
        } else {
          alert(
            "모든 필수 옵션(스타포스, 잠재능력, 에디셔널 잠재능력, 스탯타입)을 선택해주세요."
          );
        }
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
        // 오류 처리 (예: 토스트 메시지 표시)
      } finally {
        setIsSearching(false);
      }
    } else if (searchQuery.trim()) {
      // 캐릭터 검색 모드
      if (isItemSearch) {
        // 아이템 검색 모드에서 선택된 아이템이 없는 경우 옵션 정보 가져오기 시도
        handleItemSelect(searchQuery.trim());
      } else {
        router.push(`/character/${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [showSuggestions]);

  return (
    <div className="magical-gradient">
      <div className="aurora-gradient animate-aurora"></div>
      <StarsBackground />

      <div className="content-container">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          메이플마켓.today
        </h1>
        <p className="text-lg text-purple-200 mb-8">
          오늘의 메이플스토리 경매장 시세를 찾아보세요!<br></br>
          과거부터 오늘까지의 시세를 여기서 편하게 찾아볼 수 있답니다!
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

                if (isItemSearch) {
                  setSelectedItem(null); // 입력 변경 시 선택된 아이템 초기화
                  setSelectedOptionIds([]); // 입력 변경 시 선택된 옵션 초기화
                } else {
                  setSelectedCharacter(null); // 입력 변경 시 선택된 캐릭터 초기화
                }

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

                // 1글자 미만이면 자동완성 숨기기
                if (newValue.length < 1) {
                  setSuggestions([]);
                  setShowSuggestions(false);
                  return;
                }

                // 스페이스바 입력 감지
                if (newValue.endsWith(" ") && newValue.trim().length >= 2) {
                  fetchSuggestions(newValue.trim());
                  return;
                }

                // 0.1초 디바운스 설정
                const timer = setTimeout(() => {
                  setDebounceTimer(timer);
                  fetchSuggestions(newValue);
                }, 100);
              }}
              className="search-input"
              onKeyDown={(e) => {
                // 엔터키 처리
                if (e.key === "Enter") {
                  // 자동완성 목록에서 항목이 선택된 경우
                  if (showSuggestions && selectedSuggestionIndex >= 0) {
                    e.preventDefault(); // 기본 동작 방지
                    handleItemSelect(suggestions[selectedSuggestionIndex]);
                  } else {
                    // 선택된 항목이 없는 경우 일반 검색 실행
                    handleSearch();
                  }
                  return;
                }

                // 자동완성 목록이 표시되지 않은 경우 처리하지 않음
                if (!showSuggestions || suggestions.length === 0) return;

                // 위 화살표 키
                if (e.key === "ArrowUp") {
                  e.preventDefault(); // 커서가 맨 앞으로 이동하는 기본 동작 방지
                  setSelectedSuggestionIndex((prev) =>
                    prev <= 0 ? suggestions.length - 1 : prev - 1
                  );
                }
                // 아래 화살표 키
                else if (e.key === "ArrowDown") {
                  e.preventDefault(); // 커서가 맨 뒤로 이동하는 기본 동작 방지
                  setSelectedSuggestionIndex((prev) =>
                    prev >= suggestions.length - 1 ? 0 : prev + 1
                  );
                }
                // Enter 키
                else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
                  e.preventDefault(); // 폼 제출 방지
                  handleItemSelect(suggestions[selectedSuggestionIndex]);
                }
              }}
            />
            {showSuggestions && (
              <div className="suggestions-container">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${
                      index === selectedSuggestionIndex
                        ? "suggestion-item-selected"
                        : ""
                    }`}
                    onClick={() => handleItemSelect(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            <Search className="search-icon" />
          </div>
        </div>

        {/* 아이템 검색 옵션 패널 */}
        {isItemSearch ? (
          <div className={isItemSearch ? "slide-enter" : "slide-exit"}>
            {optionsVisible && (
              <div className="options-wrapper">
                <ItemOptions
                  isActive={!!selectedItem}
                  itemName={selectedItem}
                  availableOptions={itemOptions}
                  isLoading={isLoadingOptions}
                  onOptionSelect={handleOptionSelect}
                />

                {selectedItem && itemOptions && (
                  <div className="search-button-container">
                    <button
                      className={`search-button-large ${
                        selectedOptionIds.length !== 0 && isItemSearch
                          ? "opacity-50"
                          : ""
                      }`}
                      onClick={handleSearch}
                      disabled={selectedOptionIds.length === 0 && isItemSearch}
                      type="button"
                    >
                      {isSearching ? (
                        <>
                          <div className="spinner mr-2"></div>
                          검색 중...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          {selectedOptionIds.length > 0
                            ? `${selectedOptionIds.length}개 옵션으로 검색`
                            : "검색"}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* 캐릭터 검색 결과 패널 */
          <div className={!isItemSearch ? "slide-enter" : "slide-exit"}>
            <CharacterSearchResults characterName={selectedCharacter} />
          </div>
        )}
      </div>
    </div>
  );
}
