// tslint:disable: no-class no-expression-statement no-this no-object-mutation
import {
  // tslint:disable-next-line: ordered-imports
  LinguaWebcaStore,
  LinguaWebcaRequest,
  LinguaWebcaResponse
} from './interfaces'
import { createFromMapping } from './SwitchingStore'

export class UniversalStore {
  // tslint:disable-next-line: readonly-keyword
  protected storeMap: ReadonlyArray<
    readonly [string | RegExp, LinguaWebcaStore]
  >
  // tslint:disable-next-line: readonly-keyword
  protected store: LinguaWebcaStore

  constructor() {
    this.request = this.request.bind(this)
    this.storeMap = []
    this.store = createFromMapping(this.storeMap)
  }

  public reset(): void {
    this.storeMap = []
    this.store = createFromMapping(this.storeMap)
  }

  public use(prefix: string, store: LinguaWebcaStore): void {
    this.storeMap = [...this.storeMap, [prefix, store]]
    this.store = createFromMapping(this.storeMap)
  }

  public request(req: LinguaWebcaRequest): Promise<LinguaWebcaResponse> {
    return this.store(req)
  }
}
