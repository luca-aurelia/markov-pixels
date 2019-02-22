"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sumValues = (obj) => {
    let total = 0;
    for (const value of Object.values(obj)) {
        total += value;
    }
    return total;
};
function recordStateTransition(codec, transitionCounts, transition) {
    const from = codec.from.encode(transition[0]);
    const to = codec.to.encode(transition[1]);
    if (!transitionCounts[from]) {
        transitionCounts[from] = {};
    }
    if (!transitionCounts[from][to]) {
        transitionCounts[from][to] = 0;
    }
    transitionCounts[from][to] += 1;
    return transitionCounts;
}
function getTransitionCountsFrom(codec, transitionCounts, from) {
    const encodedFrom = codec.from.encode(from);
    return transitionCounts[encodedFrom];
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
function countStateTransitions(codec, stateTransitions) {
    const transitionCounts = {};
    for (let i = 0; i < stateTransitions.length; i++) {
        const stateTransition = stateTransitions[i];
        recordStateTransition(codec, transitionCounts, stateTransition);
    }
    return transitionCounts;
}
exports.countStateTransitions = countStateTransitions;
function predict(codec, transitionCounts, from) {
    const transitionCountsFrom = getTransitionCountsFrom(codec, transitionCounts, from);
    if (!transitionCountsFrom) {
        return null;
    }
    const sumTransitionCounts = sumValues(transitionCountsFrom);
    const randomCountSum = Math.floor(sumTransitionCounts * Math.random());
    let index = 0;
    let countSum = 0;
    const entries = Object.entries(transitionCountsFrom);
    while (countSum <= randomCountSum) {
        countSum += entries[index][1];
        index++;
    }
    const encodedPrediction = entries[index - 1][0];
    const prediction = codec.to.decode(encodedPrediction);
    return prediction;
}
exports.predict = predict;
class HiMarkov {
    constructor(codec, stateTransitions = []) {
        this.codec = codec;
        this.transitionCounts = countStateTransitions(codec, stateTransitions);
    }
    recordStateTransition(transition) {
        this.transitionCounts = recordStateTransition(this.codec, this.transitionCounts, transition);
    }
    predict(from) {
        return predict(this.codec, this.transitionCounts, from);
    }
}
exports.default = HiMarkov;
