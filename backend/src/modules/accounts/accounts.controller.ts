import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check account trustworthiness' })
  async checkAccount(@Body() body: { accountNumber: string; bankCode?: string }) {
    return this.accountsService.checkAccount(body.accountNumber, body.bankCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details' })
  async getAccount(@Param('id') id: string) {
    return this.accountsService.getAccount(id);
  }
}
