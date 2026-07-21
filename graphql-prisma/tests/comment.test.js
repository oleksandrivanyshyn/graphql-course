import 'cross-fetch/polyfill';
import seedDatabase, {
  userOne,
  commentOne,
  commentTwo,
  postOne,
  postTwo,
} from './utils/seedDatabase';
import getClient from './utils/getClient';
import prisma from '../src/prisma';
import {
  deleteComment,
  deletePost,
  subscribeToComments,
  subscribeToPosts,
} from './utils/operations';
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

test('Should delete own comment', async () => {
  const authenticatedClient = getClient(userOne.jwt);
  const variables = {
    id: commentTwo.comment.id,
  };
  await authenticatedClient.mutate({ mutation: deleteComment, variables });
  const exists = await prisma.exists.Comment({ id: commentTwo.comment.id });

  expect(exists).toBe(false);
});

test('Should not delete other users comment', async () => {
  const authenticatedClient = getClient(userOne.jwt);
  const variables = {
    id: commentOne.comment.id,
  };

  await expect(
    authenticatedClient.mutate({ mutation: deleteComment, variables }),
  ).rejects.toThrow();
});

test('Should subscribe to comments for a post', async (done) => {
  const variables = {
    postId: postOne.post.id,
  };

  client.subscribe({ query: subscribeToComments, variables }).subscribe({
    next(response) {
      expect(response.data.comment.mutation).toBe('DELETED');
      done();
    },
  });

  setTimeout(async () => {
    const authenticatedClient = getClient(userOne.jwt);
    await authenticatedClient.mutate({
      mutation: deleteComment,
      variables: { id: commentTwo.comment.id },
    });
  }, 500);
}, 10000);

test('Should subscribe to changes for published posts', async (done) => {
  client.subscribe({ query: subscribeToPosts }).subscribe({
    next(response) {
      expect(response.data.post.mutation).toBe('DELETED');
      done();
    },
  });

  setTimeout(async () => {
    const authenticatedClient = getClient(userOne.jwt);
    await authenticatedClient.mutate({
      mutation: deletePost,
      variables: { id: postOne.post.id },
    });
  }, 500);
}, 10000);
