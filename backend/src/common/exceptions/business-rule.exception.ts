import { DomainException } from './domain.exception';

export class BusinessRuleException extends DomainException {
  constructor(message: string, code = 'BUSINESS_RULE_ERROR') {
    super(message, code, 422);
  }
}
