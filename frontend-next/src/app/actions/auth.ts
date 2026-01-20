'use server';

import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function verifyCredentials(identifier: unknown, password: unknown) {
  if (typeof identifier !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid credentials');
  }

  const trimmedIdentifier = identifier.trim();
  if (!trimmedIdentifier) {
    throw new Error('Invalid credentials');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: trimmedIdentifier.toLowerCase() },
        { username: trimmedIdentifier },
      ],
    },
  });

  if (!user) {
    throw new Error('Invalid identifier or password');
  }

  const isValid = await compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid identifier or password');
  }

  return { id: String(user.id), username: user.username, email: user.email };
}
