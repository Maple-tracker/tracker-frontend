"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { useItemOptions, type CategoryPath } from "@/hooks/use-item-options";

type ItemOptionsProps = {
  isActive: boolean;
  itemName: string | null;
  availableOptions: any | null;
  isLoading: boolean;
  onOptionSelect: (optionIds: number[]) => void;
};
export function ItemOptions({
  isActive,
  itemName,
  availableOptions,
  isLoading,
  onOptionSelect,
}: ItemOptionsProps) {
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
    getOptionIdsForPath,
    isEnchantedFlagAvailable,
    isOptionSelected,
    getCurrentPath,
    resetOptions,
    selectAllSubOptions,
    getSelectedValues,
    selectedOptions,
  } = useItemOptions(availableOptions);

  // 펼쳐진 카테고리
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "starForce",
  ]);

  // 카테고리 정의 - 인챈트 여부를 제외
  const categories = [
    { id: "starForce", name: "스타포스", nextCategory: "statType" },
    { id: "statType", name: "스탯타입", nextCategory: "potentialOption" },
    {
      id: "potentialOption",
      name: "잠재능력 %",
      nextCategory: "additionalPotentialOption",
    },
    {
      id: "additionalPotentialOption",
      name: "에디셔널 잠재능력",
      nextCategory: null,
    },
  ];

  // 부모 컴포넌트에 선택된 옵션 ID 전달
  useEffect(() => {
    onOptionSelect(selectedOptionIds);
  }, [selectedOptionIds, onOptionSelect]);

  // 카테고리 토글
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // 옵션 선택 처리
  const handleOptionSelect = (categoryId: string, value: string) => {
    
    const currentPath = getCurrentPath(categoryId);

    // 이미 선택된 값인지 확인
    const isSelected = isOptionSelected(categoryId, value, currentPath);

    // 선택/해제 처리
    if (isSelected) {
      // 선택 해제: 현재 값과 하위 옵션 제거
      if (categoryId === "starForce") {
        const currentStarForce = getSelectedValues("starForce");
        handleStarForceChange(currentStarForce.filter((v) => v !== value));
      } else if (categoryId === "statType") {
        const currentStatType = getSelectedValues("statType", currentPath);
        handleStatTypeChange(
          currentStatType.filter((v) => v !== value),
          currentPath
        );
      } else if (categoryId === "potentialOption") {
        const currentPotential = getSelectedValues(
          "potentialOption",
          currentPath
        );
        handlePotentialOptionChange(
          currentPotential.filter((v) => v !== value),
          currentPath
        );
      } else if (categoryId === "additionalPotentialOption") {
        const currentAdditional = getSelectedValues(
          "additionalPotentialOption",
          currentPath
        );
        handleAdditionalPotentialOptionChange(
          currentAdditional.filter((v) => v !== value),
          currentPath
        );
      }
    } else {
      // 선택: 현재 값 추가
      if (categoryId === "starForce") {
        const currentStarForce = getSelectedValues("starForce");
        handleStarForceChange([...currentStarForce, value]);
        // 모든 하위 옵션 선택
        selectAllSubOptions("starForce", value);
      } else if (categoryId === "statType") {
        const currentStatType = getSelectedValues("statType", currentPath);
        handleStatTypeChange([...currentStatType, value], currentPath);
        // 모든 하위 옵션 선택
        selectAllSubOptions("statType", value);
      } else if (categoryId === "potentialOption") {
        const currentPotential = getSelectedValues(
          "potentialOption",
          currentPath
        );
        handlePotentialOptionChange([...currentPotential, value], currentPath);
        // 모든 하위 옵션 선택
        selectAllSubOptions("potentialOption", value);
      } else if (categoryId === "additionalPotentialOption") {
        const currentAdditional = getSelectedValues(
          "additionalPotentialOption",
          currentPath
        );
        handleAdditionalPotentialOptionChange(
          [...currentAdditional, value],
          currentPath
        );
      }
    }

    // 경로 업데이트는 별도로 처리
    let newPath: CategoryPath | null = null;
    if (categoryId === "starForce") {
      newPath = { starForce: value };
    } else if (categoryId === "statType" && activePath) {
      newPath = { ...activePath, statType: value };
    } else if (categoryId === "potentialOption" && activePath) {
      newPath = { ...activePath, potentialOption: value };
    } else if (categoryId === "additionalPotentialOption" && activePath) {
      newPath = { ...activePath, additionalPotentialOption: value };
    }

    if (newPath && !isSelected) {
      setActivePathValue(newPath);

      // 다음 카테고리 자동 펼치기
      const category = categories.find((cat) => cat.id === categoryId);
      if (
        category?.nextCategory &&
        !expandedCategories.includes(category.nextCategory)
      ) {
        setExpandedCategories([...expandedCategories, category.nextCategory]);
      }
    }
  };

  // 노작 여부 토글 (인챈트 여부의 반대)
  const handleNoEnchantToggle = () => {
    // 노작 여부를 토글합니다.
    // enchantedFlag가 true면 인챈트된 상태(노작 아님), false면 노작 상태입니다.
    handleEnchantedFlagChange(!enchantedFlag);
  };

  // 옵션 미리보기 처리
  const handlePreview = (categoryId: string, value: string) => {
    let newPath: CategoryPath | null = null;

    // 카테고리에 따라 새 경로 설정
    if (categoryId === "starForce") {
      newPath = { starForce: value };
    } else if (categoryId === "statType" && activePath?.starForce) {
      newPath = { starForce: activePath.starForce, statType: value };
    } else if (
      categoryId === "potentialOption" &&
      activePath?.starForce &&
      activePath?.statType
    ) {
      newPath = {
        starForce: activePath.starForce,
        statType: activePath.statType,
        potentialOption: value,
      };
    } else if (
      categoryId === "additionalPotentialOption" &&
      activePath?.starForce &&
      activePath?.statType &&
      activePath?.potentialOption
    ) {
      newPath = {
        starForce: activePath.starForce,
        statType: activePath.statType,
        potentialOption: activePath.potentialOption,
        additionalPotentialOption: value,
      };
    }

    // 활성 경로 업데이트
    if (newPath) setActivePathValue(newPath);

    // 다음 카테고리 자동 펼치기
    const category = categories.find((cat) => cat.id === categoryId);
    if (
      category?.nextCategory &&
      !expandedCategories.includes(category.nextCategory)
    ) {
      setExpandedCategories([...expandedCategories, category.nextCategory]);
    }
  };

  // 카테고리별 선택 개수 가져오기
  const getSelectionCount = (categoryId: string) => {
    const currentPath = getCurrentPath(categoryId);
    const values = getSelectedValues(categoryId, currentPath);
    return values.length;
  };

  // 카테고리별 옵션 가져오기
  const getOptionsForCategory = (categoryId: string) => {
    return getCategoryOptions(categoryId, activePath);
  };

  // 옵션 초기화
  const handleReset = () => {
    resetOptions();
    setExpandedCategories(["starForce"]);
  };

  return (
    <div className={`options-panel ${isActive ? "" : "options-disabled"}`}>
      {!isActive && (
        <div className="options-overlay">
          <div className="options-message">아이템명을 검색해주세요!</div>
        </div>
      )}

      <div className="options-header">
        <h3 className="text-lg font-medium text-white">추가 옵션</h3>
        <div>
          {(starForce.length > 0 ||
            statType.length > 0 ||
            potentialOption.length > 0 ||
            additionalPotentialOption.length > 0 ||
            enchantedFlag) && (
            <button
              onClick={handleReset}
              className="reset-button"
              type="button"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 노작 여부 슬라이드 버튼 - 최상단에 별도로 배치 */}
      <div className="no-enchant-toggle-container">
        <span className="no-enchant-label">노작 여부</span>
        <div
          className={`toggle-switch ${
            !enchantedFlag ? "toggle-switch-on" : ""
          }`}
          onClick={handleNoEnchantToggle}
        >
          <div className="toggle-switch-slider"></div>
        </div>
      </div>

      <div
        className={`horizontal-categories ${
          !enchantedFlag ? "categories-disabled" : ""
        }`}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-column ${
              getSelectionCount(category.id) > 0 ? "has-selections" : ""
            }`}
          >
            <div
              className={`category-header ${
                expandedCategories.includes(category.id) ? "expanded" : ""
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="category-title">
                <span>{category.name}</span>
                {getSelectionCount(category.id) > 0 && (
                  <span className="selection-count">
                    {getSelectionCount(category.id)}
                  </span>
                )}
              </div>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="options-list">
                {getOptionsForCategory(category.id).length > 0 ? (
                  // 일반 카테고리 옵션 처리
                  getOptionsForCategory(category.id).map((option) => {
                    const currentPath = getCurrentPath(category.id);
                    const selected = isOptionSelected(
                      category.id,
                      option.value,
                      currentPath
                    );

                    return (
                      <div key={option.value} className="option-row">
                        <div
                          className={`option-item ${
                            selected ? "selected" : ""
                          }`}
                        >
                          <div
                            className="option-checkbox"
                            onClick={() =>
                              handleOptionSelect(category.id, option.value)
                            }
                          >
                            {selected && (
                              <Check className="check-icon" size={12} />
                            )}
                          </div>
                          <div
                            className="option-content"
                            onClick={() =>
                              handleOptionSelect(category.id, option.value)
                            }
                          >
                            <span className="option-label">{option.label}</span>
                            {option.combinationInfo && (
                              <span className="option-info">
                                {option.combinationInfo}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Preview button */}
                        {category.nextCategory && (
                          <button
                            className={`preview-button ${
                              (activePath?.starForce === option.value &&
                                category.id === "starForce") ||
                              (activePath?.statType === option.value &&
                                category.id === "statType") ||
                              (activePath?.potentialOption === option.value &&
                                category.id === "potentialOption") ||
                              (activePath?.additionalPotentialOption ===
                                option.value &&
                                category.id === "additionalPotentialOption")
                                ? "active"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(category.id, option.value);
                            }}
                            title="하위 옵션 보기"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // 옵션이 없는 경우
                  <div className="no-options-message">
                    {category.id === "starForce"
                      ? "선택 가능한 옵션이 없습니다"
                      : "상위 카테고리를 먼저 선택해주세요"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .reset-button {
          background-color: rgba(76, 29, 149, 0.3);
          color: #c1abff;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s;
        }

        .reset-button:hover {
          background-color: rgba(76, 29, 149, 0.5);
        }

        /* 노작 여부 토글 스위치 스타일 */
        .no-enchant-toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background-color: rgba(26, 26, 46, 0.3);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(60, 27, 153, 0.3);
        }

        .no-enchant-label {
          font-weight: 500;
          color: white;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #374151;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .toggle-switch-on {
          background-color: #8b5cf6;
        }

        .toggle-switch-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-switch-on .toggle-switch-slider {
          transform: translateX(20px);
        }

        .horizontal-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .category-column {
          flex: 1;
          min-width: 150px;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(60, 27, 153, 0.3);
          border-radius: 0.5rem;
          background-color: rgba(26, 26, 46, 0.3);
          overflow: hidden;
        }

        .category-column.has-selections {
          border-color: rgba(100, 45, 255, 0.5);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: rgba(40, 18, 102, 0.2);
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid rgba(60, 27, 153, 0.2);
        }

        .category-header:hover {
          background-color: rgba(60, 27, 153, 0.3);
        }

        .category-header.expanded {
          background-color: rgba(60, 27, 153, 0.4);
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: white;
        }

        .selection-count {
          background-color: rgba(100, 45, 255, 0.3);
          color: #c1abff;
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: 1rem;
          min-width: 1.5rem;
          text-align: center;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          max-height: 200px;
          overflow-y: auto;
        }

        .options-list::-webkit-scrollbar {
          width: 4px;
        }

        .options-list::-webkit-scrollbar-track {
          background: rgba(26, 26, 46, 0.3);
        }

        .options-list::-webkit-scrollbar-thumb {
          background-color: rgba(100, 45, 255, 0.5);
          border-radius: 2px;
        }

        .option-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(60, 27, 153, 0.1);
        }

        .option-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
          flex-grow: 1;
          background-color: rgba(147, 51, 234, 0.1);
        }

        .option-item:hover {
          background-color: rgba(147, 51, 234, 0.2);
        }

        .option-item.selected {
          background-color: rgba(147, 51, 234, 0.3);
        }

        .option-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 1px solid rgba(100, 45, 255, 0.5);
          background-color: rgba(60, 27, 153, 0.2);
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
        }

        .option-item.selected .option-checkbox {
          background-color: rgba(100, 45, 255, 0.7);
        }

        .check-icon {
          color: white;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .option-label {
          font-size: 0.8rem;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .option-info {
          font-size: 0.7rem;
          color: #a281ff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-button {
          background-color: rgba(60, 27, 153, 0.2);
          color: #a281ff;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 4px;
          transition: background-color 0.2s;
        }

        .preview-button:hover {
          background-color: rgba(60, 27, 153, 0.4);
          color: white;
        }

        .preview-button.active {
          background-color: rgba(100, 45, 255, 0.5);
          color: white;
        }

        .no-options-message {
          padding: 0.75rem;
          font-size: 0.75rem;
          color: #f87171;
          text-align: center;
          font-style: italic;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .horizontal-categories {
            flex-direction: column;
          }

          .category-column {
            width: 100%;
          }
        }

        .categories-disabled {
          opacity: 0.5;
          pointer-events: none;
          position: relative;
        }

        .categories-disabled::after {
          content: "노작 아이템은 추가 옵션을 선택할 수 없습니다";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(76, 29, 149, 0.8);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          text-align: center;
          white-space: nowrap;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .categories-disabled::after {
            white-space: normal;
            width: 80%;
          }
        }
      `}</style>
    </div>
  );
}
