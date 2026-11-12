import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './types';
import { JwtAuthGuard } from '../auth/jwt.guard';

class OrderItemDto {
  @IsString()
  ticketTypeId!: string;

  @IsInt()
  @Min(1)
  qty!: number;
}

class CreateOrderDto {
  @IsString()
  eventId!: string;

  @IsString()
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  market?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('payments/methods')
  methods(@Headers('x-nox-market') market?: string) {
    return { market: market ?? 'MM', methods: this.payments.listMethods(market ?? 'MM') };
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async create(
    @Body() body: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Req() req?: { userId?: string },
  ) {
    const result = await this.payments.createOrder({
      userId: req?.userId as string,
      eventId: body.eventId,
      market: body.market ?? 'MM',
      items: body.items,
      method: body.method,
      idempotencyKey,
    });
    return {
      orderId: result.order.id,
      paymentId: result.payment.id,
      status: result.order.status,
      amount: result.payment.amount,
      currency: result.payment.currency,
      expiresAt: result.payment.expiresAt,
      instruction: result.instruction,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  get(@Param('id') id: string, @Req() req: { userId: string }) {
    return this.payments.getOrder(id, req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  cancel(@Param('id') id: string, @Req() req: { userId: string }) {
    return this.payments.cancel(id, req.userId);
  }
}

@Controller('webhooks/payment')
export class WebhooksController {
  constructor(private readonly payments: PaymentsService) {}

  @Post(':provider')
  async webhook(
    @Param('provider') provider: string,
    @Req() req: { headers: Record<string, string | string[] | undefined>; rawBody?: Buffer; body?: unknown },
  ) {
    const rawBody =
      req.rawBody ??
      Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    const result = await this.payments.handleWebhook({
      provider: provider as never,
      headers: req.headers,
      rawBody,
    });
    return { ok: true, ...result };
  }
}
