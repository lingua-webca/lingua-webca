import { LinguaWebcaRequest, LinguaWebcaStore, StoreSwitchFunction } from "./interfaces"

export const createSwitchingStore = (switchFn: StoreSwitchFunction) => (
  req: LinguaWebcaRequest
) => switchFn(req)(req)

type SwitchingStoreMap = ReadonlyArray<
  readonly [string | RegExp, LinguaWebcaStore]
>

export const always404: LinguaWebcaStore = request =>
  Promise.resolve({
    body: 'Store not found',
    code: 404,
    request,
    uri: request.uri
  })

export const createSwitchFnFromMapping = (mapping: SwitchingStoreMap) => (
  req: LinguaWebcaRequest
) => {
  const item = mapping.find(([path]) => {
    // tslint:disable-next-line: no-if-statement
    if (path instanceof RegExp) {
      return (path as RegExp).test(req.uri)
    }
    return req.uri.indexOf(path) === 0
  })

  return item ? item[1] : always404
}

export const createFromMapping = (mapping: SwitchingStoreMap) =>
  SwitchingStore.create(createSwitchFnFromMapping(mapping))

export const SwitchingStore = {
  create: createSwitchingStore,
  fromMapping: createFromMapping
}
