import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Listar banners activos' })
  getActiveBanners() {
    return this.bannersService.getActiveBanners();
  }
}
