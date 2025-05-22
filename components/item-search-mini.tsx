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
    const response = await fetch(
      "https://dev.maplemarket.today/api/autocomplete",
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
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();

  // 아이템 옵션 훅 사용
  const {
    starForce,
    potentialOption,
    additionalPotentialOption,
    statType,
    enchantedFlag,
    selectedOptionIds,
    activePath,
    handleStarForceChange,
    handlePotentialOptionChange,
    handleAdditionalPotentialOptionChange,
    handleStatTypeChange,
    handleEnchantedFlagChange,
    setActivePathValue,
    getCategoryOptions,
    isEnchantedFlagAvailable,
    resetOptions,
    selectAllSubOptions,
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

  // 검색 버튼 클릭 핸들러
  const handleSearch = async () => {
    if (selectedItem) {
      try {
        setIsSearching(true);

        // 선택된 옵션 ID가 있는 경우에만 검색 진행
        if (selectedOptionIds.length > 0) {
          // 선택된 옵션 ID를 로컬 스토리지에 저장
          localStorage.setItem(
            `optionIds_${selectedItem}`,
            JSON.stringify(selectedOptionIds)
          );

          // 아이템 상세 페이지로 이동
          router.push(`/item/${encodeURIComponent(selectedItem)}`);
        } else {
          // 옵션이 선택되지 않았을 때 알림
          alert(
            "모든 필수 옵션(스타포스, 잠재능력, 에디셔널 잠재능력, 스탯타입)을 선택해주세요."
          );
        }
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // 카테고리별 옵션 가져오기
  const getOptionsForCategory = (categoryId: string) => {
    return getCategoryOptions(categoryId, activePath).map((option) => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
      combinationInfo: option.combinationInfo,
    }));
  };

  // 카테고리별 선택된 값 가져오기
  const getSelectedValues = (categoryId: string) => {
    if (categoryId === "starForce") return starForce;
    if (categoryId === "statType") return statType;
    if (categoryId === "potentialOption") return potentialOption;
    if (categoryId === "additionalPotentialOption")
      return additionalPotentialOption;
    return [];
  };

  // 노작 여부 변경 핸들러 (인챈트의 반대)
  const handleNoEnchantChange = (checked: boolean) => {
    handleEnchantedFlagChange(!checked);
  };
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
              {(starForce.length > 0 ||
                potentialOption.length > 0 ||
                additionalPotentialOption.length > 0 ||
                statType.length > 0 ||
                enchantedFlag) && (
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
            {/* 노작 여부 체크박스를 상단으로 이동 */}
            <div className="mini-option-item mini-checkbox-container">
              <input
                type="checkbox"
                id="mini-no-enchant-flag"
                checked={!enchantedFlag}
                onChange={(e) => {
                  handleNoEnchantChange(e.target.checked);
                }}
                className="mini-checkbox-input"
              />
              <label
                htmlFor="mini-no-enchant-flag"
                className="mini-checkbox-label"
              >
                노작 여부
              </label>
            </div>

            <div className="mini-option-item">
              <label htmlFor="mini-star-force" className="mini-option-label">
                스타포스
              </label>
              <CustomSelect
                options={getOptionsForCategory("starForce")}
                value={starForce}
                onChange={(value) => {
                  handleStarForceChange(value);
                  if (Array.isArray(value) && value.length === 1) {
                    selectAllSubOptions("starForce", value[0]);
                  }
                }}
                placeholder="선택"
                mini={true}
                multiple={true}
              />
            </div>

            <div className="mini-option-item">
              <label htmlFor="mini-stat-type" className="mini-option-label">
                스탯타입
              </label>
              <CustomSelect
                options={getOptionsForCategory("statType")}
                value={statType}
                onChange={(value) => {
                  handleStatTypeChange(value);
                  if (
                    Array.isArray(value) &&
                    value.length === 1 &&
                    activePath?.starForce
                  ) {
                    selectAllSubOptions("statType", value[0]);
                  }
                }}
                placeholder="선택"
                mini={true}
                disabled={starForce.length === 0}
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
                options={getOptionsForCategory("potentialOption")}
                value={potentialOption}
                onChange={(value) => {
                  handlePotentialOptionChange(value);
                  if (
                    Array.isArray(value) &&
                    value.length === 1 &&
                    activePath?.starForce &&
                    activePath?.statType
                  ) {
                    selectAllSubOptions("potentialOption", value[0]);
                  }
                }}
                placeholder="선택"
                mini={true}
                disabled={starForce.length === 0 || statType.length === 0}
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
                options={getOptionsForCategory("additionalPotentialOption")}
                value={additionalPotentialOption}
                onChange={handleAdditionalPotentialOptionChange}
                placeholder="선택"
                mini={true}
                disabled={
                  starForce.length === 0 ||
                  statType.length === 0 ||
                  potentialOption.length === 0
                }
                multiple={true}
              />
            </div>
          </div>

          <div className="mini-search-action">
            <button
              className={`mini-search-action-button ${
                selectedOptionIds.length === 0 ? "opacity-70" : ""
              } ${isSearching ? "searching" : ""}`}
              onClick={handleSearch}
              disabled={isSearching}
              type="button"
            >
              {isSearching ? (
                <>
                  <div className="mini-spinner mr-1"></div>
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="mr-1 h-3 w-3" />
                  {selectedOptionIds.length > 0
                    ? `${selectedOptionIds.length}개 옵션으로 검색`
                    : "검색"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        /* 노작 여부 토글 스위치 스타일 */
        .mini-no-enchant-toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background-color: rgba(26, 26, 46, 0.3);
          border-radius: 0.375rem;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(60, 27, 153, 0.3);
        }

        .mini-no-enchant-label {
          font-weight: 500;
          color: white;
          font-size: 0.75rem;
        }

        .mini-toggle-switch {
          position: relative;
          width: 36px;
          height: 20px;
          background-color: #374151;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .mini-toggle-switch-on {
          background-color: #8b5cf6;
        }

        .mini-toggle-switch-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .mini-toggle-switch-on .mini-toggle-switch-slider {
          transform: translateX(16px);
        }
      `}</style>
    </div>
  );
}
