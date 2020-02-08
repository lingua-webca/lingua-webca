// tslint:disable: no-if-statement no-expression-statement no-let
import { createGraphAdapter } from '@chaingun/http-adapter'
import { authenticateAccount, graphSigner, unpackNode } from '@chaingun/sear'
import { GunGraphAdapter, GunGraphData } from '@chaingun/types'
import {
  ExpressLikeRequest,
  ExpressLikeResponse,
  ExpressLikeStore,
  LinguaWebcaStore,
  PathPrefixedStore,
  SwitchingStore
} from '@lingua-webca/core'
import { parse as uriParse } from 'uri-js'

type Signer = (graph: GunGraphData) => Promise<GunGraphData>

interface LoggedInAs {
  readonly pub: string
  readonly alias: string
}

export function createSpecificStore(
  adapter: GunGraphAdapter
): LinguaWebcaStore {
  const app = new ExpressLikeStore()

  let signer: Signer | null = null
  let user: LoggedInAs | null = null

  async function genericPut(
    req: ExpressLikeRequest,
    res: ExpressLikeResponse
  ): Promise<void> {
    const graphData = signer ? await signer(req.body) : req.body
    const diff = await adapter.put(graphData)

    res.json(diff)
  }

  async function specificPut(
    req: ExpressLikeRequest,
    res: ExpressLikeResponse
  ): Promise<void> {
    const graphData = {
      [req.params.soul]: req.body
    }
    const data = signer ? await signer(graphData) : graphData
    const diff = await adapter.put(data)
    res.json(diff)
  }

  // tslint:disable-next-line: variable-name
  app.get('/me', async (_req, res) => {
    res.json(user)
  })

  app.post('/login', async (req, res) => {
    const { alias, password } = req.body
    const aliasNode = unpackNode(await adapter.get(`~@${alias}`))

    for (const soul in aliasNode) {
      if (soul === '_') {
        continue
      }

      const ident = unpackNode(await adapter.get(soul))

      try {
        const result = await authenticateAccount(ident, password)

        if (result) {
          signer = graphSigner(result)
          user = { pub: result.pub, alias: result.alias }
          res.json(result)
          return
        }
      } catch (e) {
        // tslint:disable-next-line: no-console
        console.warn(e.stack)
      }
    }

    throw new Error('Login failed')
  })

  // tslint:disable-next-line: variable-name
  app.post('/logout', async (_req, res) => {
    signer = null
    user = null
    res.json({ ok: true })
  })

  app.get('/key/*key/from_node/*soul', async (req, res) => {
    const { key, soul } = req.params
    const node = await adapter.get(decodeURI(soul), { '.': decodeURI(key) })
    res.json(node)
  })

  app.get('/*soul', async (req, res) => {
    const node = await adapter.get(decodeURI(req.params.soul))
    res.json(node)
  })

  app.patch('/', genericPut)
  app.put('/', genericPut)
  app.patch('/*soul', specificPut)
  app.put('/*soul', specificPut)

  return app.request
}

export function createGunStore(): LinguaWebcaStore {
  const storeCache: Record<string, LinguaWebcaStore> = {}

  return SwitchingStore.create(request => {
    const { scheme, host, port } = uriParse(request.uri)

    // tslint:disable-next-line: no-if-statement
    if (scheme !== 'gun') {
      return () =>
        Promise.resolve({
          body: `Invalid gun uri scheme ${scheme}`,
          code: 500,
          request,
          uri: request.uri
        })
    }

    // tslint:disable-next-line: no-if-statement
    if (!host) {
      return () =>
        Promise.resolve({
          body: `Invalid gun uri host ${host}`,
          code: 500,
          request,
          uri: request.uri
        })
    }

    const basePath = `${scheme}://${host}${port ? `:${port}` : ''}`
    let store = storeCache[basePath]

    if (!store) {
      store = PathPrefixedStore.create(
        basePath,
        createSpecificStore(createGraphAdapter(`http://${host}/gun`))
      )

      // tslint:disable-next-line: no-object-mutation
      storeCache[basePath] = store
    }

    return store
  })
}

export const ChainGunLinguaStore = {
  create: createGunStore,
  createSpecific: createSpecificStore
}
