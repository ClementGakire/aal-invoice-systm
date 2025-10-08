#!/usr/bin/env node

/**
 * Utility script to hash passwords for users in the database
 * Usage: node scripts/hash-passwords.js
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORDS = {
  'musoni@aal.rw': 'musoni123',
  'tito@aal.rw': 'tito123',
  'jimmy@aal.rw': 'jimmy123',
  'steven@aal.rw': 'steven123',
  'shamuso@aal.rw': 'shamuso123',
  'danny.sales@aal.rw': 'danny123',
  'test@example.com': 'test123',
};

async function hashPasswords() {
  console.log('🔐 Starting password hashing process...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: Object.keys(DEFAULT_PASSWORDS)
        }
      }
    });

    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      const plainPassword = DEFAULT_PASSWORDS[user.email];
      
      if (!plainPassword) {
        console.log(`⚠️  No default password found for ${user.email}, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      console.log(`✅ Updated password for ${user.email}`);
    }

    console.log('🎉 Password hashing completed successfully!');
  } catch (error) {
    console.error('❌ Error hashing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
hashPasswords();