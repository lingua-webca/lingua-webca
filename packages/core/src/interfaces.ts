export type URI = string
export type LinguaWebcaVerb =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'PATCH'
  | 'DELETE'
  | 'LISTEN'
export type LinguaWebcaResponseCode = number

export interface LinguaWebcaHeaders {
  readonly [name: string]: string
}

export type LinguaWebcaEventHandler<T = any> = (evt: T) => void

export interface LinguaWebcaRequest<
  BodyType = any,
  Headers = LinguaWebcaHeaders,
  EvtType = any
> {
  readonly verb: LinguaWebcaVerb
  readonly uri: URI
  readonly eventHandler?: LinguaWebcaEventHandler<EvtType>
  readonly headers?: Headers
  readonly body?: BodyType
}

export interface LinguaWebcaResponse<
  BodyType = any,
  Headers = LinguaWebcaHeaders
> {
  readonly uri: URI
  readonly request: LinguaWebcaRequest<any, any>
  readonly headers?: Headers
  readonly code: LinguaWebcaResponseCode
  readonly body: BodyType
}

export interface LinguaCache<
  Request extends LinguaWebcaRequest = LinguaWebcaRequest,
  Response extends LinguaWebcaResponse = LinguaWebcaResponse
> {
  readonly get: (req: Request) => Response | undefined
  readonly set: (req: Request, value: Response) => Response | undefined
  readonly del: (req: Request) => void
}

export type LinguaWebcaStore<
  Request extends LinguaWebcaRequest = LinguaWebcaRequest,
  Response extends LinguaWebcaResponse = LinguaWebcaResponse
> = (uri: Request) => Promise<Response>

export type StoreSwitchFunction = (
  request: LinguaWebcaRequest
) => LinguaWebcaStore

export type LinguaWebcaMappingStore = (
  backing: LinguaWebcaStore
) => LinguaWebcaStore

export interface LinguaWebcaClient {
  readonly request: <ResBody = any, ReqBody = any>(
    uri: string,
    verb: LinguaWebcaVerb,
    body: ReqBody
  ) => Promise<ResBody>

  readonly on: <EvtType = any>(
    uri: string,
    handler: LinguaWebcaEventHandler<EvtType>
  ) => () => void

  readonly get: <ResBody = any>(uri: string) => Promise<ResBody>

  readonly put: <ResBody = any, ReqBody = any>(
    uri: string,
    body: ReqBody
  ) => Promise<ResBody>

  readonly patch: <ResBody = any, ReqBody = any>(
    uri: string,
    body: ReqBody
  ) => Promise<ResBody>

  readonly post: <ResBody = any, ReqBody = any>(
    uri: string,
    body: ReqBody
  ) => Promise<ResBody>

  readonly del: <ResBody = any, ReqBody = any>(
    uri: string,
    body: ReqBody
  ) => Promise<ResBody>
}
