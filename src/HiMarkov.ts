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

export interface TransitionCounts {
  [fromState: string]: {
    [toState: string]: number
  }
}

export interface Codec<T> {
  encode: (input: T) => string
  decode: (input: string) => T
}

export interface StateTransitionCodec<From, To> {
  from: Codec<From>,
  to: Codec<To>
}

function recordStateTransition<From, To>(codec: StateTransitionCodec<From, To>, transitionCounts: TransitionCounts, transition: StateTransition<From, To>) {
  const from = codec.from.encode(transition[0])
  const to = codec.to.encode(transition[1])

  if (!transitionCounts[from]) {
    transitionCounts[from] = {}
  }

  if (!transitionCounts[from][to]) {
    transitionCounts[from][to] = 0
  }

  transitionCounts[from][to] += 1

  return transitionCounts
}

function getTransitionCountsFrom<From, To>(codec: StateTransitionCodec<From, To>, transitionCounts: TransitionCounts, from: From) {
  const encodedFrom = codec.from.encode(from)
  return transitionCounts[encodedFrom]
}

// stateTransitions is an array of arrays. Each nested array represents
// an instance of a transition from one state to another.
// stateTransitions = [
//   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
//   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
//   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
// ]

// transitionCounts['sad']['happy'] returns the number of times
// that a transition from 'sad' to 'happy' was present in stateTransitions
export function countStateTransitions<From, To>(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[]) {
  const transitionCounts: TransitionCounts = {}

  for (let i = 0; i < stateTransitions.length; i++) {
    const stateTransition = stateTransitions[i]
    recordStateTransition(codec, transitionCounts, stateTransition)
  }

  return transitionCounts
}

export function predict<From, To>(codec: StateTransitionCodec<From, To>, transitionCounts: TransitionCounts, from: From) {
  const transitionCountsFrom = getTransitionCountsFrom(codec, transitionCounts, from)
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
  const prediction = codec.to.decode(encodedPrediction)
  return prediction
}

export default class HiMarkov<From, To> {
  transitionCounts: TransitionCounts
  private codec: StateTransitionCodec<From, To>
  constructor(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[] = []) {
    this.codec = codec
    this.transitionCounts = countStateTransitions(codec, stateTransitions)
  }

  recordStateTransition(transition: StateTransition<From, To>) {
    this.transitionCounts = recordStateTransition(this.codec, this.transitionCounts, transition)
  }

  predict(from: From) {
    return predict(this.codec, this.transitionCounts, from)
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
