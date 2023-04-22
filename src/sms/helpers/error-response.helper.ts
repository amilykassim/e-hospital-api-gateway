export class ErrorResponse {
  readonly statusCode: number;
  error: string;

  constructor(error, statusCode?) {
    this.statusCode = (statusCode) ? statusCode : 400;
    this.error = error;
  }
}