import {
  LinguaCache,
  LinguaWebcaRequest,
  LinguaWebcaResponse,
  LinguaWebcaStore
} from './interfaces'

export function createBasicCache<
  Request extends LinguaWebcaRequest = LinguaWebcaRequest,
  Response extends LinguaWebcaResponse = LinguaWebcaResponse
>(getCacheKey = (req: Request) => req.uri): LinguaCache<Request, Response> {
  const cache: Record<string, Response> = {}

  return {
    get(req: Request): Response | undefined {
      return cache[getCacheKey(req)]
    },

    set(req: Request, value: Response): Response {
      // tslint:disable-next-line: no-object-mutation no-expression-statement
      cache[getCacheKey(req)] = value
      return value
    },

    del(req: Request): void {
      // tslint:disable-next-line: no-object-mutation no-expression-statement no-delete
      delete cache[getCacheKey(req)]
    }
  }
}

export function createCachingStore(
  backing: LinguaWebcaStore,
  cache?: LinguaCache
): LinguaWebcaStore {
  const theCache = cache || CachingStore.createBasicCache()

  return (request: LinguaWebcaRequest) => {
    const cached = theCache.get(request)
    return cached
      ? Promise.resolve({
          ...cached,
          request
        })
      : backing(request)
  }
}

export const CachingStore = {
  create: createCachingStore,
  createBasicCache
}
