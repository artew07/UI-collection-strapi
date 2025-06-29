const fs = require('fs');
const path = require('path');

async function migrateData() {
  console.log('🚀 Starting migration from app-thumbnail to application...');
  
  try {
    // 1. Получаем все записи из старого Content Type
    const oldApps = await strapi.entityService.findMany('api::app-thumbnail.app-thumbnail', {
      populate: ['image', 'logo', 'screenshots', 'categories']
    });
    
    console.log(`📊 Found ${oldApps.length} app-thumbnails to migrate`);
    
    // 2. Мигрируем каждую запись
    for (const oldApp of oldApps) {
      const newAppData = {
        title: oldApp.name || 'Untitled App',
        description: oldApp.description || '',
        release_date: oldApp.published_date || null,
        preview_images: oldApp.image || [],
        app_logo: oldApp.logo || null,
        app_screenshots: oldApp.screenshots || [],
        categories: oldApp.categories || [],
        platform: 'web', // По умолчанию
        status: 'published',
        featured: false,
        publishedAt: oldApp.publishedAt || new Date()
      };
      
      // 3. Создаем новую запись
      const newApp = await strapi.entityService.create('api::application.application', {
        data: newAppData,
        populate: ['preview_images', 'app_logo', 'app_screenshots', 'categories']
      });
      
      console.log(`✅ Migrated: ${oldApp.name} → ${newApp.title} (ID: ${newApp.id})`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // 4. Создаем бэкап старых данных
    const backupData = {
      timestamp: new Date().toISOString(),
      migratedCount: oldApps.length,
      oldData: oldApps
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../migration-backup.json'),
      JSON.stringify(backupData, null, 2)
    );
    
    console.log('📦 Backup created: migration-backup.json');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Экспортируем функцию для использования в Strapi
module.exports = { migrateData };

// Если запускается напрямую
if (require.main === module) {
  console.log('⚠️  Run this script through Strapi CLI:');
  console.log('npm run strapi script migrate-to-applications.js');
} 