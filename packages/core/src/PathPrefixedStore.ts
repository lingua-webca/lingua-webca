import { LinguaWebcaStore } from './interfaces'
import { createMappingStore } from './MappingStore'

export const createPathPrefixedStore = (
  prefix: string,
  backing: LinguaWebcaStore
) =>
  createMappingStore(
    request => ({
      ...request,
      uri: request.uri.replace(prefix, '')
    }),
    response => ({
      ...response,
      uri: `${prefix}${response.uri}`
    }),
    backing
  )

export const PathPrefixedStore = {
  create: createPathPrefixedStore
}
