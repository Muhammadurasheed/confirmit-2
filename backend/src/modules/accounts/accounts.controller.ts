import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { ResolveAccountDto } from './dto/resolve-account.dto';

class CheckAccountDto {
  account_number: string;
  bank_code?: string;
  business_name?: string;
}

class ReportFraudDto {
  account_number: string;
  category: string;
  description: string;
}

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check account trustworthiness and fraud reports' })
  async checkAccount(@Body() dto: CheckAccountDto) {
    return this.accountsService.checkAccount(
      dto.account_number,
      dto.bank_code,
      dto.business_name,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details by account ID' })
  async getAccount(@Param('id') id: string) {
    return this.accountsService.getAccount(id);
  }

  @Post('report-fraud')
  @ApiOperation({ summary: 'Report fraudulent account activity' })
  async reportFraud(@Body() dto: ReportFraudDto) {
    return this.accountsService.reportFraud(
      dto.account_number,
      dto.category,
      dto.description,
    );
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Resolve account name from account number and bank code using Paystack' })
  async resolveAccount(@Body() dto: ResolveAccountDto) {
    return this.accountsService.resolveAccount(
      dto.accountNumber,
      dto.bankCode,
    );
  }
}
