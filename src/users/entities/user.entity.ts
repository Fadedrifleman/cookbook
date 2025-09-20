import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  id: string;

  @Field({ description: "User's email address" })
  email: string;

  @Field({ description: 'Unique username for the user' })
  username: string;

  // We explicitly DO NOT expose the password field in our GraphQL schema.
}