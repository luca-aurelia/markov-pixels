// Type definitions for structurae
// Project: structurae
// Definitions by: Maga D. Zandaqo <denelxan@gmail.com> (http://maga.name)

type Collection = any[] | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array |
    Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

type CollectionConstructor = ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor
    | Uint8ClampedArrayConstructor | Int16Array | Uint16ArrayConstructor | Int32ArrayConstructor
    | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;

interface GridOptions {
    rows: number;
    columns: number;
    pad?: any;
}

interface Coordinates {
    row: number;
    column: number;
}

declare class Grid {
    columns: number;
    rows: number;
    offset: number;
    pad: any;
    lastCoordinates: Coordinates;

    constructor(options?: GridOptions, ...args: any);
    get(row: number, column: number): any;
    set(row: number, column: number, value: any): this;
    setArray(array: Collection, offset: number): void;
    getCoordinates(index: number): Coordinates;
    toArrays(withPadding?: boolean): any[][];
    static getOffset(columns: number): number;
    static getLength(rows: number, columns: number): number;
    static fromArrays(arrays: any[][], pad: any): Grid;
}

interface Constructor<T> {
    new(...args: any[]): T;
}

export declare function GridMixin<T extends Collection>(Base?: Constructor<T>): Constructor<T & Grid>

type AnyNumber = number | bigint;
type FieldName = number | string;
type Matcher = [AnyNumber, AnyNumber];

interface UnpackedInt {
    [propName: string]: number;
}

interface Field {
    name: FieldName;
    size?: number;
}

interface Masks {
    [propName: string]: AnyNumber;
}

export class BitField {
    value: AnyNumber;
    constructor(data?: AnyNumber | number[]);
    get(field: FieldName): number;
    set(field: FieldName, value: number): any;
    has(...fields: FieldName[]): boolean;
    match(matcher: Matcher | UnpackedInt): boolean;
    toObject(): UnpackedInt;
    toString(): string;
    valueOf(): AnyNumber;
    static initialize(): void;
    static encode(data: (AnyNumber)[]): AnyNumber;
    static decode(data: AnyNumber): UnpackedInt;
    static isValid(data: number[] | UnpackedInt): boolean;
    static getMinSize(number: number): number;
    static getMatcher(matcher: UnpackedInt): Matcher;
    static fields: (Field | FieldName)[];
    static size: number;
    static masks: Masks;
    static offsets: Masks;
    static isInitialized: boolean;
    static isBigInt: boolean;
    static isSafe: boolean;
    static zero: 0 | 0n;
    static one: 1 | 1n;
    static two: 2 | 2n;
    static mask: AnyNumber;
}

type CompareResult = 1 | -1 | 0;

interface Comparator {
    (a: any, b: any): CompareResult
}

declare class SortedCollection {
    isSorted(): boolean;
    isUnique(): boolean;
    range(start: number, end: number, subarray?: boolean): SortedCollection;
    rank(element: any): number;
    static compare(a: any, b: any): CompareResult;
    static getDifference<T extends Collection>(a: Collection, b: Collection, symmetric?: boolean, comparator?: Comparator, container?: T): T;
    static getDifferenceScore(a: Collection, b: Collection, symmetric?: boolean, comparator?: Comparator): number;
    static getIndex(arr: Collection, target: any, comparator?: Comparator, rank?: boolean, start?: number, end?: number): number;
    static getIntersection<T extends Collection>(a: Collection, b: Collection, comparator?: Comparator, container?: T): T;
    static getIntersectionScore(a: Collection, b: Collection, comparator?: Comparator): number;
    static getRange<T extends Collection>(arr: T, start?: number, end?: number, comparator?: Comparator, subarray?: boolean): T;
    static getUnion<T extends Collection>(a: Collection, b: Collection, unique?: boolean, comparator?: Comparator, container?: T): T;
    static getUnique<T extends Collection>(arr: Collection, comparator?: Comparator, container?: T): T;
    static isSorted(arr: Collection, comparator?: Comparator): boolean;
    static isUnique(arr: Collection, comparator?: Comparator): boolean;
}

export declare function SortedMixin<T extends Collection>(Base?: Constructor<T>): Constructor<T & SortedCollection>

export class SortedArray extends SortedMixin(Array) {
    unique: boolean;
    set(arr: Collection): this;
    uniquify(): this;
}

interface RecordField {
    name: string;
    type: string;
    size?: number;
    littleEndian?: boolean;
}

interface RecordSchema {
    [propName: string]: RecordField;
}

export declare class RecordArray extends DataView {
    size: number;
    private fields: RecordField[];
    private schema: RecordSchema;
    private offset: number;
    private offsets: object;
    private stringView: StringView;

    constructor(fields: RecordField[], size: number, buffer?: ArrayBuffer, byteOffset?: number, byteLength?: number);
    get(index: number, field: string): any;
    set(index: number, field: string, value: any, littleEndian?: boolean): this;
    getString(offset: number, littleEndian: boolean, size: number): StringView;
    setString(offset: number, value: Collection): void;
    toObject(index: number): object;
}

export declare class Pool extends Uint16Array {
    private nextAvailable: number;
    constructor(size: number);
    get(): number;
    free(index: number): void;
}

export declare class StringView extends Uint8Array {
    size: number;
    static masks: Int8Array;

    characters(): string;
    charAt(index?: number): string;
    private getCharEnd(index: number): number;
    private getCharStart(index: number, startCharIndex?: number, startIndex?: number): number;
    replace(pattern: Collection, replacement: Collection): this;
    reverse(): this;
    search(searchValue: Collection, fromIndex?: number): number;
    private searchNaive(searchValue: Collection, fromIndex?: number): number;
    private searchShiftOr(searchValue: Collection, fromIndex?: number): number;
    substring(indexStart: number, indexEnd?: number): string;
    private toChar(index: number): string;
    toString(): string;
    trim(): StringView;
    static fromString(string: string, size?: number): StringView;
    static getByteSize(string: string): number;
}

export declare class BinaryHeap extends Array {
    heapify(): this;
    isHeap(): boolean;
    left(index: number): any;
    parent(index: number): any;
    replace(item: any): any;
    right(index: number): any;
    update(index: number): void;
    private has(index: number): boolean;
    private siftDown(start: number): void;
    private siftUp(start: number): void;
    static compare(a: any, b: any): boolean;
    private static getLeftIndex(index: number): number;
    private static getParentIndex(index: number): number;
    private static getRightIndex(index: number): number;
    static isHeap(heap: Collection): boolean;
}

interface BitPosition {
    bucket: number;
    position: number;
}

type Bit = 0 | 1;

interface BinaryGridOptions {
    rows: number;
    columns: number;
}

export declare class BinaryGrid {
    offset: number;
    columns: number;
    rows: number;
    lastPosition: BitPosition;
    constructor(options: BinaryGridOptions, ...args: any);
    get(row: number, column: number): Bit;
    set(row: number, column: number, value?: Bit): this;
    setArray(array: Collection, offset: number): void;
    getRow(row: number): Bit[];
    getColumn(column: number): Bit[];
    private getBitPosition(row: number, column: number): BitPosition;
    static getLength(rows: number, columns: number): number;
    static getOffset(columns: number): number;
}

declare class SymmetricGrid {
    rows: number;
    columns: number;
    pad: any;
    lastCoordinates: Coordinates;

    constructor(options?: GridOptions, ...args: any);
    get(row: number, column: number): any;
    set(row: number, column: number, value: any): this;
    setArray(array: Collection, offset: number): void;
    getCoordinates(index: number): Coordinates;
    toArrays(withPadding?: boolean): any[][];
    static getLength(rows: number, columns: number): number;
    static fromArrays(arrays: any[][], pad: any): SymmetricGrid;
}

export declare function SymmetricGridMixin<T extends Collection>(Base?: Constructor<T>): Constructor<T & SymmetricGrid>

export declare class UnweightedGraph extends BinaryGrid {
    size: number;
    colors: BinaryGrid;
    directed: boolean;

    constructor(options?: GridOptions, ...args: any);
    addEdge(x: number, y: number): this;
    removeEdge(x: number, y: number): this;
    hasEdge(x: number, y: number): boolean;
    outEdges(x: number): number[];
    inEdges(x: number): number[];
    isGray(x: number): boolean;
    setGray(x: number): this;
    isBlack(x: number): boolean;
    setBlack(x: number): this;
    traverse(isDFS?: boolean, start?: number, gray?: boolean, white?: boolean, black?: boolean): number;
    path(start: number, end?: number): number[];
    tree(start?: number): number[];
    isAcyclic(): boolean;
    topologicalSort(): number[];
    static getLength(size: number): number;
}

declare class WeightedUndirectedGraph {
    size: number;
    colors: BinaryGrid;
    directed: boolean;

    constructor(options?: GridOptions, ...args: any);
    get(x: number, y: number): number;
    set(x: number, y: number, weight: number): this;
    addEdge(x: number, y: number, weight: number): this;
    removeEdge(x: number, y: number): this;
    hasEdge(x: number, y: number): boolean;
    outEdges(x: number): number[];
    inEdges(x: number): number[];
    isGray(x: number): boolean;
    setGray(x: number): this;
    isBlack(x: number): boolean;
    setBlack(x: number): this;
    traverse(isDFS?: boolean, start?: number, gray?: boolean, white?: boolean, black?: boolean): number;
    path(start: number, end: number, isAcyclic?: boolean, isPositive?: boolean): number[];
    tree(start?: number): number[];
    isAcyclic(): boolean;
    topologicalSort(): number[];
    static getLength(size: number): number;
    private searchTopological(start: number, end: number, distances: number[], predecessor: number[]): boolean;
    private searchDijkstra(start: number, end: number, distances: number[], predecessor: number[]): boolean;
    private searchBellmanFord(start: number, end: number, distances: number[], predecessor: number[]): boolean;
}
