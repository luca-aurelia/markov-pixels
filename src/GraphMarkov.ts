import WeightedUndirectedGraph from './structurae/WeightedUndirectedGraph'

interface NumbersByStrings {
  [key: string]: number
}

export type StateSorter<State> = (a: State, b: State) => -1 | 0 | 1
export type StateTransition<From, To> = [From, To]

export interface SerializedTransitionsByFromState<To> {
  [fromState: string]: Array<To>
}

export interface Codec<T> {
  encode: (input: T) => number
  decode: (input: number) => T
}

export interface StateCodec<From, To> {
  from: Codec<From>,
  to: Codec<To>
}

const stateSorterNoOp = <To>(toState: To): -1 | 0 | 1 => 1

export default class GraphMarkov<From, To> {
  private codec: StateCodec<From, To>
  private stateSorter: StateSorter<To>
  graph: WeightedUndirectedGraph
  totalTransitionsCount: { [encodedState: number]: number }

  constructor(codec: StateCodec<From, To>, stateSorter: StateSorter<To> = stateSorterNoOp, size: number) {
    this.graph = new WeightedUndirectedGraph({ size })
    this.totalTransitionsCount = {}
    this.codec = codec
    this.stateSorter = stateSorter
  }

  recordStateTransition(transition: StateTransition<From, To>) {
    const [from, to] = transition
    const f = this.codec.from.encode(from)
    const t = this.codec.to.encode(to)

    if (this.graph.hasEdge(f, t)) {
      const previousTransitionsCount = this.graph.get(f, t)
      this.graph.set(f, t, previousTransitionsCount + 1)
      this.totalTransitionsCount[f] += 1
    } else {
      this.graph.addEdge(f, t, 1)
      this.totalTransitionsCount[f] = 0
    }
  }

  predict(from: From, inferenceParameter?: number) {
    const origin = this.codec.from.encode(from)

    // States we can get to starting from f
    const destinations = this.graph.outEdges(origin)
    if (!destinations.length) {
      return null
    }

    if (inferenceParameter === undefined) {
      inferenceParameter = Math.random()
    }

    if (inferenceParameter < 0 || inferenceParameter > 1) throw new Error(`If inference parameter is provided, it must be between 0 and 1 (inclusive), but was ${inferenceParameter}`)

    const countTransitionsFromOrigin = this.totalTransitionsCount[origin]
    let target = Math.floor(inferenceParameter * (countTransitionsFromOrigin + 1))

    let prediction!: number
    for (const destination of destinations) {
      const weight = this.graph.get(origin, destination)
      target -= weight
      if (target <= 0) {
        prediction = destination
        break
      }
    }

    return this.codec.to.decode(prediction)
  }
}
