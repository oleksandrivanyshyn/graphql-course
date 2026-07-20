import { Prisma } from 'prisma-binding';
import path from 'path';

const prisma = new Prisma({
  typeDefs: path.join(__dirname, 'generated/prisma.graphql'),
  endpoint: 'http://localhost:4466',
});

/ prisma.query prisma.mutation prisma.subscription prisma.exists

const createPostForUser = async (authorId, data) => {
  const post = await prisma.mutation.createPost({
    data: {
      ...data,
      author: {
        connect: {
          id: authorId
        }
      }
    }
  }, '{ id }')
  const user = await prisma.query.user({
    where: {
      id: authorId
    }
  }, '{ id name email posts { id title published } }')
  return user
}

// createPostForUser('cjjucl3yu004x0822dq5tipuz', {
//     title: 'Great books to read',
//     body: 'The War of Art',
//     published: true
// }).then((user) => {
//     console.log(JSON.stringify(user, undefined, 2))
// })

const updatePostForUser = async (postId, data) => {
  const post = await prisma.mutation.updatePost({
    where: {
      id: postId
    },
    data
  }, '{ author { id } }')
  const user = await prisma.query.user({
    where: {
      id: post.author.id
    }
  }, '{ id name email posts { id title published } }')
  return user
}

// updatePostForUser("cjjzwjkez009p0822fbvn6lui", { published: false }).then((user) => {
//     console.log(JSON.stringify(user, undefined, 2))
// })