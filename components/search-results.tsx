"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type SearchResultItem = {
  id: string
  name: string
  price: number
  lastUpdated: string
  image: string
}

type SearchResultsProps = {
  results: SearchResultItem[]
}

export function SearchResults({ results = [] }: SearchResultsProps) {
  const router = useRouter()

  if (results.length === 0) {
    return null
  }

  return (
    <div className="mt-8 w-full">
      <h2 className="text-xl font-semibold text-white mb-4">검색 결과</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <Card key={item.id} className="bg-background/50 backdrop-blur-sm border-purple-800/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-900/50 rounded-md flex items-center justify-center">
                  <img
                    src={item.image || "/placeholder.svg?height=64&width=64"}
                    alt={item.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-sm text-purple-200">{item.price.toLocaleString()} 메소</p>
                  <p className="text-xs text-muted-foreground">마지막 업데이트: {item.lastUpdated}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-purple-600 text-purple-200 hover:bg-purple-900/50"
                onClick={() => router.push(`/item/${encodeURIComponent(item.id)}`)}
              >
                가격 기록 보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

