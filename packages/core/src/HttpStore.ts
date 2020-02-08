import fetch from 'isomorphic-fetch'
import { LinguaWebcaRequest, LinguaWebcaResponse } from './interfaces'

export async function httpStore(
  request: LinguaWebcaRequest
): Promise<LinguaWebcaResponse> {
  const { uri, verb } = request
  const reqBody = request.body
    ? typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body)
    : undefined
  const res = await fetch(uri, {
    body: reqBody,
    method: verb
  })
  const code = res.status
  const body = await res.json()

  return {
    body,
    code,
    request,
    uri
  }
}

export const HttpStore = {
  store: httpStore
}
