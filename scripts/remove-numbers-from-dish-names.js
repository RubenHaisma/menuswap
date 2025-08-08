const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeNumbersFromDishNames() {
  try {
    console.log('Starting to clean dish names...');
    
    // Get all dishes
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    console.log(`Found ${dishes.length} dishes to process`);
    
    let updatedCount = 0;
    let deletedCount = 0;
    const batchSize = 500; // Process in batches of 500
    const updates = [];
    
    for (const dish of dishes) {
      // Remove numbers, "Uitverkocht op voorraad", and € signs
      let cleanedName = dish.name
        .replace(/\d+/g, '') // Remove all numbers
        .replace(/Uitverkocht op voorraad/gi, '') // Remove "Uitverkocht op voorraad" (case insensitive)
        .replace(/€/g, '') // Remove € signs
        .trim();
      
      // Remove extra spaces that might be left after cleaning
      const finalName = cleanedName.replace(/\s+/g, ' ').trim();
      
      // Only update if the name actually changed and is not empty
      if (finalName !== dish.name && finalName.length > 0) {
        updates.push({
          id: dish.id,
          name: finalName,
          originalName: dish.name
        });
      } else if (finalName.length === 0) {
        console.log(`Deleting: "${dish.name}" (would result in empty name)`);
        // Delete the dish instead of skipping
        await prisma.dish.delete({
          where: { id: dish.id }
        });
        deletedCount++;
      } else {
        // No change needed
      }
      
      // Process in batches
      if (updates.length >= batchSize) {
        await processBatch(updates);
        updatedCount += updates.length;
        updates.length = 0; // Clear the array
      }
    }
    
    // Process remaining updates
    if (updates.length > 0) {
      await processBatch(updates);
      updatedCount += updates.length;
    }
    
    console.log(`\nSummary:`);
    console.log(`- Updated: ${updatedCount} dishes`);
    console.log(`- Deleted: ${deletedCount} dishes (empty after cleaning)`);
    console.log(`- Total processed: ${dishes.length} dishes`);
    
  } catch (error) {
    console.error('Error cleaning dish names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function processBatch(updates) {
  console.log(`Processing batch of ${updates.length} updates...`);
  
  // Use Promise.all for concurrent updates
  await Promise.all(
    updates.map(async (update) => {
      await prisma.dish.update({
        where: { id: update.id },
        data: { name: update.name }
      });
      console.log(`Updated: "${update.originalName}" -> "${update.name}"`);
    })
  );
}

// Run the script
removeNumbersFromDishNames();
