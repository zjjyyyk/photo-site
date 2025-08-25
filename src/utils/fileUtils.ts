/**
 * 文件处理工具函数
 * 专门处理包含中文字符的文件名和文件内容读取
 */

/**
 * 检查字符串是否包含中文字符
 */
export function containsChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str);
}

/**
 * 安全地创建对象URL，处理中文文件名
 */
export function createSafeObjectURL(file: File): string {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('创建对象URL失败:', error);
    throw new Error(`无法为文件 "${file.name}" 创建预览URL`);
  }
}

/**
 * 创建一个文件的副本，使用ASCII文件名
 * 用于解决某些库对中文文件名的兼容性问题
 */
export function createAsciiFileCopy(file: File): File {
  if (!containsChinese(file.name)) {
    return file;
  }
  
  const extension = file.name.split('.').pop() || '';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const asciiName = `temp_${timestamp}_${randomId}.${extension}`;
  
  console.log(`创建ASCII文件副本: ${file.name} -> ${asciiName}`);
  
  return new File([file], asciiName, {
    type: file.type,
    lastModified: file.lastModified
  });
}

/**
 * 将文件转换为ArrayBuffer，用于直接内容处理
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('无法将文件转换为ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`读取文件失败: ${reader.error?.message || '未知错误'}`));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 安全地处理文件名，确保中文字符正确显示
 */
export function safeFileName(fileName: string): string {
  try {
    // 尝试解码可能被错误编码的文件名
    const decoded = decodeURIComponent(escape(fileName));
    return decoded;
  } catch (error) {
    // 如果解码失败，返回原始文件名
    console.warn('文件名解码失败，使用原始名称:', fileName);
    return fileName;
  }
}

/**
 * 验证文件是否为有效的图片文件
 */
export function isValidImageFile(file: File): boolean {
  // 检查MIME类型
  if (!file.type.startsWith('image/')) {
    return false;
  }
  
  // 检查常见的图片扩展名
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'];
  const extension = file.name.toLowerCase().split('.').pop();
  
  if (!extension || !validExtensions.includes(`.${extension}`)) {
    return false;
  }
  
  return true;
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 文件处理结果类型
 */
export interface FileProcessResult {
  success: boolean;
  originalFile: File;
  processedFile?: File;
  arrayBuffer?: ArrayBuffer;
  error?: string;
}

/**
 * 综合文件处理函数，尝试多种方法处理文件
 */
export async function processFileForExif(file: File): Promise<FileProcessResult> {
  try {
    console.log(`开始处理文件: ${file.name}`);
    
    // 验证文件
    if (!isValidImageFile(file)) {
      return {
        success: false,
        originalFile: file,
        error: '不是有效的图片文件'
      };
    }
    
    // 如果文件名包含中文，创建ASCII副本
    let processedFile = file;
    if (containsChinese(file.name)) {
      processedFile = createAsciiFileCopy(file);
    }
    
    // 同时准备ArrayBuffer版本
    const arrayBuffer = await fileToArrayBuffer(file);
    
    return {
      success: true,
      originalFile: file,
      processedFile,
      arrayBuffer
    };
    
  } catch (error) {
    return {
      success: false,
      originalFile: file,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}
