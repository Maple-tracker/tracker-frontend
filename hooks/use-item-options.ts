"use client";

import { useState, useEffect } from "react";

// 타입 정의
export type OptionCombination = {
  id: string;
  starForce: string;
  potentialOption: string;
  additionalPotentialOption: string;
  statType: string;
  enchantedFlag: boolean;
};

export type ItemOptionsData = {
  combinations: OptionCombination[];
  availableOptions: {
    starForce: string[];
    potentialOption: string[];
    additionalPotentialOption: string[];
    statType: string[];
    enchantedFlag: boolean;
  };
};

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type OptionField =
  | "starForce"
  | "potentialOption"
  | "additionalPotentialOption"
  | "statType"
  | "enchantedFlag";
export type OptionValue<T extends OptionField> = T extends "enchantedFlag"
  ? boolean
  : string;

const gradeOrder = {
  없음: 0,
  레어: 1,
  에픽: 2,
  유니크: 3,
  레전더리: 4,
};

// 스타포스 정렬 함수
const sortStarForce = (a: string, b: string): number => {
  // 문자열이 아닌 경우 안전하게 문자열로 변환
  const strA = String(a);
  const strB = String(b);

  const numA = Number.parseInt(strA.replace(/[^0-9]/g, "") || "0");
  const numB = Number.parseInt(strB.replace(/[^0-9]/g, "") || "0");
  return numA - numB;
};

// 잠재능력 정렬 함수
const sortPotential = (a: string, b: string): number => {
  // 문자열 변환
  const strA = String(a);
  const strB = String(b);

  // 등급 추출 (첫 번째 단어)
  const gradeA = strA.split(" ")[0];
  const gradeB = strB.split(" ")[0];

  // 등급이 다르면 등급 순서로 정렬
  if (gradeA !== gradeB) {
    return (
      (gradeOrder[gradeA as keyof typeof gradeOrder] || 0) -
      (gradeOrder[gradeB as keyof typeof gradeOrder] || 0)
    );
  }

  // 등급이 같으면 퍼센트 값으로 정렬
  const percentA = Number.parseInt(strA.match(/(\d+)%/)?.[1] || "0");
  const percentB = Number.parseInt(strB.match(/(\d+)%/)?.[1] || "0");
  return percentA - percentB;
};

// 에디셔널 잠재능력 정렬 함수
const sortAdditionalPotential = (a: string, b: string): number => {
  // 문자열 변환
  const strA = String(a);
  const strB = String(b);

  // 등급 추출 (첫 번째 단어)
  const gradeA = strA.split(" ")[0];
  const gradeB = strB.split(" ")[0];

  // 등급이 다르면 등급 순서로 정렬
  if (gradeA !== gradeB) {
    return (
      (gradeOrder[gradeA as keyof typeof gradeOrder] || 0) -
      (gradeOrder[gradeB as keyof typeof gradeOrder] || 0)
    );
  }

  // 등급이 같으면 첫 번째 숫자로 정렬
  const parts1A = strA.split(" ");
  const parts1B = strB.split(" ");

  if (parts1A.length > 1 && parts1B.length > 1) {
    const num1A = Number.parseInt(parts1A[1] || "0");
    const num1B = Number.parseInt(parts1B[1] || "0");

    if (num1A !== num1B) {
      return num1A - num1B;
    }

    // 첫 번째 숫자가 같으면 두 번째 숫자로 정렬
    if (parts1A.length > 2 && parts1B.length > 2) {
      const num2A = Number.parseInt(parts1A[2] || "0");
      const num2B = Number.parseInt(parts1B[2] || "0");
      return num2A - num2B;
    }
  }

  // 기본 비교
  return strA.localeCompare(strB);
};

export function useItemOptions(itemOptionsData: ItemOptionsData | null) {
  const [starForce, setStarForce] = useState("");
  const [potentialOption, setPotentialOption] = useState("");
  const [additionalPotentialOption, setAdditionalPotentialOption] =
    useState("");
  const [statType, setStatType] = useState("");
  const [enchantedFlag, setEnchantedFlag] = useState(false);
  const [filteredCombinations, setFilteredCombinations] = useState<
    OptionCombination[]
  >([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 아이템 옵션 데이터가 변경되면 상태 초기화
  useEffect(() => {
    setStarForce("");
    setPotentialOption("");
    setAdditionalPotentialOption("");
    setStatType("");
    setEnchantedFlag(false);
    setSelectedOptionId(null);

    if (itemOptionsData?.combinations) {
      setFilteredCombinations(itemOptionsData.combinations);
    } else {
      setFilteredCombinations([]);
    }
  }, [itemOptionsData]);

  // 옵션 선택 시 다른 옵션 필터링
  const updateAvailableOptions = <T extends OptionField>(
    field: T,
    value: OptionValue<T>
  ) => {
    if (!itemOptionsData?.combinations) return;

    // 현재 선택된 옵션들
    const currentSelections = {
      starForce,
      potentialOption,
      additionalPotentialOption,
      statType,
      enchantedFlag,
    };

    // 새로 선택된 옵션 업데이트
    currentSelections[field] = value as any;

    // 선택된 옵션에 맞는 조합 필터링
    const newFilteredCombinations = itemOptionsData.combinations.filter(
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
    } else {
      setSelectedOptionId(null);
    }
  };

  // 옵션 변경 핸들러
  const handleStarForceChange = (value: string) => {
    setStarForce(value);
    updateAvailableOptions("starForce", value);
  };

  const handlePotentialOptionChange = (value: string) => {
    setPotentialOption(value);
    updateAvailableOptions("potentialOption", value);
  };

  const handleAdditionalPotentialOptionChange = (value: string) => {
    setAdditionalPotentialOption(value);
    updateAvailableOptions("additionalPotentialOption", value);
  };

  const handleStatTypeChange = (value: string) => {
    setStatType(value);
    updateAvailableOptions("statType", value);
  };

  const handleEnchantedFlagChange = (checked: boolean) => {
    setEnchantedFlag(checked);
    updateAvailableOptions("enchantedFlag", checked);
  };

  // 현재 선택 가능한 옵션 목록 생성 함수 - 롤백: 선택 가능한 옵션만 반환
  const getAvailableStarForceOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.starForce) return [];

    // 필터링된 조합에서 가능한 스타포스 값 추출
    const availableValues = [
      ...new Set(filteredCombinations.map((combo) => combo.starForce)),
    ];

    // 선택 가능한 옵션만 반환 (오름차순 정렬)
    return availableValues.sort(sortStarForce).map((value) => ({
      value,
      label: value,
    }));
  };

  const getAvailablePotentialOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.potentialOption) return [];

    // 필터링된 조합에서 가능한 잠재능력 값 추출
    const availableValues = [
      ...new Set(filteredCombinations.map((combo) => combo.potentialOption)),
    ];

    // 선택 가능한 옵션만 반환 (오름차순 정렬)
    return availableValues.sort(sortPotential).map((value) => ({
      value,
      label: value,
    }));
  };

  const getAvailableAdditionalPotentialOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.additionalPotentialOption)
      return [];

    // 필터링된 조합에서 가능한 추가 잠재능력 값 추출
    const availableValues = [
      ...new Set(
        filteredCombinations.map((combo) => combo.additionalPotentialOption)
      ),
    ];

    // 선택 가능한 옵션만 반환 (오름차순 정렬)
    return availableValues.sort(sortAdditionalPotential).map((value) => ({
      value,
      label: value,
    }));
  };

  const getAvailableStatTypeOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.statType) return [];

    // 필터링된 조합에서 가능한 스탯타입 값 추출
    const availableValues = [
      ...new Set(filteredCombinations.map((combo) => combo.statType)),
    ];

    // 선택 가능한 옵션만 반환
    return availableValues.map((value) => ({
      value,
      label: value,
    }));
  };

  // 인챈트 플래그 선택 가능 여부
  const isEnchantedFlagAvailable = (): boolean => {
    return filteredCombinations.some((combo) => combo.enchantedFlag);
  };

  // 옵션 초기화 함수
  const resetOptions = () => {
    setStarForce("");
    setPotentialOption("");
    setAdditionalPotentialOption("");
    setStatType("");
    setEnchantedFlag(false);
    setSelectedOptionId(null);
    if (itemOptionsData?.combinations) {
      setFilteredCombinations(itemOptionsData.combinations);
    }
  };

  return {
    // 상태
    starForce,
    potentialOption,
    additionalPotentialOption,
    statType,
    enchantedFlag,
    selectedOptionId,
    filteredCombinations,

    // 핸들러
    handleStarForceChange,
    handlePotentialOptionChange,
    handleAdditionalPotentialOptionChange,
    handleStatTypeChange,
    handleEnchantedFlagChange,

    // 옵션 목록 생성 함수
    getAvailableStarForceOptions,
    getAvailablePotentialOptions,
    getAvailableAdditionalPotentialOptions,
    getAvailableStatTypeOptions,
    isEnchantedFlagAvailable,

    // 상태 초기화
    resetOptions,
  };
}
