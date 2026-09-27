import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './types';

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

  @Post('orders')
  async create(
    @Body() body: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) throw new UnauthorizedException('Missing user');
    const result = await this.payments.createOrder({
      userId,
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

  @Get('orders/:id')
  get(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing user');
    const order = this.payments.getOrder(id, userId);
    return order;
  }

  @Post('orders/:id/cancel')
  cancel(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing user');
    return this.payments.cancel(id, userId);
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
