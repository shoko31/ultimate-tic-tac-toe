import type { Board } from '@/stores'
import EventEmitter from 'eventemitter3'
import { type DataConnection, Peer, type PeerError, PeerErrorType } from 'peerjs'

let clientInstance: GameClient | undefined = undefined

export type GameClientError = {
  name: PeerErrorType
  isFatal: boolean
  description: string
  error: PeerError<PeerErrorType>
}

export type GameClientEvents = {
  ready: () => void
  'network-status-changed': () => void
  'game-joined': (gameId: string) => void
  'game-left': () => void
  'failed-to-join': () => void
  'host-recovery-mode': () => void
  data: (msg: GameClientMessage) => void
}

export class GameClient extends EventEmitter<GameClientEvents> {
  #peer: Peer
  #dataConnection: DataConnection | undefined = undefined
  #errors: GameClientError[] = []
  #hostMode: boolean = false

  /**
   * Creates a new game Client using PeerJS
   * @param id Id is used for reconnection. If it's first connection, do not specify
   */
  private constructor(id?: string) {
    super()

    console.log('ID', id)

    // Bind methods
    this.#processMessageBound = this.#processMessage.bind(this)
    this.#handlePeerErrorBound = this.#handlePeerError.bind(this)
    this.send = this.send.bind(this)

    this.#peer = id ? new Peer(id) : new Peer()
    this.#peer.on('open', () => {
      this.#log('Game client is ready!')
      setTimeout(() => {
        this.emit('ready')
      }, 1000)
    })
    this.#peer.on('connection', (connection) => {
      this.#log('New connection!', connection.peer)

      // Disconnect previous connected client
      if (this.#dataConnection !== undefined) {
        this.#dataConnection.close()
        this.#dataConnection = undefined
      }

      this.#dataConnection = connection
      this.#hostMode = true

      connection.on('open', () => {
        this.emit('game-joined', this.#peer.id)
      })
      connection.on('close', () => {
        this.#log('Connection closed!', connection.peer)
        this.#dataConnection?.removeAllListeners()
        this.#dataConnection = undefined
        this.emit('game-left')
      })
      connection.on('error', (err) => {
        console.log('Error connection', err)
      })
      connection.on('data', this.#processMessageBound)
    })
    this.#peer.on('disconnected', () => {
      this.#log('Disconnected!')
    })
    this.#peer.on('error', (e) => {
      this.#handlePeerErrorBound(e as PeerError<PeerErrorType>)
    })
  }

  public static get instance(): GameClient {
    if (clientInstance === undefined) {
      let gameClientId = undefined
      if (window.localStorage && window.localStorage.getItem) {
        const id = window.localStorage.getItem('ultimate-tic-tac-toc--uuid')
        if (id !== '' && id !== undefined && id !== null) {
          gameClientId = id
        }
      }
      clientInstance = new GameClient(gameClientId)
    }
    return clientInstance
  }

  public get error() {
    return this.#errors.length === 0 ? undefined : this.#errors[this.#errors.length - 1]
  }

  public get id() {
    return this.#peer.id
  }

  public get ready() {
    return this.#peer.open
  }

  public get gameJoined() {
    return this.#dataConnection !== undefined && this.#dataConnection.open
  }

  public get networkError() {
    return this.error?.name === PeerErrorType.Network
  }

  public get isHost() {
    return this.gameJoined && this.#hostMode
  }

  public get isGuest() {
    return this.gameJoined && !this.#hostMode
  }

  async join(id: string) {
    const dataConnection = this.#peer.connect(id, { reliable: true })
    dataConnection.on('open', () => {
      this.#dataConnection = dataConnection
      this.#log('Data connection opened!')
      this.emit('game-joined', dataConnection.peer)
    })
    dataConnection.on('data', this.#processMessageBound)
    dataConnection.on('close', () => {
      this.#log('dataConnection closed')
      this.emit('host-recovery-mode')
      this.#dataConnection = undefined
    })
  }

  send(msg: GameClientMessage): void {
    if (!this.#dataConnection) return
    this.#log('Sending message', JSON.stringify(msg))
    this.#dataConnection.send(msg)
  }

  #handlePeerErrorBound
  #handlePeerError(error: PeerError<PeerErrorType>): void {
    if (this.#errors.length > 0 && this.#errors[this.#errors.length - 1].isFatal) return // Only allow one error
    const errorList: {
      [key in PeerErrorType]: {
        name: key
        isFatal: boolean
        description: string
        error: PeerError<PeerErrorType>
      }
    } = {
      [PeerErrorType.BrowserIncompatible]: {
        name: PeerErrorType.BrowserIncompatible,
        isFatal: true,
        description:
          "The client's browser does not support some or all WebRTC features that you are trying to use.",
        error
      },
      [PeerErrorType.Disconnected]: {
        name: PeerErrorType.Disconnected,
        isFatal: false,
        description:
          "You've already disconnected this peer from the server and can no longer make any new connections on it.",
        error
      },
      [PeerErrorType.InvalidID]: {
        name: PeerErrorType.InvalidID,
        isFatal: true,
        description: 'The ID passed into the Peer constructor contains illegal characters.',
        error
      },
      [PeerErrorType.InvalidKey]: {
        name: PeerErrorType.InvalidKey,
        isFatal: true,
        description:
          'The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).',
        error
      },
      [PeerErrorType.Network]: {
        name: PeerErrorType.Network,
        isFatal: false,
        description: 'Lost or cannot establish a connection to the signalling server.',
        error
      },
      [PeerErrorType.PeerUnavailable]: {
        name: PeerErrorType.PeerUnavailable,
        isFatal: false,
        description: "The peer you're trying to connect to does not exist.",
        error
      },
      [PeerErrorType.SslUnavailable]: {
        name: PeerErrorType.SslUnavailable,
        isFatal: true,
        description:
          'PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.',
        error
      },
      [PeerErrorType.ServerError]: {
        name: PeerErrorType.ServerError,
        isFatal: true,
        description: 'Unable to reach the server.',
        error
      },
      [PeerErrorType.SocketError]: {
        name: PeerErrorType.SocketError,
        isFatal: true,
        description: 'An error from the underlying socket.',
        error
      },
      [PeerErrorType.SocketClosed]: {
        name: PeerErrorType.SocketClosed,
        isFatal: true,
        description: 'The underlying socket closed unexpectedly.',
        error
      },
      [PeerErrorType.UnavailableID]: {
        name: PeerErrorType.UnavailableID,
        isFatal: true,
        description: 'The ID passed into the Peer constructor is already taken.',
        error
      },
      [PeerErrorType.WebRTC]: {
        name: PeerErrorType.WebRTC,
        isFatal: false,
        description: 'Native WebRTC errors.',
        error
      }
    }

    const e = errorList[error.type]
    this.#errors.push(e)
    this.#log(e.name, e.description, e.error)

    if (e.name === PeerErrorType.Network) {
      this.emit('network-status-changed')
    }

    if (e.name === PeerErrorType.PeerUnavailable) {
      if (this.#dataConnection?.open) this.#dataConnection?.close()
      this.#dataConnection = undefined
      this.emit('failed-to-join')
    }
  }

  #log(name: string, description?: string, err?: PeerError<PeerErrorType>) {
    const body = description ? ` : ${description}` : ''
    const logFn = err ? console.error : console.log
    logFn(
      `%c[GameClient]%c ${name}${body}`,
      'color: red; font-weight: bold',
      'color: initial; font-weight: initial;',
      err ?? ''
    )
  }

  #processMessageBound
  #processMessage(msg: any) {
    if (typeof msg !== 'object') return
    if (!isGameClientMessage(msg)) {
      this.#log(
        'Unknow message received',
        typeof msg === 'object' && 'type' in msg ? msg.type : JSON.stringify(msg)
      )
      return
    }
    this.emit('data', msg)
  }

  dispose() {
    if (this.#dataConnection) {
      this.#dataConnection.removeAllListeners()
      this.#dataConnection.close()
      this.#dataConnection = undefined
    }
    this.#peer.removeAllListeners()
    this.#peer.destroy()
  }
}

export type GameClientMessage =
  | GameClientChangeOptionsMessage
  | GameClientStartGameMessage
  | GameClientChatMessage
  | GameClientPlayAtMessage
  | GameClientBackToLobbyMessage
  | GameClientHostRecoveryMessage
  | GameClientGuestRecoveryMessage

export function isGameClientMessage(o: any): o is GameClientMessage {
  if (typeof o !== 'object') return false
  if (!('type' in o)) return false
  return [
    'GameClientChangeOptionsMessage',
    'GameClientStartGame',
    'GameClientStartGameMessage',
    'GameClientChatMessage',
    'GameClientPlayAtMessage',
    'GameClientBackToLobbyMessage',
    'GameClientHostRecoveryMessage',
    'GameClientGuestRecoveryMessage'
  ].includes(o.type)
}

export type GameClientGameMode = 'regular' | 'ultimate'

export type GameClientChangeOptionsMessage = {
  type: 'GameClientChangeOptionsMessage'
  gameMode: GameClientGameMode
}

export type GameClientStartGameMessage = {
  type: 'GameClientStartGameMessage'
  gameMode: GameClientGameMode
  seed: string
  iteration: number
}

export type GameClientChatMessage = {
  type: 'GameClientChatMessage'
  text: string
}

export type GameClientPlayAtMessage = {
  type: 'GameClientPlayAtMessage'
  index: number
}

export type GameClientBackToLobbyMessage = {
  type: 'GameClientBackToLobbyMessage'
}

export type GameClientHostRecoveryMessage = {
  type: 'GameClientHostRecoveryMessage'
  gameMode: GameClientGameMode
  seed: string
  iteration: number
  board: Board
  guestSymbol: 'o' | 'x'
  lastPlayedIndex: number | undefined
  roomId: string
}

export type GameClientGuestRecoveryMessage = {
  type: 'GameClientGuestRecoveryMessage'
  gameMode: GameClientGameMode
  seed: string
  iteration: number
  board: Board
  guestSymbol: 'o' | 'x'
  lastPlayedIndex: number | undefined
  roomId: string
}
