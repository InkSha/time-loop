import type { TimeEngine } from './type'

export class Timeout implements TimeEngine {
  private timer: NodeJS.Timeout | null = null
  constructor(private delay = 1000, private running = false) {}

  execute(callback: () => void): void {
    this.close()
    this.running = true
    const executor = () => {
      this.timer = setTimeout(() => {
        callback()
        if (this.running) executor()
      }, this.delay)
    }
    executor()
  }

  close(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.running = false
  }
}
