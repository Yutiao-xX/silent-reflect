/*
 * Reflection 插件 — 薄壳
 *
 * 设计约束（与引擎约定一致）：
 *   1. 插件不生成任何内容。所有 md 由外部引擎（run.mjs）产出。
 *   2. 插件只做三件事：读 _Reflection/、渲染、点按钮触发一次外部生成。
 *   3. 关掉 Obsidian 不影响数据——真相永远在文件里。
 *
 * 因为只是壳，用单文件 CommonJS 就够，不引入打包工具链。
 */

const { Plugin, ItemView, WorkspaceLeaf, MarkdownRenderer, PluginSettingTab, Setting, Notice } = require('obsidian');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const VIEW_TYPE = 'reflection-view';
const TABS = [
  { id: 'daily', label: '今日', dir: 'Daily' },
  { id: 'weekly', label: '本周', dir: 'Weekly' },
  { id: 'insights', label: '洞察', dir: 'insights', match: /^insights-/ },
  { id: 'about', label: 'About', dir: null },
];
const DEFAULT_SETTINGS = {
  toolsDir: '',
  // GUI 启动的应用往往没有 shell PATH，直接写绝对路径最稳
  nodePath: 'C:\\Program Files\\nodejs\\node.exe',
  period: 'daily',
};

class ReflectionView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tab = 'daily';
    this.selected = null;
    this.busy = false;
  }

  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return 'Silent Reflect'; }
  getIcon() { return 'eye'; }

  async onOpen() {
    // 自动刷新：引擎是外部进程，写完文件不会通知插件，
    // 所以靠 Obsidian 自己的 vault 事件发现变化。
    const onChange = (file) => this.onVaultChange(file && file.path);
    this.registerEvent(this.app.vault.on('modify', onChange));
    this.registerEvent(this.app.vault.on('create', onChange));
    this.registerEvent(this.app.vault.on('delete', onChange));
    this.registerEvent(this.app.vault.on('rename', (f, oldPath) => this.onVaultChange(oldPath)));
    await this.render();
  }

  onVaultChange(p) {
    if (!p || !p.startsWith('_Reflection/')) return;
    if (!p.endsWith('.md') && !p.endsWith('.json')) return;
    // 一次生成会连写多个文件，合并成一次刷新
    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(() => this.render(), 600);
  }

  basePath() {
    // 桌面端才有 basePath；isDesktopOnly=true 已保证
    return this.app.vault.adapter.basePath || '';
  }

  async listFiles(dir, match) {
    const folder = `_Reflection/${dir}`;
    try {
      const r = await this.app.vault.adapter.list(folder);
      return (r.files || [])
        .filter((f) => f.endsWith('.md'))
        .filter((f) => !match || match.test(path.basename(f)))
        .map((f) => ({ path: f, name: path.basename(f, '.md') }))
        .sort((a, b) => b.name.localeCompare(a.name));
    } catch (e) {
      // 不要裸 catch：它会把编程错误伪装成「没有数据」，排查时完全看不出问题
      console.error('[reflection] list failed', folder, e);
      return [];
    }
  }

  async render() {
    const root = this.contentEl;
    const keepScroll = root.scrollTop;
    root.empty();
    root.addClass('reflection-view');

    // ---- 顶部：标题 + 生成按钮 ----
    const head = root.createDiv({ cls: 'reflection-head' });
    head.createEl('div', { text: 'Silent Reflect', cls: 'reflection-title' });
    const btn = head.createEl('button', { text: '重新生成', cls: 'reflection-btn' });
    btn.onclick = () => this.regenerate(btn);

    // ---- tab ----
    const tabBar = root.createDiv({ cls: 'reflection-tabs' });
    for (const t of TABS) {
      const el = tabBar.createEl('button', { text: t.label, cls: 'reflection-tab' });
      if (t.id === this.tab) el.addClass('is-active');
      el.onclick = async () => { this.tab = t.id; this.selected = null; await this.render(); };
    }

const tabDef = TABS.find((t) => t.id === this.tab);
    if (tabDef.id === 'about') { this.renderAbout(root); return; }
    const files = await this.listFiles(tabDef.dir, tabDef.match);

    if (files.length === 0) {
      root.createDiv({
        cls: 'reflection-empty',
        text: `_Reflection/${tabDef.dir} 还没有内容。点「重新生成」，或等 22:00 自动生成。`,
      });
      return;
    }

    // ---- 文件选择 ----
    if (!this.selected || !files.some((f) => f.path === this.selected)) this.selected = files[0].path;
    if (files.length > 1) {
      const sel = root.createEl('select', { cls: 'reflection-select' });
      for (const f of files) {
        const opt = sel.createEl('option', { text: f.name, value: f.path });
        if (f.path === this.selected) opt.selected = true;
      }
      sel.onchange = async () => { this.selected = sel.value; await this.render(); };
    }

    // ---- 正文 ----
    const body = root.createDiv({ cls: 'reflection-body' });
    let md = '';
    try { md = await this.app.vault.adapter.read(this.selected); }
    catch { body.createDiv({ cls: 'reflection-empty', text: '读取失败：' + this.selected }); return; }

    // sourcePath 用真实路径，[[双链]] 才能解析到正确笔记
    await MarkdownRenderer.render(this.app, md, body, this.selected, this);

    const meta = root.createDiv({ cls: 'reflection-meta' });
    meta.setText(`${path.basename(this.selected)} ｜ 共 ${files.length} 篇`);
    root.scrollTop = keepScroll;  // 自动刷新不该把读者弹回顶部
  }

  renderAbout(root) {
    const box = root.createDiv({ cls: 'reflection-about' });
    box.createEl('h2', { text: 'Silent Reflect' });
    box.createEl('div', { text: 'Passive writing trace & reflection for Obsidian', cls: 'about-tagline' });

    const section = (title, items) => {
      box.createEl('h3', { text: title });
      const ul = box.createEl('ul');
      for (const it of items) ul.createEl('li', { text: it });
    };

    section('WHAT IT DOES', [
      'Watches how your notes change: which section, how often, how long it stalled.',
      'Generates a daily reflection (4 dimensions) and a weekly one (6).',
      'Surfaces behaviour you cannot see yourself: repeated restarts, churn without closure, conclusions that flipped.',
      'Every insight cites the note it came from.',
    ]);

    section('WHAT IT DOES NOT DO', [
      'Never modifies, moves or deletes your notes.',
      'Writes only inside the _Reflection folder.',
      'No telemetry. The panel makes no network requests.',
    ]);

    section('HOW IT WORKS', [
      'Capture: file events and section-level diffs, append-only.',
      'Screen: deterministic rules propose candidates, no model involved.',
      'Reflect: a model judges each candidate against your own evidence and may reject it.',
    ]);

    box.createEl('p', {
      text: 'An empty insight day is a valid result — nothing is padded to look productive.',
      cls: 'about-note',
    });

    const foot = box.createDiv({ cls: 'about-foot' });
    foot.createEl('span', { text: 'v0.1.1 · MIT' });
    const link = foot.createEl('a', { text: 'github.com/Yutiao-xX/silent-reflect' });
    link.href = 'https://github.com/Yutiao-xX/silent-reflect';
    link.target = '_blank';
  }
  async regenerate(btn) {
    if (this.busy) return;
    const s = this.plugin.settings;
    const runMjs = path.join(s.toolsDir, 'run.mjs');
    if (!fs.existsSync(runMjs)) {
      new Notice(`找不到 ${runMjs}，请在设置里改工具目录`);
      return;
    }
    const base = this.basePath();
    if (!base) { new Notice('拿不到 vault 路径，无法生成'); return; }

    this.busy = true;
    const old = btn.textContent;
    btn.textContent = '生成中…';
    btn.disabled = true;

    const args = [runMjs, '--vault', base];
    if (s.period === 'weekly') args.push('--period', 'weekly');

    // nodePath 不存在时退回 PATH 里的 node
    const nodeBin = fs.existsSync(s.nodePath) ? s.nodePath : 'node';
    execFile(nodeBin, args, { windowsHide: true, timeout: 5 * 60 * 1000 }, async (err, stdout, stderr) => {
      this.busy = false;
      btn.textContent = old;
      btn.disabled = false;
      if (err) {
        new Notice('生成失败：' + (stderr || err.message).slice(0, 160), 8000);
      } else {
        const m = /候选\s*(\d+)\s*→\s*洞察\s*(\d+)/.exec(String(stdout));
        new Notice(m ? `已生成：候选 ${m[1]} 条，洞察 ${m[2]} 条` : '已生成', 5000);
        await this.render();
      }
    });
  }
}

class ReflectionSettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h3', { text: 'Reflection 设置' });

    new Setting(containerEl)
      .setName('工具目录')
      .setDesc('存放 run.mjs 的目录（不是 vault）')
      .addText((t) => t.setValue(this.plugin.settings.toolsDir)
        .onChange(async (v) => { this.plugin.settings.toolsDir = v.trim(); await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Node 路径')
      .setDesc('Obsidian 从图形界面启动时通常找不到 node，建议填绝对路径')
      .addText((t) => t.setValue(this.plugin.settings.nodePath)
        .onChange(async (v) => { this.plugin.settings.nodePath = v.trim(); await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('重新生成的范围')
      .setDesc('日复盘更快，周复盘会读最近 7 天')
      .addDropdown((d) => d
        .addOption('daily', '日复盘')
        .addOption('weekly', '周复盘')
        .setValue(this.plugin.settings.period)
        .onChange(async (v) => { this.plugin.settings.period = v; await this.plugin.saveSettings(); }));
  }
}

module.exports = class ReflectionPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) => new ReflectionView(leaf, this));

    this.addRibbonIcon('eye', '打开 Silent Reflect', () => this.activateView());

    this.addCommand({
      id: 'open-reflection',
      name: '打开复盘面板',
      callback: () => this.activateView(),
    });

    this.addSettingTab(new ReflectionSettingTab(this.app, this));
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      // getRightLeaf 可能返回 null（侧栏已满或版本差异），要有兜底，否则插件加载后点图标会崩
      leaf = workspace.getRightLeaf(false) || workspace.getLeaf('tab');
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() { await this.saveData(this.settings); }
};
