const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 路径配置
const imagesDir = path.join(__dirname, 'public/images');
const thumbnailDir = path.join(__dirname, 'public/images/thumbnail');
const dataFile = path.join(__dirname, 'src/data/userCategories.json');

// 确保缩略图目录存在
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

// 生成缩略图函数
const generateThumbnail = async (imagePath, filename) => {
  try {
    const thumbnailPath = path.join(thumbnailDir, filename);
    
    // 检查缩略图是否已存在
    if (fs.existsSync(thumbnailPath)) {
      console.log(`缩略图已存在，跳过: ${filename}`);
      return `/images/thumbnail/${filename}`;
    }
    
    await sharp(imagePath)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        progressive: true 
      })
      .toFile(thumbnailPath);
    
    console.log(`缩略图生成成功: ${filename}`);
    return `/images/thumbnail/${filename}`;
  } catch (error) {
    console.error(`生成缩略图失败 ${filename}:`, error);
    return null;
  }
};

// 更新userCategories.json中的thumbnailUrl
const updateThumbnailUrls = async () => {
  try {
    // 读取数据文件
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    let updated = false;
    
    // 遍历所有分类和照片
    for (const category of data.categories) {
      for (const photo of category.photos) {
        // 获取图片文件名
        const filename = path.basename(photo.url);
        const imagePath = path.join(imagesDir, filename);
        
        // 检查原图是否存在
        if (fs.existsSync(imagePath)) {
          // 生成缩略图
          const thumbnailUrl = await generateThumbnail(imagePath, filename);
          
          if (thumbnailUrl && photo.thumbnailUrl !== thumbnailUrl) {
            photo.thumbnailUrl = thumbnailUrl;
            updated = true;
            console.log(`更新缩略图URL: ${photo.title} -> ${thumbnailUrl}`);
          }
        } else {
          console.warn(`原图不存在: ${imagePath}`);
        }
      }
    }
    
    // 如果有更新，保存文件
    if (updated) {
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
      console.log('userCategories.json 更新完成');
    } else {
      console.log('没有需要更新的内容');
    }
    
  } catch (error) {
    console.error('更新缩略图URL失败:', error);
  }
};

// 主函数
const main = async () => {
  console.log('开始为现有图片生成缩略图...');
  
  try {
    // 获取images目录下的所有图片文件
    const files = fs.readdirSync(imagesDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    console.log(`找到 ${files.length} 个图片文件`);
    
    // 为每个图片生成缩略图
    for (const filename of files) {
      const imagePath = path.join(imagesDir, filename);
      await generateThumbnail(imagePath, filename);
    }
    
    // 更新数据文件中的thumbnailUrl
    await updateThumbnailUrls();
    
    console.log('所有缩略图生成完成！');
  } catch (error) {
    console.error('生成缩略图过程中出错:', error);
  }
};

// 运行脚本
main();
