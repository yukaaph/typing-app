(function () {
  const STORAGE_KEY = 'settings-checklist-state-v1';

  const NAV_LABELS = {
    contract: '契約情報',
    media: 'メディア設定',
    organizations: '組織設定',
    categories: '配信カテゴリ',
    tags: '配信タグ',
    autoDelivery: '自動配信設定',
    overview: '提出内容確認'
  };

  const STATUS_LABEL = {
    draft: '下書き',
    submitted: '提出済・確認待ち',
    confirmed: '確認完了',
    rejected: '差し戻し中'
  };

  const PLAN_OPTIONS = [
    { id: 'スタンダードプラン', desc: '主要な配信カテゴリ・タグ機能をご利用いただけます。' },
    { id: 'プレミアムプラン', desc: '全カテゴリ・自動配信・API連携など全機能をご利用いただけます。' }
  ];

  function uid() {
    return 'id-' + Math.random().toString(36).slice(2, 10);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function defaultState() {
    return {
      contract: {
        contractId: 'C-2026-0001',
        plan: 'スタンダードプラン',
        startDate: '2026-04-01',
        staffName: '山田 太郎（弊社担当）'
      },
      media: {
        managerName: '',
        managerEmail: '',
        fromEmail: '',
        lineToken: ''
      },
      organizations: [],
      categories: [],
      tags: [],
      autoDelivery: {
        categoryId: '',
        tagIds: [],
        level: ''
      },
      status: 'draft',
      rejectComment: '',
      mode: 'customer',
      activeSection: 'contract'
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return Object.assign(base, parsed, {
        contract: Object.assign(base.contract, parsed.contract || {}),
        media: Object.assign(base.media, parsed.media || {}),
        autoDelivery: Object.assign(base.autoDelivery, parsed.autoDelivery || {}),
        organizations: Array.isArray(parsed.organizations) ? parsed.organizations : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      });
    } catch (e) {
      return defaultState();
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const mainContent = document.getElementById('mainContent');
  const statusBadge = document.getElementById('statusBadge');
  const toast = document.getElementById('toast');
  const resetBtn = document.getElementById('resetBtn');
  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function isCustomerFieldsEditable() {
    return state.mode === 'customer' && (state.status === 'draft' || state.status === 'rejected');
  }

  function isContractEditable() {
    return state.mode === 'staff';
  }

  function validate() {
    const missing = [];
    const m = state.media;
    if (!m.managerName.trim()) missing.push({ section: 'media', label: 'メディア設定: 担当者名' });
    if (!m.managerEmail.trim()) missing.push({ section: 'media', label: 'メディア設定: 担当者メールアドレス' });
    else if (!isEmail(m.managerEmail.trim())) missing.push({ section: 'media', label: 'メディア設定: 担当者メールアドレス（メール形式で入力してください）' });
    if (!m.fromEmail.trim()) missing.push({ section: 'media', label: 'メディア設定: 送信元メールアドレス' });
    else if (!isEmail(m.fromEmail.trim())) missing.push({ section: 'media', label: 'メディア設定: 送信元メールアドレス（メール形式で入力してください）' });

    if (state.organizations.length === 0) missing.push({ section: 'organizations', label: '組織設定: 組織を1件以上登録してください' });
    if (state.categories.length === 0) missing.push({ section: 'categories', label: '配信カテゴリ: カテゴリを1件以上登録してください' });

    if (!state.autoDelivery.categoryId) missing.push({ section: 'autoDelivery', label: '自動配信設定: 配信カテゴリを選択してください' });
    if (!state.autoDelivery.level.trim()) missing.push({ section: 'autoDelivery', label: '自動配信設定: 配信レベル' });

    return missing;
  }

  function buildChildrenMap(list) {
    const byParent = {};
    list.forEach((node) => {
      const key = node.parentId || 'root';
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(node);
    });
    return byParent;
  }

  function deleteNodeAndDescendants(list, id) {
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      list.forEach((n) => {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          changed = true;
        }
      });
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (toDelete.has(list[i].id)) list.splice(i, 1);
    }
    if (state.autoDelivery.categoryId && toDelete.has(state.autoDelivery.categoryId)) {
      state.autoDelivery.categoryId = '';
    }
    state.autoDelivery.tagIds = state.autoDelivery.tagIds.filter((tid) => !toDelete.has(tid));
  }

  function flattenTree(list, parentId, depth, acc) {
    parentId = parentId || null;
    depth = depth || 0;
    acc = acc || [];
    list.filter((n) => (n.parentId || null) === parentId).forEach((n) => {
      acc.push({ id: n.id, name: n.name, depth });
      flattenTree(list, n.id, depth + 1, acc);
    });
    return acc;
  }

  function showInlineForm(anchorEl, initialValue, onSave, insertAfter) {
    const formId = 'inlineForm-' + Math.random().toString(36).slice(2, 8);
    const html = `<div class="inline-form" id="${formId}">
      <input type="text" value="${escapeHtml(initialValue)}" placeholder="名称を入力">
      <button class="btn btn--primary btn--small" data-role="save">保存</button>
      <button class="btn btn--ghost btn--small" data-role="cancel">キャンセル</button>
    </div>`;
    anchorEl.insertAdjacentHTML(insertAfter ? 'afterend' : 'beforeend', html);
    const form = document.getElementById(formId);
    const input = form.querySelector('input');
    input.focus();
    input.select();
    form.querySelector('[data-role="save"]').addEventListener('click', () => onSave(input.value));
    form.querySelector('[data-role="cancel"]').addEventListener('click', () => form.remove());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onSave(input.value);
      if (e.key === 'Escape') form.remove();
    });
  }

  function renderTreeNodes(nodes, byParent, editable) {
    return `<ul class="tree">${nodes.map((node) => {
      const children = byParent[node.id] || [];
      return `<li class="tree-node" data-id="${node.id}">
        <div class="tree-node__row">
          <span class="tree-node__name">${escapeHtml(node.name)}</span>
          ${editable ? `<div class="tree-node__actions">
            <button class="btn btn--ghost btn--small" data-action="add-child" data-id="${node.id}">＋子を追加</button>
            <button class="btn btn--ghost btn--small" data-action="rename" data-id="${node.id}">編集</button>
            <button class="btn-link-danger" data-action="delete" data-id="${node.id}">削除</button>
          </div>` : ''}
        </div>
        ${children.length ? renderTreeNodes(children, byParent, editable) : ''}
      </li>`;
    }).join('')}</ul>`;
  }

  function renderTreeSection(kind, title, itemLabel) {
    const editable = isCustomerFieldsEditable();
    const list = state[kind];
    const byParent = buildChildrenMap(list);
    const rootNodes = byParent.root || [];

    mainContent.innerHTML = `
      <h2 class="section-title">${title}</h2>
      <p class="section-desc">${itemLabel}は階層構造で登録できます。「＋子を追加」で下位階層を追加できます。</p>
      ${editable ? `<div class="tree-toolbar"><button class="btn btn--add btn--small" id="addRootBtn">＋ルート${itemLabel}を追加</button></div>` : ''}
      <div id="treeAddForm"></div>
      ${rootNodes.length ? renderTreeNodes(rootNodes, byParent, editable) : `<div class="tree-empty">まだ${itemLabel}が登録されていません。</div>`}
    `;

    if (!editable) return;

    document.getElementById('addRootBtn').addEventListener('click', () => {
      showInlineForm(document.getElementById('treeAddForm'), '', (value) => {
        if (!value.trim()) return;
        list.push({ id: uid(), name: value.trim(), parentId: null });
        saveState();
        render();
      });
    });

    mainContent.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'delete') {
          if (!confirm('この項目と配下の子項目もすべて削除されます。よろしいですか？')) return;
          deleteNodeAndDescendants(list, id);
          saveState();
          render();
        } else if (action === 'add-child') {
          showInlineForm(btn.closest('.tree-node__row'), '', (value) => {
            if (!value.trim()) return;
            list.push({ id: uid(), name: value.trim(), parentId: id });
            saveState();
            render();
          }, true);
        } else if (action === 'rename') {
          const node = list.find((n) => n.id === id);
          showInlineForm(btn.closest('.tree-node__row'), node.name, (value) => {
            if (!value.trim()) return;
            node.name = value.trim();
            saveState();
            render();
          }, true);
        }
      });
    });
  }

  function renderContractSection() {
    const editable = isContractEditable();
    const c = state.contract;
    if (editable) {
      mainContent.innerHTML = `
        <h2 class="section-title">契約情報</h2>
        <p class="section-desc">弊社担当者が設定する契約情報です。お客様画面では閲覧のみとなります。</p>
        <div class="field-group"><div class="field-label">契約ID</div><input type="text" id="field-contractId" value="${escapeHtml(c.contractId)}"></div>
        <div class="field-group">
          <div class="field-label">契約プラン</div>
          <div class="plan-cards" id="planCards">
            ${PLAN_OPTIONS.map((p) => `
              <label class="plan-card ${c.plan === p.id ? 'is-selected' : ''}">
                <input type="radio" name="plan" value="${escapeHtml(p.id)}" ${c.plan === p.id ? 'checked' : ''}>
                <span class="plan-card__title">${escapeHtml(p.id)}</span>
                <span class="plan-card__desc">${escapeHtml(p.desc)}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="field-group"><div class="field-label">契約開始日</div><input type="text" id="field-startDate" value="${escapeHtml(c.startDate)}" placeholder="YYYY-MM-DD"></div>
        <div class="field-group"><div class="field-label">弊社担当者</div><input type="text" id="field-staffName" value="${escapeHtml(c.staffName)}"></div>
        <div class="btn-row"><button class="btn btn--primary" id="saveContractBtn">保存</button></div>
      `;
      mainContent.querySelectorAll('input[name="plan"]').forEach((radio) => {
        radio.addEventListener('change', () => {
          mainContent.querySelectorAll('.plan-card').forEach((card) => card.classList.remove('is-selected'));
          radio.closest('.plan-card').classList.add('is-selected');
        });
      });
      document.getElementById('saveContractBtn').addEventListener('click', () => {
        const checkedPlan = mainContent.querySelector('input[name="plan"]:checked');
        c.contractId = document.getElementById('field-contractId').value;
        c.plan = checkedPlan ? checkedPlan.value : c.plan;
        c.startDate = document.getElementById('field-startDate').value;
        c.staffName = document.getElementById('field-staffName').value;
        saveState();
        showToast('契約情報を保存しました');
        render();
      });
    } else {
      mainContent.innerHTML = `
        <h2 class="section-title">契約情報</h2>
        <p class="section-desc">こちらは弊社担当者が設定した契約情報です（閲覧のみ）。</p>
        <div class="field-group"><div class="field-label">契約ID</div><div class="readonly-value">${escapeHtml(c.contractId) || '(未設定)'}</div></div>
        <div class="field-group"><div class="field-label">契約プラン</div><div class="readonly-value">${escapeHtml(c.plan) || '(未設定)'}</div></div>
        <div class="field-group"><div class="field-label">契約開始日</div><div class="readonly-value">${escapeHtml(c.startDate) || '(未設定)'}</div></div>
        <div class="field-group"><div class="field-label">弊社担当者</div><div class="readonly-value">${escapeHtml(c.staffName) || '(未設定)'}</div></div>
      `;
    }
  }

  function mediaFieldHTML(key, label, value, required, editable, type) {
    const badge = required ? '<span class="badge-required">必須</span>' : '<span class="badge-optional">任意</span>';
    if (editable) {
      return `<div class="field-group">
        <div class="field-label">${label} ${badge}</div>
        <input type="${type}" id="field-${key}" value="${escapeHtml(value)}">
      </div>`;
    }
    return `<div class="field-group">
      <div class="field-label">${label} ${badge}</div>
      <div class="readonly-value">${escapeHtml(value) || '(未入力)'}</div>
    </div>`;
  }

  function renderMediaSection() {
    const editable = isCustomerFieldsEditable();
    const m = state.media;
    mainContent.innerHTML = `
      <h2 class="section-title">メディア設定</h2>
      <p class="section-desc">配信に利用する担当者情報・送信元情報を入力してください。</p>
      ${mediaFieldHTML('managerName', '担当者名', m.managerName, true, editable, 'text')}
      ${mediaFieldHTML('managerEmail', '担当者メールアドレス', m.managerEmail, true, editable, 'email')}
      ${mediaFieldHTML('fromEmail', '送信元メールアドレス', m.fromEmail, true, editable, 'email')}
      ${mediaFieldHTML('lineToken', 'LINEトークン', m.lineToken, false, editable, 'text')}
      ${editable ? '<div class="btn-row"><button class="btn btn--primary" id="saveMediaBtn">保存</button></div>' : ''}
    `;
    if (!editable) return;
    document.getElementById('saveMediaBtn').addEventListener('click', () => {
      ['managerName', 'managerEmail', 'fromEmail', 'lineToken'].forEach((key) => {
        m[key] = document.getElementById('field-' + key).value;
      });
      saveState();
      showToast('メディア設定を保存しました');
      render();
    });
  }

  function renderTagsSection() {
    const editable = isCustomerFieldsEditable();
    const colCount = editable ? 3 : 2;
    const rows = state.tags.length
      ? state.tags.map((t, i) => `<tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(t.name)}</td>
          ${editable ? `<td><button class="btn-link-danger" data-id="${t.id}">削除</button></td>` : ''}
        </tr>`).join('')
      : `<tr><td colspan="${colCount}" class="table-empty">まだタグが登録されていません。</td></tr>`;

    mainContent.innerHTML = `
      <h2 class="section-title">配信タグ</h2>
      <p class="section-desc">配信タグは階層を持たないフラットな一覧です。</p>
      <table class="repeat-table">
        <thead><tr><th>No.</th><th>タグ名</th>${editable ? '<th>操作</th>' : ''}</tr></thead>
        <tbody id="tagList">${rows}</tbody>
      </table>
      ${editable ? `<div class="inline-form">
        <input type="text" id="newTagInput" placeholder="新しいタグ名">
        <button class="btn btn--add btn--small" id="addTagBtn">＋ タグ追加</button>
      </div>` : ''}
    `;
    if (!editable) return;

    const addTagHandler = () => {
      const input = document.getElementById('newTagInput');
      const value = input.value.trim();
      if (!value) return;
      state.tags.push({ id: uid(), name: value });
      saveState();
      render();
    };
    document.getElementById('addTagBtn').addEventListener('click', addTagHandler);
    document.getElementById('newTagInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTagHandler();
    });
    mainContent.querySelectorAll('#tagList button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        state.tags = state.tags.filter((t) => t.id !== id);
        state.autoDelivery.tagIds = state.autoDelivery.tagIds.filter((tid) => tid !== id);
        saveState();
        render();
      });
    });
  }

  function findCategoryName(id) {
    const c = state.categories.find((c) => c.id === id);
    return c ? c.name : '';
  }
  function findTagName(id) {
    const t = state.tags.find((t) => t.id === id);
    return t ? t.name : '';
  }

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function nodePath(list, id) {
    const map = {};
    list.forEach((n) => { map[n.id] = n; });
    const parts = [];
    let cur = map[id];
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentId ? map[cur.parentId] : null;
    }
    return parts.join(' > ');
  }

  function buildCsvRows() {
    const rows = [['分類', '項目', '内容']];
    const c = state.contract;
    rows.push(['契約情報', '契約ID', c.contractId]);
    rows.push(['契約情報', '契約プラン', c.plan]);
    rows.push(['契約情報', '契約開始日', c.startDate]);
    rows.push(['契約情報', '弊社担当者', c.staffName]);

    const m = state.media;
    rows.push(['メディア設定', '担当者名', m.managerName]);
    rows.push(['メディア設定', '担当者メールアドレス', m.managerEmail]);
    rows.push(['メディア設定', '送信元メールアドレス', m.fromEmail]);
    rows.push(['メディア設定', 'LINEトークン', m.lineToken]);

    if (state.organizations.length) {
      state.organizations.forEach((n, i) => rows.push(['組織設定', '組織' + (i + 1), nodePath(state.organizations, n.id)]));
    } else {
      rows.push(['組織設定', '(未登録)', '']);
    }

    if (state.categories.length) {
      state.categories.forEach((n, i) => rows.push(['配信カテゴリ', 'カテゴリ' + (i + 1), nodePath(state.categories, n.id)]));
    } else {
      rows.push(['配信カテゴリ', '(未登録)', '']);
    }

    rows.push(['配信タグ', 'タグ一覧', state.tags.map((t) => t.name).join('、')]);

    const ad = state.autoDelivery;
    rows.push(['自動配信設定', '配信カテゴリ', findCategoryName(ad.categoryId)]);
    rows.push(['自動配信設定', '配信タグ', ad.tagIds.map(findTagName).filter(Boolean).join('、')]);
    rows.push(['自動配信設定', '配信レベル', ad.level]);

    rows.push(['ステータス', '提出状況', STATUS_LABEL[state.status]]);
    if (state.status === 'rejected') rows.push(['ステータス', '差し戻しコメント', state.rejectComment]);

    return rows;
  }

  function downloadCsv() {
    const rows = buildCsvRows();
    const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    const bom = String.fromCharCode(0xfeff);
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    const safeId = (state.contract.contractId || 'export').replace(/[^A-Za-z0-9_-]/g, '');
    a.download = `settings-checklist_${safeId}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function formatDateTime(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function buildPrintHtml() {
    const c = state.contract;
    const m = state.media;
    const ad = state.autoDelivery;
    const orgByParent = buildChildrenMap(state.organizations);
    const catByParent = buildChildrenMap(state.categories);

    return `
      <h1>設定確認表</h1>
      <p class="print-meta">出力日時: ${escapeHtml(formatDateTime(new Date()))} ／ ステータス: ${escapeHtml(STATUS_LABEL[state.status])}</p>

      ${state.status === 'rejected' ? `<div class="print-note"><strong>差し戻しコメント：</strong>${escapeHtml(state.rejectComment) || '(コメントなし)'}</div>` : ''}

      <h2>契約情報</h2>
      <table class="print-table">
        <tr><th>契約ID</th><td>${escapeHtml(c.contractId) || '-'}</td></tr>
        <tr><th>契約プラン</th><td>${escapeHtml(c.plan) || '-'}</td></tr>
        <tr><th>契約開始日</th><td>${escapeHtml(c.startDate) || '-'}</td></tr>
        <tr><th>弊社担当者</th><td>${escapeHtml(c.staffName) || '-'}</td></tr>
      </table>

      <h2>メディア設定</h2>
      <table class="print-table">
        <tr><th>担当者名</th><td>${escapeHtml(m.managerName) || '-'}</td></tr>
        <tr><th>担当者メールアドレス</th><td>${escapeHtml(m.managerEmail) || '-'}</td></tr>
        <tr><th>送信元メールアドレス</th><td>${escapeHtml(m.fromEmail) || '-'}</td></tr>
        <tr><th>LINEトークン</th><td>${escapeHtml(m.lineToken) || '-'}</td></tr>
      </table>

      <h2>組織設定</h2>
      ${state.organizations.length ? renderTreeNodes(orgByParent.root || [], orgByParent, false) : '<p class="print-empty">未登録</p>'}

      <h2>配信カテゴリ</h2>
      ${state.categories.length ? renderTreeNodes(catByParent.root || [], catByParent, false) : '<p class="print-empty">未登録</p>'}

      <h2>配信タグ</h2>
      ${state.tags.length ? `<p>${state.tags.map((t) => escapeHtml(t.name)).join('、')}</p>` : '<p class="print-empty">未登録</p>'}

      <h2>自動配信設定</h2>
      <table class="print-table">
        <tr><th>配信カテゴリ</th><td>${escapeHtml(findCategoryName(ad.categoryId)) || '-'}</td></tr>
        <tr><th>配信タグ</th><td>${ad.tagIds.map(findTagName).filter(Boolean).map(escapeHtml).join('、') || '-'}</td></tr>
        <tr><th>配信レベル</th><td>${escapeHtml(ad.level) || '-'}</td></tr>
      </table>
    `;
  }

  function printPdf() {
    document.getElementById('printArea').innerHTML = buildPrintHtml();
    window.print();
  }

  function renderAutoDeliverySection() {
    const editable = isCustomerFieldsEditable();
    const flatCategories = flattenTree(state.categories);
    const ad = state.autoDelivery;

    const categoryOptions = flatCategories.map((c) => `<option value="${c.id}" ${ad.categoryId === c.id ? 'selected' : ''}>${'　'.repeat(c.depth)}${escapeHtml(c.name)}</option>`).join('');

    mainContent.innerHTML = `
      <h2 class="section-title">自動配信設定</h2>
      <p class="section-desc">自動配信を行う際に使用するカテゴリ・タグ・配信レベルを設定します。</p>

      <div class="field-group">
        <div class="field-label">自動配信時の配信カテゴリ <span class="badge-required">必須</span></div>
        ${editable
          ? `<select id="adCategory" ${flatCategories.length === 0 ? 'disabled' : ''}>
               <option value="">選択してください</option>
               ${categoryOptions}
             </select>
             ${flatCategories.length === 0 ? '<div style="font-size:12px;color:var(--color-text-muted);margin-top:6px;">先に「配信カテゴリ」でカテゴリを登録してください。</div>' : ''}`
          : `<div class="readonly-value">${escapeHtml(findCategoryName(ad.categoryId)) || '(未設定)'}</div>`}
      </div>

      <div class="field-group">
        <div class="field-label">配信タグ <span class="badge-optional">任意</span></div>
        ${editable
          ? `<div class="checkbox-list" id="adTags">
               ${state.tags.length ? state.tags.map((t) => `
                 <label class="checkbox-row">
                   <input type="checkbox" value="${t.id}" ${ad.tagIds.includes(t.id) ? 'checked' : ''}>
                   ${escapeHtml(t.name)}
                 </label>`).join('') : '<span style="font-size:13px;color:var(--color-text-muted);">先に「配信タグ」でタグを登録してください。</span>'}
             </div>`
          : `<div class="readonly-value">${ad.tagIds.map(findTagName).filter(Boolean).map(escapeHtml).join('、') || '(未設定)'}</div>`}
      </div>

      <div class="field-group">
        <div class="field-label">配信レベル <span class="badge-required">必須</span></div>
        ${editable
          ? `<input type="text" id="adLevel" value="${escapeHtml(ad.level)}" placeholder="例：レベル1">`
          : `<div class="readonly-value">${escapeHtml(ad.level) || '(未設定)'}</div>`}
      </div>

      ${editable ? '<div class="btn-row"><button class="btn btn--primary" id="saveAutoDeliveryBtn">保存</button></div>' : ''}
    `;

    if (!editable) return;
    document.getElementById('saveAutoDeliveryBtn').addEventListener('click', () => {
      ad.categoryId = document.getElementById('adCategory').value;
      ad.level = document.getElementById('adLevel').value;
      ad.tagIds = Array.from(mainContent.querySelectorAll('#adTags input[type="checkbox"]:checked')).map((cb) => cb.value);
      saveState();
      showToast('自動配信設定を保存しました');
      render();
    });
  }

  function renderOverviewSection() {
    const missing = validate();
    const sectionsOrder = ['media', 'organizations', 'categories', 'tags', 'autoDelivery'];
    const missingBySection = {};
    missing.forEach((m) => {
      missingBySection[m.section] = (missingBySection[m.section] || 0) + 1;
    });

    let html = `<h2 class="section-title">提出内容確認</h2>`;

    if (state.status === 'rejected') {
      html += `<div class="info-banner info-banner--danger"><strong>差し戻しされました。</strong><br>${escapeHtml(state.rejectComment) || '(コメントなし)'}</div>`;
    } else if (state.status === 'submitted') {
      html += `<div class="info-banner info-banner--warning">提出済みです。弊社担当者の確認をお待ちください。</div>`;
    } else if (state.status === 'confirmed') {
      html += `<div class="info-banner info-banner--success">弊社担当者による確認が完了しました。</div>`;
    }

    html += `<table class="overview-table"><thead><tr><th>項目</th><th>状態</th></tr></thead><tbody>`;
    sectionsOrder.forEach((sec) => {
      const ok = !missingBySection[sec];
      html += `<tr><td>${NAV_LABELS[sec]}</td><td class="${ok ? 'check-ok' : 'check-ng'}">${ok ? '✓ 入力済み' : '未入力あり'}</td></tr>`;
    });
    html += `</tbody></table>`;

    if (missing.length) {
      html += `<div class="missing-list"><strong>未入力の必須項目</strong><ul>${missing.map((m) => `<li>${escapeHtml(m.label)}</li>`).join('')}</ul></div>`;
    }

    if (state.mode === 'customer') {
      const canSubmit = missing.length === 0 && (state.status === 'draft' || state.status === 'rejected');
      const label = state.status === 'submitted' ? '提出済み' : state.status === 'confirmed' ? '確認完了' : '提出する';
      html += `<div class="btn-row"><button class="btn btn--primary" id="submitBtn" ${canSubmit ? '' : 'disabled'}>${label}</button></div>`;
    } else if (state.status === 'submitted') {
      html += `
        <div class="field-group">
          <div class="field-label">差し戻しコメント（差し戻す場合は必須）</div>
          <textarea class="comment-box" id="staffComment" placeholder="修正依頼の内容を入力してください"></textarea>
        </div>
        <div class="btn-row">
          <button class="btn btn--primary" id="confirmBtn">確認完了にする</button>
          <button class="btn btn--danger" id="rejectBtn">差し戻す</button>
        </div>`;
    } else if (state.status === 'confirmed') {
      html += `<div class="info-banner info-banner--success">この提出内容は確認済みです。</div>`;
    } else {
      html += `<div class="info-banner info-banner--neutral">お客様からの提出をお待ちしています。</div>`;
    }

    mainContent.innerHTML = html;

    if (state.mode === 'customer') {
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.addEventListener('click', () => {
          state.status = 'submitted';
          state.rejectComment = '';
          saveState();
          showToast('提出しました');
          render();
        });
      }
    } else {
      const confirmBtn = document.getElementById('confirmBtn');
      const rejectBtn = document.getElementById('rejectBtn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          state.status = 'confirmed';
          saveState();
          showToast('確認完了にしました');
          render();
        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
          const comment = document.getElementById('staffComment').value.trim();
          if (!comment) { showToast('差し戻しコメントを入力してください'); return; }
          state.status = 'rejected';
          state.rejectComment = comment;
          saveState();
          showToast('差し戻しました');
          render();
        });
      }
    }
  }

  const SECTION_RENDERERS = {
    contract: renderContractSection,
    media: renderMediaSection,
    organizations: () => renderTreeSection('organizations', '組織設定', '組織'),
    categories: () => renderTreeSection('categories', '配信カテゴリ', 'カテゴリ'),
    tags: renderTagsSection,
    autoDelivery: renderAutoDeliverySection,
    overview: renderOverviewSection
  };

  function renderStatusBadge() {
    statusBadge.textContent = STATUS_LABEL[state.status];
    statusBadge.dataset.status = state.status;
  }

  function renderModeSwitch() {
    document.querySelectorAll('.mode-switch__btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mode === state.mode);
    });
  }

  function renderSideNav() {
    const missing = validate();
    const missingSections = new Set(missing.map((m) => m.section));
    document.querySelectorAll('.side-nav__item').forEach((btn) => {
      const sec = btn.dataset.section;
      btn.classList.toggle('is-active', sec === state.activeSection);
      let mark = '';
      const showChecks = state.mode === 'customer' && (state.status === 'draft' || state.status === 'rejected') && sec !== 'overview' && sec !== 'contract';
      if (showChecks) {
        mark = missingSections.has(sec)
          ? ' <span class="nav-check" style="color:var(--color-danger)">・</span>'
          : ' <span class="nav-check" style="color:var(--color-success)">✓</span>';
      }
      btn.innerHTML = NAV_LABELS[sec] + mark;
    });
  }

  function render() {
    renderStatusBadge();
    renderModeSwitch();
    renderSideNav();
    const fn = SECTION_RENDERERS[state.activeSection];
    if (fn) fn();
  }

  document.querySelectorAll('.mode-switch__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      saveState();
      render();
    });
  });

  document.querySelectorAll('.side-nav__item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeSection = btn.dataset.section;
      saveState();
      render();
    });
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('入力したデモデータをすべて削除し、初期状態に戻します。よろしいですか？')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    render();
    showToast('リセットしました');
  });

  document.getElementById('topbarCsvBtn').addEventListener('click', () => {
    downloadCsv();
    showToast('CSVを出力しました');
  });

  document.getElementById('topbarPdfBtn').addEventListener('click', () => {
    printPdf();
  });

  render();
})();
