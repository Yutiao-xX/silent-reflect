# 提交到 Obsidian 社区市场

## 一句话说明

往 [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases) 的 `community-plugins.json` 加一条，提 PR。合并后插件出现在 Obsidian 应用内的「第三方插件 → 浏览」。

没有独立网站，`obsidian.md/plugins` 那个网页也是读同一份 JSON。

---

## 当前状态

| 步骤 | 状态 |
| :-- | :-- |
| 插件 repo 与 Release（含三附件） | ✅ 完成 |
| Fork `obsidian-releases` | ✅ 完成 |
| 分支 `add-silent-reflect` 推送到 fork | ✅ 完成 |
| 开 PR | ❌ **被上游拒收**（见下） |

### 为什么开不了 PR

```
GraphQL: Yutiao-xX does not have the correct permissions to execute CreatePullRequest
REST:    HTTP 404
```

同一个账号向自己的仓库建 PR 是成功的，所以**不是账号权限问题，是这个仓库限制了交互**。常见原因：

- 仓库开启了 *interaction limits*（只允许已有贡献者开 issue/PR）
- 新账号对高流量仓库有冷却期

**解决方式**：用网页手动开，通常能过。见下。

---

## 手动开 PR（一次点击）

分支已经推好，直接打开这个链接就会生成 PR 表单：

```
https://github.com/obsidianmd/obsidian-releases/compare/master...Yutiao-xX:add-silent-reflect?expand=1
```

标题填：

```
Add plugin: Silent Reflect
```

正文用下面这段（也可直接复制 `PR-BODY.md`）。

如果网页也提示无权限，就先在仓库里参与一次讨论（评论一个 issue），通常几小时到一天后限制解除。

---

## 加进去的那一条

```json
{
  "id": "silent-reflect",
  "name": "Silent Reflect",
  "author": "吴子明",
  "description": "Silently tracks what you write and change in your vault, then generates daily and weekly reflections. Strictly read-only.",
  "repo": "Yutiao-xX/silent-reflect"
}
```

---

## 审核要点（被退回的常见原因）

| 原因 | 我们的情况 |
| :-- | :-- |
| `id` 与已有插件冲突 | ✅ 已查，9295 条里无 `silent-reflect` |
| id 里含 obsidian | ✅ 不含 |
| Release 没有三个附件 | ✅ `main.js` / `manifest.json` / `styles.css` 齐全 |
| `manifest.json` 与 tag 版本不一致 | ✅ 都是 `0.1.1`，CI 里有校验 |
| 仓库缺 LICENSE | ✅ MIT |
| README 没有安装说明 | ✅ 中英双语 |
| 提交了 `data.json` | ✅ `.gitignore` 已排除 |
| 仓库不是 public | ✅ public |

审核周期 1–4 周。

---

## 合并之后会自动发生

- Obsidian 用户在「浏览」里能搜到
- `obsidian.md/plugins` 网页索引会出现
- 有下载量统计（这是唯一的量级指标）
- 后续发版只需打新 tag，市场自动读取，不用再提 PR
