import { NextResponse } from "next/server";

// 캐릭터 장비 아이템 타입 정의
export type EquippedItem = {
  id: string;
  name: string;
  imageUrl: string;
  slot: string;
  starForce?: string;
  potentialOption?: string;
  additionalPotentialOption?: string;
  statType?: string;
  enchantedFlag?: boolean;
  itemLevel?: number;
  category?: string;
  price?: number;
};

// 캐릭터 정보 타입 정의
export type CharacterData = {
  id: string;
  name: string;
  imageUrl: string;
  level: number;
  job: string;
  server: string;
  guild?: string | null;
  equippedItems: EquippedItem[];
  lastUpdated: string;
};

// 샘플 캐릭터 데이터 생성 함수
function generateSampleCharacterData(name: string): CharacterData {
  // 직업 목록
  const jobs = [
    "히어로",
    "팔라딘",
    "다크나이트",
    "아크메이지(불,독)",
    "아크메이지(썬,콜)",
    "비숍",
    "보우마스터",
    "신궁",
    "패스파인더",
    "나이트로드",
    "섀도어",
    "듀얼블레이드",
    "바이퍼",
    "캡틴",
    "캐논슈터",
    "소울마스터",
    "미하일",
    "블래스터",
    "데몬슬레이어",
    "데몬어벤져",
    "아란",
    "에반",
    "루미너스",
    "메르세데스",
    "팬텀",
    "은월",
    "카이저",
    "카인",
    "카데나",
    "엔젤릭버스터",
    "아델",
    "일리움",
    "아크",
    "라라",
    "호영",
    "제로",
    "키네시스",
  ];

  // 서버 목록
  const servers = [
    "스카니아",
    "베라",
    "루나",
    "제니스",
    "크로아",
    "유니온",
    "엘리시움",
    "이노시스",
    "레드",
    "오로라",
    "아케인",
    "노바",
  ];

  // 길드 목록
  const guilds = [
    "메이플길드",
    "영웅길드",
    "친목길드",
    "헌터길드",
    "레이드길드",
    "초보길드",
    "마스터길드",
    null,
  ];

  // 아이템 슬롯 목록 - 새로운 레이아웃에 맞게 업데이트
  const slots = [
    "모자",
    "얼굴장식",
    "눈장식",
    "귀고리",
    "상의",
    "망토",
    "벨트",
    "바지",
    "장갑",
    "신발",
    "반지1",
    "반지2",
    "반지3",
    "반지4",
    "펜던트1",
    "펜던트2",
    "무기",
    "보조무기",
    "엠블렘",
    "뱃지",
    "훈장",
    "어깨장식",
    "포켓아이템",
    "안드로이드",
    "하트",
  ];

  // 아이템 이름 목록
  const itemNames = {
    모자: [
      "아케인셰이드 모자",
      "앱솔랩스 모자",
      "카오스 반반 모자",
      "파프니르 모자",
      "네크로 모자",
    ],
    얼굴장식: [
      "블랙빈 마크",
      "파이어본 페이스",
      "메이플 페이스",
      "레인보우 페이스",
    ],
    눈장식: ["블랙빈 아이", "파이어본 아이", "메이플 아이", "레인보우 아이"],
    귀고리: [
      "메이플 이어링",
      "블랙빈 이어링",
      "커맨더 포스 이어링",
      "에스텔라 이어링",
    ],
    상의: [
      "아케인셰이드 상의",
      "앱솔랩스 상의",
      "파프니르 상의",
      "네크로 상의",
    ],
    망토: ["타일런트 망토", "앱솔랩스 망토", "노바 망토", "파프니르 망토"],
    벨트: ["타일런트 벨트", "앱솔랩스 벨트", "노바 벨트", "파프니르 벨트"],
    바지: [
      "아케인셰이드 바지",
      "앱솔랩스 바지",
      "파프니르 바지",
      "네크로 바지",
    ],
    장갑: [
      "아케인셰이드 장갑",
      "앱솔랩스 장갑",
      "파프니르 장갑",
      "네크로 장갑",
    ],
    신발: [
      "아케인셰이드 신발",
      "앱솔랩스 신발",
      "파프니르 신발",
      "네크로 신발",
    ],
    반지1: [
      "메이플 글로리 반지",
      "이터널 플레임 반지",
      "글로리온 링",
      "마이스터링",
    ],
    반지2: [
      "메이플 글로리 반지",
      "이터널 플레임 반지",
      "글로리온 링",
      "마이스터링",
    ],
    반지3: [
      "메이플 글로리 반지",
      "이터널 플레임 반지",
      "글로리온 링",
      "마이스터링",
    ],
    반지4: [
      "메이플 글로리 반지",
      "이터널 플레임 반지",
      "글로리온 링",
      "마이스터링",
    ],
    펜던트1: [
      "도미네이터 펜던트",
      "메이플 블랙 펜던트",
      "혼테일의 펜던트",
      "매커네이터 펜던트",
    ],
    펜던트2: [
      "도미네이터 펜던트",
      "메이플 블랙 펜던트",
      "혼테일의 펜던트",
      "매커네이터 펜던트",
    ],
    무기: [
      "아케인셰이드 무기",
      "앱솔랩스 무기",
      "파프니르 무기",
      "네크로 무기",
    ],
    보조무기: [
      "프린세스 노에의 보조무기",
      "매커네이터 보조무기",
      "파프니르 보조무기",
      "네크로 보조무기",
    ],
    엠블렘: [
      "골드 메이플리프 엠블렘",
      "실버 메이플리프 엠블렘",
      "브론즈 메이플리프 엠블렘",
    ],
    뱃지: ["크리스탈 뱃지", "블랙빈 뱃지", "메이플 뱃지", "레인보우 뱃지"],
    훈장: ["메이플 훈장", "블랙빈 훈장", "크리스탈 훈장", "레인보우 훈장"],
    어깨장식: [
      "아케인셰이드 숄더",
      "앱솔랩스 숄더",
      "파프니르 숄더",
      "네크로 숄더",
    ],
    포켓아이템: [
      "핑크빈의 포켓워치",
      "블랙빈의 포켓워치",
      "메이플 포켓워치",
      "레인보우 포켓워치",
    ],
    안드로이드: [
      "메이플 안드로이드",
      "블랙빈 안드로이드",
      "크리스탈 안드로이드",
      "레인보우 안드로이드",
    ],
    하트: ["티타늄 하트", "골드 하트", "실버 하트", "브론즈 하트"],
  };

  // 스타포스 옵션
  const starForceOptions = [
    "0성",
    "10성",
    "15성",
    "17성",
    "20성",
    "22성",
    "25성",
  ];

  // 잠재능력 옵션
  const potentialOptions = [
    "3%",
    "6%",
    "9%",
    "12%",
    "15%",
    "18%",
    "21%",
    "24%",
    "27%",
    "30%",
  ];

  // 에디셔널 잠재능력 옵션
  const additionalPotentialOptions = ["레어", "에픽", "유니크", "레전더리"];

  // 스탯 타입
  const statTypes = ["STR", "DEX", "INT", "LUK", "올스탯"];

  // 랜덤 아이템 생성 함수
  const createRandomItem = (slot: string): EquippedItem | null => {
    // 일부 슬롯은 비어있을 수 있음 (30% 확률)
    if (Math.random() < 0.3 && slot !== "무기") {
      return null;
    }

    const itemNameOptions = itemNames[slot as keyof typeof itemNames] || [
      "알 수 없는 아이템",
    ];
    const itemName =
      itemNameOptions[Math.floor(Math.random() * itemNameOptions.length)];

    return {
      id: `item_${Math.floor(Math.random() * 100000)}`,
      name: itemName,
      imageUrl: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(
        itemName
      )}`,
      slot: slot,
      starForce:
        starForceOptions[Math.floor(Math.random() * starForceOptions.length)],
      potentialOption:
        potentialOptions[Math.floor(Math.random() * potentialOptions.length)],
      additionalPotentialOption:
        additionalPotentialOptions[
          Math.floor(Math.random() * additionalPotentialOptions.length)
        ],
      statType: statTypes[Math.floor(Math.random() * statTypes.length)],
      enchantedFlag: Math.random() > 0.7,
      itemLevel: Math.floor(Math.random() * 200) + 100,
      category: slot.includes("무기") ? "무기" : "장비",
      price: Math.floor(Math.random() * 1000000000) + 10000000,
    };
  };

  // 장착 아이템 생성
  const equippedItems: EquippedItem[] = [];

  for (const slot of slots) {
    const item = createRandomItem(slot);
    if (item) {
      equippedItems.push(item);
    }
  }

  // 캐릭터 데이터 생성
  return {
    id: `char_${Math.floor(Math.random() * 100000)}`,
    name: name,
    imageUrl: `/placeholder.svg?height=120&width=80&query=${encodeURIComponent(
      name
    )} 캐릭터`,
    level: Math.floor(Math.random() * 100) + 200,
    job: jobs[Math.floor(Math.random() * jobs.length)],
    server: servers[Math.floor(Math.random() * servers.length)],
    guild: guilds[Math.floor(Math.random() * guilds.length)],
    equippedItems: equippedItems,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(
  request: Request,
  context: { params: { name: string } }
) {
  try {
    // URL에서 캐릭터 이름 추출
    const characterName = decodeURIComponent(context.params.name);

    // 실제 API 연동 시에는 여기서 외부 API 호출 또는 DB 쿼리 수행
    // 목업 데이터 생성
    const characterData = generateSampleCharacterData(characterName);

    // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return new NextResponse(JSON.stringify(characterData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("캐릭터 정보 API 오류:", error);

    return new NextResponse(
      JSON.stringify({
        error: "캐릭터 정보를 가져오는 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
