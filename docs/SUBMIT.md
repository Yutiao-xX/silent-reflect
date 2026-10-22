# 提交到 Obsidian Community（当前流程）

> 2026-05-12 起，`obsidian-releases` 的 PR 通道已关闭，改走社区站点 + 开发者后台 + 自动审核。
> 旧文档里的 `community-plugins.json` PR 流程已作废。

---

## 入口

```
https://community.obsidian.md/account/profile
```

需要 **Obsidian 账号**（不是 GitHub 账号）。没有就现注册，免费。
登录后连接 GitHub（只读你的公开仓库列表，用来验证仓库归属）。

---

## 要填的内容（直接复制）

### 名称

```
Silent Reflect
```

### 描述

```
Silently tracks what you write and change in your vault, then generates daily and weekly reflections. Strictly read-only.
```

### 仓库

```
Yutiao-xX/silent-reflect
```

### 定价标签

```
Free
```

> 三个选项的含义：`Free` 完全不涉及付费；`Optional payments` 有可选付费或连接付费服务；
> `Paid` 核心功能必须付费。我们不涉及任何付费，选 Free。
> Obsidian Community 本身不是商店，不提供内置支付。

### 截图

上传本目录的 `screenshot.png`（整窗，1450×932）。

### 分类 / 标签

站点会给出分类列表。优先选 `Productivity` 或 `Note-taking`；
如果有 `Journaling` / `Reflection` 这类更贴的，优先选它。

---

## 提交后会怎样

1. 自动审核立即开始，**几分钟**出结果
2. 通过 → **24 小时内**出现在应用内「第三方插件 → 浏览」
3. 未通过 → 后台会列出具体问题（代码质量 / 开发者政策 / 安全扫描）

失败不用重新提交，改完代码发新 release 即可，会自动重审。

---

## 可能被点名的地方（先自查）

| 项 | 位置 | 处理 |
| :-- | :-- | :-- |
| `console.error` | `main.js` 的 `listFiles` catch | 一般算 warning，不 fail |
| 防抖 `setTimeout` 未在 onunload 清理 | `onVaultChange` | 若被标红，改成 `this.registerInterval` / 显式 clear |
| 中文 UI 文案 | 全局 | 不违反政策 |
| 依赖外部 Node 进程 | 设置项说明 | 已声明 `isDesktopOnly: true` |

---

## 常见问题

**Q：还需要往 GitHub 提 PR 吗？**
不需要。那个通道已经关了，截图里「该仓库的一位所有者已禁用打开拉取请求的功能」就是这个意思。

**Q：以后发新版本还要来后台吗？**
不用。直接在 GitHub 打 tag 发 release，会自动重审。
只有审核失败时才需要进后台看详细原因。

**Q：能不能闭源？**
现在不接受新的闭源插件。我们是 MIT，没问题。

**Q：多久能上架？**
审核几分钟，上架 24 小时内。比之前的 1–4 周快很多。

---

## 我这边已经准备好的

- Release `0.1.1`：`main.js` / `manifest.json` / `styles.css` 三附件齐全
- `manifest.json` 与 tag 版本一致（CI 里有校验）
- id `silent-reflect` 已确认在 9295 个现有插件中不冲突，且不含 "obsidian"
- 仓库 public、MIT、含中英 README、16 个 topics、description 已填
- 截图 `docs/screenshot.png` 可直接上传
