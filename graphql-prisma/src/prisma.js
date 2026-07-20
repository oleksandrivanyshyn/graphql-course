import { Prisma } from 'prisma-binding';
import path from 'path';

const prisma = new Prisma({
  typeDefs: path.join(__dirname, 'generated/prisma.graphql'),
  endpoint: 'http://localhost:4466',
});

// prisma.query prisma.mutation prisma.subscription prisma.exists

prisma.query.users(null, '{ id name posts { id title } }').then((data) => {
  console.log(JSON.stringify(data, undefined, 2));
});

prisma.query.comments(null, '{ id text author { id name } }').then((data) => {
  console.log(JSON.stringify(data, undefined, 2));
});
