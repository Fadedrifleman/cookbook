import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

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

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException("You cannot follow yourself.");
    }

    // Check if the user to be followed exists
    const userToFollow = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!userToFollow) {
      throw new NotFoundException(`User with ID "${followingId}" not found.`);
    }

    // Check if the follow relationship already exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(`You are already following this user.`);
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { success: true, message: `Successfully followed ${userToFollow.username}.` };
  }

  async unfollowUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException("You cannot unfollow yourself.");
    }

    // Use delete to throw an error if the record doesn't exist
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      return { success: true, message: 'Successfully unfollowed user.' };
    } catch (error) {
      // Prisma throws a specific error code (P2025) for record not found on delete
      if (error.code === 'P2025') {
        throw new NotFoundException("You are not following this user.");
      }
      throw error; // Re-throw other errors
    }
  }

  async getUserProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        // Use _count to efficiently get the number of followers/following
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        recipes: { // Also fetch the user's recipes for their profile
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User "${username}" not found.`);
    }

    return {
      id: user.id,
      username: user.username,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      recipes: user.recipes,
    };
  }
}