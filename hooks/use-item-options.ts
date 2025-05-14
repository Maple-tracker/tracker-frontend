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
  combinationInfo?: string; // 선택된 다른 옵션 정보
};

export type OptionField =
  | "starForce"
  | "potentialOption"
  | "additionalPotentialOption"
  | "statType"
  | "enchantedFlag";
export type OptionValue<T extends OptionField> = T extends "enchantedFlag"
  ? boolean
  : string | string[];

// 등급 순서 정의
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

// 잠재능력 정렬 함수 (예: "레전드리 0% 정옵", "없음 0% 정옵", "유니크 6% 정옵")
const sortPotential = (a: string, b: string): number => {
  // 문자열이 아닌 경우 안전하게 문자열로 변환
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

// 에디셔널 잠재능력 정렬 함수 (예: "레전드리 3 2", "에픽 2 0", "유니크 2 1")
const sortAdditionalPotential = (a: string, b: string): number => {
  // 문자열이 아닌 경우 안전하게 문자열로 변환
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
  const [starForce, setStarForce] = useState<string[]>([]);
  const [potentialOption, setPotentialOption] = useState<string[]>([]);
  const [additionalPotentialOption, setAdditionalPotentialOption] = useState<
    string[]
  >([]);
  const [statType, setStatType] = useState<string[]>([]);
  const [enchantedFlag, setEnchantedFlag] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [availableCombinations, setAvailableCombinations] = useState<
    OptionCombination[]
  >([]);

  // 아이템 옵션 데이터가 변경되면 상태 초기화
  useEffect(() => {
    setStarForce([]);
    setPotentialOption([]);
    setAdditionalPotentialOption([]);
    setStatType([]);
    setEnchantedFlag(false);
    setSelectedOptionIds([]);

    if (itemOptionsData?.combinations) {
      setAvailableCombinations(itemOptionsData.combinations);
    } else {
      setAvailableCombinations([]);
    }
  }, [itemOptionsData]);

  // 선택된 옵션에 맞는 조합 찾기
  const updateSelectedOptionIds = () => {
    if (!itemOptionsData?.combinations) return;

    // 선택된 옵션들
    const selectedOptions = {
      starForce,
      potentialOption,
      additionalPotentialOption,
      statType,
      enchantedFlag,
    };

    // 모든 필수 옵션이 선택되었는지 확인
    const hasStarForce = selectedOptions.starForce.length > 0;
    const hasPotentialOption = selectedOptions.potentialOption.length > 0;
    const hasAdditionalPotentialOption =
      selectedOptions.additionalPotentialOption.length > 0;
    const hasStatType = selectedOptions.statType.length > 0;

    // 모든 옵션이 선택되었는지 확인 (enchantedFlag는 선택적)
    const allOptionsSelected =
      hasStarForce &&
      hasPotentialOption &&
      hasAdditionalPotentialOption &&
      hasStatType;

    // 모든 옵션이 선택되지 않았으면 빈 배열 반환
    if (!allOptionsSelected) {
      setSelectedOptionIds([]);
      setAvailableCombinations([]);
      return;
    }

    // 선택된 옵션에 맞는 조합 필터링 (모든 옵션이 정확히 일치하는 경우만)
    const matchingCombinations = itemOptionsData.combinations.filter(
      (combo) => {
        const starForceMatch = selectedOptions.starForce.includes(
          combo.starForce
        );
        const potentialMatch = selectedOptions.potentialOption.includes(
          combo.potentialOption
        );
        const additionalMatch =
          selectedOptions.additionalPotentialOption.includes(
            combo.additionalPotentialOption
          );
        const statTypeMatch = selectedOptions.statType.includes(combo.statType);
        const enchantedMatch =
          !selectedOptions.enchantedFlag ||
          combo.enchantedFlag === selectedOptions.enchantedFlag;

        // 모든 조건이 일치해야 함 (AND 조건)
        return (
          starForceMatch &&
          potentialMatch &&
          additionalMatch &&
          statTypeMatch &&
          enchantedMatch
        );
      }
    );

    // 선택된 조합들의 ID 업데이트
    const matchingOptionIds = matchingCombinations.map((combo) => combo.id);
    setSelectedOptionIds(matchingOptionIds);
    setAvailableCombinations(matchingCombinations);
  };

  // 옵션 변경 핸들러
  const handleStarForceChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setStarForce(newValue);
    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handlePotentialOptionChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setPotentialOption(newValue);
    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleAdditionalPotentialOptionChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setAdditionalPotentialOption(newValue);
    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleStatTypeChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setStatType(newValue);
    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleEnchantedFlagChange = (checked: boolean) => {
    setEnchantedFlag(checked);
    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  // 선택된 옵션 정보를 포함한 옵션 목록 생성 함수
  const getAvailableStarForceOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.starForce) return [];

    // 모든 가능한 스타포스 값 추출
    const allStarForceValues = [
      ...new Set(itemOptionsData.combinations.map((combo) => combo.starForce)),
    ];

    // 각 스타포스 값에 대해 조합 정보 추가
    return allStarForceValues.sort(sortStarForce).map((value) => {
      // 이 스타포스 값과 함께 사용 가능한 조합 찾기
      const combinationsWithThisValue = itemOptionsData.combinations.filter(
        (combo) =>
          combo.starForce === value &&
          (potentialOption.length === 0 ||
            potentialOption.includes(combo.potentialOption)) &&
          (additionalPotentialOption.length === 0 ||
            additionalPotentialOption.includes(
              combo.additionalPotentialOption
            )) &&
          (statType.length === 0 || statType.includes(combo.statType)) &&
          (!enchantedFlag || combo.enchantedFlag === enchantedFlag)
      );

      // 조합 정보 생성
      let combinationInfo = "";
      if (
        combinationsWithThisValue.length > 0 &&
        (potentialOption.length > 0 ||
          additionalPotentialOption.length > 0 ||
          statType.length > 0)
      ) {
        const infoItems = [];

        if (potentialOption.length > 0) {
          const potOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.potentialOption)),
          ];
          if (potOptions.length > 0) infoItems.push(potOptions.join(", "));
        }

        if (additionalPotentialOption.length > 0) {
          const addPotOptions = [
            ...new Set(
              combinationsWithThisValue.map((c) => c.additionalPotentialOption)
            ),
          ];
          if (addPotOptions.length > 0)
            infoItems.push(addPotOptions.join(", "));
        }

        if (statType.length > 0) {
          const statOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.statType)),
          ];
          if (statOptions.length > 0) infoItems.push(statOptions.join(", "));
        }

        if (infoItems.length > 0) {
          combinationInfo = infoItems.join(" / ");
        }
      }

      return {
        value,
        label: value,
        combinationInfo,
        disabled: combinationsWithThisValue.length === 0,
      };
    });
  };

  const getAvailablePotentialOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.potentialOption) return [];

    // 모든 가능한 잠재능력 값 추출
    const allPotentialValues = [
      ...new Set(
        itemOptionsData.combinations.map((combo) => combo.potentialOption)
      ),
    ];

    // 각 잠재능력 값에 대해 조합 정보 추가
    return allPotentialValues.sort(sortPotential).map((value) => {
      // 이 잠재능력 값과 함께 사용 가능한 조합 찾기
      const combinationsWithThisValue = itemOptionsData.combinations.filter(
        (combo) =>
          combo.potentialOption === value &&
          (starForce.length === 0 || starForce.includes(combo.starForce)) &&
          (additionalPotentialOption.length === 0 ||
            additionalPotentialOption.includes(
              combo.additionalPotentialOption
            )) &&
          (statType.length === 0 || statType.includes(combo.statType)) &&
          (!enchantedFlag || combo.enchantedFlag === enchantedFlag)
      );

      // 조합 정보 생성
      let combinationInfo = "";
      if (
        combinationsWithThisValue.length > 0 &&
        (starForce.length > 0 ||
          additionalPotentialOption.length > 0 ||
          statType.length > 0)
      ) {
        const infoItems = [];

        if (starForce.length > 0) {
          const sfOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.starForce)),
          ];
          if (sfOptions.length > 0) infoItems.push(sfOptions.join(", "));
        }

        if (additionalPotentialOption.length > 0) {
          const addPotOptions = [
            ...new Set(
              combinationsWithThisValue.map((c) => c.additionalPotentialOption)
            ),
          ];
          if (addPotOptions.length > 0)
            infoItems.push(addPotOptions.join(", "));
        }

        if (statType.length > 0) {
          const statOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.statType)),
          ];
          if (statOptions.length > 0) infoItems.push(statOptions.join(", "));
        }

        if (infoItems.length > 0) {
          combinationInfo = infoItems.join(" / ");
        }
      }

      return {
        value,
        label: value,
        combinationInfo,
        disabled: combinationsWithThisValue.length === 0,
      };
    });
  };

  const getAvailableAdditionalPotentialOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.additionalPotentialOption)
      return [];

    // 모든 가능한 추가 잠재능력 값 추출
    const allAdditionalValues = [
      ...new Set(
        itemOptionsData.combinations.map(
          (combo) => combo.additionalPotentialOption
        )
      ),
    ];

    // 각 추가 잠재능력 값에 대해 조합 정보 추가
    return allAdditionalValues.sort(sortAdditionalPotential).map((value) => {
      // 이 추가 잠재능력 값과 함께 사용 가능한 조합 찾기
      const combinationsWithThisValue = itemOptionsData.combinations.filter(
        (combo) =>
          combo.additionalPotentialOption === value &&
          (starForce.length === 0 || starForce.includes(combo.starForce)) &&
          (potentialOption.length === 0 ||
            potentialOption.includes(combo.potentialOption)) &&
          (statType.length === 0 || statType.includes(combo.statType)) &&
          (!enchantedFlag || combo.enchantedFlag === enchantedFlag)
      );

      // 조합 정보 생성
      let combinationInfo = "";
      if (
        combinationsWithThisValue.length > 0 &&
        (starForce.length > 0 ||
          potentialOption.length > 0 ||
          statType.length > 0)
      ) {
        const infoItems = [];

        if (starForce.length > 0) {
          const sfOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.starForce)),
          ];
          if (sfOptions.length > 0) infoItems.push(sfOptions.join(", "));
        }

        if (potentialOption.length > 0) {
          const potOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.potentialOption)),
          ];
          if (potOptions.length > 0) infoItems.push(potOptions.join(", "));
        }

        if (statType.length > 0) {
          const statOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.statType)),
          ];
          if (statOptions.length > 0) infoItems.push(statOptions.join(", "));
        }

        if (infoItems.length > 0) {
          combinationInfo = infoItems.join(" / ");
        }
      }

      return {
        value,
        label: value,
        combinationInfo,
        disabled: combinationsWithThisValue.length === 0,
      };
    });
  };

  const getAvailableStatTypeOptions = (): Option[] => {
    if (!itemOptionsData?.availableOptions?.statType) return [];

    // 모든 가능한 스탯타입 값 추출
    const allStatTypeValues = [
      ...new Set(itemOptionsData.combinations.map((combo) => combo.statType)),
    ];

    // 각 스탯타입 값에 대해 조합 정보 추가
    return allStatTypeValues.map((value) => {
      // 이 스탯타입 값과 함께 사용 가능한 조합 찾기
      const combinationsWithThisValue = itemOptionsData.combinations.filter(
        (combo) =>
          combo.statType === value &&
          (starForce.length === 0 || starForce.includes(combo.starForce)) &&
          (potentialOption.length === 0 ||
            potentialOption.includes(combo.potentialOption)) &&
          (additionalPotentialOption.length === 0 ||
            additionalPotentialOption.includes(
              combo.additionalPotentialOption
            )) &&
          (!enchantedFlag || combo.enchantedFlag === enchantedFlag)
      );

      // 조합 정보 생성
      let combinationInfo = "";
      if (
        combinationsWithThisValue.length > 0 &&
        (starForce.length > 0 ||
          potentialOption.length > 0 ||
          additionalPotentialOption.length > 0)
      ) {
        const infoItems = [];

        if (starForce.length > 0) {
          const sfOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.starForce)),
          ];
          if (sfOptions.length > 0) infoItems.push(sfOptions.join(", "));
        }

        if (potentialOption.length > 0) {
          const potOptions = [
            ...new Set(combinationsWithThisValue.map((c) => c.potentialOption)),
          ];
          if (potOptions.length > 0) infoItems.push(potOptions.join(", "));
        }

        if (additionalPotentialOption.length > 0) {
          const addPotOptions = [
            ...new Set(
              combinationsWithThisValue.map((c) => c.additionalPotentialOption)
            ),
          ];
          if (addPotOptions.length > 0)
            infoItems.push(addPotOptions.join(", "));
        }

        if (infoItems.length > 0) {
          combinationInfo = infoItems.join(" / ");
        }
      }

      return {
        value,
        label: value,
        combinationInfo,
        disabled: combinationsWithThisValue.length === 0,
      };
    });
  };

  // 인챈트 플래그 선택 가능 여부
  const isEnchantedFlagAvailable = (): boolean => {
    if (!itemOptionsData?.combinations) return false;

    return itemOptionsData.combinations.some(
      (combo) =>
        combo.enchantedFlag &&
        (starForce.length === 0 || starForce.includes(combo.starForce)) &&
        (potentialOption.length === 0 ||
          potentialOption.includes(combo.potentialOption)) &&
        (additionalPotentialOption.length === 0 ||
          additionalPotentialOption.includes(
            combo.additionalPotentialOption
          )) &&
        (statType.length === 0 || statType.includes(combo.statType))
    );
  };

  // 옵션 초기화 함수
  const resetOptions = () => {
    setStarForce([]);
    setPotentialOption([]);
    setAdditionalPotentialOption([]);
    setStatType([]);
    setEnchantedFlag(false);
    setSelectedOptionIds([]);
    if (itemOptionsData?.combinations) {
      setAvailableCombinations(itemOptionsData.combinations);
    }
  };

  return {
    // 상태
    starForce,
    potentialOption,
    additionalPotentialOption,
    statType,
    enchantedFlag,
    selectedOptionIds,
    availableCombinations,

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
