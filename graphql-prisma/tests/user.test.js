import 'cross-fetch/polyfill';
import ApolloBoost, { gql } from 'apollo-boost';
import bcrypt from 'bcryptjs';
import prisma from '../src/prisma';
import server from '../src/server';

let httpServer;

beforeAll(async () => {
  httpServer = await server.start({ port: 4000 });
});

afterAll(async () => {
  await httpServer.close();
});

const client = new ApolloBoost({
  uri: 'http://localhost:4000',
});

beforeEach(async () => {
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();

  const user = await prisma.mutation.createUser({
    data: {
      name: 'Jen',
      email: 'jen@example.com',
      password: bcrypt.hashSync('Red098!@#$', 10),
    },
  });

  await prisma.mutation.createPost({
    data: {
      title: 'My published post',
      body: '',
      published: true,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  await prisma.mutation.createPost({
    data: {
      title: 'My draft post',
      body: '',
      published: false,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });
});

test('Should create a new user', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Andrew"
          email: "andrew@example.com"
          password: "MyPass123"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `;

  const response = await client.mutate({
    mutation: createUser,
  });

  const exists = await prisma.exists.User({
    id: response.data.createUser.user.id,
  });
  expect(exists).toBe(true);
});
