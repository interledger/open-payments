interface ErrorDetails {
  description: string
  status?: number
  validationErrors?: string[]
}

export class OpenPaymentsClientError extends Error {
  public description: string
  public validationErrors?: string[]
  public status?: number

  constructor(message: string, args: ErrorDetails) {
    super(message)
    this.name = 'OpenPaymentsClientError'
    this.description = args.description
    this.status = args.status
    this.validationErrors = args.validationErrors
  }
}
