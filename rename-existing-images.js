const fs = require('fs');
const path = require('path');

// 路径配置
const imagesDir = path.join(__dirname, 'public/images');
const thumbnailDir = path.join(__dirname, 'public/images/thumbnail');
const dataFile = path.join(__dirname, 'src/data/userCategories.json');

// 生成安全的文件名
const generateSafeFilename = (title, timestamp, extension) => {
  // 移除或替换不安全的字符
  const safeTitle = title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 移除Windows不允许的字符
    .replace(/[()（）]/g, '') // 移除括号
    .replace(/\s+/g, '_') // 空格替换为下划线
    .replace(/_+/g, '_') // 多个下划线合并为一个
    .replace(/^_|_$/g, '') // 移除开头和结尾的下划线
    .substring(0, 50); // 限制长度
  
  return `${safeTitle}_${timestamp}${extension}`;
};

// 检查文件名是否会冲突，如果冲突则添加序号
const ensureUniqueFilename = (baseName, existingFiles, extension) => {
  let counter = 1;
  let finalName = baseName;
  
  while (existingFiles.has(finalName + extension)) {
    finalName = `${baseName}_${counter}`;
    counter++;
  }
  
  return finalName + extension;
};

// 重命名现有图片的主函数
const renameExistingImages = async () => {
  try {
    console.log('开始重命名现有图片...');
    
    // 读取数据文件
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    let updated = false;
    let renamedCount = 0;
    const usedFilenames = new Set(); // 跟踪已使用的文件名
    
    // 遍历所有分类和照片
    for (const category of data.categories) {
      console.log(`\n处理分类: ${category.name}`);
      
      for (const photo of category.photos) {
        const currentFilename = path.basename(photo.url);
        const currentPath = path.join(imagesDir, currentFilename);
        
        // 检查原图是否存在
        if (!fs.existsSync(currentPath)) {
          console.warn(`原图不存在，跳过: ${currentPath}`);
          continue;
        }
        
        // 检查是否已经是正确的命名格式（包含下划线和时间戳）
        const isAlreadyRenamed = currentFilename.includes('_') && 
                                /\d{13}/.test(currentFilename); // 包含13位时间戳
        
        if (isAlreadyRenamed) {
          console.log(`已是正确格式，跳过: ${currentFilename}`);
          usedFilenames.add(currentFilename); // 添加到已使用列表
          continue;
        }
        
        // 生成新的文件名
        const ext = path.extname(currentFilename);
        const timestamp = photo.uploadedAt ? new Date(photo.uploadedAt).getTime() : Date.now();
        const baseNewName = generateSafeFilename(photo.title, timestamp, '').replace(/_$/, ''); // 移除末尾下划线
        const newFilename = ensureUniqueFilename(baseNewName, usedFilenames, ext);
        const newPath = path.join(imagesDir, newFilename);
        
        usedFilenames.add(newFilename); // 添加到已使用列表
        
        try {
          // 重命名原图
          fs.renameSync(currentPath, newPath);
          console.log(`✓ 重命名原图: ${currentFilename} -> ${newFilename}`);
          
          // 重命名缩略图（如果存在）
          const currentThumbnailPath = path.join(thumbnailDir, currentFilename);
          const newThumbnailPath = path.join(thumbnailDir, newFilename);
          
          if (fs.existsSync(currentThumbnailPath)) {
            fs.renameSync(currentThumbnailPath, newThumbnailPath);
            console.log(`✓ 重命名缩略图: ${currentFilename} -> ${newFilename}`);
          }
          
          // 更新数据文件中的URL
          photo.url = `/images/${newFilename}`;
          if (photo.thumbnailUrl) {
            photo.thumbnailUrl = `/images/thumbnail/${newFilename}`;
          }
          
          updated = true;
          renamedCount++;
          
        } catch (error) {
          console.error(`✗ 重命名失败 ${currentFilename}:`, error.message);
        }
      }
    }
    
    // 如果有更新，保存数据文件
    if (updated) {
    //   // 备份原文件
    //   const backupFile = dataFile.replace('.json', '_backup_' + Date.now() + '.json');
    //   fs.copyFileSync(dataFile, backupFile);
    //   console.log(`\n✓ 创建备份文件: ${path.basename(backupFile)}`);
      
      // 保存更新后的数据
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
      console.log('✓ userCategories.json 更新完成');
    }
    
    console.log(`\n重命名完成！`);
    console.log(`- 总共重命名了 ${renamedCount} 个文件`);
    console.log(`- ${updated ? '数据文件已更新' : '无需更新数据文件'}`);
    
  } catch (error) {
    console.error('重命名过程中出错:', error);
  }
};

// 预览模式：只显示将要重命名的文件，不实际执行
const previewRename = () => {
  try {
    console.log('=== 预览模式：将要重命名的文件 ===\n');
    
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    let previewCount = 0;
    const usedFilenames = new Set(); // 跟踪已使用的文件名
    
    for (const category of data.categories) {
      console.log(`分类: ${category.name}`);
      
      for (const photo of category.photos) {
        const currentFilename = path.basename(photo.url);
        const currentPath = path.join(imagesDir, currentFilename);
        
        if (!fs.existsSync(currentPath)) {
          continue;
        }
        
        const isAlreadyRenamed = currentFilename.includes('_') && 
                                /\d{13}/.test(currentFilename);
        
        if (isAlreadyRenamed) {
          usedFilenames.add(currentFilename);
        } else {
          const ext = path.extname(currentFilename);
          const timestamp = photo.uploadedAt ? new Date(photo.uploadedAt).getTime() : Date.now();
          const baseNewName = generateSafeFilename(photo.title, timestamp, '').replace(/_$/, '');
          const newFilename = ensureUniqueFilename(baseNewName, usedFilenames, ext);
          
          usedFilenames.add(newFilename);
          console.log(`  ${currentFilename} -> ${newFilename}`);
          previewCount++;
        }
      }
    }
    
    console.log(`\n将要重命名 ${previewCount} 个文件`);
    console.log('\n运行 "node rename-existing-images.js --execute" 来执行重命名');
    
  } catch (error) {
    console.error('预览失败:', error);
  }
};

// 主程序
const main = () => {
  const args = process.argv.slice(2);
  const shouldExecute = args.includes('--execute') || args.includes('-e');
  
  if (shouldExecute) {
    console.log('🚀 执行模式：开始重命名文件\n');
    renameExistingImages();
  } else {
    previewRename();
  }
};

// 运行脚本
main();
