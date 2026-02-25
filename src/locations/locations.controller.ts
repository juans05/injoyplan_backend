import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Locations')
@Controller('locations')
@Public()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Listar departamentos' })
  getDepartments() {
    return this.locationsService.getDepartments();
  }

  @Get('provinces/:department')
  @ApiOperation({ summary: 'Listar provincias por departamento' })
  getProvinces(@Param('department') department: string) {
    return this.locationsService.getProvinces(department);
  }

  @Get('districts/:department/:province')
  @ApiOperation({ summary: 'Listar distritos por departamento y provincia' })
  getDistricts(
    @Param('department') department: string,
    @Param('province') province: string,
  ) {
    return this.locationsService.getDistricts(department, province);
  }
}
