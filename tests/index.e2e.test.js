/**
 * 电子念珠小程序 E2E 测试
 *
 * 运行前请确保：
 * 1. 已安装微信开发者工具
 * 2. 微信开发者工具已开启服务端口（设置 -> 安全 -> 服务端口）
 * 3. 微信开发者工具已登录
 */

const automator = require('miniprogram-automator')

// 微信开发者工具 CLI 路径（根据实际安装位置修改）
const CLI_PATH = process.env.WX_CLI_PATH || 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'

const PROJECT_PATH = 'd:/wrok/wkspace/wx-program/electronic-rosary'

describe('电子念珠小程序 E2E 测试', () => {
  let miniProgram

  beforeAll(async () => {
    miniProgram = await automator.launch({
      cliPath: CLI_PATH,
      projectPath: PROJECT_PATH
    })
  }, 60000)

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close()
    }
  })

  describe('主页功能', () => {
    let page

    beforeEach(async () => {
      page = await miniProgram.reLaunch('/pages/index/index')
      await page.waitFor(1000)
    })

    it('页面应正确加载', async () => {
      expect(page).toBeDefined()
      const data = await page.data()
      expect(data.merit).toBeDefined()
    })

    it('初始珠子应有9颗，中间为激活状态', async () => {
      const data = await page.data()
      expect(data.visibleBeads.length).toBe(9)
      expect(data.visibleBeads[4].isActive).toBe(true)
    })

    it('滑动后功德应增加', async () => {
      const initialMerit = (await page.data()).merit

      // 模拟向上滑动
      await page.touch({
        touches: [{ identifier: 0, clientX: 200, clientY: 500 }],
        eventType: 'start'
      })

      await page.waitFor(100)

      await page.touch({
        touches: [{ identifier: 0, clientX: 200, clientY: 300 }],
        eventType: 'move'
      })

      await page.waitFor(100)

      await page.touch({
        changedTouches: [{ identifier: 0, clientX: 200, clientY: 300 }],
        eventType: 'end'
      })

      await page.waitFor(500)

      const newMerit = (await page.data()).merit
      expect(newMerit).toBeGreaterThan(initialMerit)
    })

    it('滑动后应显示飘字动画', async () => {
      // 模拟滑动
      await page.touch({
        touches: [{ identifier: 0, clientX: 200, clientY: 500 }],
        eventType: 'start'
      })
      await page.touch({
        touches: [{ identifier: 0, clientX: 200, clientY: 300 }],
        eventType: 'move'
      })
      await page.touch({
        changedTouches: [{ identifier: 0, clientX: 200, clientY: 300 }],
        eventType: 'end'
      })

      await page.waitFor(200)

      const data = await page.data()
      expect(data.meritPopups.length).toBeGreaterThan(0)
    })
  })

  describe('设置页面', () => {
    it('应能导航到设置页', async () => {
      const page = await miniProgram.reLaunch('/pages/index/index')
      await page.waitFor(1000)

      // 点击设置按钮
      const settingsBtn = await page.$('.settings-btn')
      await settingsBtn.tap()

      await page.waitFor(1000)

      // 验证已跳转到设置页
      const currentPage = await miniProgram.currentPage()
      expect(currentPage.path).toContain('settings')
    })
  })
})
