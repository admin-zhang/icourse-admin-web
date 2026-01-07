/** @type {import('cz-git').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举，git 提交的 type 必须在以下类型范围内
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'fix', // 修复缺陷
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'perf', // 性能优化
        'test', // 添加疏漏测试或已有测试改动
        'build', // 构建流程、外部依赖变更 (如升级 npm 包、修改 vite 配置等)
        'ci', // 修改 CI 配置、脚本
        'revert', // 回滚 commit
        'chore', // 对构建过程或辅助工具和库的更改 (不影响源文件、测试用例)
      ],
    ],
    // 提交类型为空时禁用
    'type-empty': [2, 'never'],
    // 提交范围为空时禁用
    'scope-empty': [0],
    // 提交主题为空时禁用
    'subject-empty': [2, 'never'],
    // 提交主题为简短描述时禁用
    'subject-full-stop': [0, 'never'],
    // 提交主题风格，禁用
    'subject-case': [0],
    // 提交主题最大长度，警告
    'subject-max-length': [1, 'always', 100],
    // 头部最大长度，警告
    'header-max-length': [1, 'always', 100],
    // 正文要求以空行开始，禁用
    'body-leading-blank': [0],
    // 正文最大长度，警告
    'body-max-line-length': [1, 'always', 100],
    // 页脚要求以空行开始，禁用
    'footer-leading-blank': [0],
  },
}

