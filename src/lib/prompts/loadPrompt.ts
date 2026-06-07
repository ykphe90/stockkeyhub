import fs from 'fs'
import path from 'path'

/**
 * 从 .txt prompt 文件读取模板，并用变量替换 {{key}} 占位符
 * @param name prompt 文件名（不包含 .txt）
 * @param variables 替换内容
 * @returns 最终处理好的字符串
 */
export function loadPrompt(
  name: string,
  variables: Record<string, string | number>
): string {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'prompts', `${name}.txt`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file ${name}.txt not found.`)
  }

  let template = fs.readFileSync(filePath, 'utf-8')

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    template = template.replace(regex, String(value))
  }

  return template
}