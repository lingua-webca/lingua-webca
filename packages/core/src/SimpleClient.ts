import {
  LinguaWebcaClient,
  LinguaWebcaEventHandler,
  LinguaWebcaRequest,
  LinguaWebcaResponse,
  LinguaWebcaStore,
  LinguaWebcaVerb
} from './interfaces'

export function createSimpleClient(store: LinguaWebcaStore): LinguaWebcaClient {
  async function request<ResBody = any, ReqBody = any>(
    uri: string,
    verb: LinguaWebcaVerb = 'GET',
    body?: ReqBody
  ): Promise<ResBody> {
    const typedStore: LinguaWebcaStore<
      LinguaWebcaRequest<ReqBody>,
      LinguaWebcaResponse<ResBody>
    > = store

    const req: LinguaWebcaRequest = {
      body,
      uri,
      verb
    }

    const response = await typedStore(req)

    // tslint:disable-next-line: no-if-statement
    if (response.code >= 400) {
      throw new Error(`Response Code: ${response.code}, ${response.body}`)
    }

    return response.body
  }

  return {
    request,

    get<ResBody = any>(uri: string): Promise<ResBody> {
      return request<ResBody>(uri, 'GET')
    },

    on<EvtType = any>(
      uri: string,
      eventHandler: LinguaWebcaEventHandler<EvtType>
    ): () => void {
      const req: LinguaWebcaRequest = {
        eventHandler,
        uri,
        verb: 'LISTEN'
      }

      // tslint:disable-next-line: no-expression-statement
      store(req)

      return () => undefined
    },

    put<ResBody = any, ReqBody = any>(
      uri: string,
      body: ReqBody
    ): Promise<ResBody> {
      return request<ResBody, ReqBody>(uri, 'PUT', body)
    },

    post<ResBody = any, ReqBody = any>(
      uri: string,
      body: ReqBody
    ): Promise<ResBody> {
      return request<ResBody, ReqBody>(uri, 'POST', body)
    },

    patch<ResBody = any, ReqBody = any>(
      uri: string,
      body: ReqBody
    ): Promise<ResBody> {
      return request<ResBody, ReqBody>(uri, 'PATCH', body)
    },

    del<ResBody = any, ReqBody = any>(
      uri: string,
      body?: ReqBody
    ): Promise<ResBody> {
      return request<ResBody, ReqBody>(uri, 'DELETE', body)
    }
  }
}

export const SimpleClient = {
  create: createSimpleClient
}
