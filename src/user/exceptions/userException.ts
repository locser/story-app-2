import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('Không tìm thấy người dùng này!', HttpStatus.NOT_FOUND);
  }
}

export class UserAlreadyExists extends HttpException {
  constructor() {
    super('Người dùng này đã tồn tại!', HttpStatus.CONFLICT);
  }
}
//FIXME: http status
export class UserNotUpdatePositionException extends HttpException {
  constructor() {
    super(
      `Hãy cập nhật đầy đủ vị trí của bạn để tìm kiếm dễ dàng`,
      HttpStatus.CONFLICT,
    );
  }
}
export class CreateIndexUserError extends HttpException {
  constructor() {
    super(`Lưu người dùng Elastic lỗi!`, HttpStatus.CONFLICT);
  }
}
