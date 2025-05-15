"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ItemOption } from "@/types/price-api-types";

type OptionTagsProps = {
  options: ItemOption[];
};

export function OptionTags({ options }: OptionTagsProps) {
  const [expandedOptions, setExpandedOptions] = useState<
    Record<string, boolean>
  >({});

  // 옵션이 하나만 있으면 기본적으로 펼쳐진 상태로 시작
  // 여러 개면 첫 번째만 펼쳐진 상태로 시작
  useState(() => {
    if (options.length === 1) {
      setExpandedOptions({ [options[0].id || "0"]: true });
    } else if (options.length > 1) {
      setExpandedOptions({ [options[0].id || "0"]: true });
    }
  });

  const toggleOption = (id: string) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 옵션이 없는 경우
  if (!options || options.length === 0) {
    return <div className="text-sm text-purple-300">옵션 정보가 없습니다</div>;
  }

  return (
    <div className="option-tags-container">
      {options.map((option, index) => {
        const optionId = option.id || index.toString();
        const isExpanded = expandedOptions[optionId];

        // 옵션 요약 정보 생성 (접힌 상태에서 표시)
        const summaryInfo = [
          option.starForce,
          `${option.potentialOption} ${option.statType}`,
          option.additionalPotentialOption,
          option.enchantedFlag ? "인챈트" : "",
        ]
          .filter(Boolean)
          .join(" | ");

        return (
          <div key={optionId} className="option-set mb-2">
            <div
              className="option-header"
              onClick={() => toggleOption(optionId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleOption(optionId);
                }
              }}
            >
              <div className="option-summary">
                {options.length > 1 && (
                  <span className="option-number">옵션 {index + 1}</span>
                )}
                <span className="option-summary-text">{summaryInfo}</span>
              </div>
              <button
                className="option-toggle-btn"
                aria-label={isExpanded ? "접기" : "펼치기"}
              >
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            <div
              className={`option-details ${
                isExpanded ? "expanded" : "collapsed"
              }`}
            >
              <div className="option-tag-container">
                <div className="option-tag-group">
                  <div className="option-tag-category">스타포스</div>
                  <div className="option-tag-value">{option.starForce}</div>
                </div>

                <div className="option-tag-group">
                  <div className="option-tag-category">잠재능력</div>
                  <div className="option-tag-value">
                    {option.potentialOption} {option.statType}
                  </div>
                </div>

                <div className="option-tag-group">
                  <div className="option-tag-category">에디셔널</div>
                  <div className="option-tag-value">
                    {option.additionalPotentialOption}
                  </div>
                </div>

                {option.enchantedFlag && (
                  <div className="option-tag-group">
                    <div className="option-tag-category">노작</div>
                    <div className="option-tag-value">적용</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
