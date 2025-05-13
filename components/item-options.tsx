"use client";

import { useEffect } from "react";
import { CustomSelect } from "./custom-select";
import { useItemOptions, type ItemOptionsData } from "@/hooks/use-item-options";

type ItemOptionsProps = {
  isActive: boolean;
  itemName: string | null;
  availableOptions: ItemOptionsData | null;
  isLoading: boolean;
  onOptionSelect: (optionIds: string[]) => void;
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
  } = useItemOptions(availableOptions);

  // 선택된 옵션 ID가 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    onOptionSelect(selectedOptionIds);
  }, [selectedOptionIds, onOptionSelect]);

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
    <div className={`options-panel ${isActive ? "" : "options-disabled"}`}>
      {!isActive && (
        <div className="options-overlay">
          <div className="options-message">아이템명을 검색해주세요!</div>
        </div>
      )}

      <h3 className="text-lg font-medium text-white">추가 옵션</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ marginLeft: "auto" }}>
          {hasSelectedOptions && (
            <button
              onClick={resetOptions}
              style={{
                backgroundColor: "rgba(76, 29, 149, 0.3)",
                color: "#c1abff",
                padding: "0.25rem 0.75rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="star-force" className="text-white block">
            스타포스
          </label>
          <CustomSelect
            options={starForceOptions}
            value={starForce}
            onChange={handleStarForceChange}
            placeholder="스타포스 선택"
            disabled={!isActive || isLoading || enchantedFlag}
            multiple={true}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="stat-type" className="text-white block">
            스탯타입
          </label>
          <CustomSelect
            options={statTypeOptions}
            value={statType}
            onChange={handleStatTypeChange}
            placeholder="스탯타입 선택"
            disabled={!isActive || isLoading || enchantedFlag}
            multiple={true}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="potential-option" className="text-white block">
            잠재능력 %
          </label>
          <CustomSelect
            options={potentialOptions}
            value={potentialOption}
            onChange={handlePotentialOptionChange}
            placeholder="잠재능력 % 선택"
            disabled={!isActive || isLoading || enchantedFlag}
            multiple={true}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="additional-potential-option"
            className="text-white block"
          >
            에디셔널 잠재능력
          </label>
          <CustomSelect
            options={additionalPotentialOptions}
            value={additionalPotentialOption}
            onChange={handleAdditionalPotentialOptionChange}
            placeholder="에디셔널 잠재능력 선택"
            disabled={!isActive || isLoading || enchantedFlag}
            multiple={true}
          />
        </div>
      </div>

      <br></br>
      <div className="mt-6">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <label className="text-white mb-2">노작 여부</label>
            <div className="toggle-switch-container">
              <div
                className={`toggle-switch ${
                  enchantedFlag ? "toggle-switch-on" : ""
                } ${
                  !isActive || isLoading || !isEnchantedFlagAvailable()
                    ? "toggle-switch-disabled"
                    : ""
                }`}
                onClick={() => {
                  if (isActive && !isLoading && isEnchantedFlagAvailable()) {
                    handleEnchantedFlagChange(!enchantedFlag);
                  }
                }}
              >
                <div className="toggle-switch-slider"></div>
              </div>
              <span className="ml-3 text-sm font-medium text-white"></span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .toggle-switch-container {
          display: flex;
          align-items: center;
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
        .toggle-switch-disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
      `}</style>
    </div>
  );
}
