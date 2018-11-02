"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const stringify = (x: any): string => JSON.stringify(x)
const stringify = (point) => point.r + ',' + point.g + ',' + point.b + ',' + point.a;
const sumValues = (obj) => {
    let total = 0;
    for (const value of Object.values(obj)) {
        total += value;
    }
    return total;
};
class TransitionCounts {
    constructor() {
        this.transitionCounts = {};
    }
    recordTransition(transition) {
        const [from, to] = transition.map(stringify);
        if (!this.transitionCounts[from]) {
            this.transitionCounts[from] = {};
        }
        if (!this.transitionCounts[from][to]) {
            this.transitionCounts[from][to] = 0;
        }
        this.transitionCounts[from][to] += 1;
    }
    getTransitionCountsFrom(state) {
        const stringifiedFrom = stringify(state);
        return this.transitionCounts[stringifiedFrom];
    }
}
class HiMarkov {
    constructor(stateTransitions = []) {
        // stateTransitions is an array of arrays. Each nested array represents
        // an instance of a transition from one state to another.
        // stateTransitions = [
        //   ['sad', 'happy'], // indicates 'sad' became 'happy' one time
        //   ['angry', 'peaceful'], // indicates 'angry' became 'peaceful' another time
        //   ['sad', 'happy'], // indicates 'sad' became 'happy' a second time
        // ]
        // this.transitionCounts['sad']['happy'] returns the number of times
        // that a transition from 'sad' to 'happy' was present in stateTransitions
        this.transitionCounts = new TransitionCounts();
        for (let i = 0; i < stateTransitions.length; i++) {
            const stateTransition = stateTransitions[i];
            this.transitionCounts.recordTransition(stateTransition);
        }
    }
    recordStateTransition(transition) {
        this.transitionCounts.recordTransition(transition);
    }
    predict(from) {
        const transitionCountsFrom = this.transitionCounts.getTransitionCountsFrom(from);
        // console.log({ transitionCountsFrom })
        const sumTransitionCounts = sumValues(transitionCountsFrom);
        const randomCountSum = Math.floor(sumTransitionCounts * Math.random());
        let index = 0;
        let countSum = 0;
        const entries = Object.entries(transitionCountsFrom);
        while (countSum <= randomCountSum) {
            countSum += entries[index][1];
            index++;
        }
        const prediction = entries[index - 1][0];
        try {
            return JSON.parse(prediction);
        }
        catch (e) {
            return prediction;
        }
    }
}
exports.default = HiMarkov;
