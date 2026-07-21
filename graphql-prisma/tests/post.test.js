import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import seedDatabase from './utils/seedDatabase';
import getClient from './utils/getClient';
import server from '../src/server';

let httpServer;

beforeAll(async () => {
  httpServer = await server.start({ port: 4000 });
});

afterAll(async () => {
  await httpServer.close();
});

const client = getClient();

beforeEach(seedDatabase);

test('Should expose published posts', async () => {
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `;
  const response = await client.query({ query: getPosts });

  expect(response.data.posts.length).toBe(1);
  expect(response.data.posts[0].published).toBe(true);
});
