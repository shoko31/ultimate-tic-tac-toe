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

export function checkTicTacToeBoardState(
  obj: TicTacToeBoard | undefined
): 'o' | 'x' | 'DRAW' | undefined {
  if (obj === undefined) return undefined
  // Check for both diagonals
  if (
    (obj[0] !== undefined && obj[0] === obj[4] && obj[0] === obj[8]) ||
    (obj[2] !== undefined && obj[2] === obj[4] && obj[2] === obj[6])
  )
    return obj[4] // Use index 4 because center is common
  for (let i = 0; i < 3; i++) {
    // Check for lines
    if (
      obj[i * 3 + 0] !== undefined &&
      obj[i * 3 + 0] === obj[i * 3 + 1] &&
      obj[i * 3 + 0] === obj[i * 3 + 2]
    ) {
      return obj[i * 3 + 0]
    }
    // Check for columns
    if (obj[i + 0] !== undefined && obj[i + 0] === obj[i + 3] && obj[i + 0] === obj[i + 6]) {
      return obj[i + 0]
    }
  }
  if (obj.findIndex((v) => v === undefined) === -1) return 'DRAW'
  return undefined
}

export function checkUltimateTicTacToeBoardState(
  obj: UltimateTicTacToeBoard | undefined
): 'o' | 'x' | 'DRAW' | undefined {
  if (obj === undefined) return undefined

  // Generate Tic Tac Toe board for each sub-boards
  const results: TicTacToeBoard = Array.from({ length: 9 }, () => undefined) as TicTacToeBoard
  let amountOfUndefinedResults = 0
  for (let i = 0; i < 9; i++) {
    const r = checkTicTacToeBoardState(obj[i])
    results[i] = r === 'DRAW' ? undefined : r
    if (r === undefined) amountOfUndefinedResults++
  }

  console.log(results)

  // Check for Tic Tac Toe regular result
  const result = checkTicTacToeBoardState(results)
  if (result === undefined) {
    if (amountOfUndefinedResults === 0) return 'DRAW'
  }

  return result
}

export const useGameStore = defineStore('game', () => {
  const playerSymbol = ref<'o' | 'x'>('o') // o is always starting
  const opponentSymbol = computed<typeof playerSymbol.value>(() =>
    playerSymbol.value === 'o' ? 'x' : 'o'
  )
  const gameMode = ref<GameMode>('regular')
  const gameBoard = ref<TicTacToeBoard | UltimateTicTacToeBoard | undefined>()
  const lastPlayedIndex = ref<number>()

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
    lastPlayedIndex.value = undefined
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
      lastPlayedIndex.value = index
      text = `${symbol === playerSymbol.value ? 'You' : 'Your opponent'} played ${indexToText(
        index
      )}`
    } else if (gameMode.value === 'ultimate' && isUltimateTicTacToeBoard(gameBoard.value)) {
      const outerIndex = Math.floor(index / 9)
      const innerIndex = index - outerIndex * 9
      gameBoard.value[outerIndex][innerIndex] = symbol
      lastPlayedIndex.value = index
      text = `${symbol === playerSymbol.value ? 'You' : 'Your opponent'} played ${indexToText(
        outerIndex
      )} ${indexToText(innerIndex)}`
    }
    chatMessages.push({
      origin: 'SYSTEM',
      type: `${symbol}-play`,
      text
    })
  }

  // Win condition
  const gameResult = computed<'DRAW' | 'WIN' | 'LOST' | undefined>(() => {
    if (gameBoard.value === undefined) return undefined
    if (isTicTacToeBoard(gameBoard.value)) {
      const result = checkTicTacToeBoardState(gameBoard.value)
      if (result === 'DRAW') return 'DRAW'
      if (result !== undefined) return result === playerSymbol.value ? 'WIN' : 'LOST'
    } else if (isUltimateTicTacToeBoard(gameBoard.value)) {
      const result = checkUltimateTicTacToeBoardState(gameBoard.value)
      if (result === 'DRAW') return 'DRAW'
      if (result !== undefined) return result === playerSymbol.value ? 'WIN' : 'LOST'
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
    gameResult,
    lastPlayedIndex
  }
})
