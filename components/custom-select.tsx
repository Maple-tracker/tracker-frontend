"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Option } from "@/hooks/use-item-options";

type CustomSelectProps = {
  options: Option[];
  value: string | string[]; // 단일 또는 다중 선택 지원
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mini?: boolean;
  multiple?: boolean; // 다중 선택 지원 여부
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "선택",
  disabled = false,
  className = "",
  mini = false,
  multiple = false, // 기본값은 단일 선택
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 다중 선택인 경우 value를 배열로 처리
  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : [value as string];

  // 선택된 옵션 텍스트 표시
  const getSelectedText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find((opt) => opt.value === selectedValues[0]);
        return option ? option.label : placeholder;
      }
      return `${selectedValues.length}개 선택됨`;
    } else {
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 키보드 접근성
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let nextIndex = prev + 1;
          while (nextIndex < options.length && options[nextIndex].disabled) {
            nextIndex++;
          }
          return nextIndex < options.length ? nextIndex : prev;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let nextIndex = prev - 1;
          while (nextIndex >= 0 && options[nextIndex].disabled) {
            nextIndex--;
          }
          return nextIndex >= 0 ? nextIndex : prev;
        });
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const option = options[highlightedIndex];
        if (!option.disabled) {
          handleOptionSelect(option.value);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, highlightedIndex, options]);

  // 드롭다운이 열릴 때 현재 선택된 옵션으로 하이라이트 설정
  useEffect(() => {
    if (isOpen && !multiple) {
      const index = options.findIndex((option) => option.value === value);
      setHighlightedIndex(index >= 0 ? index : -1);
    }
  }, [isOpen, options, value, multiple]);

  // 옵션 선택 핸들러
  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      // 다중 선택 모드
      const newSelectedValues = [...selectedValues];
      const index = newSelectedValues.indexOf(optionValue);

      if (index >= 0) {
        // 이미 선택된 경우 제거
        newSelectedValues.splice(index, 1);
      } else {
        // 선택되지 않은 경우 추가
        newSelectedValues.push(optionValue);
      }

      onChange(newSelectedValues);
    } else {
      // 단일 선택 모드
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-dropdown-container ${mini ? "mini" : ""} ${className}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }}
    >
      <div
        className={`custom-dropdown-header ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <span
          className={`custom-dropdown-selected ${
            selectedValues.length === 0 ? "placeholder" : ""
          }`}
        >
          {getSelectedText()}
        </span>
        <ChevronDown
          className={`custom-dropdown-icon ${isOpen ? "open" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="custom-dropdown-options">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`custom-dropdown-option ${
                selectedValues.includes(option.value) ? "selected" : ""
              } ${index === highlightedIndex ? "highlighted" : ""} ${
                option.disabled ? "disabled" : ""
              }`}
              onClick={() => {
                if (!option.disabled) {
                  handleOptionSelect(option.value);
                }
              }}
              onMouseEnter={() => {
                if (!option.disabled) {
                  setHighlightedIndex(index);
                }
              }}
            >
              {multiple && (
                <div className="custom-dropdown-checkbox">
                  {selectedValues.includes(option.value) && (
                    <Check className="custom-dropdown-check-icon" />
                  )}
                </div>
              )}
              <div className="custom-dropdown-option-content">
                <span>{option.label}</span>
                {option.combinationInfo && (
                  <span className="custom-dropdown-combination-info">
                    {option.combinationInfo}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-dropdown-option {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
        }

        .custom-dropdown-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid #3c1b99;
          border-radius: 3px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(60, 27, 153, 0.2);
          flex-shrink: 0;
        }

        .custom-dropdown-option.selected .custom-dropdown-checkbox {
          background-color: #642dff;
        }

        .custom-dropdown-check-icon {
          width: 12px;
          height: 12px;
          color: white;
        }

        .custom-dropdown-container.mini .custom-dropdown-checkbox {
          width: 14px;
          height: 14px;
        }

        .custom-dropdown-container.mini .custom-dropdown-check-icon {
          width: 10px;
          height: 10px;
        }

        .custom-dropdown-option-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
        }

        .custom-dropdown-combination-info {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .custom-dropdown-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
