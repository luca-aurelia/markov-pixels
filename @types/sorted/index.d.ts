declare module 'sorted' {
  type SortResults = 0 | 1 | -1
  export class Sorted<T> {
    length: number
    push(element: T): void
    get(index: number): T
  }
  type ComparisonFunction<T> = (a: T, b: T) => SortResults
  export default function sorted<T>(elements: T[], comparisonFunction: ComparisonFunction<T>): Sorted<T>
}