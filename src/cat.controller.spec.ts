import { Test, TestingModule } from '@nestjs/testing';
import { CatController } from './cat.controller';

describe('AppController', () => {
  let catController: CatController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CatController],
      providers: [],
    }).compile();

    catController = app.get<CatController>(CatController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(catController.getHello()).toBe('Hello World!');
    });
  });
});
