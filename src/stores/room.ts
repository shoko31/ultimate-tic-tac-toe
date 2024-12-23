import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { GameClient, type GameClientMessage } from '@/shared/GameClient'
import { useGameStore, type Board } from './game'
import { SeededRandom } from '@/shared/SeededRandom'

export const useRoomStore = defineStore('room', () => {
  const client = GameClient.instance

  // State
  const id = ref<string | undefined>(undefined)
  const isReady = ref(client.ready)
  const gameJoined = ref(client.gameJoined)
  const isInRoom = computed(() => id.value !== undefined)
  const networkError = ref(client.networkError)
  const tryToRecoverHost = ref(false)
  let randomNumberGenerator: undefined | SeededRandom = undefined

  const isHost = ref(false)

  const gameStore = useGameStore()

  // Logic
  function host() {
    id.value = client.id
    if (localStorage) {
      localStorage.setItem('ultimate-tic-tac-toc--host-mode', '1')
      localStorage.setItem('ultimate-tic-tac-toc--uuid', client.id)
    }
    isHost.value = true
  }
  function join(peerId: string): Promise<boolean> {
    if (localStorage) {
      localStorage.clear()
    }
    return new Promise<boolean>((resolve) => {
      function s(roomId: string) {
        if (id.value === undefined && client.isGuest) {
          id.value = roomId
        }
        resolve(true)
        client.removeListener('failed-to-join', f)
      }
      function f() {
        client.removeListener('game-joined', s)
        resolve(false)
      }
      client.once('failed-to-join', f)
      client.once('game-joined', s)
      client.join(peerId)
    })
  }

  function start() {
    if (!client.isHost) return // Only host can start the game
    if (localStorage && client.isHost) {
      localStorage.setItem('ultimate-tic-tac-toc--host-mode', '2')
    }
    randomNumberGenerator = new SeededRandom()
    gameStore.createBoard()
    gameStore.playerSymbol = randomNumberGenerator.next() > 0.5 ? 'o' : 'x'
    gameStore.started = true
    client.send({
      type: 'GameClientStartGameMessage',
      gameMode: gameStore.gameMode,
      seed: randomNumberGenerator.seed,
      iteration: 0
    })
  }

  function playAgain() {
    if (!client.isHost) return // Only host can re-start the game
    randomNumberGenerator = new SeededRandom()
    gameStore.createBoard()
    gameStore.playerSymbol = randomNumberGenerator.next() > 0.5 ? 'o' : 'x'
    client.send({
      type: 'GameClientStartGameMessage',
      gameMode: gameStore.gameMode,
      seed: randomNumberGenerator.seed,
      iteration: 0
    })
  }

  function backToLobby() {
    if (!client.isHost) return // Only host can re-start the game
    gameStore.gameBoard = undefined
    gameStore.started = false
    client.send({
      type: 'GameClientBackToLobbyMessage'
    })
  }

  function playAt(index: number) {
    gameStore.playAt(index, gameStore.playerSymbol)
    client.send({
      type: 'GameClientPlayAtMessage',
      index
    })
  }

  function sendMessage(msg: string) {
    client.send({ type: 'GameClientChatMessage', text: msg })
    gameStore.chatMessages.push({
      origin: 'LOCAL',
      text: msg
    })
  }

  function gameClientReady() {
    isReady.value = client.ready
  }
  function networkStatusChanged() {
    networkError.value = client.networkError
  }
  function clientConnected() {
    gameJoined.value = client.gameJoined
    isHost.value = client.isHost
    // Sync game mode with newly connected client
    if (isHost.value) {
      client.send({
        type: 'GameClientChangeOptionsMessage',
        gameMode: gameStore.gameMode
      })
      if (gameStore.started) {
        setTimeout(() => {
          handleGuestRecovered()
        }, 500)
      }
    }
  }
  function clientDisconnected() {
    gameJoined.value = client.gameJoined
  }
  function messageReceived(msg: GameClientMessage) {
    console.log('Received message', msg)
    switch (msg.type) {
      case 'GameClientChangeOptionsMessage':
        gameStore.gameMode = msg.gameMode
        break
      case 'GameClientStartGameMessage':
        gameStore.gameMode = msg.gameMode
        randomNumberGenerator = new SeededRandom(msg.seed, msg.iteration)
        gameStore.createBoard()
        gameStore.playerSymbol = randomNumberGenerator.next() > 0.5 ? 'x' : 'o' // opposite of host
        gameStore.started = true
        break
      case 'GameClientChatMessage':
        gameStore.chatMessages.push({
          origin: 'NETWORK',
          text: msg.text
        })
        break
      case 'GameClientPlayAtMessage':
        gameStore.playAt(msg.index, gameStore.opponentSymbol)
        break
      case 'GameClientBackToLobbyMessage':
        gameStore.gameBoard = undefined
        gameStore.started = false
        break
      case 'GameClientHostRecoveryMessage':
        if (localStorage.getItem('ultimate-tic-tac-toc--host-mode') === '2' && msg.board) {
          gameStore.gameMode = msg.gameMode
          randomNumberGenerator = new SeededRandom(msg.seed, msg.iteration)
          gameStore.playerSymbol = msg.guestSymbol === 'o' ? 'x' : 'o' // opposite of host
          gameStore.loadBoardFromRecovery(msg.board, msg.lastPlayedIndex)
          gameStore.started = true
          id.value = msg.roomId
        }
        break
      case 'GameClientGuestRecoveryMessage':
        gameStore.gameMode = msg.gameMode
        randomNumberGenerator = new SeededRandom(msg.seed, msg.iteration)
        gameStore.playerSymbol = msg.guestSymbol === 'o' ? 'x' : 'o' // opposite of host
        gameStore.loadBoardFromRecovery(msg.board, msg.lastPlayedIndex)
        gameStore.started = true
        id.value = msg.roomId
        break
    }
  }

  function handleHostRecovered() {
    tryToRecoverHost.value = false
    client.send({
      type: 'GameClientHostRecoveryMessage',
      gameMode: gameStore.gameMode,
      seed: randomNumberGenerator?.seed || '',
      iteration: randomNumberGenerator?.iteration || 0,
      board: gameStore.gameBoard as Board,
      guestSymbol: gameStore.playerSymbol,
      lastPlayedIndex: gameStore.lastPlayedIndex,
      roomId: id.value || client.id
    })
  }

  function handleGuestRecovered() {
    client.send({
      type: 'GameClientGuestRecoveryMessage',
      gameMode: gameStore.gameMode,
      seed: randomNumberGenerator?.seed || '',
      iteration: randomNumberGenerator?.iteration || 0,
      board: gameStore.gameBoard as Board,
      guestSymbol: gameStore.playerSymbol,
      lastPlayedIndex: gameStore.lastPlayedIndex,
      roomId: id.value || client.id
    })
  }

  function handleHostRecoveryMode() {
    tryToRecoverHost.value = true
    const f = () => {
      if (!id.value || !tryToRecoverHost.value) return
      function a() {
        client.removeListener('game-joined', b)
        if (tryToRecoverHost.value) setTimeout(() => f(), 3000)
      }
      function b() {
        client.removeListener('failed-to-join', a)
        handleHostRecovered()
      }
      client.once('failed-to-join', a)
      client.once('game-joined', b)
      client.join(id.value)
    }
    setTimeout(() => f(), 3000)
  }

  /**
   * Register event listeners
   */
  function registerListeners() {
    client.addListener('ready', gameClientReady)
    client.addListener('network-status-changed', networkStatusChanged)
    client.addListener('game-joined', clientConnected)
    client.addListener('game-left', clientDisconnected)
    client.addListener('data', messageReceived)
    client.addListener('host-recovery-mode', handleHostRecoveryMode)
  }

  /**
   * Clean up event listeners
   */
  function cleanupListeners() {
    client.removeListener('ready', gameClientReady)
    client.removeListener('network-status-changed', networkStatusChanged)
    client.removeListener('game-joined', clientConnected)
    client.removeListener('game-left', clientDisconnected)
    client.removeListener('data', messageReceived)
    client.removeListener('host-recovery-mode', handleHostRecoveryMode)
  }

  // Watch game changes and sync with client
  watch(
    () => gameStore.gameMode,
    (newGM, oldGM) => {
      if (!client.isHost) return
      if (newGM !== oldGM) {
        client.send({ type: 'GameClientChangeOptionsMessage', gameMode: newGM })
      }
    }
  )

  // Setup
  registerListeners()

  // Clean up
  tryOnScopeDispose(() => {
    cleanupListeners()
    client.dispose()
  })

  return {
    id: readonly(id),
    isReady: readonly(isReady),
    isInRoom,
    networkError,
    isHost,
    host,
    join,
    start,
    playAgain,
    backToLobby,
    sendMessage,
    playAt,
    gameJoined,
    randomNumberGenerator
  }
})
