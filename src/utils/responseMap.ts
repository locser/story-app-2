export class ResponseMap {
  message: string;
  data: any;
  status: number;
  constructor(message: string, data: any, status: number) {
    this.message = message;
    this.data = data;
    this.status = status;
  }
}
