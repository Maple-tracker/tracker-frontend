"use client";

import { useState, useEffect } from "react";

// 타입 정의
export type OptionCombination = {
  id: number;
  starForce: number;
  potentialOption: string;
  additionalPotentialOption: string;
  statType: string;
  enchantedFlag: boolean;
};

export type CategoryOption = {
  name: string;
  subCategories: Record<string, CategoryOption>;
  optionIds: number[];
};

export type ItemOptionsData = {
  combinations: OptionCombination[];
  availableOptions: {
    starForce: string[];
    potentialOption: string[];
    additionalPotentialOption: string[];
    statType: string[];
  };
  categorizedOptions: Record<string, CategoryOption>;
  notEnchantedItemId?: number; // 노작 아이템 ID 추가
};

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
  combinationInfo?: string;
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

// 카테고리 경로 타입
export type CategoryPath = {
  starForce?: string;
  statType?: string;
  potentialOption?: string;
  additionalPotentialOption?: string;
};

export function useItemOptions(itemOptionsData: ItemOptionsData | null) {
  const [starForce, setStarForce] = useState<string[]>([]);
  const [potentialOption, setPotentialOption] = useState<string[]>([]);
  const [additionalPotentialOption, setAdditionalPotentialOption] = useState<
    string[]
  >([]);
  const [statType, setStatType] = useState<string[]>([]);
  const [enchantedFlag, setEnchantedFlag] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [availableCombinations, setAvailableCombinations] = useState<
    OptionCombination[]
  >([]);
  const [notEnchantedItemId, setNotEnchantedItemId] = useState<
    number | undefined
  >(undefined);

  // 현재 활성화된 카테고리 경로
  const [activePath, setActivePath] = useState<CategoryPath | null>(null);

  // 아이템 옵션 데이터가 변경되면 상태 초기화
  useEffect(() => {
    setStarForce([]);
    setPotentialOption([]);
    setAdditionalPotentialOption([]);
    setStatType([]);
    setEnchantedFlag(false);
    setSelectedOptionIds([]);
    setActivePath(null);
    setNotEnchantedItemId(itemOptionsData?.notEnchantedItemId);

    if (itemOptionsData?.combinations) {
      setAvailableCombinations(itemOptionsData.combinations);
    } else {
      setAvailableCombinations([]);
    }
  }, [itemOptionsData]);

  // 선택된 옵션에 맞는 조��� 찾기
  const updateSelectedOptionIds = () => {
    if (!itemOptionsData) return;

    // 노작 여부가 ON인 경우 (enchantedFlag가 false)
    if (!enchantedFlag && itemOptionsData.notEnchantedItemId !== undefined) {
      setSelectedOptionIds([itemOptionsData.notEnchantedItemId]);
      return;
    }

    // 노작 여부가 OFF인 경우 (enchantedFlag가 true) - 기존 로직 유지
    if (!itemOptionsData.combinations) return;

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

    // 모든 옵션이 선택되지 않았으면 빈 배열 반환
    if (
      !hasStarForce ||
      !hasPotentialOption ||
      !hasAdditionalPotentialOption ||
      !hasStatType
    ) {
      setSelectedOptionIds([]);
      return;
    }

    // 선택된 옵션에 맞는 조합 필터링
    const matchingCombinations = itemOptionsData.combinations.filter(
      (combo) => {
        const starForceMatch = selectedOptions.starForce.includes(
          String(combo.starForce)
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
          combo.enchantedFlag === selectedOptions.enchantedFlag;

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
  };

  // 모든 하위 옵션 선택 함수
  const selectAllSubOptions = (categoryId: string, value: string) => {
    if (!itemOptionsData?.categorizedOptions) return;

    try {
      // 현재 경로 설정
      let currentPath: CategoryPath = {};

      if (categoryId === "starForce") {
        currentPath = { starForce: value };

        // 스타포스 카테고리의 모든 하위 옵션 가져오기
        const starForceCategory = itemOptionsData.categorizedOptions[value];
        if (!starForceCategory) return;

        // 스탯타입 옵션 가져오기
        const statTypeOptions = Object.keys(starForceCategory.subCategories);
        if (statTypeOptions.length > 0) {
          // 첫 번째 스탯타입 선택
          const firstStatType = statTypeOptions[0];
          setStatType([...statType, firstStatType]);
          currentPath.statType = firstStatType;

          // 해당 스탯타입의 잠재능력 옵션 가져오기
          const statTypeCategory =
            starForceCategory.subCategories[firstStatType];
          if (statTypeCategory) {
            const potentialOptions = Object.keys(
              statTypeCategory.subCategories
            );
            if (potentialOptions.length > 0) {
              // 첫 번째 잠재능력 선택
              const firstPotential = potentialOptions[0];
              setPotentialOption([...potentialOption, firstPotential]);
              currentPath.potentialOption = firstPotential;

              // 해당 잠재능력의 에디셔널 잠재능력 옵션 가져오기
              const potentialCategory =
                statTypeCategory.subCategories[firstPotential];
              if (potentialCategory) {
                const additionalOptions = Object.keys(
                  potentialCategory.subCategories
                );
                if (additionalOptions.length > 0) {
                  // 첫 번째 에디셔널 잠재능력 선택
                  const firstAdditional = additionalOptions[0];
                  setAdditionalPotentialOption([
                    ...additionalPotentialOption,
                    firstAdditional,
                  ]);
                  currentPath.additionalPotentialOption = firstAdditional;
                }
              }
            }
          }
        }
      } else if (categoryId === "statType" && activePath?.starForce) {
        currentPath = { starForce: activePath.starForce, statType: value };

        // 스타포스 카테고리 가져오기
        const starForceCategory =
          itemOptionsData.categorizedOptions[activePath.starForce];
        if (!starForceCategory) return;

        // 스탯타입 카테고리 가져오기
        const statTypeCategory = starForceCategory.subCategories[value];
        if (!statTypeCategory) return;

        // 잠재능력 옵션 가져오기
        const potentialOptions = Object.keys(statTypeCategory.subCategories);
        if (potentialOptions.length > 0) {
          // 첫 번째 잠재능력 선택
          const firstPotential = potentialOptions[0];
          setPotentialOption([...potentialOption, firstPotential]);
          currentPath.potentialOption = firstPotential;

          // 해당 잠재능력의 에디셔널 잠재능력 옵션 가져오기
          const potentialCategory =
            statTypeCategory.subCategories[firstPotential];
          if (potentialCategory) {
            const additionalOptions = Object.keys(
              potentialCategory.subCategories
            );
            if (additionalOptions.length > 0) {
              // 첫 번째 에디셔널 잠재능력 선택
              const firstAdditional = additionalOptions[0];
              setAdditionalPotentialOption([
                ...additionalPotentialOption,
                firstAdditional,
              ]);
              currentPath.additionalPotentialOption = firstAdditional;
            }
          }
        }
      } else if (
        categoryId === "potentialOption" &&
        activePath?.starForce &&
        activePath?.statType
      ) {
        currentPath = {
          starForce: activePath.starForce,
          statType: activePath.statType,
          potentialOption: value,
        };

        // 스타포스 카테고리 가져오기
        const starForceCategory =
          itemOptionsData.categorizedOptions[activePath.starForce];
        if (!starForceCategory) return;

        // 스탯타입 카테고리 가져오기
        const statTypeCategory =
          starForceCategory.subCategories[activePath.statType];
        if (!statTypeCategory) return;

        // 잠재능력 카테고리 가져오기
        const potentialCategory = statTypeCategory.subCategories[value];
        if (!potentialCategory) return;

        // 에디셔널 잠재능력 옵션 가져오기
        const additionalOptions = Object.keys(potentialCategory.subCategories);
        if (additionalOptions.length > 0) {
          // 첫 번째 에디셔널 잠재능력 선택
          const firstAdditional = additionalOptions[0];
          setAdditionalPotentialOption([
            ...additionalPotentialOption,
            firstAdditional,
          ]);
          currentPath.additionalPotentialOption = firstAdditional;
        }
      }

      // 활성 경로 업데이트
      setActivePath(currentPath);
    } catch (error) {
      console.error("하위 옵션 선택 오류:", error);
    }
  };

  // 옵션 변경 핸들러
  const handleStarForceChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setStarForce(newValue);

    // 스타포스가 변경되면 활성 경로 업데이트
    if (newValue.length === 1) {
      setActivePath({ starForce: newValue[0] });
    } else if (newValue.length === 0) {
      setActivePath(null);
    }

    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handlePotentialOptionChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setPotentialOption(newValue);

    // 잠재능력이 변경되고 활성 경로가 있으면 업데이트
    if (activePath && newValue.length === 1) {
      setActivePath({ ...activePath, potentialOption: newValue[0] });
    }

    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleAdditionalPotentialOptionChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setAdditionalPotentialOption(newValue);

    // 에디셔널 잠재능력이 변경되고 활성 경로가 있으면 업데이트
    if (activePath && newValue.length === 1) {
      setActivePath({ ...activePath, additionalPotentialOption: newValue[0] });
    }

    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleStatTypeChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    setStatType(newValue);

    // 스탯타입이 변경되고 활성 경로가 있으면 업데이트
    if (activePath && newValue.length === 1) {
      setActivePath({ ...activePath, statType: newValue[0] });
    }

    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  const handleEnchantedFlagChange = (checked: boolean) => {
    setEnchantedFlag(checked);

    // 노작 여부가 ON(enchantedFlag가 false)이면 다른 옵션 초기화
    if (!checked) {
      setStarForce([]);
      setPotentialOption([]);
      setAdditionalPotentialOption([]);
      setStatType([]);
      setActivePath(null);
    }

    setTimeout(() => updateSelectedOptionIds(), 0);
  };

  // 활성 경로 설정
  const setActivePathValue = (path: CategoryPath) => {
    setActivePath(path);
  };

  // 특정 카테고리 경로에 대한 옵션 가져오기
  const getCategoryOptions = (
    categoryId: string,
    path: CategoryPath | null
  ): Option[] => {
    if (!itemOptionsData?.categorizedOptions || !path) {
      // 기본 옵션 반환 (첫 번째 카테고리인 경우)
      if (
        categoryId === "starForce" &&
        itemOptionsData?.availableOptions?.starForce
      ) {
        return itemOptionsData.availableOptions.starForce.map((sf) => ({
          value: sf,
          label: sf,
        }));
      }
      return [];
    }

    // 카테고리 경로에 따라 옵션 가져오기
    try {
      if (categoryId === "starForce") {
        // 최상위 카테고리는 직접 가져옴
        return Object.keys(itemOptionsData.categorizedOptions).map((key) => ({
          value: key,
          label: itemOptionsData.categorizedOptions[key].name,
        }));
      } else if (categoryId === "statType" && path.starForce) {
        // 스타포스가 선택된 경우 해당 스타포스의 하위 카테고리 가져오기
        const starForceCategory =
          itemOptionsData.categorizedOptions[path.starForce];
        if (!starForceCategory) return [];

        return Object.keys(starForceCategory.subCategories).map((key) => ({
          value: key,
          label: starForceCategory.subCategories[key].name,
        }));
      } else if (
        categoryId === "potentialOption" &&
        path.starForce &&
        path.statType
      ) {
        // 스타포스와 스탯타입이 선택된 경우
        const starForceCategory =
          itemOptionsData.categorizedOptions[path.starForce];
        if (!starForceCategory) return [];

        const statTypeCategory = starForceCategory.subCategories[path.statType];
        if (!statTypeCategory) return [];

        return Object.keys(statTypeCategory.subCategories).map((key) => ({
          value: key,
          label: statTypeCategory.subCategories[key].name,
        }));
      } else if (
        categoryId === "additionalPotentialOption" &&
        path.starForce &&
        path.statType &&
        path.potentialOption
      ) {
        // 스타포스, 스탯타입, 잠재능력이 선택된 경우
        const starForceCategory =
          itemOptionsData.categorizedOptions[path.starForce];
        if (!starForceCategory) return [];

        const statTypeCategory = starForceCategory.subCategories[path.statType];
        if (!statTypeCategory) return [];

        const potentialCategory =
          statTypeCategory.subCategories[path.potentialOption];
        if (!potentialCategory) return [];

        return Object.keys(potentialCategory.subCategories).map((key) => ({
          value: key,
          label: potentialCategory.subCategories[key].name,
        }));
      }
    } catch (error) {
      console.error("카테고리 옵션 가져오기 오류:", error);
    }

    return [];
  };

  // 특정 카테고리 경로에 대한 옵션 ID 가져오기
  const getOptionIdsForPath = (path: CategoryPath): number[] => {
    if (!itemOptionsData?.categorizedOptions || !path.starForce) return [];

    try {
      // 스타포스만 선택된 경우
      const starForceCategory =
        itemOptionsData.categorizedOptions[path.starForce];
      if (!starForceCategory) return [];

      if (!path.statType) return starForceCategory.optionIds;

      // 스타포스와 스탯타입이 선택된 경우
      const statTypeCategory = starForceCategory.subCategories[path.statType];
      if (!statTypeCategory) return [];

      if (!path.potentialOption) return statTypeCategory.optionIds;

      // 스타포스, 스탯타입, 잠재능력이 선택된 경우
      const potentialCategory =
        statTypeCategory.subCategories[path.potentialOption];
      if (!potentialCategory) return [];

      if (!path.additionalPotentialOption) return potentialCategory.optionIds;

      // 모든 카테고리가 선택된 경우
      const additionalCategory =
        potentialCategory.subCategories[path.additionalPotentialOption];
      if (!additionalCategory) return [];

      return additionalCategory.optionIds;
    } catch (error) {
      console.error("옵션 ID 가져오기 오류:", error);
      return [];
    }
  };

  // 인챈트 플래그 선택 가능 여부
  const isEnchantedFlagAvailable = (): boolean => {
    if (!itemOptionsData?.combinations) return false;

    // 활성 경로가 있고 모든 카테고리가 선택된 경우에만 인챈트 가능
    if (
      activePath?.starForce &&
      activePath?.statType &&
      activePath?.potentialOption &&
      activePath?.additionalPotentialOption
    ) {
      const optionIds = getOptionIdsForPath(activePath);
      return optionIds.some((id) => {
        const combo = itemOptionsData.combinations.find((c) => c.id === id);
        return combo?.enchantedFlag;
      });
    }

    return false;
  };

  // 옵션 초기화 함수
  const resetOptions = () => {
    setStarForce([]);
    setPotentialOption([]);
    setAdditionalPotentialOption([]);
    setStatType([]);
    setEnchantedFlag(false);
    setSelectedOptionIds([]);
    setActivePath(null);
    if (itemOptionsData?.combinations) {
      setAvailableCombinations(itemOptionsData.combinations);
    }
  };

  // 노작 여부 상태 반환 추가
  return {
    // 상태
    starForce,
    potentialOption,
    additionalPotentialOption,
    statType,
    enchantedFlag,
    selectedOptionIds,
    availableCombinations,
    activePath,
    notEnchantedItemId,

    // 핸들러
    handleStarForceChange,
    handlePotentialOptionChange,
    handleAdditionalPotentialOptionChange,
    handleStatTypeChange,
    handleEnchantedFlagChange,
    setActivePathValue,
    selectAllSubOptions,

    // 카테고리 옵션 함수
    getCategoryOptions,
    getOptionIdsForPath,
    isEnchantedFlagAvailable,

    // 상태 초기화
    resetOptions,
  };
}
