"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useItemOptions, type ItemOptionsData } from "@/hooks/use-item-options";
import { CustomSelect } from "./custom-select";

// 자동완성 API 호출 함수
const fetchAutocompleteSuggestions = async (query: string) => {
  if (query.length < 2) return [];

  try {
    const response = await fetch("/api/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: query }),
    });

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
    // API 호출
    const response = await fetch("/api/item-options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemName }),
    });

    // 404 오류 처리
    if (response.status === 404) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "해당 아이템 시세 데이터가 존재하지 않습니다."
      );
    }

    if (!response.ok) {
      throw new Error("아이템 옵션 정보를 가져오는 중 오류가 발생했습니다.");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

type ItemSearchMiniProps = {
  currentItemName: string;
};

export function ItemSearchMini({ currentItemName }: ItemSearchMiniProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemOptions, setItemOptions] = useState<ItemOptionsData | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const router = useRouter();

  // 아이템 옵션 훅 사용
  const {
    starForce,
    potentialOption,
    additionalPotentialOption,
    statType,
    enchantedFlag,
    selectedOptionIds,
    handleStarForceChange,
    handlePotentialOptionChange,
    handleAdditionalPotentialOptionChange,
    handleStatTypeChange,
    handleEnchantedFlagChange,
    getAvailableStarForceOptions,
    getAvailablePotentialOptions,
    getAvailableAdditionalPotentialOptions,
    getAvailableStatTypeOptions,
    isEnchantedFlagAvailable,
    resetOptions,
  } = useItemOptions(itemOptions);

  // 컴포넌트 마운트 시 현재 아이템명 설정
  useEffect(() => {
    setSearchQuery(currentItemName);
    setSelectedItem(currentItemName);

    // 현재 아이템에 대한 옵션 정보 가져오기
    if (currentItemName) {
      setIsLoadingOptions(true);
      fetchItemOptions(currentItemName)
        .then((options) => {
          setItemOptions(options);
        })
        .catch((error) => {
          console.error(
            "아이템 옵션 정보를 가져오는 중 오류가 발생했습니다:",
            error
          );
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [currentItemName]);

  const fetchSuggestions = async (query: string) => {
    if (query.length >= 2) {
      const results = await fetchAutocompleteSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // 아이템 선택 시 옵션 정보 가져오기
  const handleItemSelect = async (itemName: string) => {
    setSearchQuery(itemName);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1); // 선택된 인덱스 초기화
    resetOptions();

    setIsLoadingOptions(true);
    try {
      const options = await fetchItemOptions(itemName);
      setItemOptions(options);
      setSelectedItem(itemName); // 성공 시에만 선택된 아이템 설정
    } catch (error) {
      console.error(
        "아이템 옵션 정보를 가져오는 중 오류가 발생했습니다:",
        error
      );
      setSelectedItem(null); // 오류 발생 시 선택된 아이템 초기화
      setItemOptions(null);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleSearch = () => {
    if (selectedItem) {
      // POST 요청으로 변경
      router.push(`/item/${encodeURIComponent(selectedItem)}`);
    }
  };

  // 옵션 데이터 포맷팅
  const starForceOptions = getAvailableStarForceOptions();
  const potentialOptions = getAvailablePotentialOptions();
  const additionalPotentialOptions = getAvailableAdditionalPotentialOptions();
  const statTypeOptions = getAvailableStatTypeOptions();

  // 옵션이 하나라도 선택되었는지 확인
  const hasSelectedOptions =
    starForce.length > 0 ||
    potentialOption.length > 0 ||
    additionalPotentialOption.length > 0 ||
    statType.length > 0 ||
    enchantedFlag;

  return (
    <div className="mini-search-container">
      <div className="mini-search-input-wrapper">
        <input
          type="text"
          placeholder="아이템 검색..."
          value={searchQuery}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchQuery(newValue);
            setSelectedItem(null); // 입력 변경 시 선택된 아이템 초기화

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

            // 0.5초 디바운스 설정
            const timer = setTimeout(() => {
              fetchSuggestions(newValue);
            }, 500);

            setDebounceTimer(timer);
          }}
          className="mini-search-input"
          onKeyDown={(e) => {
            // 자동완성 목록이 표시되지 않은 경우 처리하지 않음
            if (!showSuggestions || suggestions.length === 0) {
              // 엔터키 처리 - 일반 검색
              if (e.key === "Enter") {
                handleSearch();
              }
              return;
            }

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
            else if (e.key === "Enter") {
              e.preventDefault(); // 폼 제출 방지
              if (selectedSuggestionIndex >= 0) {
                handleItemSelect(suggestions[selectedSuggestionIndex]);
              } else {
                handleSearch();
              }
            }
          }}
        />
        <Search className="mini-search-icon" />
      </div>

      <div className="mini-search-buttons">
        <button
          className="mini-option-button"
          onClick={() => setShowOptions(!showOptions)}
          type="button"
        >
          <Filter className="h-4 w-4" />
        </button>

        <button
          className={`mini-search-button ${!selectedItem ? "opacity-50" : ""}`}
          onClick={handleSearch}
          disabled={!selectedItem}
          type="button"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showSuggestions && (
        <div className="mini-suggestions-container">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`mini-suggestion-item ${
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

      {showOptions && (
        <div className="mini-options-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h4 className="text-sm font-medium text-white">옵션 선택</h4>
            <div style={{ marginLeft: "auto" }}>
              {hasSelectedOptions && (
                <button
                  onClick={resetOptions}
                  style={{
                    backgroundColor: "rgba(76, 29, 149, 0.3)",
                    color: "#c1abff",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    border: "none",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(76, 29, 149, 0.5)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(76, 29, 149, 0.3)")
                  }
                  type="button"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          <div className="mini-options-grid">
            <div className="mini-option-item">
              <label htmlFor="mini-star-force" className="mini-option-label">
                스타포스
              </label>
              <CustomSelect
                options={starForceOptions}
                value={starForce}
                onChange={handleStarForceChange}
                placeholder="선택"
                mini={true}
                disabled={enchantedFlag}
                multiple={true}
              />
            </div>

            <div className="mini-option-item">
              <label htmlFor="mini-stat-type" className="mini-option-label">
                스탯타입
              </label>
              <CustomSelect
                options={statTypeOptions}
                value={statType}
                onChange={handleStatTypeChange}
                placeholder="선택"
                mini={true}
                disabled={enchantedFlag}
                multiple={true}
              />
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-potential-option"
                className="mini-option-label"
              >
                잠재능력 %
              </label>
              <CustomSelect
                options={potentialOptions}
                value={potentialOption}
                onChange={handlePotentialOptionChange}
                placeholder="선택"
                mini={true}
                disabled={enchantedFlag}
                multiple={true}
              />
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-additional-potential-option"
                className="mini-option-label"
              >
                에디셔널 잠재능력
              </label>
              <CustomSelect
                options={additionalPotentialOptions}
                value={additionalPotentialOption}
                onChange={handleAdditionalPotentialOptionChange}
                placeholder="선택"
                mini={true}
                disabled={enchantedFlag}
                multiple={true}
              />
            </div>

            <div className="mini-option-item mini-checkbox-container">
              <input
                type="checkbox"
                id="mini-enchanted-flag"
                checked={enchantedFlag}
                onChange={(e) => {
                  handleEnchantedFlagChange(e.target.checked);
                }}
                className="mini-checkbox-input"
                disabled={!isEnchantedFlagAvailable()}
              />
              <label
                htmlFor="mini-enchanted-flag"
                className={`mini-checkbox-label ${
                  !isEnchantedFlagAvailable() ? "opacity-50" : ""
                }`}
              >
                노작 여부
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
