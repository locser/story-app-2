import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';

// full thuộc tín của socket, thêm thuộc tính user
export interface AuthenticatedSocket extends Socket {
  user?: User;
}
