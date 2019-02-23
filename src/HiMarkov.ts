import sorted, { Sorted } from 'sorted'
interface NumbersByStrings {
  [key: string]: number
}

export type StateSorter<State> = (a: State, b: State) => -1 | 0 | 1
export type StateTransition<From, To> = [From, To]

export interface TransitionsByFromState<To> {
  [fromState: string]: Sorted<To>
}

export interface SerializedTransitionsByFromState<To> {
  [fromState: string]: Array<To>
}

export interface Codec<T> {
  encode: (input: T) => string
  decode: (input: string) => T
}

export interface StateTransitionCodec<From, To> {
  from: Codec<From>,
  to: Codec<To>
}

function recordStateTransition<From, To>(codec: StateTransitionCodec<From, To>, transitionsByFromState: TransitionsByFromState<To>, transition: StateTransition<From, To>, toStateSorter: StateSorter<To>) {
  const [from, to] = transition
  const encodedFrom = codec.from.encode(from)
  // const to = codec.to.encode(transition[1])

  if (!transitionsByFromState[encodedFrom]) {
    transitionsByFromState[encodedFrom] = sorted<To>([], toStateSorter)
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
export function recordStateTransitions<From, To>(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[], toStateSorter: StateSorter<To>) {
  const transitionsByFromState: TransitionsByFromState<To> = {}

  for (let i = 0; i < stateTransitions.length; i++) {
    const stateTransition = stateTransitions[i]
    recordStateTransition(codec, transitionsByFromState, stateTransition, toStateSorter)
  }

  return transitionsByFromState
}

const getRandomElement = <T>(collection: Sorted<T>) => {
  const i = Math.floor(Math.random() * collection.length)
  return collection.get(i)
}

export function predict<From, To>(codec: StateTransitionCodec<From, To>, transitionsByFromState: TransitionsByFromState<To>, from: From, inferenceParameter?: number) {
  const transitionsFrom = getTransitionsFrom(codec, transitionsByFromState, from)
  if (!transitionsFrom) {
    return null
  }
  let prediction
  if (inferenceParameter === undefined) {
    prediction = getRandomElement(transitionsFrom)
  } else {
    if (inferenceParameter < 0 || inferenceParameter > 1) throw new Error(`If inference parameter is provided, it must be between 0 and 1 (inclusive), but was ${inferenceParameter}`)

    const index = Math.floor(inferenceParameter * transitionsFrom.length)
    prediction = transitionsFrom.get(index)
  }
  return prediction
}


const toStateSorterNoOp = <To>(toState: To): -1 | 0 | 1 => 1

export default class HiMarkov<From, To> {
  transitionsByFromState: TransitionsByFromState<To>
  private codec: StateTransitionCodec<From, To>
  private toStateSorter: StateSorter<To>
  static fromSerialized<From, To>(codec: StateTransitionCodec<From, To>, serialized: SerializedTransitionsByFromState<To>, toStateSorter: StateSorter<To> = toStateSorterNoOp) {
    const markovChain = new HiMarkov(codec, [], toStateSorter)
    markovChain.transitionsByFromState = this.deserializeStateTransitions(serialized, toStateSorter)
    return markovChain
  }
  static deserializeStateTransitions<To>(serialized: SerializedTransitionsByFromState<To>, toStateSorter: StateSorter<To>) {
    const deserialized: TransitionsByFromState<To> = {}
    for (const key of Object.keys(serialized)) {
      deserialized[key] = sorted.fromSorted(serialized[key], toStateSorter)
    }
    return deserialized
  }
  constructor(codec: StateTransitionCodec<From, To>, stateTransitions: StateTransition<From, To>[] = [], toStateSorter: StateSorter<To> = toStateSorterNoOp) {
    this.codec = codec
    this.transitionsByFromState = recordStateTransitions(codec, stateTransitions, toStateSorter)
    this.toStateSorter = toStateSorter
  }

  recordStateTransition(transition: StateTransition<From, To>) {
    this.transitionsByFromState = recordStateTransition(this.codec, this.transitionsByFromState, transition, this.toStateSorter)
  }

  predict(from: From, inferenceParameter?: number) {
    return predict(this.codec, this.transitionsByFromState, from, inferenceParameter)
  }

  serializeStateTransitions() {
    const serialized: SerializedTransitionsByFromState<To> = {}
    for (const key of Object.keys(this.transitionsByFromState)) {
      serialized[key] = this.transitionsByFromState[key].toArray()
    }
    return serialized
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
