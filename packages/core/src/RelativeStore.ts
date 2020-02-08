import { LinguaWebcaStore } from './interfaces'
import { createMappingStore } from './MappingStore'

export const createRelativeStore = (
  prefix: string,
  backing: LinguaWebcaStore
) =>
  createMappingStore(
    request => ({
      ...request,
      uri: `${prefix}${request.uri}`
    }),
    response => ({
      ...response,
      uri: response.uri.replace(prefix, '')
    }),
    backing
  )

export const RelativeStore = {
  create: createRelativeStore
}
