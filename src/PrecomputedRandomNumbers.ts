import Deque from 'double-ended-queue'

const noOp = (n: number) => n

interface NumberMapper {
  (randomNumber: number): number
}

export default class PrecomputedRandomNumbers {
  queue: Deque<number>
  i: number
  constructor(count: number, mapper: NumberMapper = noOp) {
    this.queue = new Deque(count)
    this.i = 0
    for (let i = 0; i < count; i++) {
      const rand = mapper(Math.random())
      this.queue.unshift(rand)
    }
  }
  getNext() {
    this.i += 1
    return this.queue.get(this.i)
  }
}