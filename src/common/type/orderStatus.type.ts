export enum OrderStatusType {
  PENDING_PAYMENT = 'pending_payment',
  PENDING = 'pending',
  PREPARING_FOR_SHIPPING = 'preparing_for_shipping',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  REQUIRE_CANCEL = 'require_cancel',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  REQUIRE_REFUND = 'require_refund',
}
