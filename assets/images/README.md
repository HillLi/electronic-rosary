# 珠子图片资源

此目录存放念珠的图片资源文件。

## 所需图片

| 文件名 | 用途 | 建议尺寸 |
|--------|------|----------|
| `bead.png` | 普通状态珠子 | 200x200 px |
| `bead-active.png` | 激活状态珠子（可选高亮效果） | 200x200 px |

## 图片要求

- **格式**: PNG（支持透明背景）
- **尺寸**: 建议 200x200 像素（小程序会自动缩放）
- **背景**: 透明
- **风格**: 檀木/木质念珠风格，与禅意主题协调

## 设计建议

### bead.png（普通状态）
- 檀木色木质纹理
- 圆形珠子
- 适当的阴影增加立体感
- 柔和的高光效果

### bead-active.png（激活状态）
- 可以使用更亮的颜色
- 或者添加金色/暖色光晕效果
- 保持与普通状态视觉一致性

## 简化方案

如果只想用一张图片，可以：

1. 只提供 `bead.png`
2. 激活效果由 CSS 的 `transform: scale()` 和 `filter` 实现

修改 `pages/index/index.wxml` 中的图片路径：

```html
src="/assets/images/bead.png"
```

## 免费图片资源

- [Unsplash](https://unsplash.com/) - 搜索 "wooden beads"
- [Pexels](https://www.pexels.com/) - 搜索 "rosary" 或 "prayer beads"
- [Flaticon](https://www.flaticon.com/) - 搜索 "bead" 图标

**注意**: 使用时请遵守各网站的许可协议。
