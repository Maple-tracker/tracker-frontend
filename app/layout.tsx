import type React from "react";
import "@/app/globals.css";

export const metadata = {
  title: "메이플스토리 경매장 트래커",
  description: "메이플스토리 게임 아이템의 일일 가격 추적",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
