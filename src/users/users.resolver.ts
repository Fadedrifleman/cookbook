import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from '../auth/dto/login.input';
import { LoginResponse } from '../auth/dto/login.response';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => User, { name: 'register' })
  async registerUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    const user = await this.usersService.create(createUserInput);
    // Exclude password from the response
    const { password, ...result } = user;
    return result;
  }

  @Mutation(() => LoginResponse, { name: 'login' })
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.username,
      loginInput.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard) // This protects the endpoint
  async getProfile(@CurrentUser() user: { id: string, username: string }) {
    // The `user` object is the payload from our JWT, thanks to the decorator.
    const userFromDb = await this.usersService.findOneById(user.id);
    const { password, ...result } = userFromDb;
    return result;
  }
}