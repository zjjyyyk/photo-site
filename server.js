const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '200mb' })); // 增加JSON请求体限制
app.use(express.urlencoded({ extended: true, limit: '200mb' })); // 增加URL编码限制
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images/thumbnail', express.static(path.join(__dirname, 'public/images/thumbnail')));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'public/images');
const thumbnailDir = path.join(__dirname, 'public/images/thumbnail');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 增加到20MB单个文件限制
    files: 500 // 增加文件数量限制到500个
  },
  fileFilter: (req, file, cb) => {
    // 确保文件名正确处理UTF-8编码
    try {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (error) {
      console.warn('文件名编码转换失败:', error);
    }
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  }
});

// 生成安全的文件名
const generateSafeFilename = (title, timestamp, extension) => {
  // 移除或替换不安全的字符
  const safeTitle = title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 移除Windows不允许的字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .substring(0, 50); // 限制长度
  
  return `${safeTitle}_${timestamp}${extension}`;
};

// 生成缩略图函数
const generateThumbnail = async (imagePath, filename) => {
  try {
    const thumbnailPath = path.join(thumbnailDir, filename);
    
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
    
    console.log(`缩略图生成成功: ${thumbnailPath}`);
    return `/images/thumbnail/${filename}`;
  } catch (error) {
    console.error('生成缩略图失败:', error);
    return null;
  }
};

// 数据文件路径
const dataFile = path.join(__dirname, 'src/data/userCategories.json');

// 读取数据
const readData = () => {
  try {
    if (!fs.existsSync(dataFile)) {
      const initialData = { categories: [] };
      fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return { categories: [] };
  }
};

// 写入数据
const writeData = (data) => {
  try {
    // 确保目录存在
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
};

// API 路由

// 获取所有分类
app.get('/api/categories', (req, res) => {
  try {
    const data = readData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取单个分类
app.get('/api/categories/:id', (req, res) => {
  try {
    const data = readData();
    const category = data.categories.find(cat => cat.id === req.params.id);
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 创建新分类
app.post('/api/categories', upload.single('coverImage'), (req, res) => {
  try {
    const { name, nameEn, description, sortWeight } = req.body;
    
    // 生成分类 ID
    const id = nameEn || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const data = readData();
    
    // 检查分类是否已存在
    if (data.categories.find(cat => cat.id === id)) {
      return res.status(400).json({ error: '分类已存在' });
    }
    
    // 处理封面图片
    let coverImage = '';
    if (req.file) {
      coverImage = `/images/${req.file.filename}`;
    }
    
    const newCategory = {
      id,
      name,
      nameEn: nameEn || name,
      description: description || '',
      coverImage,
      photos: [],
      totalCount: 0,
      sortWeight: parseInt(sortWeight) || 0,
      createdAt: new Date().toISOString()
    };
    
    data.categories.push(newCategory);
    
    if (writeData(data)) {
      res.json(newCategory);
    } else {
      res.status(500).json({ error: '保存分类失败' });
    }
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({ error: '创建分类失败' });
  }
});

// 上传照片到指定分类
// 添加照片到分类接口
app.post('/api/categories/:id/photos', upload.array('photos', 500), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { photoData } = req.body; // 照片元数据 JSON 字符串
    
    const data = readData();
    const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: '分类不存在' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 解析照片元数据
    let photoMetadata = {};
    try {
      photoMetadata = JSON.parse(photoData || '{}');
    } catch (e) {
      console.warn('照片元数据解析失败，使用默认值');
    }
    
    // 生成缩略图并创建照片对象
    const newPhotos = [];
    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index];
      
      // 确保文件名正确处理UTF-8编码
      let originalName = file.originalname;
      try {
        // 如果文件名看起来是错误编码的，尝试修复
        if (originalName.includes('Ã') || originalName.includes('â')) {
          originalName = Buffer.from(originalName, 'latin1').toString('utf8');
        }
      } catch (error) {
        console.warn('文件名编码修复失败:', error);
      }
      
      const metadata = photoMetadata[file.originalname] || photoMetadata[originalName] || {};
      
      console.log('处理文件:', {
        originalName: file.originalname,
        fixedName: originalName,
        hasMetadata: !!metadata,
        exifData: metadata.exif
      });
      
      // 获取标题和扩展名
      const title = metadata.title || originalName.replace(/\.[^/.]+$/, "");
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      
      // 生成新的文件名
      let newFilename = generateSafeFilename(title, timestamp, ext);
      const oldPath = path.join(uploadDir, file.filename);
      const newPath = path.join(uploadDir, newFilename);
      
      // 重命名文件
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`文件重命名: ${file.filename} -> ${newFilename}`);
      } catch (error) {
        console.error('文件重命名失败:', error);
        // 如果重命名失败，继续使用原文件名
        newFilename = file.filename;
      }
      
      // 生成缩略图
      const imagePath = path.join(uploadDir, newFilename);
      const thumbnailUrl = await generateThumbnail(imagePath, newFilename);
      
      const photoObject = {
        id: Date.now() + index,
        url: `/images/${newFilename}`,
        thumbnailUrl: thumbnailUrl || `/images/${newFilename}`, // 如果缩略图生成失败，使用原图
        title: title,
        description: metadata.description || '',
        tags: metadata.tags || [],
        exif: metadata.exif || {},
        width: metadata.width || 800,
        height: metadata.height || 600,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        originalName: originalName
      };
      
      newPhotos.push(photoObject);
    }
    
    // 添加照片到分类
    data.categories[categoryIndex].photos.push(...newPhotos);
    data.categories[categoryIndex].totalCount = data.categories[categoryIndex].photos.length;
    
    if (writeData(data)) {
      res.json({ 
        message: '照片上传成功', 
        photos: newPhotos,
        totalCount: data.categories[categoryIndex].totalCount
      });
    } else {
      res.status(500).json({ error: '保存照片数据失败' });
    }
  } catch (error) {
    console.error('上传照片失败:', error);
    res.status(500).json({ error: '上传照片失败' });
  }
});

// 删除分类
app.delete('/api/categories/:id', (req, res) => {
  try {
    const data = readData();
    const categoryIndex = data.categories.findIndex(cat => cat.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: '分类不存在' });
    }
    
    // 删除分类的所有图片文件
    const category = data.categories[categoryIndex];
    category.photos.forEach(photo => {
      const filePath = path.join(__dirname, 'public', photo.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // 删除封面图片
    if (category.coverImage) {
      const coverPath = path.join(__dirname, 'public', category.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    data.categories.splice(categoryIndex, 1);
    
    if (writeData(data)) {
      res.json({ message: '分类删除成功' });
    } else {
      res.status(500).json({ error: '删除分类失败' });
    }
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ error: '删除分类失败' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: '文件太大，单个文件限制为 20MB',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: '文件数量超过限制，最多上传 500 个文件',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: '上传的文件格式不支持',
        code: 'INVALID_FILE_TYPE'
      });
    }
  }
  res.status(500).json({ error: error.message || '服务器错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 文件上传服务器运行在: http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${uploadDir}`);
  console.log(`📄 数据文件: ${dataFile}`);
});
