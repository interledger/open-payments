import { HttpMethod } from '@interledger/openapi'
import { RouteDeps, UnauthenticatedResourceRequestArgs } from '.'
import { getRSPath, ILPStreamConnection } from '../types'
import { get } from './requests'

export interface ILPStreamConnectionRoutes {
  get(args: UnauthenticatedResourceRequestArgs): Promise<ILPStreamConnection>
}

export const createILPStreamConnectionRoutes = (
  deps: RouteDeps
): ILPStreamConnectionRoutes => {
  const { axiosInstance, openApi, logger } = deps

  const getILPStreamConnectionValidator =
    openApi.createResponseValidator<ILPStreamConnection>({
      path: getRSPath('/connections/{id}'),
      method: HttpMethod.GET
    })

  return {
    get: (args: UnauthenticatedResourceRequestArgs) =>
      get({ axiosInstance, logger }, args, getILPStreamConnectionValidator)
  }
}
