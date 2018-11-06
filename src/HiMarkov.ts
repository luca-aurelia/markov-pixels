const stringify = (x: any): string => JSON.stringify(x)
// const stringify = (pixel: any): string => `{ "red": ${pixel.red}, "green": ${pixel.green}, "blue": ${pixel.blue}, "alpha": ${pixel.alpha}}`
interface NumbersByStrings {
  [key: string]: number
}

const sumValues = (obj: NumbersByStrings): number => {
  let total = 0
  for (const value of Object.values(obj)) {
    total += value
  }
  return total
}

export type StateTransition<From, To> = [From, To]

interface TransitionCountsToState {
  [toState: string]: number
}

interface TransitionCountsMap {
  [fromState: string]: TransitionCountsToState
}

class TransitionCounts<From, To> {
  private transitionCounts: TransitionCountsMap
  private fromCodec: Codec<From>
  private toCodec: Codec<To>
  constructor(fromCodec: Codec<From>, toCodec: Codec<To>, transitionCounts: TransitionCountsMap = {}) {
    this.transitionCounts = transitionCounts
    this.fromCodec = fromCodec
    this.toCodec = toCodec
  }
  recordTransition(transition: StateTransition<From, To>) {
    const from = this.fromCodec.encode(transition[0])
    const to = this.toCodec.encode(transition[1])

    if (!this.transitionCounts[from]) {
      this.transitionCounts[from] = {}
    }
    if (!this.transitionCounts[from][to]) {
      this.transitionCounts[from][to] = 0
    }
    this.transitionCounts[from][to] += 1
  }
  getTransitionCountsFrom(state: From): TransitionCountsToState {
    const encodedFrom = this.fromCodec.encode(state)
    return this.transitionCounts[encodedFrom]
  }
  toJson() {
    return JSON.stringify(this.transitionCounts)
  }
}

interface Codec<T> {
  encode: (input: T) => string
  decode: (input: string) => T
}

export function countStateTransitions<From, To>(fromCodec: Codec<From>, toCodec: Codec<To>, stateTransitions: StateTransition<From, To>[]) {
  const transitionCounts = new TransitionCounts(fromCodec, toCodec)

  for (let i = 0; i < stateTransitions.length; i++) {
    const stateTransition = stateTransitions[i]
    transitionCounts.recordTransition(stateTransition)
  }

  return transitionCounts
}

export function predict<From, To>(transitionCounts: TransitionCounts<From, To>, from: From) {
  const transitionCountsFrom = transitionCounts.getTransitionCountsFrom(from)
  if (!transitionCountsFrom) {
    return null
  }

  const sumTransitionCounts = sumValues(transitionCountsFrom)
  const randomCountSum = Math.floor(sumTransitionCounts * Math.random())

  let index = 0
  let countSum = 0
  const entries = Object.entries(transitionCountsFrom)
  while (countSum <= randomCountSum) {
    countSum += entries[index][1]
    index++
  }

  const encodedPrediction = entries[index - 1][0]
  const prediction = this.toCodec.decode(encodedPrediction)
  return prediction
}

export default class HiMarkov<From, To> {
  private transitionCounts: TransitionCounts<From, To>
  private fromCodec: Codec<From>
  private toCodec: Codec<To>
  constructor(fromCodec: Codec<From>, toCodec: Codec<To>, stateTransitions: StateTransition<From, To>[] = []) {
    // stateTransitions is an array of arrays. Each nested array represents
    // an instance of a transition from one state to another.
    // stateTransitions = [
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
    //   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
    // ]

    // this.transitionCounts['sad']['happy'] returns the number of times
    // that a transition from 'sad' to 'happy' was present in stateTransitions

    this.fromCodec = fromCodec
    this.toCodec = toCodec
    this.transitionCounts = countStateTransitions(fromCodec, toCodec, stateTransitions)
  }

  recordStateTransition(transition: StateTransition<From, To>) {
    this.transitionCounts.recordTransition(transition)
  }

  predict(from: From) {
    return predict(this.transitionCounts, from)
  }

  // predictInverse(from) {
  // const transitionCountsFrom = this.transitionCounts.getTransitionCountsFrom(from)

  // const max = Object.values(
  //   transitionCountsFrom
  // ).reduce((previousMax, count) => Math.max(previousMax, count))

  // const invertedTransitionCountsFrom = Object.entries(transitionCountsFrom)
  //   .map(([toState, count]) => [toState, max - count + 1]) // add one so no occurrences drop to 0
  //   .reduce((obj, [key, value]) => {
  //     obj[key] = value
  //     return obj
  //   }, {})
  // const sumTransitionCounts = sumValues(invertedTransitionCountsFrom)
  // const randomCountSum = Math.floor(sumTransitionCounts * Math.random())

  // let index = 0
  // let countSum = 0
  // const entries = Object.entries(invertedTransitionCountsFrom)
  // while (countSum <= randomCountSum) {
  //   countSum += entries[index][1]
  //   index++
  // }

  // const prediction = entries[index - 1][0]

  // try {
  //   return JSON.parse(prediction)
  // } catch (e) {
  //   return prediction
  // }
  // }
}
