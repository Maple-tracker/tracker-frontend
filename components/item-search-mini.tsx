"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const [starForce, setStarForce] = useState("");
  const [upperPotential, setUpperPotential] = useState("");
  const [lowerPotentialGrade, setLowerPotentialGrade] = useState("");
  const [noDrag, setNoDrag] = useState(false);

  const router = useRouter();

  // 컴포넌트 마운트 시 현재 아이템명 설정
  useEffect(() => {
    setSearchQuery(currentItemName);
    setSelectedItem(currentItemName);
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
    setSelectedItem(itemName);
    setSearchQuery(itemName);
    setShowSuggestions(false);

    const options = await fetchItemOptions(itemName);
    setItemOptions(options);
  };

  const handleSearch = () => {
    if (selectedItem) {
      // 선택된 옵션 정보와 함께 상세 페이지로 이동
      router.push(`/item/${encodeURIComponent(selectedItem)}`);
    }
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
        />
        <Search className="mini-search-icon" />
        {showSuggestions && (
          <div className="mini-suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="mini-suggestion-item"
                onClick={() => handleItemSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
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
          className="mini-search-button"
          onClick={handleSearch}
          type="button"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showOptions && (
        <div className="mini-options-panel">
          <div className="mini-options-grid">
            <div className="mini-option-item">
              <label htmlFor="mini-star-force" className="mini-option-label">
                스타포스
              </label>
              <select
                id="mini-star-force"
                value={starForce}
                onChange={(e) => setStarForce(e.target.value)}
                className="mini-select-input"
              >
                <option value="" disabled>
                  선택
                </option>
                {itemOptions?.starForce?.map(
                  (option: string, index: number) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                ) || (
                  <>
                    <option value="0성">0성</option>
                    <option value="10성">10성</option>
                    <option value="15성">15성</option>
                    <option value="17성">17성</option>
                    <option value="20성">20성</option>
                    <option value="22성">22성</option>
                    <option value="25성">25성</option>
                  </>
                )}
              </select>
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-upper-potential"
                className="mini-option-label"
              >
                윗잠재능력 %
              </label>
              <select
                id="mini-upper-potential"
                value={upperPotential}
                onChange={(e) => setUpperPotential(e.target.value)}
                className="mini-select-input"
              >
                <option value="" disabled>
                  선택
                </option>
                {itemOptions?.upperPotential?.map(
                  (option: string, index: number) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                ) || (
                  <>
                    <option value="3%">3%</option>
                    <option value="6%">6%</option>
                    <option value="9%">9%</option>
                    <option value="12%">12%</option>
                    <option value="15%">15%</option>
                    <option value="18%">18%</option>
                    <option value="21%">21%</option>
                    <option value="24%">24%</option>
                    <option value="27%">27%</option>
                    <option value="30%">30%</option>
                  </>
                )}
              </select>
            </div>

            <div className="mini-option-item">
              <label
                htmlFor="mini-lower-potential"
                className="mini-option-label"
              >
                아랫잠재능력 등급
              </label>
              <select
                id="mini-lower-potential"
                value={lowerPotentialGrade}
                onChange={(e) => setLowerPotentialGrade(e.target.value)}
                className="mini-select-input"
              >
                <option value="" disabled>
                  선택
                </option>
                {itemOptions?.lowerPotentialGrade?.map(
                  (option: string, index: number) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                ) || (
                  <>
                    <option value="레어">레어</option>
                    <option value="에픽">에픽</option>
                    <option value="유니크">유니크</option>
                    <option value="레전더리">레전더리</option>
                  </>
                )}
              </select>
            </div>

            <div className="mini-option-item mini-checkbox-container">
              <input
                type="checkbox"
                id="mini-no-drag"
                checked={noDrag}
                onChange={(e) => setNoDrag(e.target.checked)}
                className="mini-checkbox-input"
                disabled={!itemOptions?.hasNoDrag}
              />
              <label
                htmlFor="mini-no-drag"
                className={`mini-checkbox-label ${
                  !itemOptions?.hasNoDrag ? "opacity-50" : ""
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
