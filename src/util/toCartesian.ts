import { PolarCoordinate } from './polarTypes'

export default ({ radius, angle }: PolarCoordinate) => ({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) })