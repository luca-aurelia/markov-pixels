import Deque from 'double-ended-queue'

interface NumbersByStrings {
  [key: string]: number
}

export type StateTransition<From, To> = [From, To]

export interface TransitionsByFromState<To> {
  [fromState: string]: Deque<To>
}

export interface Codec<T> {
  encode: (input: T) => string
  decode: (input: string) => T
}

export interface StateTransitionCodec<From, To> {
  from: Codec<From>,
  to: Codec<To>
}

function recordStateTransition<From, To>(codec: StateTransitionCodec<From, To>, transitionsByFromState: TransitionsByFromState<To>, transition: StateTransition<From, To>) {
  const [from, to] = transition
  const encodedFrom = codec.from.encode(from)
  // const to = codec.to.encode(transition[1])

  if (!transitionsByFromState[encodedFrom]) {
    transitionsByFromState[encodedFrom] = new Deque<To>()
  }

  transitionsByFromState[encodedFrom].push(to)

  return transitionsByFromState
}

function getTransitionsFrom<From, To>(codec: StateTransitionCodec<From, To>, transitionsByFromState: TransitionsByFromState<To>, from: From) {
  const encodedFrom = codec.from.encode(from)
  return transitionsByFromState[encodedFrom]
}

// stateTransitions is an array of arrays. Each nested array represents
// an instance of a transition from one state to another.
// stateTransitions = [
//   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
//   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
//   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
// ]

// transitionsByFromState['sad']['happy'] returns the number of times
// that a transition from 'sad' to 'happy' was present in stateTransitions
export function recordStateTransitions<From, To>(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[]) {
  const transitionsByFromState: TransitionsByFromState<To> = {}

  for (let i = 0; i < stateTransitions.length; i++) {
    const stateTransition = stateTransitions[i]
    recordStateTransition(codec, transitionsByFromState, stateTransition)
  }

  return transitionsByFromState
}

const getRandomElement = <T>(deque: Deque<T>) => {
  const i = Math.floor(Math.random() * deque.length)
  return deque.get(i)
}
export function predict<From, To>(codec: StateTransitionCodec<From, To>, transitionsByFromState: TransitionsByFromState<To>, from: From) {
  const transitionsFrom = getTransitionsFrom(codec, transitionsByFromState, from)
  if (!transitionsFrom) {
    return null
  }
  const prediction = getRandomElement(transitionsFrom)
  return prediction
}

export default class HeyMarkov<From, To> {
  transitionsByFromState: TransitionsByFromState<To>
  private codec: StateTransitionCodec<From, To>
  constructor(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[] = []) {
    this.codec = codec
    this.transitionsByFromState = recordStateTransitions(codec, stateTransitions)
  }

  recordStateTransition(transition: StateTransition<From, To>) {
    this.transitionsByFromState = recordStateTransition(this.codec, this.transitionsByFromState, transition)
  }

  predict(from: From) {
    return predict(this.codec, this.transitionsByFromState, from)
  }

  // predictInverse(from) {
  // const transitionCountsFrom = this.transitionsByFromState.getTransitionCountsFrom(from)

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
