"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mini?: boolean;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "선택",
  disabled = false,
  className = "",
  mini = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

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
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, highlightedIndex, options, onChange]);

  // 드롭다운이 열릴 때 현재 선택된 옵션으로 하이라이트 설정
  useEffect(() => {
    if (isOpen) {
      const index = options.findIndex((option) => option.value === value);
      setHighlightedIndex(index >= 0 ? index : -1);
    }
  }, [isOpen, options, value]);

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
            !selectedOption ? "placeholder" : ""
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
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
                option.value === value ? "selected" : ""
              } ${index === highlightedIndex ? "highlighted" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
