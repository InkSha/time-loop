# Timeloop

A lightweight and simple time loop library.

## Install

```bash
pnpm add @inksha/timeloop
```

## Usage

```typescript
import Timeloop, { Timeout } from '@inksha/timeloop'

const timeloop = new Timeloop(new Timeout())

let count = 5

timeloop.registerTasks({
  name: 'example',
  interval: 1 /** second */,
  fn(timestamp) {
    console.log(timestamp)
    if (count-- <= 0) {
      timeloop.unregisterTask('example')
    }
  }
})

timeloop.run()
```

## Custom Time Engine

```typescript
import type { TimeEngine } from '@inksha/timeloop'

export class RAF implements TimeEngine {
  private running = false
  private timer: number | null = null

  constructor() {}

  execute(callback: () => void): void {
    this.close()
    this.running = true
    const executor = () => {
      this.timer = requestAnimationFrame(() => {
        callback()
        if (this.running) executor()
      })
    }
    executor()
  }

  close(): void {
    if (this.timer) {
      cancelAnimationFrame(this.timer)
      this.timer = null
    }
    this.running = false
  }
}

const frameLoop = new Timeloop(new RAF())

```

## API

| method | comment |
| :-- | :-- |
| `changePathname(pathname: string)`  | on change route call, instance match old and new pathname, if not match, clean no set keeplive task |
| `hasTask(name: string)`  | query task name exist |
| `registerTasks(...tasks: TimerTask[])`  | register task |
| `unregisterTask(taskName: string): void`  | unregister task |
| `run()`  | run loop |
| `close()`  | close loop |

## Types

```typescript
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
```
