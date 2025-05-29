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
  optionId: number;
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
  notEnchantedItemId?: number;
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

export type CategoryPath = {
  starForce?: string;
  statType?: string;
  potentialOption?: string;
  additionalPotentialOption?: string;
};

export type SelectedOption = {
  category: string;
  value: string;
  path: string[];
};

export function useItemOptions(itemOptionsData: ItemOptionsData | null) {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [enchantedFlag, setEnchantedFlag] = useState(true); // 기본값: 노작 아님 (인챈트/옵션 따짐)
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [availableCombinations, setAvailableCombinations] = useState<
    OptionCombination[]
  >([]);
  const [notEnchantedItemId, setNotEnchantedItemId] = useState<
    number | undefined
  >(undefined);
  const [activePath, setActivePath] = useState<CategoryPath | null>(null);

  useEffect(() => {
    setSelectedOptions([]);
    setEnchantedFlag(true);
    setSelectedOptionIds([]);
    setActivePath(null);
    setNotEnchantedItemId(itemOptionsData?.notEnchantedItemId);
    setAvailableCombinations(itemOptionsData?.combinations || []);
  }, [itemOptionsData]);

  const getSelectedValues = (
    category: string,
    path: string[] = []
  ): string[] => {
    const values = new Set<string>();
    selectedOptions.forEach((option) => {
      // 1. Check if the category matches
      if (option.category !== category) return;

      // 2. Check if the option's path starts with the provided parent path
      // and is exactly one level deeper.
      // The option.path should be like [...path, option.value]
      if (option.path.length !== path.length + 1) return;

      let parentPathMatches = true;
      for (let i = 0; i < path.length; i++) {
        if (option.path[i] !== path[i]) {
          parentPathMatches = false;
          break;
        }
      }

      if (parentPathMatches) {
        // The last element of option.path should be its value for this category
        if (option.path[path.length] === option.value) {
          values.add(option.value);
        }
      }
    });
    return Array.from(values);
  };

  const updateSelectedOptionIds = () => {
    console.log(
      "[updateSelectedOptionIds] Called. EnchantedFlag:",
      enchantedFlag,
      "SelectedOptions Count:",
      selectedOptions.length
    );

    if (!itemOptionsData) {
      console.log(
        "[updateSelectedOptionIds] No itemOptionsData, clearing IDs."
      );
      setSelectedOptionIds([]);
      return;
    }

    // 노작 여부가 ON인 경우 (enchantedFlag가 false)
    if (!enchantedFlag && itemOptionsData.notEnchantedItemId !== undefined) {
      console.log(
        "[updateSelectedOptionIds] '노작' selected, using notEnchantedItemId:",
        itemOptionsData.notEnchantedItemId
      );
      setSelectedOptionIds([itemOptionsData.notEnchantedItemId]);
      return;
    }

    // 노작 여부가 OFF인 경우 - enchantedFlag를 조합 매칭에서 제외
    if (!itemOptionsData.combinations || !itemOptionsData.categorizedOptions) {
      console.log(
        "[updateSelectedOptionIds] No combinations or categorizedOptions, clearing IDs."
      );
      setSelectedOptionIds([]);
      return;
    }

    const validOptionIds: number[] = [];
    const completeOptions = selectedOptions.filter(
      (option) =>
        option.category === "additionalPotentialOption" &&
        option.path.length === 4
    );

    console.log(
      "[updateSelectedOptionIds] All selectedOptions:",
      JSON.parse(JSON.stringify(selectedOptions))
    );
    console.log(
      "[updateSelectedOptionIds] Complete paths (additionalPotentialOption with path length 4):",
      JSON.parse(JSON.stringify(completeOptions))
    );

    completeOptions.forEach((additionalOption) => {
      const [
        starForcePathVal,
        statTypePathVal,
        potentialOptionPathVal,
        additionalPotentialOptionPathVal,
      ] = additionalOption.path;
      console.log(
        `[updateSelectedOptionIds] Processing complete path: [${starForcePathVal}, ${statTypePathVal}, ${potentialOptionPathVal}, ${additionalPotentialOptionPathVal}] (enchantedFlag excluded from matching)`
      );

      const matchingCombinations = itemOptionsData.combinations.filter(
        (combo) => {
          // Detailed logging for specific path components if they look like labels
          if (
            starForcePathVal.endsWith("성") ||
            potentialOptionPathVal.includes("%") ||
            additionalPotentialOptionPathVal.includes(" ")
          ) {
            // This block will log if any path component seems to be a label rather than a raw value.
          }

          // More specific logging when starForce and statType seem to match, to inspect further
          if (
            String(combo.starForce) === starForcePathVal.replace(/\D/g, "") &&
            combo.statType === statTypePathVal
          ) {
            console.log(
              `[Debug Match Attempt] Path: [${starForcePathVal}, ${statTypePathVal}, ${potentialOptionPathVal}, ${additionalPotentialOptionPathVal}]`
            );
            console.log(
              `  Combo ID: ${combo.id}, StarForce: ${combo.starForce}, StatType: ${combo.statType}, Potential: "${combo.potentialOption}", Additional: "${combo.additionalPotentialOption}"`
            );
            console.log(
              `  Comparing Potential: "${combo.potentialOption}" vs "${potentialOptionPathVal}"`
            );
            console.log(
              `  Comparing Additional: "${combo.additionalPotentialOption}" vs "${additionalPotentialOptionPathVal}"`
            );
          }
          const isMatch =
            String(combo.starForce) === starForcePathVal.replace(/\D/g, "") && // "XX성" 같은 문자열에서 숫자만 추출하여 비교
            combo.statType === statTypePathVal &&
            combo.potentialOption === potentialOptionPathVal &&
            combo.additionalPotentialOption ===
              additionalPotentialOptionPathVal;
          // enchantedFlag 조건 제거

          if (isMatch) {
            console.log(
              `[updateSelectedOptionIds]   ✅ Match found for combo ID ${combo.id}:`,
              combo
            );
          }
          return isMatch;
        }
      );

      if (matchingCombinations.length === 0) {
        console.log(
          `[updateSelectedOptionIds]   ❌ No matching combinations found for path [${starForcePathVal}, ${statTypePathVal}, ${potentialOptionPathVal}, ${additionalPotentialOptionPathVal}]`
        );
      }

      matchingCombinations.forEach((combo) => {
        if (!validOptionIds.includes(combo.id)) {
          validOptionIds.push(combo.id);
        }
      });
    });

    console.log(
      "[updateSelectedOptionIds] Final validOptionIds:",
      validOptionIds
    );
    setSelectedOptionIds(validOptionIds);
  };

  useEffect(() => {
    updateSelectedOptionIds();
  }, [selectedOptions, enchantedFlag, itemOptionsData]);

  const isOptionSelected = (
    category: string,
    value: string,
    path: string[] = []
  ): boolean => {
    return selectedOptions.some((option) => {
      if (option.category !== category || option.value !== value) return false;
      if (path.length === 0) return true;
      const expectedPath = [...path, value];
      if (expectedPath.length !== option.path.length) return false;
      for (let i = 0; i < expectedPath.length; i++) {
        if (expectedPath[i] !== option.path[i]) return false;
      }
      return true;
    });
  };

  const addOption = (category: string, value: string, path: string[] = []) => {
    if (isOptionSelected(category, value, path)) return;
    const fullPath = [...path, value];
    setSelectedOptions((prev) => {
      // 중복 추가 방지 (경로까지 완전히 동일한 경우)
      if (
        prev.some(
          (opt) =>
            opt.category === category &&
            opt.value === value &&
            JSON.stringify(opt.path) === JSON.stringify(fullPath)
        )
      ) {
        return prev;
      }
      return [...prev, { category, value, path: fullPath }];
    });
  };

  const removeOption = (
    category: string,
    value: string,
    path: string[] = []
  ) => {
    setSelectedOptions((prev) =>
      prev.filter((option) => {
        if (option.category !== category || option.value !== value) return true;
        const expectedPath = [...path, value];
        if (expectedPath.length !== option.path.length) return true;
        for (let i = 0; i < expectedPath.length; i++) {
          if (expectedPath[i] !== option.path[i]) return true;
        }
        return false;
      })
    );
  };

  const removeAllSubOptions = (pathPrefix: string[]) => {
    if (pathPrefix.length === 0) return;
    setSelectedOptions((prev) =>
      prev.filter((option) => {
        if (option.path.length <= pathPrefix.length) return true; // Keep shorter or same-length paths
        for (let i = 0; i < pathPrefix.length; i++) {
          if (option.path[i] !== pathPrefix[i]) return true; // Path prefix doesn't match, keep
        }
        return false; // Path prefix matches, remove
      })
    );
  };

  const selectAllSubOptions = (categoryId: string, value: string) => {
    if (!itemOptionsData?.categorizedOptions) return;

    try {
      let currentSelectionPath: CategoryPath = {};
      let basePathArray: string[] = [];

      if (categoryId === "starForce") {
        currentSelectionPath = { starForce: value };
        basePathArray = [value];
        const starForceCat = itemOptionsData.categorizedOptions[value];
        if (!starForceCat) return;

        Object.keys(starForceCat.subCategories).forEach((statTypeValue) => {
          addOption("statType", statTypeValue, basePathArray);
          const statTypeCat = starForceCat.subCategories[statTypeValue];
          if (statTypeCat) {
            Object.keys(statTypeCat.subCategories).forEach(
              (potentialOptionValue) => {
                addOption("potentialOption", potentialOptionValue, [
                  ...basePathArray,
                  statTypeValue,
                ]);
                const potentialCat =
                  statTypeCat.subCategories[potentialOptionValue];
                if (potentialCat) {
                  Object.keys(potentialCat.subCategories).forEach(
                    (additionalOptionValue) => {
                      addOption(
                        "additionalPotentialOption",
                        additionalOptionValue,
                        [...basePathArray, statTypeValue, potentialOptionValue]
                      );
                    }
                  );
                }
              }
            );
          }
        });
        // Set activePath to the first fully traversable path for UI guidance
        const firstStat = Object.keys(starForceCat.subCategories)[0];
        if (firstStat) {
          currentSelectionPath.statType = firstStat;
          const firstPotCat =
            starForceCat.subCategories[firstStat]?.subCategories;
          const firstPot = firstPotCat
            ? Object.keys(firstPotCat)[0]
            : undefined;
          if (firstPot) {
            currentSelectionPath.potentialOption = firstPot;
            const firstAddCat = firstPotCat[firstPot]?.subCategories;
            const firstAdd = firstAddCat
              ? Object.keys(firstAddCat)[0]
              : undefined;
            if (firstAdd)
              currentSelectionPath.additionalPotentialOption = firstAdd;
          }
        }
      } else if (categoryId === "statType" && activePath?.starForce) {
        currentSelectionPath = {
          starForce: activePath.starForce,
          statType: value,
        };
        basePathArray = [activePath.starForce, value];
        const statTypeCat =
          itemOptionsData.categorizedOptions[activePath.starForce]
            ?.subCategories[value];
        if (!statTypeCat) return;

        Object.keys(statTypeCat.subCategories).forEach(
          (potentialOptionValue) => {
            addOption("potentialOption", potentialOptionValue, basePathArray);
            const potentialCat =
              statTypeCat.subCategories[potentialOptionValue];
            if (potentialCat) {
              Object.keys(potentialCat.subCategories).forEach(
                (additionalOptionValue) => {
                  addOption(
                    "additionalPotentialOption",
                    additionalOptionValue,
                    [...basePathArray, potentialOptionValue]
                  );
                }
              );
            }
          }
        );
        const firstPotCat = statTypeCat.subCategories;
        const firstPot = firstPotCat ? Object.keys(firstPotCat)[0] : undefined;
        if (firstPot) {
          currentSelectionPath.potentialOption = firstPot;
          const firstAddCat = firstPotCat[firstPot]?.subCategories;
          const firstAdd = firstAddCat
            ? Object.keys(firstAddCat)[0]
            : undefined;
          if (firstAdd)
            currentSelectionPath.additionalPotentialOption = firstAdd;
        }
      } else if (
        categoryId === "potentialOption" &&
        activePath?.starForce &&
        activePath?.statType
      ) {
        currentSelectionPath = {
          starForce: activePath.starForce,
          statType: activePath.statType,
          potentialOption: value,
        };
        basePathArray = [activePath.starForce, activePath.statType, value];
        const potentialCat =
          itemOptionsData.categorizedOptions[activePath.starForce]
            ?.subCategories[activePath.statType]?.subCategories[value];
        if (!potentialCat) return;

        Object.keys(potentialCat.subCategories).forEach(
          (additionalOptionValue) => {
            addOption(
              "additionalPotentialOption",
              additionalOptionValue,
              basePathArray
            );
          }
        );
        const firstAddCat = potentialCat.subCategories;
        const firstAdd = firstAddCat ? Object.keys(firstAddCat)[0] : undefined;
        if (firstAdd) currentSelectionPath.additionalPotentialOption = firstAdd;
      }

      setActivePath(currentSelectionPath);
    } catch (error) {
      console.error("Error in selectAllSubOptions:", error);
    }
  };

  const handleStarForceChange = (values: string | string[]) => {
    const newValues = Array.isArray(values) ? values : [values];
    const currentSelected = getSelectedValues("starForce");

    currentSelected.forEach((val) => {
      if (!newValues.includes(val)) {
        removeOption("starForce", val);
        removeAllSubOptions([val]);
      }
    });
    newValues.forEach((val) => {
      if (!currentSelected.includes(val)) {
        addOption("starForce", val);
      }
    });

    if (newValues.length === 1) setActivePath({ starForce: newValues[0] });
    else if (newValues.length === 0) setActivePath(null);
  };

  const handlePotentialOptionChange = (
    values: string | string[],
    path: string[] = []
  ) => {
    const newValues = Array.isArray(values) ? values : [values];
    const currentSelected = getSelectedValues("potentialOption", path);

    currentSelected.forEach((val) => {
      if (!newValues.includes(val)) {
        removeOption("potentialOption", val, path);
        removeAllSubOptions([...path, val]);
      }
    });
    newValues.forEach((val) => {
      if (!currentSelected.includes(val)) {
        addOption("potentialOption", val, path);
      }
    });
    if (activePath && newValues.length === 1)
      setActivePath({ ...activePath, potentialOption: newValues[0] });
  };

  const handleAdditionalPotentialOptionChange = (
    values: string | string[],
    path: string[] = []
  ) => {
    const newValues = Array.isArray(values) ? values : [values];
    const currentSelected = getSelectedValues(
      "additionalPotentialOption",
      path
    );

    currentSelected.forEach((val) => {
      if (!newValues.includes(val))
        removeOption("additionalPotentialOption", val, path);
    });
    newValues.forEach((val) => {
      if (!currentSelected.includes(val))
        addOption("additionalPotentialOption", val, path);
    });
    if (activePath && newValues.length === 1)
      setActivePath({ ...activePath, additionalPotentialOption: newValues[0] });
  };

  const handleStatTypeChange = (
    values: string | string[],
    path: string[] = []
  ) => {
    const newValues = Array.isArray(values) ? values : [values];
    const currentSelected = getSelectedValues("statType", path);

    currentSelected.forEach((val) => {
      if (!newValues.includes(val)) {
        removeOption("statType", val, path);
        removeAllSubOptions([...path, val]);
      }
    });
    newValues.forEach((val) => {
      if (!currentSelected.includes(val)) {
        addOption("statType", val, path);
      }
    });
    if (activePath && newValues.length === 1)
      setActivePath({ ...activePath, statType: newValues[0] });
  };

  const handleEnchantedFlagChange = (checked: boolean) => {
    setEnchantedFlag(checked);
    if (!checked) {
      // "노작" selected (enchantedFlag is false)
      setSelectedOptions([]);
      setActivePath(null);
    }
  };

  const setActivePathValue = (path: CategoryPath) => setActivePath(path);

  const getCategoryOptions = (
    categoryId: string,
    currentPath: CategoryPath | null
  ): Option[] => {
    if (!itemOptionsData?.categorizedOptions) return [];

    try {
      if (categoryId === "starForce") {
        return Object.keys(itemOptionsData.categorizedOptions).map((key) => ({
          value: key,
          label: itemOptionsData.categorizedOptions[key].name,
        }));
      }
      if (!currentPath) return [];

      if (categoryId === "statType" && currentPath.starForce) {
        const starForceCat =
          itemOptionsData.categorizedOptions[currentPath.starForce];
        return starForceCat
          ? Object.keys(starForceCat.subCategories).map((key) => ({
              value: key,
              label: starForceCat.subCategories[key].name,
            }))
          : [];
      }
      if (
        categoryId === "potentialOption" &&
        currentPath.starForce &&
        currentPath.statType
      ) {
        const statTypeCat =
          itemOptionsData.categorizedOptions[currentPath.starForce]
            ?.subCategories[currentPath.statType];
        return statTypeCat
          ? Object.keys(statTypeCat.subCategories).map((key) => ({
              value: key,
              label: statTypeCat.subCategories[key].name,
            }))
          : [];
      }
      if (
        categoryId === "additionalPotentialOption" &&
        currentPath.starForce &&
        currentPath.statType &&
        currentPath.potentialOption
      ) {
        const potentialCat =
          itemOptionsData.categorizedOptions[currentPath.starForce]
            ?.subCategories[currentPath.statType]?.subCategories[
            currentPath.potentialOption
          ];
        return potentialCat
          ? Object.keys(potentialCat.subCategories).map((key) => ({
              value: key,
              label: potentialCat.subCategories[key].name,
            }))
          : [];
      }
    } catch (error) {
      console.error(
        "Error getting category options for",
        categoryId,
        "with path",
        currentPath,
        error
      );
    }
    return [];
  };

  const getOptionIdsForPath = (path: CategoryPath): number[] => {
    // This function might not be strictly needed if updateSelectedOptionIds works correctly
    // but can be kept for direct path-to-ID lookups if necessary.
    // For now, primary logic is in updateSelectedOptionIds.
    return []; // Placeholder, as primary logic is in updateSelectedOptionIds
  };

  const isEnchantedFlagAvailable = (): boolean => {
    // This logic might also be simplified if dependent on selected combinations
    return true; // Placeholder
  };

  const resetOptions = () => {
    setSelectedOptions([]);
    setEnchantedFlag(true);
    // selectedOptionIds will be cleared by useEffect -> updateSelectedOptionIds
    setActivePath(null);
  };

  const getCurrentPath = (categoryId: string): string[] => {
    if (!activePath) return [];
    if (categoryId === "starForce") return [];
    if (categoryId === "statType" && activePath.starForce)
      return [activePath.starForce];
    if (
      categoryId === "potentialOption" &&
      activePath.starForce &&
      activePath.statType
    )
      return [activePath.starForce, activePath.statType];
    if (
      categoryId === "additionalPotentialOption" &&
      activePath.starForce &&
      activePath.statType &&
      activePath.potentialOption
    ) {
      return [
        activePath.starForce,
        activePath.statType,
        activePath.potentialOption,
      ];
    }
    return [];
  };

  return {
    starForce: getSelectedValues("starForce"),
    potentialOption: getSelectedValues(
      "potentialOption",
      getCurrentPath("potentialOption")
    ),
    additionalPotentialOption: getSelectedValues(
      "additionalPotentialOption",
      getCurrentPath("additionalPotentialOption")
    ),
    statType: getSelectedValues("statType", getCurrentPath("statType")),
    enchantedFlag,
    selectedOptionIds,
    availableCombinations,
    activePath,
    notEnchantedItemId,
    selectedOptions,
    handleStarForceChange,
    handlePotentialOptionChange,
    handleAdditionalPotentialOptionChange,
    handleStatTypeChange,
    handleEnchantedFlagChange,
    setActivePathValue,
    selectAllSubOptions,
    getCategoryOptions,
    getOptionIdsForPath,
    isEnchantedFlagAvailable,
    isOptionSelected,
    getSelectedValues,
    getCurrentPath,
    resetOptions,
  };
}
