import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  use(req: IRequestPaginateParams, _: Response, next: Function) {
    const {
      limit = 10,
      page = 1,
      search = '',
      order = null,
      sort = null,
    } = req.query;
    req.paginate = { limit, page, search, order, sort };
    next();
  }
}

interface IRequestPaginateParams extends Request {
  paginate?: {
    limit: any;
    page: any;
    search: any;
    order: any;
    sort: any;
  };
}
