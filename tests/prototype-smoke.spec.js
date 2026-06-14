const path = require("path");
const { pathToFileURL } = require("url");
const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "ai-novel-prototype-state";

function entryUrl() {
  return pathToFileURL(path.join(process.cwd(), "index.html")).href;
}

test("secondary library, outline, graph, and settings surfaces use unified modals", async ({ page }) => {
  await page.addInitScript(key => localStorage.removeItem(key), STORAGE_KEY);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(entryUrl());

  await page.locator('[data-view="library"]').click();
  await page.locator('[data-select-lore="shen"]').click();
  await expect(page.locator("#modalRoot")).toContainText("沈青岚");
  await page.locator('[data-action="open-lore-editor"]').click();
  await expect(page.locator("#modalRoot #editLoreTitle")).toHaveValue("沈青岚");
  await expect(page.locator("#modalRoot select")).toHaveCount(0);
  await page.locator("#editLoreDetail").fill("她擅长读取灵契残响，并在第 12 章确认云氏密约线索。");
  await page.locator('[data-action="save-lore-editor"]').click();
  await expect(page.locator("#modalRoot")).toContainText("第 12 章确认云氏密约线索");

  await page.locator('[data-action="close-modal"]').click();
  await page.locator("#quickAddButton").click();
  await expect(page.locator("#newLoreTitle")).toBeVisible();
  await page.locator('[data-form-prefix="newLore"][data-form-field="Type"][data-form-option="事件"]').click();
  await expect(page.locator('label[for="newLoreTitleInput"]')).toHaveText("事件名称");
  await expect(page.locator("#modalRoot select")).toHaveCount(0);
  await page.locator('[data-action="close-modal"]').click();

  await page.locator('[data-view="outline"]').click();
  await expect(page.locator("#chapterGoal")).toHaveCount(0);
  await page.locator('[data-select-chapter="ch11"]').click();
  await expect(page.locator("#chapterModalTitle")).toContainText("第 11 章");
  await page.locator('[data-action="close-modal"]').click();
  await page.locator("#quickAddButton").click();
  await expect(page.locator("#chapterFormTitleInput")).toHaveValue("新章节");
  await expect(page.locator("#modalRoot select")).toHaveCount(0);

  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-view="graph"]').click();
  await page.locator('[data-action="open-relation-detail"][data-id="shen"]').click();
  await expect(page.locator("#relationDetailTitle")).toHaveText("沈青岚");
  await page.locator('[data-action="close-modal"]').click();
  await page.locator("#quickAddButton").click();
  await expect(page.locator("#relationFormTitle")).toHaveText("关系资料");

  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-view="settings"]').click();
  await page.locator('[data-action="open-settings-panel"][data-id="api"]').click();
  await expect(page.locator("#settingsPanelTitle")).toHaveText("DeepSeek API");
});

test("AI chat sends bounded lore payload, executes openModal action, and keeps writes in approval", async ({ page }) => {
  let chatPayload;

  await page.addInitScript(key => {
    localStorage.setItem(
      key,
      JSON.stringify({
        apiConfig: {
          provider: "DeepSeek",
          baseUrl: "https://api.deepseek.com",
          model: "deepseek-v4-flash",
          apiKey: "test-key",
          connected: true
        }
      })
    );
  }, STORAGE_KEY);

  await page.route("**/api/ai/chat", async route => {
    chatPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        reply: "我已打开第 12 章，并提交一条待审批资料变更。",
        contextBundle: {
          loreItemIds: ["shen"],
          relationHints: ["沈青岚-星陨宴"],
          timelineRefs: ["第 2 卷中段"],
          chapterId: "ch12"
        },
        actions: [{ kind: "openModal", targetType: "chapter", targetId: "ch12" }],
        proposedChanges: [
          {
            id: "ai-chat-change",
            type: "新增",
            title: "新增事件：AI 聊天线索",
            reason: "用户要求 AI 新增事件线索。",
            impact: "影响第 12 章后续调查。",
            conflict: "无明显冲突。",
            patch: {
              loreItem: {
                id: "ai-chat-clue",
                type: "事件",
                title: "AI 聊天线索",
                summary: "由 AI 聊天提交、等待用户批准的事件。",
                detail: "这条资料只有批准后才写入资料库。",
                tags: ["AI已审批"],
                importance: "中",
                status: "有效",
                relations: ["沈青岚"],
                timeline: "第 2 卷中段",
                references: ["第 12 章"]
              }
            }
          }
        ]
      })
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(entryUrl());
  await expect(page.locator(".context-list")).toHaveCount(0);
  await expect(page.locator(".ai-composer #aiMessageInput")).toBeVisible();
  await expect(page.locator(".ai-timeline .context-output")).toHaveCount(0);
  await expect(page.locator(".ai-timeline #approvals")).toHaveCount(0);
  await expect(page.locator(".ai-empty-state")).toContainText("等待真实生成");
  await page.locator('[data-action="open-ai-approvals"]').click();
  await expect(page.locator("#aiApprovalsTitle")).toHaveText("待审批变更");
  await expect(page.locator("#modalRoot")).toContainText("没有真实 AI 待审批建议");
  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-action="open-current-plan"]').click();
  await expect(page.locator("#chapterModalTitle")).toContainText("第 12 章");
  await page.locator('[data-action="close-modal"]').click();
  await page.locator("#aiMessageInput").fill("打开第 12 章，并新增一个事件线索");
  await page.locator('[data-action="send-ai-message"]').click();

  await expect(page.locator("#chapterModalTitle")).toContainText("第 12 章");
  await expect(page.locator(".ai-timeline .context-output")).toContainText("本次引用资料");
  await expect(page.locator(".ai-timeline #approvals")).toContainText("AI 聊天线索");
  expect(chatPayload).toBeTruthy();
  expect(chatPayload.lore).toBeUndefined();
  expect(chatPayload.loreIndex.length).toBeGreaterThan(0);
  expect(chatPayload.loreDetails.length).toBeGreaterThan(0);
  expect(chatPayload.loreDetails.length).toBeLessThanOrEqual(6);
  expect(JSON.stringify(chatPayload)).not.toContain("function render");

  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-action="approve-change"][data-id="ai-chat-change"]').click();
  await page.locator('[data-view="library"]').click();
  await page.locator('[data-category="事件"]').click();
  await expect(page.getByRole("button", { name: /AI 聊天线索/ })).toBeVisible();
});

test("library exposes worldbuilding categories and family member picker persists links", async ({ page }) => {
  await page.addInitScript(key => localStorage.removeItem(key), STORAGE_KEY);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(entryUrl());

  await page.locator('[data-view="library"]').click();
  await expect(page.locator('[data-category="世界观/规则"]')).toBeVisible();
  await page.locator('[data-category="世界观/规则"]').click();
  await expect(page.getByRole("button", { name: /灵契法则/ })).toBeVisible();

  await page.locator('[data-category="家族/势力"]').click();
  await page.locator('[data-select-lore="yun"]').click();
  await page.locator('[data-action="open-lore-editor"]').click();
  await expect(page.locator('[data-structured-field="editLoreMembers"][value="shen"]')).toBeChecked();

  const importanceColumns = await page.locator('[data-option-group="editLoreImportance"]').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  expect(importanceColumns).toBe(4);

  await page.locator('[data-action="save-lore-editor"]').click();
  await expect(page.locator("#modalRoot")).toContainText("成员");
  await expect(page.locator("#modalRoot")).toContainText("沈青岚");

  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-category="人物"]').click();
  await page.locator('[data-select-lore="shen"]').click();
  await expect(page.locator("#modalRoot")).toContainText("所属家族/势力");
  await expect(page.locator("#modalRoot")).toContainText("云氏家族");
});

test("schema v1 local lore migrates into v2 categories and structured family links", async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(
      key,
      JSON.stringify({
        schemaVersion: 1,
        activeCategory: "世界规则",
        chat: [
          { role: "user", text: "根据第 2 卷目标，写第 12 章：宴会暗杀失败后，女主发现家族密约。" },
          { role: "assistant", text: "我会先读取人物、家族、旧王印、星陨宴和第 2 卷目标。草稿完成后，任何新增设定都会进入待审批变更。" }
        ],
        proposedChanges: [
          { id: "change-1", type: "新增", title: "新增事件：密约碎片", status: "待审批" }
        ],
        lore: [
          {
            id: "legacy-person",
            type: "人物",
            title: "旧档角色",
            summary: "旧资料中的人物。",
            detail: "",
            tags: [],
            importance: "中",
            status: "有效",
            relations: [],
            timeline: "",
            references: []
          },
          {
            id: "legacy-family",
            type: "家族/势力",
            title: "旧档家族",
            summary: "旧资料中的家族。",
            detail: "",
            tags: [],
            importance: "高",
            status: "有效",
            relations: ["旧档角色"],
            timeline: "",
            references: []
          },
          {
            id: "legacy-rule",
            type: "世界规则",
            title: "旧档规则",
            summary: "旧资料中的世界规则。",
            detail: "",
            tags: [],
            importance: "核心",
            status: "有效",
            relations: [],
            timeline: "",
            references: []
          },
          {
            id: "legacy-item",
            type: "物品",
            title: "旧档信物",
            summary: "旧资料中的物品。",
            detail: "",
            tags: [],
            importance: "低",
            status: "有效",
            relations: [],
            timeline: "",
            references: []
          }
        ]
      })
    );
  }, STORAGE_KEY);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(entryUrl());
  await page.locator('[data-view="library"]').click();
  await expect(page.getByRole("button", { name: /旧档规则/ })).toBeVisible();

  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(stored.schemaVersion).toBe(2);
  expect(stored.activeCategory).toBe("世界观/规则");
  expect(stored.chat).toEqual([]);
  expect(stored.proposedChanges).toEqual([]);

  await page.locator('[data-category="物品/线索"]').click();
  await expect(page.getByRole("button", { name: /旧档信物/ })).toBeVisible();

  await page.locator('[data-category="家族/势力"]').click();
  await page.locator('[data-select-lore="legacy-family"]').click();
  await expect(page.locator("#modalRoot")).toContainText("成员");
  await expect(page.locator("#modalRoot")).toContainText("旧档角色");
});
