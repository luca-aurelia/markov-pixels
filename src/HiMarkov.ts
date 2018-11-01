const stringify = (x: any): string => JSON.stringify(x)

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
  constructor() {
    this.transitionCounts = {}
  }
  recordTransition(transition: StateTransition<From, To>) {
    const [from, to] = transition.map(stringify)
    if (!this.transitionCounts[from]) {
      this.transitionCounts[from] = {}
    }
    if (!this.transitionCounts[from][to]) {
      this.transitionCounts[from][to] = 0
    }
    this.transitionCounts[from][to] += 1
  }
  getTransitionCountsFrom(state: From): TransitionCountsToState {
    const stringifiedFrom = stringify(state)
    return this.transitionCounts[stringifiedFrom]
  }
}

export default class HiMarkov<From, To> {
  private transitionCounts: TransitionCounts<From, To>
  constructor(stateTransitions: StateTransition<From, To>[]) {
    // stateTransitions is an array of arrays. Each nested array represents
    // an instance of a transition from one state to another.
    // stateTransitions = [
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
    //   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
    // ]

    // this.transitionCounts['sad']['happy'] returns the number of times
    // that a transition from 'sad' to 'happy' was present in stateTransitions

    this.transitionCounts = new TransitionCounts()

    for (let i = 0; i < stateTransitions.length; i++) {
      const stateTransition = stateTransitions[i]
      this.transitionCounts.recordTransition(stateTransition)
    }
  }

  predict(from: From) {
    const transitionCountsFrom = this.transitionCounts.getTransitionCountsFrom(from)
    // console.log({ transitionCountsFrom })
    const sumTransitionCounts = sumValues(transitionCountsFrom)
    const randomCountSum = Math.floor(sumTransitionCounts * Math.random())

    let index = 0
    let countSum = 0
    const entries = Object.entries(transitionCountsFrom)
    while (countSum <= randomCountSum) {
      countSum += entries[index][1]
      index++
    }

    const prediction = entries[index - 1][0]

    try {
      return JSON.parse(prediction)
    } catch (e) {
      return prediction
    }
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
