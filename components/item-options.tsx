"use client";

import { useState, useEffect } from "react";
import { CustomSelect } from "@/components/custom-select";

// 아이템 옵션 API 응답 타입 정의
type OptionCombination = {
  id: string;
  starForce: string;
  potentialOption: string;
  additionalPotentialOption: string;
  statType: string;
  enchantedFlag: boolean;
};

type ItemOptionsApiResponse = {
  combinations: OptionCombination[];
  availableOptions: {
    starForce: string[];
    potentialOption: string[];
    additionalPotentialOption: string[];
    statType: string[];
  };
};

type ItemOptionsProps = {
  isActive: boolean;
  itemName: string | null;
  availableOptions: ItemOptionsApiResponse | null;
  isLoading: boolean;
  onOptionSelect: (optionId: string | null) => void;
};

export function ItemOptions({
  isActive,
  itemName,
  availableOptions,
  isLoading,
  onOptionSelect,
}: ItemOptionsProps) {
  const [starForce, setStarForce] = useState("");
  const [potentialOption, setpotentialOption] = useState("");
  const [additionalPotentialOption, setadditionalPotentialOption] = useState("");
  const [statType, setStatType] = useState("");
  const [noDrag, setNoDrag] = useState(false);

  // 현재 선택 가능한 옵션 조합들
  const [filteredCombinations, setFilteredCombinations] = useState<
    OptionCombination[]
  >([]);

  // 선택된 옵션 ID
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 아이템이 변경되면 옵션 초기화
  useEffect(() => {
    setStarForce("");
    setpotentialOption("");
    setadditionalPotentialOption("");
    setStatType("");
    setNoDrag(false);
    setSelectedOptionId(null);

    if (availableOptions?.combinations) {
      setFilteredCombinations(availableOptions.combinations);
    }
  }, [itemName, availableOptions]);

  // 옵션 선택 시 다른 옵션 필터링
  type OptionField =
    | "starForce"
    | "potentialOption"
    | "additionalPotentialOption"
    | "statType"
    | "enchantedFlag";
  type OptionValue<T extends OptionField> = T extends "enchantedFlag"
    ? boolean
    : string;

  const updateAvailableOptions = <T extends OptionField>(
    field: T,
    value: OptionValue<T>
  ) => {
    if (!availableOptions?.combinations) return;

    // 현재 선택된 옵션들
    const currentSelections = {
      starForce,
      potentialOption,
      additionalPotentialOption,
      statType,
      enchantedFlag: noDrag,
    };

    // 새로 선택된 옵션 업데이트
    currentSelections[field] = value as any; // 타입

    // 선택된 옵션에 맞는 조합 필터링
    const newFilteredCombinations = availableOptions.combinations.filter(
      (combo) => {
        return (
          (!currentSelections.starForce ||
            combo.starForce === currentSelections.starForce) &&
          (!currentSelections.potentialOption ||
            combo.potentialOption === currentSelections.potentialOption) &&
          (!currentSelections.additionalPotentialOption ||
            combo.additionalPotentialOption ===
              currentSelections.additionalPotentialOption) &&
          (!currentSelections.statType ||
            combo.statType === currentSelections.statType) &&
          (currentSelections.enchantedFlag === false ||
            combo.enchantedFlag === currentSelections.enchantedFlag)
        );
      }
    );

    setFilteredCombinations(newFilteredCombinations);

    // 모든 옵션이 선택되었는지 확인
    const allSelected =
      currentSelections.starForce !== "" &&
      currentSelections.potentialOption !== "" &&
      currentSelections.additionalPotentialOption !== "" &&
      currentSelections.statType !== "";

    // 정확히 하나의 조합만 남았거나 모든 옵션이 선택된 경우
    if (newFilteredCombinations.length === 1 && allSelected) {
      setSelectedOptionId(newFilteredCombinations[0].id);
      onOptionSelect(newFilteredCombinations[0].id);
    } else {
      setSelectedOptionId(null);
      onOptionSelect(null);
    }
  };

  // 스타포스 옵션 변경 핸들러
  const handleStarForceChange = (value: string) => {
    setStarForce(value);
    updateAvailableOptions("starForce", value);
  };

  // 윗잠재능력 옵션 변경 핸들러
  const handlepotentialOptionChange = (value: string) => {
    setpotentialOption(value);
    updateAvailableOptions("potentialOption", value);
  };

  // 아랫잠재능력 옵션 변경 핸들러
  const handleadditionalPotentialOptionChange = (value: string) => {
    setadditionalPotentialOption(value);
    updateAvailableOptions("additionalPotentialOption", value);
  };

  // 스탯타입 옵션 변경 핸들러
  const handleStatTypeChange = (value: string) => {
    setStatType(value);
    updateAvailableOptions("statType", value);
  };

  // 노작여부 옵션 변경 핸들러
  const handleNoDragChange = (checked: boolean) => {
    setNoDrag(checked);
    updateAvailableOptions("enchantedFlag", checked);
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
  const getAvailablepotentialOptionOptions = () => {
    if (!filteredCombinations.length) return [];

    const options = [
      ...new Set(filteredCombinations.map((combo) => combo.potentialOption)),
    ];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
  };

  // 현재 선택 가능한 아랫잠재능력 옵션 목록
  const getAvailableadditionalPotentialOptionOptions = () => {
    if (!filteredCombinations.length) return [];

    const options = [
      ...new Set(
        filteredCombinations.map((combo) => combo.additionalPotentialOption)
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
    return filteredCombinations.some((combo) => combo.enchantedFlag);
  };

  // 옵션 데이터 포맷팅
  const starForceOptions = getAvailableStarForceOptions();
  const potentialOptionOptions = getAvailablepotentialOptionOptions();
  const additionalPotentialOptionOptions = getAvailableadditionalPotentialOptionOptions();
  const statTypeOptions = getAvailableStatTypeOptions();
  return (
    <div className={`options-panel ${isActive ? "" : "options-disabled"}`}>
      {!isActive && (
        <div className="options-overlay">
          <div className="options-message">아이템명을 검색해주세요!</div>
        </div>
      )}

      <h3 className="text-lg font-medium text-white mb-4">추가 옵션</h3>

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
            disabled={
              !isActive || isLoading || starForceOptions.length === 0 || noDrag
            }
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
            disabled={
              !isActive || isLoading || statTypeOptions.length === 0 || noDrag
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="upper-potential" className="text-white block">
            윗잠재능력 %
          </label>
          <CustomSelect
            options={potentialOptionOptions}
            value={potentialOption}
            onChange={handlepotentialOptionChange}
            placeholder="윗잠재능력 % 선택"
            disabled={
              !isActive ||
              isLoading ||
              potentialOptionOptions.length === 0 ||
              noDrag
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lower-potential-grade" className="text-white block">
            아랫잠재능력 등급
          </label>
          <CustomSelect
            options={additionalPotentialOptionOptions}
            value={additionalPotentialOption}
            onChange={handleadditionalPotentialOptionChange}
            placeholder="아랫잠재능력 등급 선택"
            disabled={
              !isActive ||
              isLoading ||
              additionalPotentialOptionOptions.length === 0 ||
              noDrag
            }
          />
        </div>
      </div>
      <br></br>
      <div className="mt-6">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <label className="text-white mb-2">노작 여부</label>
            <br></br>
            <div className="toggle-switch-container">
              <div
                className={`toggle-switch ${noDrag ? "toggle-switch-on" : ""} ${
                  !isActive || isLoading || !isNoDragAvailable()
                    ? "toggle-switch-disabled"
                    : ""
                }`}
                onClick={() => {
                  if (isActive && !isLoading && isNoDragAvailable()) {
                    handleNoDragChange(!noDrag);
                  }
                }}
              >
                <div className="toggle-switch-slider"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
