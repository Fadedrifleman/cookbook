import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput): Promise<UserModel> {
    const { email, username, password } = createUserInput;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException('Username or email is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
  }

  async findOneByUsername(username: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findOneById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}