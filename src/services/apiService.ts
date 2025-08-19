// API 服务 - 与后端服务器通信
const API_BASE_URL = 'http://localhost:3001/api';

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  tags: string[];
  exif: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    dateTaken?: string;
  };
  width: number;
  height: number;
  uploadedAt?: string;
  fileSize?: number;
  originalName?: string;
}

export interface PhotoCategory {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  coverImage: string;
  photos: Photo[];
  totalCount: number;
  sortWeight?: number;
  createdAt?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // 获取所有分类
  async getCategories(): Promise<PhotoCategory[]> {
    return this.request<PhotoCategory[]>('/categories');
  }

  // 获取单个分类
  async getCategoryById(id: string): Promise<PhotoCategory> {
    return this.request<PhotoCategory>(`/categories/${id}`);
  }

  // 创建新分类
  async createCategory(data: {
    name: string;
    nameEn?: string;
    description: string;
    sortWeight?: number;
    coverImage?: File;
  }): Promise<PhotoCategory> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.nameEn) formData.append('nameEn', data.nameEn);
    formData.append('description', data.description);
    if (data.sortWeight !== undefined) formData.append('sortWeight', data.sortWeight.toString());
    if (data.coverImage) formData.append('coverImage', data.coverImage);

    return this.request<PhotoCategory>('/categories', {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
      },
    });
  }

  // 上传照片到分类
  async uploadPhotos(
    categoryId: string, 
    files: File[], 
    photoMetadata: Record<string, Partial<Photo>>
  ): Promise<{ message: string; photos: Photo[]; totalCount: number }> {
    const formData = new FormData();
    
    // 添加照片文件
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    // 添加照片元数据
    formData.append('photoData', JSON.stringify(photoMetadata));

    return this.request<{ message: string; photos: Photo[]; totalCount: number }>(
      `/categories/${categoryId}/photos`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
        },
      }
    );
  }

  // 删除分类
  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // 获取图片完整URL
  getImageUrl(path: string): string {
    if (path.startsWith('http')) {
      return path; // 已经是完整URL
    }
    
    // 优先使用后端的图片服务（当后端运行时）
    // 如果后端不可用，浏览器会自动回退到前端的静态资源
    return `http://localhost:3001${path}`;
  }

  // 获取前端静态资源图片URL（用作后端不可用时的备用）
  getFrontendImageUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${window.location.origin}/photo-site${path}`;
  }
}

export const apiService = new ApiService();
