import { SimpleClient } from './SimpleClient'
import { UniversalStore } from './UniversalStore'
export {
  ExpressLikeStore,
  ExpressLikeResponse,
  ExpressLikeRequest
} from './ExpressLikeStore'
export { CachingStore } from './CachingStore'
export { MappingStore } from './MappingStore'
export { PathPrefixedStore } from './PathPrefixedStore'
export { RelativeStore } from './RelativeStore'
export { SwitchingStore } from './SwitchingStore'
export { SimpleClient } from './SimpleClient'
export { UniversalStore } from './UniversalStore'
export { HttpStore } from './HttpStore'
export * from './interfaces'

export const store = new UniversalStore()
export const webca = SimpleClient.create(store.request)
