import { BUSINESS_ERROR_CODE } from './business.error.codes';
import { HttpException, HttpStatus } from '@nestjs/common';

type BussinessError = {
  code: number;
  message: string;
};

export class BusinessException extends HttpException {
  constructor(err: BussinessError | string) {
    if (typeof err == 'string') {
      err = {
        code: BUSINESS_ERROR_CODE.COMMON,
        message: err,
      };
    }
    super(err, HttpStatus.OK);
  }

  static throwForbidden() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
      message: '抱歉哦，您无此权限！',
    });
  }
}
