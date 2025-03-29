"use client";

import { useState, useEffect } from "react";
import { Search, User, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { ItemOptions } from "@/components/item-options";
import { StarsBackground } from "@/components/stars-background";

// 자동완성 API 호출 함수
const fetchAutocompleteSuggestions = async (query: string, isItem: boolean) => {
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

export function SearchPage() {
  const [isItemSearch, setIsItemSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(true);
  const router = useRouter();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchSuggestions = async (query: string) => {
    if (query.length >= 2) {
      const results = await fetchAutocompleteSuggestions(query, isItemSearch);
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

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      // In a real app, we would encode the query properly
      router.push(`/item/${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
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
                  fetchSuggestions(newValue);
                }, 500);

                setDebounceTimer(timer);
              }}
              className="search-input"
            />
            <Search className="search-icon" />
          </div>
          <button
            className="search-button"
            onClick={() => handleSearch()}
            type="button"
          >
            검색
          </button>
        </div>

        {showSuggestions && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Animated options panel */}
        <div className={isItemSearch ? "slide-enter" : "slide-exit"}>
          {optionsVisible && <ItemOptions />}
        </div>
      </div>
    </div>
  );
}
