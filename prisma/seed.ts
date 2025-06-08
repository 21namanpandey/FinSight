import { PrismaClient, Category } from '@prisma/client';
import { subDays, subMonths, format } from 'date-fns';

const prisma = new PrismaClient();

const categories: Category[] = [
  'FOOD_DINING',
  'TRANSPORTATION',
  'SHOPPING',
  'ENTERTAINMENT',
  'BILLS_UTILITIES',
  'HEALTHCARE',
  'TRAVEL',
  'EDUCATION',
  'GROCERIES',
  'RENT',
  'OTHER'
];

const sampleTransactions = [
  { description: 'Grocery shopping at Walmart', category: 'GROCERIES', amount: 85.50 },
  { description: 'Monthly rent payment', category: 'RENT', amount: 1200.00 },
  { description: 'Dinner at Italian restaurant', category: 'FOOD_DINING', amount: 45.75 },
  { description: 'Gas station fill-up', category: 'TRANSPORTATION', amount: 52.30 },
  { description: 'Netflix subscription', category: 'ENTERTAINMENT', amount: 15.99 },
  { description: 'Electricity bill', category: 'BILLS_UTILITIES', amount: 89.45 },
  { description: 'Doctor visit copay', category: 'HEALTHCARE', amount: 25.00 },
  { description: 'Online course purchase', category: 'EDUCATION', amount: 199.99 },
  { description: 'Coffee shop', category: 'FOOD_DINING', amount: 4.50 },
  { description: 'Uber ride', category: 'TRANSPORTATION', amount: 12.75 },
  { description: 'Amazon purchase', category: 'SHOPPING', amount: 67.89 },
  { description: 'Movie tickets', category: 'ENTERTAINMENT', amount: 24.00 },
  { description: 'Pharmacy prescription', category: 'HEALTHCARE', amount: 18.50 },
  { description: 'Internet bill', category: 'BILLS_UTILITIES', amount: 59.99 },
  { description: 'Weekend trip hotel', category: 'TRAVEL', amount: 150.00 },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create transactions for the last 3 months
  const transactions = [];
  const currentDate = new Date();

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = subMonths(currentDate, monthOffset);
    
    // Create 15-20 transactions per month
    const transactionCount = Math.floor(Math.random() * 6) + 15;
    
    for (let i = 0; i < transactionCount; i++) {
      const randomTransaction = sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
      
      // Add some variation to amounts
      const amountVariation = 0.8 + Math.random() * 0.4; // 80% to 120% of original
      const amount = Math.round(randomTransaction.amount * amountVariation * 100) / 100;

      transactions.push({
        description: randomTransaction.description,
        amount,
        date: transactionDate,
        // category: randomTransaction.category,
        category: Category[randomTransaction.category as keyof typeof Category],
      });
    }
  }

  // Insert transactions
  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✅ Created ${transactions.length} transactions`);

  // Create budgets for current month
  const currentMonth = format(currentDate, 'yyyy-MM');
  const budgetData = [
    { category: 'GROCERIES', amount: 400.00 },
    { category: 'RENT', amount: 1200.00 },
    { category: 'FOOD_DINING', amount: 300.00 },
    { category: 'TRANSPORTATION', amount: 200.00 },
    { category: 'ENTERTAINMENT', amount: 150.00 },
    { category: 'BILLS_UTILITIES', amount: 250.00 },
    { category: 'HEALTHCARE', amount: 100.00 },
    { category: 'SHOPPING', amount: 200.00 },
  ];

  for (const budget of budgetData) {
    await prisma.budget.create({
      data: {
        ...budget,
        month: currentMonth,
      },
    });
  }

  console.log(`✅ Created ${budgetData.length} budgets for ${currentMonth}`);

  // Create some budgets for previous month to show historical data
  const previousMonth = format(subMonths(currentDate, 1), 'yyyy-MM');
  for (const budget of budgetData.slice(0, 5)) {
    await prisma.budget.create({
      data: {
        ...budget,
        amount: budget.amount * (0.9 + Math.random() * 0.2), // Slight variation
        month: previousMonth,
      },
    });
  }

  console.log(`✅ Created ${budgetData.slice(0, 5).length} budgets for ${previousMonth}`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });