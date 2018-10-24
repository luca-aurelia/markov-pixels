const is = require('@sindresorhus/is')
const CliProgress = require('cli-progress')

const stringifyNonPrimitives = x => (is.primitive(x) ? x : JSON.stringify(x))

const sumValues = obj => {
  let total = 0
  for (const value of Object.values(obj)) {
    total += value
  }
  return total
}

class HiMarkov {
  constructor (stateTransitions) {
    // stateTransitions is an array of arrays. Each nested array represents
    // an instance of a transition from one state to another.
    // stateTransitions = [
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
    //   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
    //   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
    // ]

    // this.transitionCounts['sad']['happy'] returns the number of times
    // that a transition from 'sad' to 'happy' was present in stateTransitions
    this.transitionCounts = {}

    const progressBar = new CliProgress.Bar()
    progressBar.start(stateTransitions.length, 0)

    for (let i = 0; i < stateTransitions.length; i++) {
      const stateTransition = stateTransitions[i]
      const [from, to] = stateTransition.map(stringifyNonPrimitives)
      if (!this.transitionCounts[from]) {
        this.transitionCounts[from] = {}
      }
      if (!this.transitionCounts[from][to]) {
        this.transitionCounts[from][to] = 0
      }
      this.transitionCounts[from][to] += 1
      progressBar.update(i)
    }

    progressBar.stop()
  }

  predict (from) {
    from = stringifyNonPrimitives(from)
    // console.log({ from })

    // console.log({ transitionCounts: this.transitionCounts })
    const transitionCountsFrom = this.transitionCounts[from]
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

  predictInverse (from) {
    from = stringifyNonPrimitives(from)
    // console.log({ from })

    // console.log({ transitionCounts: this.transitionCounts })
    const transitionCountsFrom = this.transitionCounts[from]
    // console.log({ transitionCountsFrom })

    const max = Object.values(
      transitionCountsFrom
    ).reduce((previousMax, count) => Math.max(previousMax, count))

    const invertedTransitionCountsFrom = Object.entries(transitionCountsFrom)
      .map(([toState, count]) => [toState, max - count + 1]) // add one so no occurrences drop to 0
      .reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    const sumTransitionCounts = sumValues(invertedTransitionCountsFrom)
    const randomCountSum = Math.floor(sumTransitionCounts * Math.random())

    let index = 0
    let countSum = 0
    const entries = Object.entries(invertedTransitionCountsFrom)
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

  sumTransitionCounts (from) {
    from = stringifyNonPrimitives(from)
  }
}

module.exports = HiMarkov
