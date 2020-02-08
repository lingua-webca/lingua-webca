import {
  LinguaWebcaRequest,
  LinguaWebcaResponse,
  LinguaWebcaStore
} from './interfaces'

type ReqMapFn = (req: LinguaWebcaRequest) => LinguaWebcaRequest
type ResMapFn = (req: LinguaWebcaResponse) => LinguaWebcaResponse

export const mappedRequest = (
  reqMap: ReqMapFn,
  resMap: ResMapFn,
  backing: LinguaWebcaStore,
  request: LinguaWebcaRequest
) =>
  backing(reqMap(request)).then(res => ({
    ...resMap(res),
    request
  }))

export const createMappingStore = (
  reqMap: ReqMapFn,
  resMap: ResMapFn,
  backing: LinguaWebcaStore
) => (request: LinguaWebcaRequest) =>
  mappedRequest(reqMap, resMap, backing, request)

export const MappingStore = {
  create: createMappingStore,
  mappedRequest
}
