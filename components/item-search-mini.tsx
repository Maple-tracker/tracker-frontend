"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/custom-select";
import { useToast } from "@/contexts/toast-context";

// 자동완성 API 호출 함수
const fetchAutocompleteSuggestions = async (query: string) => {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      "http://localhost:8080/api/item_name/completion",
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
      `/api/item-options?name=${encodeURIComponent(itemName)}`
    );

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

    // 목업 데이터 - 실제 API 연결 시 제거
    // return {
    //   combinations: [
    //     {
    //       id: "opt1",
    //       starForce: "0성",
    //       upperPotential: "3%",
    //       lowerPotentialGrade: "레어",
    //       statType: "STR",
    //       hasNoDrag: false,
    //     },
    //     {
    //       id: "opt2",
    //       starForce: "10성",
    //       upperPotential: "6%",
    //       lowerPotentialGrade: "에픽",
    //       statType: "DEX",
    //       hasNoDrag: false,
    //     },
    //     {
    //       id: "opt3",
    //       starForce: "15성",
    //       upperPotential: "9%",
    //       lowerPotentialGrade: "유니크",
    //       statType: "INT",
    //       hasNoDrag: true,
    //     },
    //     {
    //       id: "opt4",
    //       starForce: "17성",
    //       upperPotential: "12%",
    //       lowerPotentialGrade: "레전더리",
    //       statType: "LUK",
    //       hasNoDrag: true,
    //     },
    //     {
    //       id: "opt5",
    //       starForce: "20성",
    //       upperPotential: "15%",
    //       lowerPotentialGrade: "레어",
    //       statType: "올스탯",
    //       hasNoDrag: false,
    //     },
    //     {
    //       id: "opt6",
    //       starForce: "22성",
    //       upperPotential: "18%",
    //       lowerPotentialGrade: "에픽",
    //       statType: "STR",
    //       hasNoDrag: true,
    //     },
    //     {
    //       id: "opt7",
    //       starForce: "25성",
    //       upperPotential: "21%",
    //       lowerPotentialGrade: "유니크",
    //       statType: "DEX",
    //       hasNoDrag: false,
    //     },
    //   ],
    //   availableOptions: {
    //     starForce: ["0성", "10성", "15성", "17성", "20성", "22성", "25성"],
    //     upperPotential: [
    //       "3%",
    //       "6%",
    //       "9%",
    //       "12%",
    //       "15%",
    //       "18%",
    //       "21%",
    //       "24%",
    //       "27%",
    //       "30%",
    //     ],
    //     lowerPotentialGrade: ["레어", "에픽", "유니크", "레전더리"],
    //     statType: ["STR", "DEX", "INT", "LUK", "올스탯"],
    //     hasNoDrag: true,
    //   },
    // };
  } catch (error) {
    console.error("아이템 옵션 정보 가져오기 실패:", error);
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
  const [itemOptions, setItemOptions] = useState<any>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // 토스트 훅 사용
  const { showToast } = useToast();

  // 옵션 상태 관리
  const [starForce, setStarForce] = useState("");
  const [upperPotential, setUpperPotential] = useState("");
  const [lowerPotentialGrade, setLowerPotentialGrade] = useState("");
  const [statType, setStatType] = useState("");
  const [noDrag, setNoDrag] = useState(false);

  // 현재 선택 가능한 옵션 조합들
  const [filteredCombinations, setFilteredCombinations] = useState<any[]>([]);

  // 선택된 옵션 ID
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const router = useRouter();

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
          if (options?.combinations) {
            setFilteredCombinations(options.combinations);
          }
        })
        .catch((error) => {
          showToast(
            error instanceof Error
              ? error.message
              : "아이템 옵션 정보를 가져오는 중 오류가 발생했습니다.",
            "error"
          );
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [currentItemName, showToast]);

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
    setSelectedOptionId(null);

    // 옵션 초기화
    setStarForce("");
    setUpperPotential("");
    setLowerPotentialGrade("");
    setStatType("");
    setNoDrag(false);
    setIsLoadingOptions(true);

    try {
      const options = await fetchItemOptions(itemName);
      setItemOptions(options);
      setSelectedItem(itemName); // 성공 시에만 선택된 아이템 설정
      if (options?.combinations) {
        setFilteredCombinations(options.combinations);
      }
    } catch (error) {
      // 오류 발생 시 토스트 메시지 표시
      showToast(
        error instanceof Error
          ? error.message
          : "아이템 옵션 정보를 가져오는 중 오류가 발생했습니다.",
        "error"
      );
      setSelectedItem(null); // 오류 발생 시 선택된 아이템 초기화
      setItemOptions(null);
      setFilteredCombinations([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // 옵션 선택 시 다른 옵션 필터링
  type OptionField =
    | "starForce"
    | "upperPotential"
    | "lowerPotentialGrade"
    | "statType"
    | "hasNoDrag";
  type OptionValue<T extends OptionField> = T extends "hasNoDrag"
    ? boolean
    : string;

  const updateAvailableOptions = <T extends OptionField>(
    field: T,
    value: OptionValue<T>
  ) => {
    if (!itemOptions?.combinations) return;

    // 현재 선택된 옵션들
    const currentSelections = {
      starForce,
      upperPotential,
      lowerPotentialGrade,
      statType,
      hasNoDrag: noDrag,
    };

    // 새로 선택된 옵션 업데이트
    currentSelections[field] = value as any; // 타입 캐스팅으로 오류 해결

    // 선택된 옵션에 맞는 조합 필터링
    const newFilteredCombinations = itemOptions.combinations.filter(
      (combo: any) => {
        return (
          (!currentSelections.starForce ||
            combo.starForce === currentSelections.starForce) &&
          (!currentSelections.upperPotential ||
            combo.upperPotential === currentSelections.upperPotential) &&
          (!currentSelections.lowerPotentialGrade ||
            combo.lowerPotentialGrade ===
              currentSelections.lowerPotentialGrade) &&
          (!currentSelections.statType ||
            combo.statType === currentSelections.statType) &&
          (currentSelections.hasNoDrag === false ||
            combo.hasNoDrag === currentSelections.hasNoDrag)
        );
      }
    );

    setFilteredCombinations(newFilteredCombinations);

    // 모든 옵션이 선택되었는지 확인
    const allSelected =
      currentSelections.starForce !== "" &&
      currentSelections.upperPotential !== "" &&
      currentSelections.lowerPotentialGrade !== "" &&
      currentSelections.statType !== "";

    // 정확히 하나의 조합만 남았거나 모든 옵션이 선택된 경우
    if (newFilteredCombinations.length === 1 && allSelected) {
      setSelectedOptionId(newFilteredCombinations[0].id);
    } else {
      setSelectedOptionId(null);
    }
  };

  const handleSearch = () => {
    if (selectedItem) {
      // 선택된 옵션 정보와 함께 상세 페이지로 이동
      if (selectedOptionId) {
        router.push(
          `/item/${encodeURIComponent(
            selectedItem
          )}?optionId=${selectedOptionId}`
        );
      } else {
        router.push(`/item/${encodeURIComponent(selectedItem)}`);
      }
    }
  };

  // 현재 선택 가능한 스타포스 옵션 목록
  const getAvailableStarForceOptions = () => {
    if (!filteredCombinations.length) return [];

    const options = [
      ...new Set(filteredCombinations.map((combo) => combo.starForce)),
    ];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
  };

  // 현재 선택 가능한 윗잠재능력 옵션 목록
  const getAvailableUpperPotentialOptions = () => {
    if (!filteredCombinations.length) return [];

    const options = [
      ...new Set(filteredCombinations.map((combo) => combo.upperPotential)),
    ];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
  };

  // 현재 선택 가능한 아랫잠재능력 옵션 목록
  const getAvailableLowerPotentialGradeOptions = () => {
    if (!filteredCombinations.length) return [];

    const options = [
      ...new Set(
        filteredCombinations.map((combo) => combo.lowerPotentialGrade)
      ),
    ];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
  };

  // 현재 선택 가능한 스탯타입 옵션 목록
  const getAvailableStatTypeOptions = () => {
    if (!filteredCombinations.length) return [];
    const options = [
      ...new Set(filteredCombinations.map((combo) => combo.statType)),
    ];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
  };

  // 노작여부 선택 가능 여부
  const isNoDragAvailable = () => {
    return filteredCombinations.some((combo) => combo.hasNoDrag);
  };

  // 옵션 데이터 포맷팅
  const starForceOptions = getAvailableStarForceOptions();
  const upperPotentialOptions = getAvailableUpperPotentialOptions();
  const lowerPotentialGradeOptions = getAvailableLowerPotentialGradeOptions();
  const statTypeOptions = getAvailableStatTypeOptions();

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
            setSelectedOptionId(null); // 입력 변경 시 선택된 옵션 초기화

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
          className={`mini-search-button ${
            !selectedItem || (selectedItem && !selectedOptionId)
              ? "opacity-50"
              : ""
          }`}
          onClick={handleSearch}
          disabled={
            !selectedItem || (selectedItem && !selectedOptionId) ? true : false
          }
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
          <div className="mini-options-grid">
            <div className="mini-option-item">
              <label htmlFor="mini-star-force" className="mini-option-label">
                스타포스
              </label>
              <CustomSelect
                options={starForceOptions}
                value={starForce}
                onChange={(value) => {
                  setStarForce(value);
                  updateAvailableOptions("starForce", value);
                }}
                placeholder="선택"
                mini={true}
              />
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-upper-potential"
                className="mini-option-label"
              >
                윗잠재능력 %
              </label>
              <CustomSelect
                options={upperPotentialOptions}
                value={upperPotential}
                onChange={(value) => {
                  setUpperPotential(value);
                  updateAvailableOptions("upperPotential", value);
                }}
                placeholder="선택"
                mini={true}
              />
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-lower-potential"
                className="mini-option-label"
              >
                아랫잠재능력 등급
              </label>
              <CustomSelect
                options={lowerPotentialGradeOptions}
                value={lowerPotentialGrade}
                onChange={(value) => {
                  setLowerPotentialGrade(value);
                  updateAvailableOptions("lowerPotentialGrade", value);
                }}
                placeholder="선택"
                mini={true}
              />
            </div>

            <div className="mini-option-item">
              <label htmlFor="mini-stat-type" className="mini-option-label">
                스탯타입
              </label>
              <CustomSelect
                options={statTypeOptions}
                value={statType}
                onChange={(value) => {
                  setStatType(value);
                  updateAvailableOptions("statType", value);
                }}
                placeholder="선택"
                mini={true}
              />
            </div>

            <div className="mini-option-item mini-checkbox-container">
              <input
                type="checkbox"
                id="mini-no-drag"
                checked={noDrag}
                onChange={(e) => {
                  setNoDrag(e.target.checked);
                  updateAvailableOptions("hasNoDrag", e.target.checked);
                }}
                className="mini-checkbox-input"
                disabled={!isNoDragAvailable()}
              />
              <label
                htmlFor="mini-no-drag"
                className={`mini-checkbox-label ${
                  !isNoDragAvailable() ? "opacity-50" : ""
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
