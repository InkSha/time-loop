import type { TimeEngine, TimerTask } from './type'

export class RepeatTaskError extends Error {}

export class TimeLoop {
  private currentPathname: string = ''
  private tasks: TimerTask[] = []
  private removes: Set<number> = new Set()

  constructor(private engine: TimeEngine) {}

  private push(...tasks: TimerTask[]) {
    for (const task of tasks) {
      let count = -1
      let now = Date.now()
      if (task.once) count = 1
      if (task.delay) now += task.delay
      // do some...
      this.tasks.push({
        count,
        lastTimestamp: now,
        ...task
      })
    }
  }

  changePathname(pathname: string) {
    if (this.currentPathname !== pathname && this.currentPathname !== '') {
      this.currentPathname = pathname
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i]

        if (task.keepAlive) continue

        this.removes.add(i)
      }
    }
  }

  hasTask(name: string) {
    for (const task of this.tasks) {
      if (task.name === name) {
        return true
      }
    }

    return false
  }

  registerTasks(...tasks: TimerTask[]) {
    for (const task of tasks) {
      if (this.hasTask(task.name)) {
        if (task.replace) {
          this.unregisterTask(task.name)
        } else if (task.keepAlive) {
          continue
        } else throw new RepeatTaskError(`task [${task.name}] repeat`)
      }
    }
    this.push(...tasks)
    return () => {
      tasks.map((item) => this.unregisterTask(item.name))
    }
  }

  unregisterTask(taskName: string): void {
    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i]

      if (task.name !== taskName) {
        continue
      }

      this.removes.add(i)
    }
  }

  run() {
    this.engine.execute(() => {
      if (this.removes.size > 0) {
        const sorted = Array.from(this.removes).sort((a, b) => b - a)
        for (const index of sorted) {
          this.tasks.splice(index, 1)
        }
        this.removes.clear()
      }
      const now = Date.now()

      for (const task of this.tasks) {
        if (task.interval !== undefined) {
          if (task.lastTimestamp !== undefined) {
            if (now - task.lastTimestamp >= task.interval * 1000) {
              task.lastTimestamp = now
            } else {
              continue
            }
          } else {
            task.lastTimestamp = now
          }
        }
        Promise.resolve(task.fn(now)).then(() => {
          if (task.count && task.count > 0) {
            task.count--
          }
          if (task.count === 0) {
            this.unregisterTask(task.name)
          }
        })
      }
    })
  }

  close() {
    this.engine.close()
  }
}
