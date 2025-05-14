// 아이템 기본 정보 타입
export type ItemBasicInfo = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  level: number;
  tradable: boolean;
};

// 아이템 옵션 타입
export type ItemOption = {
  id: string;
  starForce: string;
  potentialOption: string; // 변경
  additionalPotentialOption: string; // 변경
  statType: string;
  enchantedFlag: boolean; // 변경
};

// 가격 데이터 포인트 타입
export type PriceDataPoint = {
  date: string; // ISO 형식 날짜 문자열 (YYYY-MM-DD)
  price: number; // 메소 단위 가격 (평균 가격)
  highPrice: number; // 일일 최고가
  lowPrice: number; // 일일 최저가
  volume: number; // 거래량
};

// 가격 통계 타입
export type PriceStats = {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChange: number; // 양수: 상승, 음수: 하락
  priceChangePercentage: number; // 백분율 (예: 4.17은 4.17%)
  lastUpdated: string; // ISO 형식 날짜 문자열
};

// 아이템 시세 API 응답 타입
export type ItemPriceResponse = {
  item: ItemBasicInfo;
  option?: ItemOption | null;
  itemOptions: ItemOption[];
  priceStats: PriceStats;
  priceHistory: PriceDataPoint[];
  relatedOptions?: ItemOption[]; // 관련 옵션 목록 (선택적)
};
