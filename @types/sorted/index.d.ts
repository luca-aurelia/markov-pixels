declare module 'sorted' {
  type SortResults = 0 | 1 | -1
  type ComparisonFunction<T> = (a: T, b: T) => SortResults
  export class Sorted<T> {
    constructor(elements: T[], comparisonFunction: ComparisonFunction<T>)
    length: number
    push(element: T): void
    get(index: number): T
    toArray(): Array<T>
  }
  interface SortedModule {
    <T>(elements: T[], comparisonFunction: ComparisonFunction<T>): Sorted<T>
    fromSorted<T>(elements: T[], comparisonFunction: ComparisonFunction<T>): Sorted<T>
  }
  const sorted: SortedModule
  export default sorted
}