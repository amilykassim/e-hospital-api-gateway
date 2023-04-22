import { Controller, Get } from '@nestjs/common';

@Controller()
export class CatController {
  constructor() { }

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
