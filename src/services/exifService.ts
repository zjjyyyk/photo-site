import exifr from 'exifr';
import { ExifData } from '../types';

export class ExifService {
  /**
   * 安全地处理文件名，确保中文字符正确显示
   * @param fileName - 原始文件名
   * @returns 处理后的文件名
   */
  static safeFileName(fileName: string): string {
    try {
      // 尝试解码可能被错误编码的文件名
      return decodeURIComponent(escape(fileName));
    } catch (error) {
      // 如果解码失败，返回原始文件名
      console.warn('文件名解码失败，使用原始名称:', fileName);
      return fileName;
    }
  }

  /**
   * 从图片文件中提取 EXIF 数据
   * @param file - 图片文件
   * @returns Promise<ExifData | null> - 提取的 EXIF 数据或 null
   */
  static async extractExifData(file: File): Promise<ExifData | null> {
    try {
      console.log(`[EXIF] 正在处理文件: ${file.name}, 大小: ${file.size} bytes, 类型: ${file.type}`);
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        console.warn('[EXIF] 不是图片文件类型:', file.type);
        return null;
      }
      
      // 简化的EXIF提取选项
      const exifOptions = {
        pick: [
          'Make', 'Model', 'LensModel', 'LensMake',
          'ISO', 'FNumber', 'ExposureTime', 'FocalLength',
          'DateTimeOriginal', 'DateTime', 'CreateDate',
          'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef'
        ],
        mergeOutput: true,  // 关键：合并输出，这样所有字段都在顶层
        sanitize: true
      };
      
      // 直接使用exifr解析文件
      console.log('[EXIF] 开始提取EXIF数据...');
      const exifData = await exifr.parse(file, exifOptions);
      
      if (!exifData) {
        console.log('[EXIF] 文件中没有找到EXIF数据');
        return null;
      }
      
      console.log('[EXIF] 原始EXIF数据:', exifData);
      console.log('[EXIF] 数据键:', Object.keys(exifData));
      
      // 如果数据有嵌套结构，也输出嵌套的键
      if (exifData.ifd0) {
        console.log('[EXIF] ifd0键:', Object.keys(exifData.ifd0));
      }
      if (exifData.exif) {
        console.log('[EXIF] exif键:', Object.keys(exifData.exif));
      }

      if (!exifData) {
        console.log('No EXIF data found in image');
        return null;
      }

      // 转换为标准格式
      const processedExif: ExifData = {};

      // 相机信息
      if (exifData.Make && exifData.Model) {
        processedExif.camera = `${exifData.Make} ${exifData.Model}`.trim();
      } else if (exifData.Model) {
        processedExif.camera = exifData.Model;
      }

      // 镜头信息
      if (exifData.LensModel) {
        processedExif.lens = exifData.LensModel;
      } else if (exifData.LensMake && exifData.LensModel) {
        processedExif.lens = `${exifData.LensMake} ${exifData.LensModel}`.trim();
      }

      // ISO
      if (exifData.ISO) {
        processedExif.iso = exifData.ISO;
      }

      // 光圈值
      if (exifData.FNumber) {
        processedExif.aperture = `f/${exifData.FNumber}`;
      }

      // 快门速度
      if (exifData.ExposureTime) {
        processedExif.shutterSpeed = this.formatShutterSpeed(exifData.ExposureTime);
      }

      // 焦距
      if (exifData.FocalLength) {
        processedExif.focalLength = `${exifData.FocalLength}mm`;
      }

      // 拍摄日期
      const dateFields = [exifData.DateTimeOriginal, exifData.DateTime, exifData.CreateDate];
      for (const dateField of dateFields) {
        if (dateField) {
          processedExif.dateTaken = this.formatDate(dateField);
          break;
        }
      }

      // GPS 位置信息
      if (exifData.GPSLatitude && exifData.GPSLongitude) {
        const latitude = this.parseGPSCoordinate(exifData.GPSLatitude, exifData.GPSLatitudeRef);
        const longitude = this.parseGPSCoordinate(exifData.GPSLongitude, exifData.GPSLongitudeRef);
        
        if (latitude !== null && longitude !== null) {
          // 这里可以添加反向地理编码来获取地点名称
          processedExif.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
      }

      console.log('Extracted EXIF data:', processedExif);
      return processedExif;

    } catch (error) {
      console.error(`[EXIF] 提取 EXIF 数据时出错 (文件: ${file.name}):`, error);
      console.error('[EXIF] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      return null;
    }
  }

  /**
   * 格式化快门速度
   * @param exposureTime - 曝光时间（秒）
   * @returns 格式化的快门速度字符串
   */
  private static formatShutterSpeed(exposureTime: number): string {
    if (exposureTime >= 1) {
      return `${exposureTime}s`;
    } else if (exposureTime > 0) {
      const fraction = 1 / exposureTime;
      if (fraction % 1 === 0) {
        return `1/${fraction}s`;
      } else {
        return `1/${Math.round(fraction)}s`;
      }
    }
    return '';
  }

  /**
   * 格式化日期
   * @param date - 日期对象或字符串
   * @returns 格式化的日期字符串 (YYYY-MM-DD)
   */
  private static formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * 解析 GPS 坐标
   * @param coordinate - GPS 坐标值
   * @param ref - GPS 参考方向 (N/S/E/W)
   * @returns 十进制度数或 null
   */
  private static parseGPSCoordinate(coordinate: number | number[], ref?: string): number | null {
    try {
      let decimalDegrees: number;

      if (Array.isArray(coordinate) && coordinate.length >= 3) {
        // DMS 格式 [度, 分, 秒]
        const [degrees, minutes, seconds] = coordinate;
        decimalDegrees = degrees + minutes / 60 + seconds / 3600;
      } else if (typeof coordinate === 'number') {
        decimalDegrees = coordinate;
      } else {
        return null;
      }

      // 应用方向参考
      if (ref === 'S' || ref === 'W') {
        decimalDegrees = -decimalDegrees;
      }

      return decimalDegrees;
    } catch (error) {
      console.error('Error parsing GPS coordinate:', error);
      return null;
    }
  }

  /**
   * 获取图片尺寸信息
   * @param file - 图片文件
   * @returns Promise<{width: number, height: number} | null>
   */
  static async getImageDimensions(file: File): Promise<{width: number, height: number} | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 批量提取多个文件的 EXIF 数据
   * @param files - 图片文件数组
   * @returns Promise<ExifData[]> - EXIF 数据数组
   */
  static async extractMultipleExifData(files: File[]): Promise<(ExifData | null)[]> {
    const promises = files.map(file => this.extractExifData(file));
    return Promise.all(promises);
  }
}

export default ExifService;
