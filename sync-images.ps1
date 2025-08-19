# 图片同步脚本 - 将后端上传的图片复制到前端静态资源目录

$backendImagesPath = "public\images"
$frontendImagesPath = "public\images"  # 由于前后端共享同一个项目目录，路径相同

Write-Host "检查图片目录同步状态..."

if (Test-Path $backendImagesPath) {
    $backendImages = Get-ChildItem $backendImagesPath -Filter "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp" | Select-Object Name
    Write-Host "后端图片目录中有 $($backendImages.Count) 张图片"
    
    if (Test-Path $frontendImagesPath) {
        $frontendImages = Get-ChildItem $frontendImagesPath -Filter "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp" | Select-Object Name
        Write-Host "前端图片目录中有 $($frontendImages.Count) 张图片"
        
        # 检查缺失的图片
        $missingImages = $backendImages | Where-Object { $_.Name -notin $frontendImages.Name }
        
        if ($missingImages.Count -gt 0) {
            Write-Host "发现 $($missingImages.Count) 张图片需要同步"
            foreach ($image in $missingImages) {
                $sourcePath = Join-Path $backendImagesPath $image.Name
                $destPath = Join-Path $frontendImagesPath $image.Name
                Copy-Item $sourcePath $destPath -Force
                Write-Host "已复制: $($image.Name)"
            }
        } else {
            Write-Host "所有图片已同步"
        }
    } else {
        Write-Host "创建前端图片目录..."
        New-Item -ItemType Directory -Path $frontendImagesPath -Force
        
        # 复制所有图片
        foreach ($image in $backendImages) {
            $sourcePath = Join-Path $backendImagesPath $image.Name
            $destPath = Join-Path $frontendImagesPath $image.Name
            Copy-Item $sourcePath $destPath -Force
        }
        Write-Host "已同步所有 $($backendImages.Count) 张图片"
    }
} else {
    Write-Host "后端图片目录不存在"
}

Write-Host "图片同步完成！"
