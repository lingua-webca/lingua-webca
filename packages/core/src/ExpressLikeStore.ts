// tslint:disable: no-class no-this max-classes-per-file no-object-mutation
// tslint:disable: no-expression-statement no-if-statement no-let
import Route from 'route-parser'
import { parse as parseUri } from 'uri-js'
import {
  LinguaWebcaClient,
  LinguaWebcaRequest,
  LinguaWebcaResponse,
  LinguaWebcaVerb
} from './interfaces'
import { SimpleClient } from './SimpleClient'

export class ExpressLikeResponse {
  public readonly request: LinguaWebcaRequest
  public readonly route: ExpressLikeRoute
  public readonly params: any

  // tslint:disable-next-line: readonly-keyword
  protected resolve?: (res: any) => void

  // tslint:disable-next-line: readonly-keyword
  protected reject?: (err: any) => void

  constructor(
    request: LinguaWebcaRequest,
    route: ExpressLikeRoute,
    match: any
  ) {
    this.request = request
    this.route = route
    this.params = match
  }

  public execute(): Promise<LinguaWebcaResponse> {
    const { query } = parseUri(this.request.uri)
    return new Promise(async (ok, fail) => {
      this.resolve = ok
      this.reject = fail
      try {
        await this.route.handler(
          {
            ...this.request,
            params: this.params,
            query
          },
          this
        )
      } catch (e) {
        this.resolve({
          body: e,
          code: 500,
          request: this.request,
          uri: this.request.uri
        })
      }
    })
  }

  public json(body: any): void {
    if (!this.resolve) {
      throw new Error('Response not initialized')
    }

    this.resolve({
      body,
      request: this.request,
      uri: this.request.uri
    })
  }
}

type ExpressLikeHandler = (
  req: ExpressLikeRequest,
  res: ExpressLikeResponse
) => void

interface ExpressLikeRoute {
  readonly method?: LinguaWebcaVerb
  readonly path: string
  readonly route: Route
  readonly handler: ExpressLikeHandler
}

export interface ExpressLikeRequest extends LinguaWebcaRequest {
  readonly params: any
  readonly query?: string
}

export class ExpressLikeStore {
  public readonly client: LinguaWebcaClient
  // tslint:disable-next-line: readonly-keyword readonly-array
  protected readonly routes: ExpressLikeRoute[]

  constructor() {
    this.routes = []
    this.request = this.request.bind(this)
    this.client = SimpleClient.create(this.request)
  }

  public get(path: string, handler: ExpressLikeHandler): void {
    this.route(path, handler, 'GET')
  }

  public put(path: string, handler: ExpressLikeHandler): void {
    this.route(path, handler, 'PUT')
  }

  public patch(path: string, handler: ExpressLikeHandler): void {
    this.route(path, handler, 'PATCH')
  }

  public post(path: string, handler: ExpressLikeHandler): void {
    this.route(path, handler, 'POST')
  }

  public del(path: string, handler: ExpressLikeHandler): void {
    this.route(path, handler, 'DELETE')
  }

  public request(req: LinguaWebcaRequest): Promise<LinguaWebcaResponse> {
    let match: any

    const route = this.routes.find(r => {
      if (r.method !== req.verb) {
        return false
      }

      return !!(match = r.route.match(req.uri))
    })

    if (!route) {
      return Promise.resolve({
        body: `No routes match request: ${req.uri}`,
        code: 404,
        request: req,
        uri: req.uri
      })
    }

    const response = new ExpressLikeResponse(req, route, match)
    return response.execute()
  }

  protected route(
    path: string,
    handler: ExpressLikeHandler,
    method: LinguaWebcaVerb = 'GET'
  ): void {
    this.routes.push({
      handler,
      method,
      path,
      route: new Route(path)
    })
  }
}
