import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  CoreFolioLayoutCreateHeaderDto,
  CoreFolioLayoutDetailRowDto,
} from '../../domain/helpers/dto/core.folio-layout.dto';
import {
  CoreFolioLayoutDetail,
  CoreFolioLayoutDetailDocument,
} from '../database/core.folio-layout-detail.schema';
import {
  CoreFolioLayout,
  CoreFolioLayoutDocument,
} from '../database/core.folio-layout.schema';

@Injectable()
export class CoreFolioLayoutRepository {
  constructor(
    @InjectModel(CoreFolioLayout.name)
    private readonly coreLayoutModel: ModelExt<CoreFolioLayoutDocument>,
    @InjectModel(CoreFolioLayoutDetail.name)
    private readonly coreLayoutDetailModel: ModelExt<CoreFolioLayoutDetailDocument>,
  ) {}

  async paginateAll(usuario: string, paginate: IPaginateParams): Promise<any> {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any[] = [
      {
        $match: {
          usuario: new Types.ObjectId(usuario),
        },
      },
    ];

    if (paginate.order && paginate.sort)
      options.sort = {
        [paginate.order]: paginate.sort,
      };

    const agregate = this.coreLayoutModel.aggregate(agregateData, {
      collation: { locale: 'en' },
    });

    return await this.coreLayoutModel.aggregatePaginate(agregate, options);
  }

  async getCountByUser(usuario: string): Promise<number> {
    return await this.coreLayoutModel
      .countDocuments({ usuario: new Types.ObjectId(usuario) })
      .exec();
  }

  async createLayoutHeader(
    layoutHeader: CoreFolioLayoutCreateHeaderDto,
  ): Promise<CoreFolioLayout> {
    const header = new this.coreLayoutModel(layoutHeader);
    return await header.save();
  }

  async createLayoutRow(layoutRows: CoreFolioLayoutDetailRowDto[]) {
    return await this.coreLayoutDetailModel.insertMany(layoutRows);
  }

  async findHeader(header: string): Promise<CoreFolioLayout> {
    return await this.coreLayoutModel
      .findById(new Types.ObjectId(header))
      .lean();
  }

  async findDetailsByHeader(
    header: Types.ObjectId,
    paginateParams: IPaginateParams,
  ) {
    let query: any = {
      header,
      success: false,
    };

    if (paginateParams.search !== '') {
      query.message = {
        $regex: new RegExp(paginateParams.search),
        $options: 'i',
      };
    }

    let options: any = {
      limit: paginateParams.limit,
      page: paginateParams.page,
      select: '-id -header -block',
    };

    if (paginateParams.order && paginateParams.sort)
      options.sort = {
        [paginateParams.order]: paginateParams.sort,
      };

    return await this.coreLayoutDetailModel.paginate(query, options);
  }

  async updateLayoutHeader(
    id: string,
    correcto: boolean,
  ): Promise<CoreFolioLayout> {
    return await this.coreLayoutModel
      .findByIdAndUpdate(
        id,
        {
          fechaFinCarga: Date.now(),
          correcto,
          procesado: true,
        },
        { new: true },
      )
      .exec();
  }
}
