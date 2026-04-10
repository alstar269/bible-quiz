import type { ScoreResult } from '@/types'

const BASE_POINTS = 100
const MAX_TIME_BONUS = 50
const HINT_PENALTY = 20
const COMBO_THRESHOLDS = [
  { min: 5, multiplier: 2.0 },
  { min: 3, multiplier: 1.5 },
  { min: 0, multiplier: 1.0 },
] as const

/**
 * 점수 계산기
 * 마치 볼링 점수처럼: 기본 점수 + 시간 보너스 + 콤보 배수 - 힌트 감점
 */
export function calculateScore(params: {
  readonly isCorrect: boolean
  readonly timeTaken: number
  readonly timerSeconds: number
  readonly combo: number
  readonly hintsUsed: number
  readonly enableCombo: boolean
}): ScoreResult {
  if (!params.isCorrect) {
    return {
      basePoints: 0,
      timeBonus: 0,
      comboMultiplier: 1.0,
      hintPenalty: 0,
      totalPoints: 0,
    }
  }

  const basePoints = BASE_POINTS

  // 시간 보너스: 제한 시간의 절반 이내에 풀면 최대 보너스
  const timeBonus =
    params.timerSeconds > 0
      ? Math.round(
          MAX_TIME_BONUS *
            Math.max(0, 1 - params.timeTaken / params.timerSeconds)
        )
      : 0

  // 콤보 배수
  const comboMultiplier = params.enableCombo
    ? (COMBO_THRESHOLDS.find((t) => params.combo >= t.min)?.multiplier ?? 1.0)
    : 1.0

  // 힌트 감점
  const hintPenalty = params.hintsUsed * HINT_PENALTY

  const totalPoints = Math.max(
    0,
    Math.round((basePoints + timeBonus) * comboMultiplier - hintPenalty)
  )

  return { basePoints, timeBonus, comboMultiplier, hintPenalty, totalPoints }
}
