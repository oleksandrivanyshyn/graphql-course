import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/prisma';

const userOne = {
  input: {
    name: 'Jen',
    email: 'jen@example.com',
    password: 'Red098!@#$',
  },
  user: undefined,
  jwt: undefined,
};

const postOne = {
  input: {
    title: 'My published post',
    body: '',
    published: true,
  },
  post: undefined,
};

const postTwo = {
  input: {
    title: 'My draft post',
    body: '',
    published: false,
  },
  post: undefined,
};

const seedDatabase = async () => {
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();

  const hashedPassword = bcrypt.hashSync(userOne.input.password, 10);

  userOne.user = await prisma.mutation.createUser({
    data: {
      ...userOne.input,
      password: hashedPassword,
    },
  });

  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

  postOne.post = await prisma.mutation.createPost({
    data: {
      ...postOne.input,
      author: {
        connect: {
          id: userOne.user.id,
        },
      },
    },
  });

  postTwo.post = await prisma.mutation.createPost({
    data: {
      ...postTwo.input,
      author: {
        connect: {
          id: userOne.user.id,
        },
      },
    },
  });
};

export { seedDatabase as default, userOne, postOne, postTwo };
