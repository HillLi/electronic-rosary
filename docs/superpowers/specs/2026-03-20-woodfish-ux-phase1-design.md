# 木鱼页面 UX 优化 - Phase 1 设计规格

## 背景

用户已提供真实木鱼图片 (`assets/images/woodfish.png`)，需将其集成到木鱼页面，同时添加禅意背景效果。

## 设计决策

1. **木鱼显示**: 使用用户提供的真实木鱼图片替代 CSS 绘制
2. **木槌处理**: 不显示木槌，改用波纹效果提供视觉反馈（用户偏好真实感）
3. **背景效果**: 复用念珠页面的檀香烟雾粒子效果

## 改动范围

### 1. `pages/woodfish/woodfish.wxml`

- 添加檀香烟雾粒子层（复用 index 页面结构）
- 替换 CSS 木鱼为 `<image>` 组件
- 移除木槌相关代码
- 保留波纹和飘字效果

### 2. `pages/woodfish/woodfish.wxss`

- 添加烟雾粒子动画（从 index.wxss 复用）
- 更新木鱼区域样式，适配图片显示
- 移除 CSS 木鱼和木槌样式
- 优化波纹效果，作为主要点击反馈

### 3. `pages/woodfish/woodfish.js`

- 移除木槌动画相关逻辑（仅保留木鱼震动）
- 简化敲击状态管理

## 关键样式设计

### 木鱼图片容器

```css
.woodfish-image-wrapper {
  width: 400rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.woodfish-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.woodfish-image-wrapper.knocking {
  animation: woodfishShake 0.15s ease-in-out;
}
```

### 波纹效果增强

由于没有木槌动画，波纹效果作为主要视觉反馈，需要更明显：

```css
.ripple {
  border: 3rpx solid rgba(184, 134, 11, 0.6);
  box-shadow: 0 0 20rpx rgba(184, 134, 11, 0.3);
}
```

## 验收标准

1. 木鱼图片正确显示，保持原始比例
2. 点击时有波纹效果和震动反馈
3. 檀香烟雾粒子正常飘动
4. 功德计数和飘字功能正常
5. 音效播放正常

## 后续阶段

- Phase 2: 动画细化
- Phase 3: 音效增强 + 触觉反馈
