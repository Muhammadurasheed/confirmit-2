import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('register')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new business' })
  async registerBusiness(@Body() body: any) {
    return this.businessService.registerBusiness(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business profile' })
  async getBusiness(@Param('id') id: string) {
    return this.businessService.getBusiness(id);
  }

  @Post('api-keys/generate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate API key for business' })
  async generateApiKey(@Body() body: { businessId: string }) {
    return this.businessService.generateApiKey(body.businessId);
  }

  @Get('stats/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business analytics' })
  async getBusinessStats(@Param('id') id: string) {
    return this.businessService.getBusinessStats(id);
  }
}
