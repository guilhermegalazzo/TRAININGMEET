import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../../.env' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Clean database (optional, but good for idempotent seeds)
    // await db.delete(schema.users); 

    // 2. Seed Users
    const userIds = Array.from({ length: 10 }).map(() => uuidv4());
    const users: schema.NewUser[] = userIds.map((id, i) => ({
        id,
        clerkId: `user_${i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        username: `user_${i}`,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    }));

    console.log('Inserting users...');
    await db.insert(schema.users).values(users);

    // 3. Seed Events
    const events: schema.NewEvent[] = [];

    // 5 Public Events
    for (let i = 0; i < 5; i++) {
        events.push({
            creatorId: userIds[i % userIds.length],
            title: `Public Training ${i}`,
            description: `Description for public training ${i}`,
            latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
            startTime: new Date(Date.now() + i * 86400000),
            visibility: 'PUBLIC',
            approvalMode: 'AUTO',
            locationName: 'Ibirapuera Park',
        });
    }

    // 10 Private Events
    for (let i = 0; i < 10; i++) {
        events.push({
            creatorId: userIds[(i + 5) % userIds.length],
            title: `Private Training ${i}`,
            description: `Secret training session ${i}`,
            latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
            startTime: new Date(Date.now() + (i + 5) * 86400000),
            visibility: 'PRIVATE',
            approvalMode: 'MANUAL',
            locationName: 'Private Gym',
        });
    }

    // 15 Other Events (some recurring)
    for (let i = 0; i < 15; i++) {
        const isRecurring = i % 3 === 0;
        events.push({
            creatorId: userIds[(i + 15) % userIds.length],
            title: `Training ${i + 15}`,
            description: `Training session ${i + 15}`,
            latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
            startTime: new Date(Date.now() + (i + 15) * 86400000),
            visibility: i % 2 === 0 ? 'PUBLIC' : 'FRIENDS',
            approvalMode: i % 4 === 0 ? 'MANUAL' : 'AUTO',
            recurrenceRule: isRecurring ? 'FREQ=WEEKLY;BYDAY=MO,WE,FR' : null,
            locationName: 'City Center',
        });
    }

    console.log('Inserting events...');
    await db.insert(schema.events).values(events);

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:');
    console.error(err);
    process.exit(1);
});
