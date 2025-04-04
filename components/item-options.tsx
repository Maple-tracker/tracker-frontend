"use client";

import { useState, useEffect } from "react";
import { CustomSelect } from "@/components/custom-select";

type ItemOptionsProps = {
  isActive: boolean;
  itemName: string | null;
  availableOptions: any;
  isLoading: boolean;
};

export function ItemOptions({
  isActive,
  itemName,
  availableOptions,
  isLoading,
}: ItemOptionsProps) {
  const [starForce, setStarForce] = useState("");
  const [upperPotential, setUpperPotential] = useState("");
  const [lowerPotentialGrade, setLowerPotentialGrade] = useState("");
  const [noDrag, setNoDrag] = useState(false);

  // 아이템이 변경되면 옵션 초기화
  useEffect(() => {
    setStarForce("");
    setUpperPotential("");
    setLowerPotentialGrade("");
    setNoDrag(false);
  }, [itemName]);

  // 옵션 데이터 포맷팅
  const starForceOptions = availableOptions?.starForce?.map(
    (option: string) => ({
      value: option,
      label: option,
    })
  ) || [
    { value: "0성", label: "0성" },
    { value: "10성", label: "10성" },
    { value: "15성", label: "15성" },
    { value: "17성", label: "17성" },
    { value: "20성", label: "20성" },
    { value: "22성", label: "22성" },
    { value: "25성", label: "25성" },
  ];

  const upperPotentialOptions = availableOptions?.upperPotential?.map(
    (option: string) => ({
      value: option,
      label: option,
    })
  ) || [
    { value: "3%", label: "3%" },
    { value: "6%", label: "6%" },
    { value: "9%", label: "9%" },
    { value: "12%", label: "12%" },
    { value: "15%", label: "15%" },
    { value: "18%", label: "18%" },
    { value: "21%", label: "21%" },
    { value: "24%", label: "24%" },
    { value: "27%", label: "27%" },
    { value: "30%", label: "30%" },
  ];

  const lowerPotentialGradeOptions = availableOptions?.lowerPotentialGrade?.map(
    (option: string) => ({
      value: option,
      label: option,
    })
  ) || [
    { value: "레어", label: "레어" },
    { value: "에픽", label: "에픽" },
    { value: "유니크", label: "유니크" },
    { value: "레전더리", label: "레전더리" },
  ];
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
            onChange={setStarForce}
            placeholder="스타포스 선택"
            disabled={!isActive || isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="upper-potential" className="text-white block">
            윗잠재능력 %
          </label>
          <CustomSelect
            options={upperPotentialOptions}
            value={upperPotential}
            onChange={setUpperPotential}
            placeholder="윗잠재능력 % 선택"
            disabled={!isActive || isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lower-potential-grade" className="text-white block">
            아랫잠재능력 등급
          </label>
          <CustomSelect
            options={lowerPotentialGradeOptions}
            value={lowerPotentialGrade}
            onChange={setLowerPotentialGrade}
            placeholder="아랫잠재능력 등급 선택"
            disabled={!isActive || isLoading}
          />
        </div>

        <div className="flex items-center space-x-2 h-full">
          <input
            type="checkbox"
            id="no-drag"
            checked={noDrag}
            onChange={(e) => setNoDrag(e.target.checked)}
            className="checkbox-input"
            disabled={!isActive || isLoading || !availableOptions?.hasNoDrag}
          />
          <label
            htmlFor="no-drag"
            className={`text-white ${
              !isActive || isLoading || !availableOptions?.hasNoDrag
                ? "opacity-50"
                : ""
            }`}
          >
            노작 여부
          </label>
        </div>
      </div>
    </div>
  );
}
