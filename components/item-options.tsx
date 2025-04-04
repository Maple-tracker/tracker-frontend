"use client";

import { useState, useEffect } from "react";

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
          <select
            id="star-force"
            value={starForce}
            onChange={(e) => setStarForce(e.target.value)}
            className="select-input"
            disabled={!isActive || isLoading}
          >
            <option value="" disabled>
              스타포스 선택
            </option>
            {availableOptions?.starForce?.map(
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

        <div className="space-y-2">
          <label htmlFor="upper-potential" className="text-white block">
            윗잠재능력 %
          </label>
          <select
            id="upper-potential"
            value={upperPotential}
            onChange={(e) => setUpperPotential(e.target.value)}
            className="select-input"
            disabled={!isActive || isLoading}
          >
            <option value="" disabled>
              윗잠재능력 % 선택
            </option>
            {availableOptions?.upperPotential?.map(
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

        <div className="space-y-2">
          <label htmlFor="lower-potential-grade" className="text-white block">
            아랫잠재능력 등급
          </label>
          <select
            id="lower-potential-grade"
            value={lowerPotentialGrade}
            onChange={(e) => setLowerPotentialGrade(e.target.value)}
            className="select-input"
            disabled={!isActive || isLoading}
          >
            <option value="" disabled>
              아랫잠재능력 등급 선택
            </option>
            {availableOptions?.lowerPotentialGrade?.map(
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
