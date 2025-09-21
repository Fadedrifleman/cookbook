import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { SearchModule } from './search/search.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { CommentsModule } from './comments/comments.module';
import { DateTimeResolver } from 'graphql-scalars';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      // Add the context back in, which is vital for the GqlAuthGuard to work.
      // It passes the request object from the HTTP layer to the GraphQL execution context.
      context: ({ req }) => ({ req }),
      subscriptions: {
        'graphql-ws': true, // Enable the modern 'graphql-ws' protocol
        'subscriptions-transport-ws': false, // Disable the older, deprecated protocol
      },
      // This explicitly provides our custom scalar resolver.
      resolvers: { DateTime: DateTimeResolver },
      // This option tells the schema builder: "Do NOT automatically create
      // a scalar for any `Date` types you find. I will handle it."
      buildSchemaOptions: {
        dateScalarMode: 'timestamp', // or 'isoDate', but this prevents the default scalar
        noDuplicatedFields: false, // Good practice to have
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RecipesModule,
    SearchModule,
    PubSubModule,
    CommentsModule,
    AiModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver
  ],
})
export class AppModule { }