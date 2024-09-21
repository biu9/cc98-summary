/**
 * 过滤掉包含了请勿外传等类似字符的帖子
 * @param content 
 * @returns 
 */
export const securityFilter = (content: string): string => {

  const dangerousText = [
    "请勿外传", "不要外传", "保密", "机密", "禁止传播", "泄露", "透露",
    "勿传", "不传", "qwfc", "bywc", "1勿2传", "4不要5外传",
  ]

  if(dangerousText.some(text => content.includes(text))) 
    return '';
  
  return content;
}