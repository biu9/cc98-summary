export function getMarkdownContent(mdContent:string) {
    const res = mdContent.replace(/\u21b5/g,'') // 去除↵
                .replace(/\[[^\]]+\]/g,'') // 去除[xxx]
                .replace(/\s/g,'') // 去除空格
    
    return res
}