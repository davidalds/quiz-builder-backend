import { Request } from 'express'

export type ReqType = Request & { user: { id: number } }
