export interface TimeEngine {
  execute(callback: () => void): void
  close(): void
}

export type TimerTask = {
  name: string
  once?: boolean
  /**
   * unit second
   */
  interval?: number
  delay?: number
  count?: number
  keepAlive?: boolean
  lastTimestamp?: number
  replace?: boolean
  fn: (timestamp: number) => void
}
