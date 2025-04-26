"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EquippedItem } from "@/app/api/character/[name]/route";

// 아이템 슬롯 위치 정의 - 새로운 레이아웃으로 업데이트
const SLOT_POSITIONS: Record<string, { grid: string; position: string }> = {
  // 1행
  반지4: { grid: "1 / 1 / 2 / 2", position: "top-left" },
  얼굴장식: { grid: "1 / 2 / 2 / 3", position: "top-left" },
  모자: { grid: "1 / 6 / 2 / 7", position: "top-right" },
  신발: { grid: "1 / 7 / 2 / 8", position: "top-right" },

  // 2행
  반지3: { grid: "2 / 1 / 3 / 2", position: "middle-left" },
  눈장식: { grid: "2 / 2 / 3 / 3", position: "middle-left" },
  상의: { grid: "2 / 6 / 3 / 7", position: "middle-right" },
  장갑: { grid: "2 / 7 / 3 / 8", position: "middle-right" },

  // 3행
  반지2: { grid: "3 / 1 / 4 / 2", position: "middle-left" },
  귀고리: { grid: "3 / 2 / 4 / 3", position: "middle-left" },
  하의: { grid: "3 / 6 / 4 / 7", position: "middle-right" },
  망토: { grid: "3 / 7 / 4 / 8", position: "middle-right" },

  // 4행
  반지1: { grid: "4 / 1 / 5 / 2", position: "middle-left" },
  목걸이2: { grid: "4 / 2 / 5 / 3", position: "middle-left" },
  어깨장식: { grid: "4 / 6 / 5 / 7", position: "middle-right" },
  훈장: { grid: "4 / 7 / 5 / 8", position: "middle-right" },

  // 5행 (모든 슬롯 채워짐)
  뱃지: { grid: "5 / 1 / 6 / 2", position: "bottom" },
  목걸이1: { grid: "5 / 2 / 6 / 3", position: "bottom" },
  무기: { grid: "5 / 3 / 6 / 4", position: "bottom" },
  보조무기: { grid: "5 / 4 / 6 / 5", position: "bottom" },
  엠블렘: { grid: "5 / 5 / 6 / 6", position: "bottom" },
  안드로이드: { grid: "5 / 6 / 6 / 7", position: "bottom" },
  기계심장: { grid: "5 / 7 / 6 / 8", position: "bottom" },

  // 6행
  벨트: { grid: "6 / 1 / 7 / 2", position: "bottom" },
  포켓아이템: { grid: "6 / 7 / 7 / 8", position: "bottom" },
};

interface CharacterEquipmentProps {
  equippedItems: EquippedItem[];
  characterImageUrl: string;
  characterName: string;
}

export function CharacterEquipment({
  equippedItems,
  characterImageUrl,
  characterName,
}: CharacterEquipmentProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<EquippedItem | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 아이템 슬롯 클릭 핸들러
  const handleItemClick = (item: EquippedItem) => {
    // 아이템 시세 페이지로 이동
    router.push(`/item/${encodeURIComponent(item.name)}`);
  };

  // 아이템 호버 핸들러
  const handleItemHover = (e: React.MouseEvent, item: EquippedItem | null) => {
    setHoveredItem(item);
    if (item) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    } else {
      setMousePosition(null);
    }
  };

  // 슬롯별 아이템 매핑
  const itemsBySlot: Record<string, EquippedItem | null> = {};

  // 모든 슬롯을 null로 초기화
  Object.keys(SLOT_POSITIONS).forEach((slot) => {
    itemsBySlot[slot] = null;
  });

  // 장착된 아이템으로 채우기
  equippedItems.forEach((item) => {
    // API에서 오는 슬롯 이름과 우리가 사용하는 슬롯 이름 매핑
    const slotMapping: Record<string, string> = {
      모자: "모자",
      얼굴장식: "얼굴장식",
      눈장식: "눈장식",
      귀고리: "귀고리",
      상의: "상의",
      망토: "망토",
      벨트: "벨트",
      바지: "하의",
      장갑: "장갑",
      신발: "신발",
      반지1: "반지1",
      반지2: "반지2",
      반지3: "반지3",
      반지4: "반지4",
      펜던트1: "목걸이1",
      펜던트2: "목걸이2",
      무기: "무기",
      보조무기: "보조무기",
      엠블렘: "엠블렘",
      뱃지: "뱃지",
      훈장: "훈장",
      어깨장식: "어깨장식",
      포켓아이템: "포켓아이템",
      안드로이드: "안드로이드",
      하트: "기계심장",
      보조장비: "포켓아이템",
    };

    const mappedSlot = slotMapping[item.slot] || item.slot;

    if (mappedSlot in itemsBySlot) {
      itemsBySlot[mappedSlot] = item;
    }
  });

  return (
    <div className="character-equipment-container">
      {/* 캐릭터 장비창 */}
      <div className="equipment-grid">
        {/* 모든 슬롯 렌더링 */}
        {Object.entries(SLOT_POSITIONS).map(([slot, { grid }]) => {
          const item = itemsBySlot[slot];
          return (
            <div
              key={slot}
              className={`equipment-slot ${item ? "has-item" : "empty"}`}
              style={{ gridArea: grid }}
              onClick={() => item && handleItemClick(item)}
              onMouseEnter={(e) => item && handleItemHover(e, item)}
              onMouseLeave={() => handleItemHover({} as React.MouseEvent, null)}
              onMouseMove={(e) => item && handleItemHover(e, item)}
            >
              {item ? (
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="item-image"
                />
              ) : (
                <div className="empty-slot-label">{slot}</div>
              )}
            </div>
          );
        })}

        {/* 캐릭터 이미지 */}
        <div className="character-image-container">
          <img
            src={characterImageUrl || "/placeholder.svg"}
            alt={characterName}
            className="character-image"
          />
          <div className="character-name">{characterName}</div>
        </div>
      </div>

      {/* 아이템 상세 정보 툴팁 */}
      {hoveredItem && mousePosition && (
        <div
          className="item-tooltip"
          style={{
            position: "fixed",
            top: mousePosition.y + 15,
            left: mousePosition.x + 15,
            zIndex: 1000,
          }}
        >
          <div className="tooltip-header">
            <div className="tooltip-title">{hoveredItem.name}</div>
            {hoveredItem.starForce && (
              <div className="tooltip-starforce">{hoveredItem.starForce}</div>
            )}
          </div>

          <div className="tooltip-body">
            {hoveredItem.itemLevel && (
              <div className="tooltip-row">
                <span className="tooltip-label">레벨:</span>
                <span className="tooltip-value">{hoveredItem.itemLevel}</span>
              </div>
            )}

            {hoveredItem.category && (
              <div className="tooltip-row">
                <span className="tooltip-label">분류:</span>
                <span className="tooltip-value">{hoveredItem.category}</span>
              </div>
            )}

            {hoveredItem.potentialOption && (
              <div className="tooltip-row">
                <span className="tooltip-label">잠재능력:</span>
                <span className="tooltip-value">
                  {hoveredItem.potentialOption} {hoveredItem.statType}
                </span>
              </div>
            )}

            {hoveredItem.additionalPotentialOption && (
              <div className="tooltip-row">
                <span className="tooltip-label">에디셔널:</span>
                <span className="tooltip-value">
                  {hoveredItem.additionalPotentialOption}
                </span>
              </div>
            )}

            {hoveredItem.enchantedFlag && (
              <div className="tooltip-row">
                <span className="tooltip-label">인챈트:</span>
                <span className="tooltip-value">적용됨</span>
              </div>
            )}

            {hoveredItem.price && (
              <div className="tooltip-row tooltip-price">
                <span className="tooltip-label">시세:</span>
                <span className="tooltip-value">
                  {hoveredItem.price.toLocaleString()} 메소
                </span>
              </div>
            )}
          </div>

          <div className="tooltip-footer">클릭하여 아이템 시세 확인</div>
        </div>
      )}

      <style jsx>{`
        .character-equipment-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          padding: 0.25rem;
          position: relative;
        }

        .equipment-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, auto);
          gap: 0.15rem;
          background-color: rgba(26, 26, 46, 0.3);
          backdrop-filter: blur(4px);
          border-radius: 0.375rem;
          border: 1px solid rgba(40, 18, 102, 0.5);
          padding: 0.25rem;
          position: relative;
          max-height: 350px; /* Fixed smaller height */
        }

        .character-image-container {
          grid-area: 1 / 3 / 5 / 6; /* 가운데 3칸, 세로 4칸 차지 */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .character-image {
          width: 100%;
          max-width: 50px; /* Smaller character image */
          height: auto;
          object-fit: contain;
        }

        .character-name {
          margin-top: 0.15rem;
          font-size: 0.65rem;
          color: white;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .equipment-slot {
          background-color: rgba(15, 15, 26, 0.5);
          border: 1px solid rgba(60, 27, 153, 0.3);
          border-radius: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          padding: 0.1rem;
          transition: all 0.2s ease;
          min-width: 0;
          min-height: 0;
        }

        .equipment-slot.has-item {
          background-color: rgba(26, 26, 46, 0.7);
          cursor: pointer;
        }

        .equipment-slot.has-item:hover {
          transform: scale(1.05);
          border-color: rgba(100, 45, 255, 0.8);
          box-shadow: 0 0 8px rgba(100, 45, 255, 0.5);
          z-index: 10;
        }

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          max-width: 100%;
          max-height: 100%;
        }

        .empty-slot-label {
          font-size: 0.4rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-tooltip {
          background-color: rgba(26, 26, 46, 0.95);
          border: 1px solid #3c1b99;
          border-radius: 0.375rem;
          padding: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          min-width: 180px;
          max-width: 250px;
          pointer-events: none;
        }

        .tooltip-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.25rem;
          margin-bottom: 0.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tooltip-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .tooltip-starforce {
          font-size: 0.65rem;
          color: #ffd700;
        }

        .tooltip-body {
          display: grid;
          gap: 0.15rem;
          margin-bottom: 0.25rem;
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
        }

        .tooltip-label {
          color: #c1abff;
        }

        .tooltip-value {
          color: white;
          font-weight: 500;
        }

        .tooltip-price {
          margin-top: 0.15rem;
          padding-top: 0.15rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tooltip-price .tooltip-value {
          color: #4ade80;
        }

        .tooltip-footer {
          font-size: 0.6rem;
          color: #a281ff;
          text-align: center;
          margin-top: 0.25rem;
          font-style: italic;
        }

        /* Media queries for responsive design */
        @media (min-width: 480px) {
          .equipment-grid {
            gap: 0.2rem;
            padding: 0.3rem;
            max-height: 380px;
          }

          .character-image {
            max-width: 55px;
          }

          .character-name {
            font-size: 0.7rem;
          }

          .empty-slot-label {
            font-size: 0.45rem;
          }
        }

        @media (min-width: 640px) {
          .equipment-grid {
            gap: 0.25rem;
            padding: 0.4rem;
            max-height: 400px;
          }

          .character-image {
            max-width: 60px;
          }

          .character-name {
            font-size: 0.75rem;
            margin-top: 0.2rem;
          }

          .empty-slot-label {
            font-size: 0.5rem;
          }

          .equipment-slot {
            padding: 0.15rem;
          }
        }
      `}</style>
    </div>
  );
}
