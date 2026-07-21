import 'cross-fetch/polyfill';
import ApolloBoost, { gql } from 'apollo-boost';
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

  try {
    const response = await client.mutate({
      mutation: createUser,
    });

    const exists = await prisma.exists.User({
      id: response.data.createUser.user.id,
    });
    expect(exists).toBe(true);
  } catch (e) {
    console.dir(e, { depth: null });
    throw e;
  }
});
