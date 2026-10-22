# 发布到 Obsidian 社区插件市场

需要两样东西：**本机装了 git**、**GitHub 账号已认证**。做完一次就行。

---

## 第一步：本机准备

### 装 git

```powershell
winget install --id Git.Git -e --source winget
```

装完**重开终端**（PATH 才会刷新），验证：

```powershell
git --version
```

### 登录 GitHub

```powershell
gh auth login
```

选 `GitHub.com` → `HTTPS` → `Login with a web browser`，浏览器里输入一次性代码即可。

> 这一步必须你来做：我没有你的账号权限，也不应该持有你的凭据。

---

## 第二步：建仓库并推送

```powershell
cd C:\dsh\reflection\plugin

git init
git add -A
git commit -m "0.1.0: 侧边栏复盘面板"

# 建仓库（私有改 --public，社区市场要求 public）
gh repo create silent-reflect --public --source=. --push

# 打 tag 触发 Release
git tag 0.1.0
git push origin 0.1.0
```

如果 `gh repo create` 提示名字冲突，就换一个，比如 `obsidian-reflection`。

**注意**：仓库名会出现在 `manifest.json` 里。建完之后把占位符换成真实地址：

```json
"authorUrl": "https://github.com/Yutiao-xX"
```

---

## 第三步：确认 Release 产物

打 tag 后 `.github/workflows/release.yml` 会自动跑，在 Releases 页面生成一个带三个附件的版本：

- `main.js`
- `manifest.json`
- `styles.css`

**Obsidian 只认这三个附件**，源码 zip 它不读。如果 Release 里没有这三个文件，插件装了也不会加载。

---

## 第四步：提交到社区市场

1. Fork [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
2. 在 `community-plugins.json` 末尾加一条：

```json
{
  "id": "silent-reflect",
  "name": "Reflection 复盘",
  "author": "吴子明",
  "description": "被动记录与自动反思：在侧边栏查看每日/每周复盘与洞察，可一键重新生成。",
  "repo": "Yutiao-xX/silent-reflect"
}
```

3. 提 PR

审核周期 1–4 周。常见退回原因：

| 原因 | 规避 |
| :-- | :-- |
| `id` 与已有插件冲突 | `silent-reflect` 已被占用的话，改名后再提 |
| README 没有安装说明 | 已写 |
| 没有 LICENSE | 已有（MIT） |
| `manifest.json` 的 `minAppVersion` 高于实际要求 | 填 1.5.0 |
| 提交了 `data.json`（用户设置） | `.gitignore` 已排除 |

---

## 发布检查清单

- [ ] `git --version` 可用
- [ ] `gh auth status` 显示已登录
- [ ] `manifest.json` 的 `authorUrl` 已改成真实地址
- [ ] `git tag` 与 `manifest.json` 的 `version` 一致
- [ ] Releases 页面有三个附件
- [ ] 仓库是 public
- [ ] 插件 id 不与市场已有插件重名

---

## 版本升级

```powershell
# 1. 改 manifest.json 的 version（如 0.1.1）
# 2. 改 versions.json，加 "0.1.1": "1.5.0"
# 3. 改 CHANGELOG.md
git add -A
git commit -m "0.1.1: <改了什么>"
git tag 0.1.1
git push origin master --tags
```

社区市场会自动读取新版本，不需要再提 PR。
