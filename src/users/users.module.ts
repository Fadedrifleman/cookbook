import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)], // Import AuthModule for dependency injection
  providers: [UsersResolver, UsersService],
  exports: [UsersService], // Export UsersService for AuthModule to use
})
export class UsersModule {}