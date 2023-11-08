import { defineStore } from 'pinia'

export type GameMode = 'regular' | 'ultimate'

export type SystemMessageType =
  | 'info'
  | 'game-won'
  | 'game-lost'
  | 'x-play'
  | 'o-play'
  | 'network-state'

export type ChatMessage =
  | {
      origin: 'LOCAL' | 'NETWORK'
      text: string
    }
  | { origin: 'SYSTEM'; text: string; type: SystemMessageType; data?: any }

export type Board = TicTacToeBoard | UltimateTicTacToeBoard
export type TicTacToeBoard = [
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x',
  undefined | 'o' | 'x'
]
export type UltimateTicTacToeBoard = [
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard,
  TicTacToeBoard
]

export function isTicTacToeBoard(obj: Board | undefined): obj is TicTacToeBoard {
  if (obj === undefined) return false
  return typeof obj[0] === 'undefined' || obj[0] === 'o' || obj[0] === 'x'
}

export function isUltimateTicTacToeBoard(obj: Board | undefined): obj is UltimateTicTacToeBoard {
  if (obj === undefined) return false
  return Array.isArray(obj[0])
}

export const useGameStore = defineStore('game', () => {
  const playerSymbol = ref<'o' | 'x'>('o') // o is always starting
  const opponentSymbol = computed<typeof playerSymbol.value>(() =>
    playerSymbol.value === 'o' ? 'x' : 'o'
  )
  const gameMode = ref<GameMode>('regular')
  const gameBoard = ref<TicTacToeBoard | UltimateTicTacToeBoard | undefined>()

  const isTurnToPlay = computed(() => {
    if (gameBoard.value === undefined) return false
    const b = isTicTacToeBoard(gameBoard.value) ? gameBoard.value : gameBoard.value.flat(1)
    const turnPlayed = b.filter((c) => c === playerSymbol.value).length
    const opponentTurnPlayed = b.filter((c) => c !== undefined && c !== playerSymbol.value).length
    return turnPlayed - opponentTurnPlayed === (playerSymbol.value === 'o' ? 0 : -1)
  })

  const started = ref(false)

  const chatMessages = reactive<ChatMessage[]>([])

  function createBoard() {
    if (gameMode.value === 'regular') {
      gameBoard.value = Array.from({ length: 9 }, () => undefined) as TicTacToeBoard
    } else {
      gameBoard.value = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => undefined)
      ) as UltimateTicTacToeBoard
    }
    chatMessages.push({ origin: 'SYSTEM', type: 'info', text: 'Game started!' })
  }

  function indexToText(index: number): string {
    function subStr(u: number, vert: boolean) {
      if (u === 0) return vert ? 'top' : 'left'
      if (u === 1) return vert ? 'middle' : 'center'
      if (u === 2) return vert ? 'bottom' : 'right'
      return ''
    }

    const col = Math.floor(index / 3)
    return `${subStr(col, true)} ${subStr(index - col * 3, false)}`
  }

  function playAt(index: number, symbol: typeof playerSymbol.value) {
    if (gameBoard.value === undefined) return
    let text = ''
    if (gameMode.value === 'regular' && isTicTacToeBoard(gameBoard.value)) {
      gameBoard.value[index] = symbol
      text = `${symbol === playerSymbol.value ? 'You' : 'Your opponent'} played ${indexToText(
        index
      )}`
    } else if (gameMode.value === 'ultimate' && isUltimateTicTacToeBoard(gameBoard.value)) {
      const outerIndex = Math.floor(index / 9)
      const innerIndex = index - outerIndex * 9
      gameBoard.value[outerIndex][innerIndex] = symbol
    }
    chatMessages.push({
      origin: 'SYSTEM',
      type: `${symbol}-play`,
      text
    })
  }

  // Win condition
  const gameResult = computed(() => {
    if (gameBoard.value === undefined) return undefined
    if (isTicTacToeBoard(gameBoard.value)) {
      // Check for both diagonals
      if (
        (gameBoard.value[0] !== undefined &&
          gameBoard.value[0] === gameBoard.value[4] &&
          gameBoard.value[0] === gameBoard.value[8]) ||
        (gameBoard.value[2] !== undefined &&
          gameBoard.value[2] === gameBoard.value[4] &&
          gameBoard.value[2] === gameBoard.value[6])
      )
        return gameBoard.value[4] === playerSymbol.value ? 'WIN' : 'LOST' // Use index 4 because center is common
      for (let i = 0; i < 3; i++) {
        // Check for lines
        if (
          gameBoard.value[i * 3 + 0] !== undefined &&
          gameBoard.value[i * 3 + 0] === gameBoard.value[i * 3 + 1] &&
          gameBoard.value[i * 3 + 0] === gameBoard.value[i * 3 + 2]
        ) {
          return gameBoard.value[i * 3 + 0] === playerSymbol.value ? 'WIN' : 'LOST'
        }
        // Check for columns
        if (
          gameBoard.value[i + 0] !== undefined &&
          gameBoard.value[i + 0] === gameBoard.value[i + 3] &&
          gameBoard.value[i + 0] === gameBoard.value[i + 6]
        ) {
          return gameBoard.value[i + 0] === playerSymbol.value ? 'WIN' : 'LOST'
        }
      }
      if (gameBoard.value.findIndex((v) => v === undefined) === -1) return 'DRAW'
    }
    return undefined
  })

  return {
    playerSymbol,
    opponentSymbol,
    isTurnToPlay,
    gameMode,
    gameBoard,
    started,
    chatMessages,
    createBoard,
    playAt,
    gameResult
  }
})
