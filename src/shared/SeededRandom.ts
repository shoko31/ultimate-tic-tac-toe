type Seed = [number, number, number, number]
function cyrb128(str: string): Seed {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  ;(h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1)
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

export class SeededRandom {
  private _seed: Seed

  private _stringSeed: string
  public get seed(): string {
    return this._stringSeed
  }

  private _generator

  private _iteration: number
  public get iteration(): number {
    return this._iteration
  }

  constructor(seed?: string, iteration?: number) {
    const s = seed ?? (Math.random() * 1000000).toString(16)
    this._stringSeed = s
    this._seed = cyrb128(s)
    this._iteration = 0
    this._generator = sfc32(this._seed[0], this._seed[1], this._seed[2], this._seed[3])
    if (iteration !== undefined) {
      for (let j = 0; j < iteration; j++) {
        this.next()
      }
    }
  }

  public next(): number
  public next(max: number): number
  public next(min: number, max: number): number
  public next(a?: number, b?: number): number {
    const randomNumber = this._generator()
    if (a !== undefined && b !== undefined) {
      const max = Math.max(a, b)
      const min = Math.min(a, b)
      return randomNumber * (max - min) + min
    }
    if (a !== undefined) {
      const max = a
      return randomNumber * max
    }
    return randomNumber
  }
}
