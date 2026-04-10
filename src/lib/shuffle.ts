/**
 * Fisher-Yates 셔플 알고리즘
 * 카드 덱을 섞는 것처럼, 배열의 뒤에서부터 랜덤한 위치의 요소와 교환한다.
 * 원본 배열을 변경하지 않고 새 배열을 반환한다.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  // 원본과 동일한 순서면 다시 셔플
  const isSameOrder = shuffled.every((word, idx) => word === array[idx])
  if (isSameOrder && array.length > 1) {
    return shuffleArray(array)
  }

  return shuffled
}
