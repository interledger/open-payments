interface ErrorDetails {
  description: string
  status?: number
  code?: string
  validationErrors?: string[]
}

export class OpenPaymentsClientError extends Error {
  public description: string
  public validationErrors?: string[]
  public status?: number
  public code?: string

  constructor(message: string, args: ErrorDetails) {
    super(message)
    this.name = 'OpenPaymentsClientError'
    this.description = args.description
    this.status = args.status
    this.code = args.code
    this.validationErrors = args.validationErrors
  }
}
