import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserObject = createParamDecorator(
  (data, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;
  },
);
